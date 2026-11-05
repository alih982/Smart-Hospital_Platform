#!/usr/bin/env python3
# retrain_model.py - فاین‌تیون با یا بدون LoRA (قابل انتخاب)

import os
import sys
import argparse
import json
import logging
import shutil
from datetime import datetime
import torch
import pandas as pd
import numpy as np
from datasets import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    BitsAndBytesConfig,
)
from peft import (
    LoraConfig,
    get_peft_model,
    prepare_model_for_kbit_training,
    PeftModel,
)
import mlflow

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DEFAULT_MAX_LENGTH = 512
DEFAULT_TRAIN_EPOCHS = 3
DEFAULT_LEARNING_RATE = 5e-5
DEFAULT_BATCH_SIZE = 4
DEFAULT_EVAL_SPLIT = 0.1
DEFAULT_LORA_R = 16
DEFAULT_LORA_ALPHA = 32
DEFAULT_LORA_DROPOUT = 0.05

# ============================================================
# توابع بارگیری داده (بدون تغییر)
# ============================================================
def load_data(data_path: str) -> Dataset:
    ext = os.path.splitext(data_path)[1].lower()
    if ext == ".csv":
        df = pd.read_csv(data_path)
        if "instruction" in df.columns and "output" in df.columns:
            df["text"] = df.apply(
                lambda row: f"### Instruction:\n{row['instruction']}\n\n### Response:\n{row['output']}",
                axis=1,
            )
        elif "prompt" in df.columns and "response" in df.columns:
            df["text"] = df.apply(
                lambda row: f"### Instruction:\n{row['prompt']}\n\n### Response:\n{row['response']}",
                axis=1,
            )
        else:
            raise ValueError("CSV باید شامل ستون‌های instruction/output یا prompt/response باشد")
    elif ext in (".json", ".jsonl"):
        import json
        with open(data_path, "r", encoding="utf-8") as f:
            if ext == ".jsonl":
                data = [json.loads(line) for line in f]
            else:
                data = json.load(f)
        if isinstance(data, dict) and "data" in data:
            data = data["data"]
        if isinstance(data, list) and all("instruction" in item for item in data):
            texts = [
                f"### Instruction:\n{item['instruction']}\n\n### Response:\n{item.get('output', item.get('response', ''))}"
                for item in data
            ]
        elif isinstance(data, list) and all("prompt" in item for item in data):
            texts = [
                f"### Instruction:\n{item['prompt']}\n\n### Response:\n{item.get('response', '')}"
                for item in data
            ]
        else:
            raise ValueError("فرمت JSON نامشخص")
        df = pd.DataFrame({"text": texts})
    else:
        raise ValueError("فرمت فایل پشتیبانی نمی‌شود")
    return Dataset.from_pandas(df)

def tokenize_function(examples, tokenizer, max_length=DEFAULT_MAX_LENGTH):
    tokenized = tokenizer(
        examples["text"],
        truncation=True,
        max_length=max_length,
        padding=False,
    )
    tokenized["labels"] = tokenized["input_ids"].copy()
    return tokenized

# ============================================================
# تابع آموزش (با انتخاب LoRA یا بدون)
# ============================================================
def train_model(
    model_path: str,
    data_path: str,
    output_dir: str,
    use_lora: bool = False,
    lora_r: int = DEFAULT_LORA_R,
    lora_alpha: int = DEFAULT_LORA_ALPHA,
    lora_dropout: float = DEFAULT_LORA_DROPOUT,
    num_epochs: int = DEFAULT_TRAIN_EPOCHS,
    learning_rate: float = DEFAULT_LEARNING_RATE,
    batch_size: int = DEFAULT_BATCH_SIZE,
    eval_split: float = DEFAULT_EVAL_SPLIT,
    lora_path: str = None,  # مسیر LoRA در صورت وجود
):
    logger.info("=" * 70)
    logger.info(f"شروع فاین‌تیون مدل از {model_path}")
    logger.info(f"استفاده از LoRA: {use_lora}")
    if use_lora and lora_path:
        logger.info(f"مسیر LoRA: {lora_path}")
    logger.info("=" * 70)

    # بارگیری توکنایزر
    tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # بارگیری مدل
    if use_lora and lora_path and os.path.exists(lora_path):
        # بارگیری مدل پایه + LoRA
        logger.info("بارگیری مدل با LoRA...")
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True,
        )
        model = PeftModel.from_pretrained(model, lora_path)
        model = model.merge_and_unload()  # ادغام LoRA با مدل پایه
        logger.info("✅ LoRA با موفقیت ادغام شد.")
    elif use_lora and not lora_path:
        # استفاده از LoRA جدید (بدون LoRA قبلی)
        logger.info("استفاده از LoRA جدید (بدون LoRA قبلی)...")
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True,
        )
        # اعمال LoRA جدید
        model = prepare_model_for_kbit_training(model)
        lora_config = LoraConfig(
            r=lora_r,
            lora_alpha=lora_alpha,
            target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
            lora_dropout=lora_dropout,
            bias="none",
            task_type="CAUSAL_LM",
        )
        model = get_peft_model(model, lora_config)
        model.print_trainable_parameters()
    else:
        # فاین‌تیون کامل (بدون LoRA)
        logger.info("فاین‌تیون کامل (بدون LoRA)...")
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True,
        )

    # بارگیری داده
    dataset = load_data(data_path)
    split_dataset = dataset.train_test_split(test_size=eval_split, seed=42)
    train_ds = split_dataset["train"].map(
        lambda x: tokenize_function(x, tokenizer),
        remove_columns=split_dataset["train"].column_names
    )
    eval_ds = split_dataset["test"].map(
        lambda x: tokenize_function(x, tokenizer),
        remove_columns=split_dataset["test"].column_names
    )

    # تنظیمات آموزش
    training_args = TrainingArguments(
        output_dir=output_dir,
        overwrite_output_dir=True,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        learning_rate=learning_rate,
        warmup_steps=50,
        logging_steps=10,
        evaluation_strategy="steps",
        eval_steps=50,
        save_steps=100,
        save_total_limit=2,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        fp16=True,
        report_to="mlflow",
        run_name=f"zhaav-finetune-{datetime.now():%Y%m%d-%H%M%S}",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        tokenizer=tokenizer,
    )
    trainer.train()

    # ذخیره مدل نهایی
    if use_lora:
        # اگر LoRA بود، فقط adapter ذخیره می‌شود
        model.save_pretrained(output_dir)
    else:
        # مدل کامل ذخیره می‌شود
        model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    # محاسبه perplexity
    eval_results = trainer.evaluate(eval_ds)
    perplexity = float(np.exp(eval_results["eval_loss"]))
    logger.info(f"Perplexity روی eval: {perplexity:.4f}")

    # ذخیره info.json
    info = {
        "timestamp": datetime.now().isoformat(),
        "perplexity": perplexity,
        "eval_loss": eval_results["eval_loss"],
        "model_name": "zhaav-gemma3",
        "use_lora": use_lora,
        "learning_rate": learning_rate,
        "num_epochs": num_epochs,
    }
    if use_lora:
        info["lora_r"] = lora_r
        info["lora_alpha"] = lora_alpha
        info["lora_dropout"] = lora_dropout

    with open(os.path.join(output_dir, "info.json"), "w") as f:
        json.dump(info, f, indent=2)

    # ثبت در MLflow
    with mlflow.start_run(run_name=f"zhaav-finetune-{datetime.now():%Y%m%d-%H%M%S}"):
        mlflow.log_metric("perplexity", perplexity)
        mlflow.log_params(info)
        mlflow.log_artifacts(output_dir)

    return perplexity, output_dir

# ============================================================
# جایگزینی مدل
# ============================================================
def replace_model(new_version_dir, production_symlink, threshold):
    info_path = os.path.join(new_version_dir, "info.json")
    if not os.path.exists(info_path):
        logger.error("فایل info.json پیدا نشد.")
        return False
    with open(info_path, "r") as f:
        info = json.load(f)
    new_perplexity = info.get("perplexity")
    if new_perplexity is None:
        logger.error("perplexity در info.json موجود نیست.")
        return False
    logger.info(f"Perplexity مدل جدید: {new_perplexity:.4f}")
    logger.info(f"آستانه: {threshold}")
    if new_perplexity >= threshold:
        logger.warning(f"Perplexity جدید ({new_perplexity:.4f}) از آستانه ({threshold}) کمتر نیست. جایگزینی نمی‌شود.")
        return False
    temp_link = production_symlink + ".tmp"
    if os.path.exists(temp_link):
        os.unlink(temp_link)
    os.symlink(os.path.basename(new_version_dir), temp_link, target_is_directory=True)
    os.replace(temp_link, production_symlink)
    logger.info(f"✅ Symlink به نسخه جدید تغییر یافت.")
    return True

# ============================================================
# Main
# ============================================================
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-model", required=True)
    parser.add_argument("--new-data", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--threshold-perplexity", type=float, default=15.0)
    parser.add_argument("--epochs", type=int, default=DEFAULT_TRAIN_EPOCHS)
    parser.add_argument("--lr", type=float, default=DEFAULT_LEARNING_RATE)
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    parser.add_argument("--production-symlink", default="app/ai_model/current")
    # پارامترهای LoRA
    parser.add_argument("--use-lora", action="store_true", help="از LoRA استفاده شود")
    parser.add_argument("--lora-path", help="مسیر LoRA موجود (در صورت وجود)")
    parser.add_argument("--lora-r", type=int, default=DEFAULT_LORA_R)
    parser.add_argument("--lora-alpha", type=int, default=DEFAULT_LORA_ALPHA)
    parser.add_argument("--lora-dropout", type=float, default=DEFAULT_LORA_DROPOUT)
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    perplexity, _ = train_model(
        model_path=args.base_model,
        data_path=args.new_data,
        output_dir=args.output_dir,
        use_lora=args.use_lora,
        lora_path=args.lora_path,
        lora_r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        num_epochs=args.epochs,
        learning_rate=args.lr,
        batch_size=args.batch_size,
    )

    success = replace_model(
        new_version_dir=args.output_dir,
        production_symlink=args.production_symlink,
        threshold=args.threshold_perplexity,
    )

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()