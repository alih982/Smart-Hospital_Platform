FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# نصب وابستگی‌های سیستمی مورد نیاز
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# کپی فایل requirements و نصب وابستگی‌ها (هم برای سرویس و هم فاین‌تیون)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# کپی کل پروژه
COPY . .

# ایجاد پوشه‌های مورد نیاز
RUN mkdir -p app/ai_model app/lora_model logs data

# اسکریپت فاین‌تیون را قابل اجرا می‌کنیم
RUN chmod +x retrain.sh

# نقطه ورودی پیش‌فرض: اجرای سرویس اصلی (FastAPI)
ENTRYPOINT ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000", "--workers", "1"]

# اگر RUN_MODE=finetune تنظیم شود، اسکریپت retrain.sh اجرا می‌شود
CMD []