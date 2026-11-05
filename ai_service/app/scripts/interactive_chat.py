#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
💬 چت تعاملی با مدل هوش مصنوعی - کاملاً آفلاین
===============================================
این اسکریپت مدل GGUF را مستقیماً بارگذاری می‌کند و
شما می‌توانید در ترمینال با مدل حرف بزنید.
نیازی به اینترنت یا سرور FastAPI ندارد.

نحوه اجرا:
    cd ai_service
    .venv/bin/python3 app/scripts/interactive_chat.py

دستورات ویژه:
    /exit   - خروج
    /reset  - پاک کردن تاریخچه
    /stats  - آمار جلسه فعلی
    /help   - راهنما
    /save   - ذخیره مکالمه در فایل JSON
"""

import os
import sys
import time
import json
from datetime import datetime

# ─── تنظیم مسیر ───
SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APP_DIR = os.path.join(SCRIPT_DIR, "app")
sys.path.insert(0, APP_DIR)
sys.path.insert(0, SCRIPT_DIR)

MODEL_DIR = os.path.join(APP_DIR, "ai_model")
MODEL_PATH = os.path.join(MODEL_DIR, "zhaav-gemma3-4B-001.gguf")

# ─── تنظیمات ───
N_THREADS = int(os.environ.get("N_THREADS", "4"))       # تعداد هسته CPU
N_CTX = int(os.environ.get("N_CTX", "1024"))            # حافظه context
MAX_TOKENS = int(os.environ.get("MAX_TOKENS", "128"))    # حداکثر توکن خروجی
TEMPERATURE = float(os.environ.get("TEMPERATURE", "0.7"))
TOP_P = float(os.environ.get("TOP_P", "0.9"))
REPEAT_PENALTY = float(os.environ.get("REPEAT_PENALTY", "1.1"))
SYSTEM_PROMPT = os.environ.get(
    "SYSTEM_PROMPT",
    "تو یک دستیار هوش مصنوعی مفید هستی. به فارسی روان و مختصر پاسخ بده."
)

# ─── تاریخچه ───
messages = []
stats = {
    "total_tokens": 0,
    "total_time": 0.0,
    "total_requests": 0,
    "start_time": datetime.now(),
}


def clear_screen():
    """پاک کردن صفحه ترمینال"""
    os.system('cls' if os.name == 'nt' else 'clear')


def print_header():
    """نمایش هدر برنامه"""
    header = f"""
╔══════════════════════════════════════════════════════╗
║     💬 چت با Zhaav Gemma 3 4B - آفلاین              ║
║     مدل: {os.path.basename(MODEL_PATH)[:30]:<30} ║
║     دستور /help برای راهنما    /exit برای خروج      ║
╚══════════════════════════════════════════════════════╝
"""
    print(header)


def print_help():
    """نمایش راهنما"""
    help_text = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖  راهنما
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /exit      - خروج از برنامه
  /reset     - پاک کردن تاریخچه مکالمه
  /stats     - نمایش آمار جلسه
  /save      - ذخیره مکالمه در فایل JSON
  /help      - نمایش این راهنما
  /system    - تغییر system prompt
  /model     - نمایش اطلاعات مدل

💡  هر پیام دیگری به‌عنوان سوال از مدل پردازش می‌شود.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
    print(help_text)


def load_model():
    """بارگذاری مدل GGUF با llama-cpp-python"""
    if not os.path.exists(MODEL_PATH):
        print(f"\n❌ مدل پیدا نشد: {MODEL_PATH}")
        print("   لطفاً مسیر فایل GGUF را بررسی کنید.")
        sys.exit(1)

    print(f"\n🔄 در حال بارگذاری مدل... (این کار چند لحظه طول می‌کشد)")
    print(f"   📦 فایل: {os.path.basename(MODEL_PATH)}")
    size_gb = os.path.getsize(MODEL_PATH) / (1024**3)
    print(f"   💾 حجم: {size_gb:.2f} GB")
    print(f"   🧵 هسته‌ها: {N_THREADS}")
    print(f"   📝 حافظه: {N_CTX} توکن")
    sys.stdout.flush()

    start = time.time()
    from llama_cpp import Llama

    llm = Llama(
        model_path=MODEL_PATH,
        n_ctx=N_CTX,
        n_threads=N_THREADS,
        n_gpu_layers=0,  # CPU mode
        verbose=False,
        seed=-1,
    )
    elapsed = time.time() - start
    print(f"   ✅ مدل بارگذاری شد در {elapsed:.2f} ثانیه ✅\n")
    return llm


def chat_once(llm, user_input: str) -> str:
    """یک بار با مدل حرف بزن و پاسخ بگیر"""
    global messages, stats

    # اضافه کردن پیام کاربر به تاریخچه
    messages.append({"role": "user", "content": user_input})

    # ساخت پیام‌ها برای مدل
    chat_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    # آخرین ۶ پیام رو می‌فرستیم (برای صرفه‌جویی در RAM)
    for msg in messages[-6:]:
        chat_messages.append(msg)

    # اندازه تقریبی ورودی
    input_chars = sum(len(m["content"]) for m in chat_messages)
    print(f"   📤 ارسال ({input_chars} کاراکتر)...", end=" ")
    sys.stdout.flush()

    start_time = time.time()

    response = llm.create_chat_completion(
        messages=chat_messages,
        max_tokens=MAX_TOKENS,
        temperature=TEMPERATURE,
        top_p=TOP_P,
        repeat_penalty=REPEAT_PENALTY,
        stop=["<|im_end|>", "###", "\n\n\n"],
    )

    elapsed = time.time() - start_time
    tokens_generated = response.get("usage", {}).get("completion_tokens", 0)
    prompt_tokens = response.get("usage", {}).get("prompt_tokens", 0)
    total_tokens = response.get("usage", {}).get("total_tokens", 0)

    reply = response["choices"][0]["message"]["content"].strip()

    # به‌روزرسانی آمار
    stats["total_tokens"] += tokens_generated
    stats["total_time"] += elapsed
    stats["total_requests"] += 1

    # اضافه کردن پاسخ به تاریخچه
    messages.append({"role": "assistant", "content": reply})

    # نمایش آمار
    tokens_per_sec = tokens_generated / elapsed if elapsed > 0 else 0
    print(f"✅ {elapsed:.1f}s | {tokens_generated} توکن | {tokens_per_sec:.2f} توکن/ثانیه")

    return reply


def print_stats():
    """نمایش آمار جلسه"""
    elapsed_total = (datetime.now() - stats["start_time"]).total_seconds()
    avg_time = stats["total_time"] / stats["total_requests"] if stats["total_requests"] > 0 else 0
    avg_tokens = stats["total_tokens"] / stats["total_requests"] if stats["total_requests"] > 0 else 0

    print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊  آمار جلسه
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⏱  مدت زمان جلسه:       {elapsed_total:.0f} ثانیه
  💬 تعداد درخواست‌ها:     {stats['total_requests']}
  📝 مجموع توکن‌های خروجی: {stats['total_tokens']}
  ⚡ میانگین زمان پاسخ:    {avg_time:.1f} ثانیه
  🔢 میانگین توکن/پاسخ:    {avg_tokens:.1f}
  🐢 سرعت متوسط:          {stats['total_tokens']/stats['total_time']:.2f} توکن/ثانیه
  💾 تاریخچه:              {len(messages)} پیام
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")


def save_conversation():
    """ذخیره مکالمه در فایل JSON"""
    filename = f"chat_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = os.path.join(SCRIPT_DIR, "logs", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    data = {
        "model": os.path.basename(MODEL_PATH),
        "system_prompt": SYSTEM_PROMPT,
        "timestamp": datetime.now().isoformat(),
        "stats": {
            "total_requests": stats["total_requests"],
            "total_tokens": stats["total_tokens"],
            "total_time_seconds": round(stats["total_time"], 2),
        },
        "messages": messages,
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n💾 مکالمه در فایل ذخیره شد: {filepath}")


def change_system_prompt(llm):
    """تغییر system prompt"""
    global SYSTEM_PROMPT
    print(f"\n📝 System Prompt فعلی: {SYSTEM_PROMPT}")
    print("   system prompt جدید را وارد کنید (خالی = انصراف):")
    new_prompt = input("   >> ").strip()
    if new_prompt:
        SYSTEM_PROMPT = new_prompt
        print(f"   ✅ System Prompt تغییر کرد به: {SYSTEM_PROMPT}")
        # پاک کردن تاریخچه چون system prompt عوض شده
        global messages
        messages = []
        print("   🗑️ تاریخچه پاک شد (به دلیل تغییر system prompt)")
    else:
        print("   ❌ انصراف")


def print_model_info():
    """نمایش اطلاعات مدل"""
    size_gb = os.path.getsize(MODEL_PATH) / (1024**3) if os.path.exists(MODEL_PATH) else 0
    print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖  اطلاعات مدل
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📛 نام:          {os.path.basename(MODEL_PATH)}
  📦 حجم:          {size_gb:.2f} GB
  🧵 هسته‌ها:      {N_THREADS}
  📝 Context:      {N_CTX} توکن
  🎯 Max Tokens:   {MAX_TOKENS}
  🌡️ Temperature:  {TEMPERATURE}
  🎲 Top P:        {TOP_P}
  🔁 Rep. Penalty: {REPEAT_PENALTY}
  💻 حالت:         CPU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")


def main():
    clear_screen()
    print_header()

    # بارگذاری مدل
    llm = load_model()

    # چک سریع
    quick_test = llm.create_chat_completion(
        messages=[
            {"role": "system", "content": "فقط 'باشه' بگو"},
            {"role": "user", "content": "آماده‌ای؟"},
        ],
        max_tokens=4,
        temperature=0.1,
    )
    quick_reply = quick_test["choices"][0]["message"]["content"].strip()
    print(f"   🤖 تست سریع: {quick_reply}")
    print()

    # ─── حلقه اصلی چت ───
    print("─── شروع مکالمه (هر سوالی داری بپرس) ───\n")

    while True:
        try:
            user_input = input("🧑 شما > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nخداحافظ! 👋")
            break

        if not user_input:
            continue

        # ── دستورات ویژه ──
        if user_input.lower() == "/exit":
            print("\nخداحافظ! 👋")
            break
        elif user_input.lower() == "/reset":
            messages.clear()
            stats["total_tokens"] = 0
            stats["total_time"] = 0.0
            stats["total_requests"] = 0
            print("\n🗑️ تاریخچه پاک شد.\n")
            continue
        elif user_input.lower() == "/stats":
            print_stats()
            continue
        elif user_input.lower() == "/help":
            print_help()
            continue
        elif user_input.lower() == "/save":
            save_conversation()
            continue
        elif user_input.lower() == "/system":
            change_system_prompt(llm)
            continue
        elif user_input.lower() == "/model":
            print_model_info()
            continue

        # ── ارسال به مدل ──
        try:
            reply = chat_once(llm, user_input)
            print(f"\n🤖 مدل > {reply}\n")
        except Exception as e:
            print(f"\n❌ خطا: {e}\n")

    # ذخیره خودکار در خروج
    if messages:
        save_conversation()

    # آمار نهایی
    print_stats()


if __name__ == "__main__":
    main()

