#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اسکریپت اندازه‌گیری مصرف RAM و منابع سیستم برای پروژه AI Microservice
این اسکریپت:
1. مصرف RAM قبل از بارگذاری مدل را اندازه می‌گیرد
2. مدل را بارگذاری می‌کند و مصرف RAM حین بارگذاری را اندازه می‌گیرد
3. یک inference انجام می‌دهد و مصرف RAM حین اجرا را اندازه می‌گیرد
4. میزان حافظه مجازی (Swap) مصرفی را نیز گزارش می‌دهد
5. تخمین کانفیگ سرور مناسب را پیشنهاد می‌دهد

نحوه اجرا:
    .venv/bin/python3 app/scripts/measure_resources.py
    
    یا با متغیر محیطی برای پورت:
    PORT=5009 .venv/bin/python3 app/scripts/measure_resources.py
"""

import os
import sys
import time
import json
import platform
from datetime import datetime

# ======================================================================
# تنظیمات مسیر
# ======================================================================
# مسیر مطلق: این اسکریپت در ai_service/app/scripts/ قرار دارد
# پس ۳ سطح بالا می‌رویم تا به ai_service برسیم
AI_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # ai_service/
APP_DIR = os.path.join(AI_SERVICE_DIR, "app")
MODEL_DIR = os.path.join(APP_DIR, "ai_model")
MODEL_PATH = os.path.join(MODEL_DIR, "zhaav-gemma3-4B-001.gguf")

# اضافه کردن مسیرهای app به PYTHONPATH برای import settings
sys.path.insert(0, APP_DIR)
sys.path.insert(0, AI_SERVICE_DIR)

# ======================================================================
# توابع اندازه‌گیری RAM
# ======================================================================

def get_ram_usage_mb() -> float:
    """برمی‌گرداند میزان RAM مصرفی پروسه جاری به مگابایت"""
    try:
        import psutil
        process = psutil.Process(os.getpid())
        mem = process.memory_info()
        return {
            "rss_mb": round(mem.rss / (1024 * 1024), 2),        # حافظه فیزیکی
            "vms_mb": round(mem.vms / (1024 * 1024), 2),        # حافظه مجازی
            "shared_mb": round(getattr(mem, 'shared', 0) / (1024 * 1024), 2),
            "percent": process.memory_percent(),
        }
    except ImportError:
        # fallback: از /proc/self/status (فقط لینوکس)
        try:
            with open(f"/proc/{os.getpid()}/status") as f:
                data = f.read()
            rss_kb = 0
            vms_kb = 0
            for line in data.split("\n"):
                if line.startswith("VmRSS:"):
                    rss_kb = int(line.split()[1])
                if line.startswith("VmSize:"):
                    vms_kb = int(line.split()[1])
            return {
                "rss_mb": round(rss_kb / 1024, 2),
                "vms_mb": round(vms_kb / 1024, 2),
                "shared_mb": 0,
                "percent": 0,
            }
        except:
            return {"rss_mb": 0, "vms_mb": 0, "shared_mb": 0, "percent": 0}


def get_system_ram() -> dict:
    """برمی‌گرداند اطلاعات کلی RAM سیستم"""
    try:
        import psutil
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()
        return {
            "total_ram_gb": round(mem.total / (1024**3), 2),
            "available_ram_gb": round(mem.available / (1024**3), 2),
            "used_ram_gb": round(mem.used / (1024**3), 2),
            "percent_used": mem.percent,
            "swap_total_gb": round(swap.total / (1024**3), 2),
            "swap_used_gb": round(swap.used / (1024**3), 2),
            "swap_percent": swap.percent,
        }
    except ImportError:
        # fallback با دستور vm_stat (macOS)
        try:
            import subprocess
            result = subprocess.run(["vm_stat"], capture_output=True, text=True)
            total = os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_PHYS_PAGES') / (1024**3)
            return {
                "total_ram_gb": round(total, 2),
                "available_ram_gb": "?",
                "used_ram_gb": "?",
                "percent_used": "?",
                "swap_total_gb": "?",
                "swap_used_gb": "?",
                "swap_percent": "?",
            }
        except:
            return {}


def get_gpu_info() -> dict:
    """بررسی وجود GPU و VRAM"""
    gpu_info = {"available": False, "name": None, "vram_total_mb": None}
    try:
        import subprocess
        # بررسی nvidia-smi
        result = subprocess.run(["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader"],
                                capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            parts = result.stdout.strip().split(", ")
            gpu_info["available"] = True
            gpu_info["name"] = parts[0] if len(parts) > 0 else "NVIDIA GPU"
            if len(parts) > 1:
                gpu_info["vram_total_mb"] = parts[1]
    except:
        pass
    return gpu_info


# ======================================================================
# تست اصلی
# ======================================================================

def run_measurement():
    print("=" * 70)
    print("📊 اندازه‌گیری مصرف RAM و منابع سیستم برای AI Service")
    print("=" * 70)
    print(f"🕐 زمان: {datetime.now().isoformat()}")
    print(f"💻 سیستم: {platform.system()} {platform.release()}")
    print(f"🐍 Python: {sys.version}")
    print()

    # ── اطلاعات سیستم ──
    sys_ram = get_system_ram()
    print("─── حافظه سیستم ───")
    print(f"  RAM کل:    {sys_ram.get('total_ram_gb', '?')} GB")
    print(f"  RAM آزاد:  {sys_ram.get('available_ram_gb', '?')} GB")
    print(f"  Swap کل:   {sys_ram.get('swap_total_gb', '?')} GB")
    print(f"  Swap مصرفی: {sys_ram.get('swap_used_gb', '?')} GB")

    gpu = get_gpu_info()
    if gpu["available"]:
        print(f"  🎮 GPU: {gpu['name']} | VRAM: {gpu['vram_total_mb']}")
    else:
        print(f"  🖥️ GPU: تشخیص داده نشد (CPU mode)")
    print()

    # ── بررسی فایل مدل ──
    print("─── فایل مدل ───")
    if os.path.exists(MODEL_PATH):
        size_gb = os.path.getsize(MODEL_PATH) / (1024**3)
        print(f"  ✅ مدل: {os.path.basename(MODEL_PATH)}")
        print(f"  📦 حجم فایل: {size_gb:.2f} GB")
    else:
        print(f"  ❌ مدل پیدا نشد: {MODEL_PATH}")
        print("  لطفاً مسیر را بررسی کنید.")
        return
    print()

    # ── مرحله 1: قبل از بارگذاری ──
    print("─── مرحله 1: قبل از بارگذاری مدل ───")
    ram_before = get_ram_usage_mb()
    print(f"  RAM مصرفی (RSS): {ram_before['rss_mb']} MB")
    print(f"  RAM مجازی (VMS): {ram_before['vms_mb']} MB")
    base_ram = ram_before['rss_mb']
    print()

    # ── مرحله 2: بارگذاری مدل ──
    print("─── مرحله 2: بارگذاری مدل (لطفاً صبر کنید...) ───")
    sys.stdout.flush()

    # بارگذاری واقعی مدل
    from llama_cpp import Llama
    from app.config import settings

    load_start = time.time()

    llm = Llama(
        model_path=MODEL_PATH,
        n_ctx=settings.N_CTX,
        n_threads=settings.N_THREADS,
        n_gpu_layers=settings.N_GPU_LAYERS,
        verbose=False,
        seed=-1,
    )
    load_elapsed = time.time() - load_start

    ram_after_load = get_ram_usage_mb()
    load_ram_increase = round(ram_after_load['rss_mb'] - base_ram, 2)

    print(f"  ✅ مدل بارگذاری شد در {load_elapsed:.2f} ثانیه")
    print(f"  RAM مصرفی بعد از بارگذاری (RSS): {ram_after_load['rss_mb']} MB")
    print(f"  📈 افزایش RAM: +{load_ram_increase} MB")
    print()

    # ── مرحله 3: Inference ──
    print("─── مرحله 3: اجرای Inference (لطفاً صبر کنید...) ───")
    sys.stdout.flush()

    inference_start = time.time()
    response = llm.create_chat_completion(
        messages=[
            {"role": "system", "content": "به فارسی مختصر پاسخ بده."},
            {"role": "user", "content": "سلام! چطوری؟ یک معرفی کوتاه از خودت بده."},
        ],
        max_tokens=32,
        temperature=0.7,
        top_p=0.9,
        repeat_penalty=1.1,
    )
    inference_elapsed = time.time() - inference_start

    reply = response['choices'][0]['message']['content'].strip()
    tokens_generated = response.get('usage', {}).get('completion_tokens', 0)
    tokens_per_sec = round(tokens_generated / inference_elapsed, 2) if inference_elapsed > 0 else 0

    ram_after_inference = get_ram_usage_mb()
    inference_ram_peak = max(ram_after_load['rss_mb'], ram_after_inference['rss_mb'])

    print(f"  ✅ Inference کامل شد در {inference_elapsed:.2f} ثانیه")
    print(f"  📝 پاسخ: \"{reply[:100]}...\" ({len(reply)} کاراکتر)")
    print(f"  🔢 توکن‌های تولیدشده: {tokens_generated}")
    print(f"  ⚡ سرعت: {tokens_per_sec} توکن/ثانیه")
    print(f"  📈 RAM مصرفی (RSS): {ram_after_inference['rss_mb']} MB")
    print(f"  📊 حداکثر RAM: {inference_ram_peak} MB")
    print()

    # ── نتیجه نهایی ──
    print("=" * 70)
    print("📋 گزارش نهایی مصرف منابع")
    print("=" * 70)
    print(f"  🏗️  RAM پایه (بدون مدل):        {base_ram} MB")
    print(f"  📦 RAM مدل (افزایش):            +{load_ram_increase} MB")
    print(f"  🏋️  RAM حین Inference:          {inference_ram_peak} MB")
    print(f"  💾 Swap مصرفی:                  {sys_ram.get('swap_used_gb', '?')} GB")
    print(f"  🎮 GPU:                         {'✅' if gpu['available'] else '❌'} {gpu.get('name', 'CPU')}")
    print()

    # ── تخمین کانفیگ سرور ──
    inference_ram_gb = round(inference_ram_peak / 1024, 2)
    swap_buffer = 1.0  # 1GB buffer برای Swap/overhead
    system_overhead = 0.5  # 500MB برای سیستم عامل
    
    # تخمین برای ai_service
    ai_service_ram = round(inference_ram_gb + swap_buffer, 1)
    
    # تخمین برای backend (Django + Celery + Redis)
    backend_ram = 1.5  # Django ~300MB + Celery ~200MB + Redis ~500MB + buffer
    
    # تخمین برای frontend (Next.js)
    frontend_ram = 0.5  # Next.js build + runtime
    
    # تخمین برای Qdrant (در آینده)
    qdrant_ram = 2.0
    
    # تخمین کل
    total_ram = round(ai_service_ram + backend_ram + frontend_ram + qdrant_ram + system_overhead, 1)

    print("─── کانفیگ پیشنهادی سرور ───")
    print(f"  🖥️ ai_service (مدل 4B GGUF):    حداقل {ai_service_ram} GB RAM")
    print(f"  🐍 backend (Django+Redis+Celery): حداقل {backend_ram} GB RAM")
    print(f"  ⚛️  frontend (Next.js):          حداقل {frontend_ram} GB RAM")
    print(f"  🔍 Qdrant (اختیاری):             حداقل {qdrant_ram} GB RAM")
    print(f"  💻 سیستم عامل:                   +{system_overhead} GB")
    print(f"  ─────────────────────────────────────")
    print(f"  🔢 جمع کل پیشنهادی:              {total_ram} GB RAM")
    print()

    # ── پیشنهاد نهایی ──
    print("─── پیشنهاد نهایی ───")
    if total_ram <= 4:
        print("  💡 کانفیگ پیشنهادی: VPS 4GB RAM + CPU 4 هسته")
        print("  📋 مثلاً: Hetzner CX22 / DigitalOcean Basic 4GB")
    elif total_ram <= 8:
        print("  💡 کانفیگ پیشنهادی: VPS 8GB RAM + CPU 4-8 هسته")
        print("  📋 مثلاً: Hetzner CX32 / DigitalOcean Premium 8GB")
    elif total_ram <= 16:
        print("  💡 کانفیگ پیشنهادی: VPS 16GB RAM + CPU 8 هسته")
        print("  📋 مثلاً: Hetzner CX42 / DigitalOcean Premium 16GB")
    elif total_ram <= 32:
        print("  💡 کانفیگ پیشنهادی: VPS 32GB RAM + CPU 8-16 هسته")
        print("  📋 مثلاً: Hetzner CCX23 / DigitalOcean Premium 32GB")
    else:
        print("  💡 کانفیگ پیشنهادی: سرور اختصاصی 64GB RAM + GPU")
        print("  📋 مثلاً: Hetzner AX102 + RTX 4090 / A100 40GB")

    print()
    print("─── نکات مهم ───")
    print("  1. اگر از GPU استفاده کنید، RAM مصرفی مدل به VRAM منتقل می‌شود")
    print("     و RAM سیستم آزاد می‌شود (فقط ~2GB اشغال می‌کند)")
    print("  2. اگر مدل کوچک‌تر مثل Gemma 2 2B (1.5GB GGUF) استفاده کنید،")
    print("     RAM مصرفی نصف می‌شود.")
    print("  3. در حالت CPU، سرعت inference ~0.05 توکن/ثانیه است")
    print("     (حدود ۳ دقیقه برای یک جمله کوتاه)")
    print("  4. برای پاسخ‌های طولانی‌تر، به رم بیشتری نیاز دارید")
    print("=" * 70)


if __name__ == "__main__":
    run_measurement()

