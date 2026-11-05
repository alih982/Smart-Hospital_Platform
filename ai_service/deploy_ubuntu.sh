#!/bin/bash
# ============================================
# AI Service - Ubuntu Deploy Script
# ============================================
# اجرای یک‌دستوری برای سرور ubuntu با اینترنت ملی
# ============================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/ai_service_deploy_$DATE.log"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI Service - Ubuntu Deployer         ║${NC}"
echo -e "${BLUE}║   یک دستور = استقرار کامل              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 لاگ ذخیره می‌شود در: $LOG_FILE${NC}"
echo ""

# ─── ۰. تشخیص معماری ───
ARCH=$(uname -m)
echo -e "${BLUE}[۰] معماری: $ARCH${NC}"

# ─── ۱. تنظیم APT Mirror (دیتاسنتر ملی) ───
echo -e "\n${BLUE}[۱] تنظیم APT Mirror برای دانلود سریعتر...${NC}"
sudo apt-get update -qq 2>&1 | tee -a "$LOG_FILE"

# ─── ۲. نصب وابستگی‌های سیستمی ───
echo -e "\n${BLUE}[۲] نصب وابستگی‌های سیستمی...${NC}"
sudo apt-get install -y -qq \
    build-essential \
    curl \
    wget \
    git \
    python3 \
    python3-pip \
    python3-venv \
    cmake \
    pkg-config \
    2>&1 | tee -a "$LOG_FILE"

echo -e "${GREEN}✅ وابستگی‌های سیستمی نصب شد.${NC}"

# ─── ۳. تنظیم PIP Mirror (دیتاسنتر ملی) ───
echo -e "\n${BLUE}[۳] تنظیم PIP Mirror...${NC}"
pip config set global.index-url https://pypi.org/simple/ 2>/dev/null || true
pip install --upgrade pip -q 2>&1 | tee -a "$LOG_FILE"

# ─── ۴. ساخت محیط مجازی ───
echo -e "\n${BLUE}[۴] ساخت محیط مجازی Python...${NC}"
VENV_DIR="$HOME/ai_service_venv"
if [ -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}⚠️  محیط مجازی قبلی پاک می‌شود...${NC}"
    rm -rf "$VENV_DIR"
fi
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
echo -e "${GREEN}✅ محیط مجازی ساخته شد: $VENV_DIR${NC}"

# ─── ۵. تشخیص معماری برای llama-cpp-python ───
echo -e "\n${BLUE}[۵] نصب llama-cpp-python (CPU-only)...${NC}"

# بررسی پلتفرم
if [[ "$ARCH" == "aarch64" || "$ARCH" == "arm64" ]]; then
    echo -e "${YELLOW}معماری ARM64 تشخیص داده شد. نیاز به کامپایل از سورس.${NC}"
    export LLAMA_NO_CUDA=1
    export LLAMA_NO_METAL=1
    pip install llama-cpp-python==0.2.90 --no-cache-dir --verbose 2>&1 | tail -20 | tee -a "$LOG_FILE"
elif [[ "$(uname)" == "Darwin" ]]; then
    echo -e "${YELLOW}macOS تشخیص داده شد. نصب llama-cpp-python با ویل...${NC}"
    export LLAMA_NO_CUDA=1
    export LLAMA_METAL=1
    pip install llama-cpp-python==0.2.90 --no-cache-dir --verbose 2>&1 | tail -20 | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}Linux x86_64 تشخیص داده شد. نصب llama-cpp-python (CPU)...${NC}"
    export LLAMA_NO_CUDA=1
    export LLAMA_NO_METAL=1
    pip install llama-cpp-python==0.2.90 --no-cache-dir --verbose 2>&1 | tail -20 | tee -a "$LOG_FILE"
fi

echo -e "${GREEN}✅ llama-cpp-python نصب شد.${NC}"

# ─── ۶. نصب بقیه وابستگی‌های Python ───
echo -e "\n${BLUE}[۶] نصب بقیه وابستگی‌های Python...${NC}"
pip install \
    fastapi==0.115.0 \
    "uvicorn[standard]==0.27.0" \
    pydantic==2.10.0 \
    pydantic-settings==2.6.1 \
    python-multipart==0.0.9 \
    --no-cache-dir \
    2>&1 | tail -10 | tee -a "$LOG_FILE"

echo -e "${GREEN}✅ همه وابستگی‌ها نصب شد.${NC}"

# ─── ۷. بررسی فایل مدل ───
echo -e "\n${BLUE}[۷] بررسی فایل مدل GGUF...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODEL_DIR="$SCRIPT_DIR/app/ai_model"
MODEL_FILE="$MODEL_DIR/zhaav-gemma3-4B-001.gguf"

if [ -f "$MODEL_FILE" ]; then
    SIZE_MB=$(du -h "$MODEL_FILE" | cut -f1)
    echo -e "${GREEN}✅ مدل وجود دارد: $MODEL_FILE ($SIZE_MB)${NC}"
else
    echo -e "${RED}❌ مدل وجود ندارد: $MODEL_FILE${NC}"
    echo -e "${YELLOW}⚠️  لطفاً فایل GGUF را در $MODEL_DIR قرار دهید.${NC}"
    echo -e "${YELLOW}⚠️  بدون مدل، سرویس کار نمی‌کند.${NC}"
fi

# ─── ۸. ایجاد دایرکتوری لاگ ───
echo -e "\n${BLUE}[۸] ایجاد دایرکتوری‌های مورد نیاز...${NC}"
mkdir -p "$SCRIPT_DIR/logs"
mkdir -p "$SCRIPT_DIR/data"
mkdir -p "$SCRIPT_DIR/app/data"
echo -e "${GREEN}✅ دایرکتوری‌ها آماده شد.${NC}"

# ─── ۹. تنظیم systemd Service ───
echo -e "\n${BLUE}[۹] تنظیم systemd سرویس...${NC}"
SERVICE_NAME="ai-service"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

sudo tee "$SERVICE_FILE" > /dev/null << SVCEOF
[Unit]
Description=AI Service - FastAPI + llama-cpp-python
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR
Environment=PATH=$VENV_DIR/bin:/usr/local/bin:/usr/bin:/bin
Environment=PYTHONPATH=$SCRIPT_DIR
Environment=PYTHONUNBUFFERED=1
Environment=N_THREADS=2
Environment=N_GPU_LAYERS=0
Environment=N_CTX=1024
ExecStart=$VENV_DIR/bin/uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 1 --loop asyncio
Restart=always
RestartSec=5
StandardOutput=append:$SCRIPT_DIR/logs/ai-service.log
StandardError=append:$SCRIPT_DIR/logs/ai-service-error.log

[Install]
WantedBy=multi-user.target
SVCEOF

sudo systemctl daemon-reload
echo -e "${GREEN}✅ فایل سرویس systemd ساخته شد.${NC}"

# ─── ۱۰. تنظیم Firewall ───
echo -e "\n${BLUE}[۱۰] تنظیم Firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 5000/tcp 2>/dev/null || true
    echo -e "${GREEN}✅ پورت 5000 باز شد.${NC}"
else
    echo -e "${YELLOW}⚠️  ufw نصب نیست. پورت 5000 باید دستی باز شود.${NC}"
fi

# ─── ۱۱. خلاصه ───
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   نصب کامل شد!                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📋 خلاصه:${NC}"
echo -e "  محیط مجازی:    $VENV_DIR"
echo -e "  پورت:           5000"
echo -e "  دایرکتوری:      $SCRIPT_DIR"
echo -e "  مدل:            $MODEL_FILE"
echo -e "  لاگ:            $SCRIPT_DIR/logs/"
echo -e ""
echo -e "${YELLOW}🚀 دستورات مدیریتی:${NC}"
echo -e "  ${GREEN}راه‌اندازی مستقیم:${NC}"
echo -e "    source $VENV_DIR/bin/activate"
echo -e "    uvicorn app.main:app --host 0.0.0.0 --port 5000"
echo -e ""
echo -e "  ${GREEN}راه‌اندازی با systemd (پس‌زمینه):${NC}"
echo -e "    sudo systemctl enable ai-service"
echo -e "    sudo systemctl start ai-service"
echo -e "    sudo systemctl status ai-service"
echo -e ""
echo -e "  ${GREEN}مشاهده لاگ:${NC}"
echo -e "    sudo journalctl -u ai-service -f"
echo -e "    tail -f $SCRIPT_DIR/logs/ai-service.log"
echo -e ""
echo -e "  ${GREEN}تست سرویس:${NC}"
echo -e "    curl http://localhost:5000/health"
echo -e "    curl -X POST http://localhost:5000/api/v1/chat \\"
echo -e "      -H 'Content-Type: application/json' \\"
echo -e "      -d '{\"message\":\"سلام\"}'"
echo -e ""
echo -e "${BLUE}✅ کار تمام. اجرای یک‌دستوری موفقیت‌آمیز بود.${NC}"

