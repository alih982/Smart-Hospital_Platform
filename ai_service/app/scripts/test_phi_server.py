#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🚀 تست سریع Phi + LoRA برای سرور
================================
یک فایل کامل و مستقل که:
1. مدل Phi رو از ai_model بارگذاری می‌کنه
2. (اختیاری) LoRA adapter رو از lora_model وصل می‌کنه
3. تست فارسی و انگلیسی می‌گیره
4. زمان و سرعت رو گزارش می‌ده

نحوه استفاده در سرور:
    python3 test_phi_server.py
    
نیاز به نصب:
    pip install torch transformers accelerate einops
    pip install peft  # فقط اگر LoRA دارید
"""

import os, sys, time, json, torch
from datetime import datetime
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# ─── تنظیمات ──────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "ai_model")
LORA_DIR = os.path.join(os.path.dirname(__file__), "..", "lora_model")
MODEL_DIR = os.path.abspath(MODEL_DIR)
LORA_DIR = os.path.abspath(LORA_DIR)

MAX_TOKENS = 50          # توکن خروجی (کمتر = سریع‌تر)
TEMPERATURE = 0.7
NUM_TESTS = 2            # تعداد دفعات تست
# ──────────────────────────────────────────────────────


def main():
    print("=" * 60)
    print("           🚀 تست Phi + LoRA")
    print(f"           {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # 1️⃣ بررسی فایل‌ها
    print("\n📂 فایل‌های مدل:")
    for f in ["config.json", "model.safetensors", "model-001.safetensors", "tokenizer.json"]:
        path = os.path.join(MODEL_DIR, f)
        if os.path.exists(path):
            print(f"   ✅ {f}  ({os.path.getsize(path)/1024**2:.1f}MB)")
        else:
            print(f"   ⚠️ {f}  پیدا نشد")

    # بررسی LoRA (اختیاری)
    lora_files = [
        os.path.join(LORA_DIR, "adapter_config.json"),
        os.path.join(LORA_DIR, "adapter_model.safetensors"),
    ]
    has_lora = all(os.path.exists(f) for f in lora_files)
    if has_lora:
        print(f"\n✅ LoRA adapter پیدا شد در: {LORA_DIR}")
    else:
        print(f"\nℹ️ LoRA adapter پیدا نشد (تست فقط با مدل پایه)")

    # 2️⃣ بارگذاری
    print("\n⏳ بارگذاری...")
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import warnings
    warnings.filterwarnings("ignore")

    t0 = time.time()
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, local_files_only=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    print(f"   ✅ tokenizer: {time.time()-t0:.1f}s")

    t0 = time.time()
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_DIR, torch_dtype=torch.float32,
        device_map="cpu", local_files_only=True, low_cpu_mem_usage=True
    )
    print(f"   ✅ مدل پایه: {time.time()-t0:.1f}s")
    print(f"   📊 پارامترها: {sum(p.numel() for p in model.parameters())/1e6:.0f}M")

    # LoRA
    if has_lora:
        print("\n⏳ اتصال LoRA...")
        try:
            from peft import PeftModel
            t0 = time.time()
            model = PeftModel.from_pretrained(model, LORA_DIR, is_trainable=False)
            model = model.merge_and_unload()
            print(f"   ✅ LoRA: {time.time()-t0:.1f}s")
        except Exception as e:
            print(f"   ❌ خطا: {e}")
            has_lora = False

    model.eval()
    print(f"\n{'='*60}")
    print(f" {'🧪 تست با LoRA' if has_lora else '🧪 تست بدون LoRA'}")
    print(f"{'='*60}")

    # 3️⃣ تست‌ها
    prompts = [
        "به فارسی پاسخ بده. سلام! حالت چطوره؟",
        "What is machine learning in simple words?",
    ]

    results = []
    for i in range(min(NUM_TESTS, len(prompts))):
        prompt = prompts[i]
        messages = [{"role": "user", "content": prompt}]

        inputs = tokenizer.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True, return_tensors="pt"
        )
        input_len = inputs.shape[1]

        t1 = time.time()
        with torch.no_grad():
            outputs = model.generate(
                inputs, max_new_tokens=MAX_TOKENS, temperature=TEMPERATURE,
                do_sample=True, top_p=0.9, repeat_penalty=1.1,
                pad_token_id=tokenizer.eos_token_id
            )
        elapsed = time.time() - t1

        out_len = outputs.shape[1] - input_len
        text = tokenizer.decode(outputs[0][input_len:], skip_special_tokens=True)
        tps = out_len / elapsed if elapsed > 0 else 0

        results.append({
            "input_tokens": input_len, "output_tokens": out_len,
            "time_s": round(elapsed, 2), "tps": round(tps, 2)
        })

        print(f"\n  تست {i+1}:")
        print(f"  📝 {prompt[:60]}...")
        print(f"  🤖 {text[:150]}")
        print(f"  ⏱️ {elapsed:.1f}s | 📊 {out_len} tok | 🚀 {tps:.2f} tok/s")

    # 4️⃣ خلاصه
    print(f"\n{'='*60}")
    print(" 📊 خلاصه نهایی")
    print(f"{'='*60}")
    avg_t = sum(r["time_s"] for r in results) / len(results)
    avg_s = sum(r["tps"] for r in results) / len(results)
    print(f"  میانگین زمان: {avg_t:.1f}s")
    print(f"  میانگین سرعت: {avg_s:.2f} tok/s")
    
    ram_gb = sum(p.numel() for p in model.parameters()) * 4 / 1024**3
    print(f"  RAM مصرفی: ~{ram_gb:.1f} GB (float32)")
    print(f"  LoRA: {'✅' if has_lora else '❌'}")
    
    # ذخیره نتیجه
    result_file = os.path.join(os.path.dirname(__file__), "..", "logs", "phi_test.json")
    os.makedirs(os.path.dirname(result_file), exist_ok=True)
    with open(result_file, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "lora": has_lora,
            "avg_time_s": avg_t,
            "avg_tps": avg_s,
            "results": results
        }, f, indent=2)
    print(f"\n  💾 نتیجه ذخیره شد: {result_file}")

    print(f"\n✅ برای اجرا روی سرور:")
    print("   python3 ai_service/app/scripts/test_phi_server.py")


if __name__ == "__main__":
    main()
