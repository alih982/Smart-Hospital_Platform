#!/bin/bash
# retrain.sh - اجرای فاین‌تیون با یا بدون LoRA
# این اسکریپت از داخل کانتینر retrain_job اجرا می‌شود

set -euo pipefail

# رنگ‌ها برای خروجی زیبا
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}شروع فرآیند فاین‌تیون مدل Zhaav Gemma 3${NC}"
echo -e "${GREEN}========================================${NC}"

# اگر آرگومانی داده نشد، از مقادیر پیش‌فرض استفاده کن
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}هیچ آرگومانی داده نشده، استفاده از مقادیر پیش‌فرض...${NC}"
    
    # تاریخ برای نام دایرکتوری خروجی
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    # اجرای اسکریپت پایتون با پارامترهای پیش‌فرض
    python retrain_model.py \
        --base-model /app/app/ai_model/base \
        --new-data /app/data/new_samples.json \
        --output-dir /app/app/ai_model/${TIMESTAMP} \
        --threshold-perplexity 12.0 \
        --epochs 3 \
        --lr 5e-5 \
        --batch-size 4
else
    # اجرا با آرگومان‌های داده شده (می‌توانید --use-lora و --lora-path را هم اضافه کنید)
    echo -e "${YELLOW}اجرای اسکریپت با آرگومان‌های داده شده...${NC}"
    python retrain_model.py "$@"
fi

# بررسی کد خروجی
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ فاین‌تیون با موفقیت انجام شد.${NC}"
    exit 0
else
    echo -e "${RED}❌ فاین‌تیون با خطا مواجه شد.${NC}"
    exit 1
fi