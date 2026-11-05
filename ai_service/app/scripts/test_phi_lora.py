#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🧪 تست مدل Phi + LoRA (مخصوص اجرا روی سرور)
=============================================
نحوه استفاده در سرور:
    cd ai_service && .venv/bin/python3 app/scripts/test_phi_lora.py
    
این اسکریپت مدل Phi رو با LoRA adapter بارگذاری می‌کنه و تست inference می‌گیره.

نکته: اگر فایل LoRA وجود نداره، فقط مدل پایه Phi رو تست می‌کنه.
"""

import os
import sys
import time
import json
import argparse
from datetime import datetime

# تنظیمات محیطی
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# مسیرها
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_MODEL_DIR = os.path.join(PROJECT_ROOT, "app", "ai_model")
LORA_DIR = os.path.join(PROJECT_ROOT, "app", "lora_model")
RESULTS_FILE = os.path.join(PROJECT_ROOT, "logs", "phi_test_results.json")

os.makedirs(os.path.dirname(RESULTS_FILE), exist_ok=True)


def print_banner():
    print("=" * 60)
    print("  🧪 تست مدل Phi + LoRA")
    print(f"  📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)


def check_model_files():
    """بررسی وجود فایل‌های مدل"""
    print("\n📂 بررسی فایل‌های مدل...")
    print("-" * 40)

    # مدل پایه Phi
    phi_files = {
        "config.json": os.path.join(AI_MODEL_DIR, "config.json"),
        "model.safetensors": os.path.join(AI_MODEL_DIR, "model.safetensors"),
        "model-001.safetensors": os.path.join(AI_MODEL_DIR, "model-001.safetensors"),
        "tokenizer.json": os.path.join(AI_MODEL_DIR, "tokenizer.json"),
        "tokenizer_config.json": os.path.join(AI_MODEL_DIR, "tokenizer_config.json"),
    }

    for name, path in phi_files.items():
        if os.path.exists(path):
            size_mb = os.path.getsize(path) / (1024 * 1024)
            print(f"  ✅ {name}: {size_mb:.1f} MB")
        else:
            print(f"  ❌ {name}: پیدا نشد")

    # LoRA adapter
    lora_files = {
        "adapter_config.json": os.path.join(LORA_DIR, "adapter_config.json"),
        "adapter_model.safetensors": os.path.join(LORA_DIR, "adapter_model.safetensors"),
    }

    lora_available = False
    print(f"\n📂 بررسی فایل‌های LoRA (در {LORA_DIR})...")
    print("-" * 40)
    for name, path in lora_files.items():
        if os.path.exists(path):
            size_mb = os.path.getsize(path) / (1024 * 1024)
            print(f"  ✅ {name}: {size_mb:.1f} MB")
            lora_available = True
        else:
            print(f"  ❌ {name}: پیدا نشد")

    return lora_available


def detect_model_type():
    """تشخیص نوع مدل از روی config.json"""
    config_path = os.path.join(AI_MODEL_DIR, "config.json")
    if not os.path.exists(config_path):
        return "unknown"

    with open(config_path, "r") as f:
        config = json.load(f)

    model_type = config.get("model_type", "unknown")
    architectures = config.get("architectures", ["unknown"])

    print(f"\n🧬 تشخیص مدل...")
    print(f"  📋 type: {model_type}")
    print(f"  📋 architecture: {architectures[0] if architectures else 'unknown'}")
    print(f"  📋 hidden_size: {config.get('hidden_size', '?')}")
    print(f"  📋 num_layers: {config.get('num_hidden_layers', '?')}")
    print(f"  📋 vocab_size: {config.get('vocab_size', '?')}")

    return model_type


def test_phi_inference(use_lora=False, max_tokens=50, num_runs=3):
    """
    تست اصلی inference با Phi + LoRA
    """
    print("\n" + "=" * 60)
    print(f"  🚀 شروع تست {'Phi + LoRA' if use_lora else 'Phi base'}")
    print("=" * 60)

    import torch
    import warnings
    warnings.filterwarnings("ignore")

    # ==============================================
    # ۱. بارگذاری tokenizer
    # ==============================================
    print("\n⏳ بارگذاری tokenizer...")
    from transformers import AutoTokenizer

    t0 = time.time()
    tokenizer = AutoTokenizer.from_pretrained(AI_MODEL_DIR, local_files_only=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    print(f"  ✅ tokenizer بارگذاری شد در {time.time()-t0:.1f}s")
    print(f"  📋 vocab_size: {tokenizer.vocab_size}")

    # ==============================================
    # ۲. بارگذاری مدل پایه
    # ==============================================
    print("\n⏳ بارگذاری مدل پایه...")
    from transformers import AutoModelForCausalLM

    t0 = time.time()
    model = AutoModelForCausalLM.from_pretrained(
        AI_MODEL_DIR,
        torch_dtype=torch.float32,
        device_map="cpu",
        local_files_only=True,
        low_cpu_mem_usage=True,
    )
    load_time = time.time() - t0
    print(f"  ✅ مدل پایه بارگذاری شد در {load_time:.1f}s")

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  📊 پارامترها: {total_params/1e6:.0f}M | trainable: {trainable_params:,}")

    # ==============================================
    # ۳. (اختیاری) اتصال LoRA adapter
    # ==============================================
    if use_lora:
        print("\n⏳ اتصال LoRA adapter...")
        try:
            from peft import PeftModel

            t0 = time.time()
            model = PeftModel.from_pretrained(model, LORA_DIR, is_trainable=False)
            model = model.merge_and_unload()
            lora_time = time.time() - t0
            print(f"  ✅ LoRA متصل و merged شد در {lora_time:.1f}s")
        except Exception as e:
            print(f"  ❌ خطا در اتصال LoRA: {e}")
            print("  ⚠ ادامه با مدل پایه...")
            use_lora = False

    model.eval()

    # ==============================================
    # ۴. تست inference
    # ==============================================
    test_prompts = [
        "به فارسی پاسخ بده. سلام! حالت چطوره؟",
        "What is machine learning? Explain briefly.",
        "یک شعر کوتاه در مورد بهار بنویس.",
    ]

    results = []
    print(f"\n🧪 اجرای {num_runs} تست inference...")
    print("-" * 40)

    for run_idx in range(num_runs):
        prompt = test_prompts[run_idx % len(test_prompts)]
        print(f"\n  تست {run_idx+1}/{num_runs}:")
        print(f"  📝 prompt: {prompt[:50]}...")

        messages = [{"role": "user", "content": prompt}]

        # Tokenize
        t1 = time.time()
        inputs = tokenizer.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True, return_tensors="pt"
        )
        input_len = inputs.shape[1]
        tokenize_time = time.time() - t1

        # Generate
        t2 = time.time()
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_new_tokens=max_tokens,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                repeat_penalty=1.1,
                pad_token_id=tokenizer.eos_token_id,
            )
        gen_time = time.time() - t2

        # Decode
        output_len = outputs.shape[1] - input_len
        response = tokenizer.decode(outputs[0][input_len:], skip_special_tokens=True)

        tokens_per_sec = output_len / gen_time if gen_time > 0 else 0

        result = {
            "run": run_idx + 1,
            "prompt": prompt[:80],
            "response": response[:150],
            "input_tokens": input_len,
            "output_tokens": output_len,
            "generation_time_s": round(gen_time, 2),
            "tokens_per_sec": round(tokens_per_sec, 2),
            "model_config": {
                "use_lora": use_lora,
                "max_tokens": max_tokens,
                "temperature": 0.7,
            },
        }
        results.append(result)

        print(f"  🤖 پاسخ: {response[:100]}...")
        print(f"  ⏱️ زمان: {gen_time:.1f}s | توکن: {output_len} | سرعت: {tokens_per_sec:.2f} tok/s")

    # ==============================================
    # ۵. خلاصه نتایج
    # ==============================================
    print("\n" + "=" * 60)
    print("  📊 خلاصه نتایج")
    print("=" * 60)

    avg_time = sum(r["generation_time_s"] for r in results) / len(results)
    avg_tokens = sum(r["output_tokens"] for r in results) / len(results)
    avg_speed = sum(r["tokens_per_sec"] for r in results) / len(results)

    print(f"  ⏱️ میانگین زمان inference: {avg_time:.1f}s")
    print(f"  📝 میانگین توکن خروجی: {avg_tokens:.0f}")
    print(f"  🚀 میانگین سرعت: {avg_speed:.2f} tok/s")
    print(f"  📦 RAM مصرفی (تخمینی): ~{total_params * 4 / 1024**3:.1f} GB (float32)")

    # ذخیره نتایج
    summary = {
        "timestamp": datetime.now().isoformat(),
        "model_path": AI_MODEL_DIR,
        "lora_used": use_lora,
        "model_type": detect_model_type(),
        "avg_inference_time_s": round(avg_time, 2),
        "avg_tokens_per_sec": round(avg_speed, 2),
        "avg_output_tokens": round(avg_tokens, 0),
        "total_params_M": round(total_params / 1e6, 0),
        "results": results,
    }

    with open(RESULTS_FILE, "w") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"\n  💾 نتایج ذخیره شد در: {RESULTS_FILE}")

    return summary


def main():
    parser = argparse.ArgumentParser(description="تست مدل Phi + LoRA")
    parser.add_argument("--no-lora", action="store_true", help="فقط مدل پایه (بدون LoRA)")
    parser.add_argument("--tokens", type=int, default=50, help="تعداد توکن خروجی (پیش‌فرض: 50)")
    parser.add_argument("--runs", type=int, default=3, help="تعداد دفعات تست (پیش‌فرض: 3)")
    args = parser.parse_args()

    print_banner()

    # بررسی فایل‌ها
    lora_available = check_model_files()

    # تشخیص نوع مدل
    model_type = detect_model_type()

    # تصمیم‌گیری برای استفاده از LoRA
    use_lora = lora_available and not args.no_lora
    if use_lora:
        print("\n✅ LoRA adapter پیدا شد → تست با LoRA")
    elif args.no_lora:
        print("\nℹ️ تست بدون LoRA (دستور --no-lora)")
    else:
        print("\nℹ️ LoRA پیدا نشد → تست فقط با مدل پایه")

    # اجرای تست
    results = test_phi_inference(use_lora=use_lora, max_tokens=args.tokens, num_runs=args.runs)

    # توصیه برای سرور
    print("\n" + "=" * 60)
    print("  🖥️ نکات اجرا روی سرور")
    print("=" * 60)
    print("""
    1. کافی‌ست این فایل (test_phi_lora.py) رو به سرور منتقل کنید
    2. فایل‌های مدل رو توی ai_service/app/ai_model/ بگذارید
    3. (اختیاری) فایل‌های LoRA رو توی ai_service/app/lora_model/ بگذارید
    4. اجرا کنید:
       cd ai_service && .venv/bin/python3 app/scripts/test_phi_lora.py
    
    5. برای تست سریع (فقط ۱ بار):
       cd ai_service && .venv/bin/python3 app/scripts/test_phi_lora.py --runs 1 --tokens 30
    """)


if __name__ == "__main__":
    main()
