#!/bin/bash
# ============================================
# AI Service - Offline Package Builder 🚀
# ============================================
# این اسکریپت را حالا که اینترنت جهانی هست اجرا کن
# همه چی رو دانلود می‌کنه و تو یه پکیج آفلاین می‌ریزه
# بعدش می‌تونی ببری رو سرور با اینترنت ملی
# ============================================

set -euo pipefail
trap 'echo -e "\n❌ خطا در خط $LINENO"; exit 1' ERR

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/offline_package"
WHEELS_DIR="$OUTPUT_DIR/wheels"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$WHEELS_DIR"

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     AI Service - Offline Package Builder        ║${NC}"
echo -e "${CYAN}║     با اینترنت جهانی → پکیج آفلاین             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ─── ۱. تشخیص معماری ───
ARCH=$(uname -m)
echo -e "${YELLOW}[۱/۶] معماری سیستم: $ARCH${NC}"

# ─── ۲. دانلود ویل‌های پایتون ───
echo -e "\n${YELLOW}[۲/۶] دانلود ویل‌های پایتون از اینترنت جهانی...${NC}"
echo -e "${BLUE}   مقصد: $WHEELS_DIR${NC}"

PYTHON_PACKAGES=(
    "fastapi==0.115.0"
    "uvicorn==0.27.0"
    "pydantic==2.10.0"
    "pydantic-settings==2.6.1"
    "python-multipart==0.0.9"
    "llama-cpp-python==0.2.90"
)

for pkg in "${PYTHON_PACKAGES[@]}"; do
    echo -e "  ${BLUE}📦 $pkg${NC}"
    pip download --only-binary=:all: --platform manylinux2014_x86_64 --python-version 3.10 --dest "$WHEELS_DIR" "$pkg" 2>/dev/null || \
    pip download --no-binary=:all: --dest "$WHEELS_DIR" "$pkg" 2>/dev/null || true
done

echo -e "${GREEN}  ✅ ویل‌ها دانلود شد: $(ls "$WHEELS_DIR"/*.whl 2>/dev/null | wc -l) فایل${NC}"

# ─── ۳. کپی فایل‌های پروژه ───
echo -e "\n${YELLOW}[۳/۶] کپی فایل‌های پروژه...${NC}"

mkdir -p "$OUTPUT_DIR/ai_service"

# کپی همه فایل‌های ai_service جز مدل و کش
rsync -a --exclude='__pycache__' --exclude='.venv*' --exclude='.DS_Store' \
    --exclude='*.safetensors' --exclude='*.gguf' --exclude='*.pyc' \
    --exclude='node_modules' --exclude='offline_package' \
    --exclude='logs/*.json' \
    "$SCRIPT_DIR/" "$OUTPUT_DIR/ai_service/" 2>/dev/null

# کپی فایل‌های اصلی کنار پکیج
cp "$SCRIPT_DIR/requirements.txt" "$OUTPUT_DIR/requirements.txt" 2>/dev/null || true
cp "$SCRIPT_DIR/deploy_ubuntu.sh" "$OUTPUT_DIR/deploy.sh" 2>/dev/null || true

echo -e "${GREEN}  ✅ فایل‌های پروژه کپی شد${NC}"

# ─── ۴. ساخت requirements_offline.txt ───
echo -e "\n${YELLOW}[۴/۶] ساخت requirements_offline.txt...${NC}"

cat > "$OUTPUT_DIR/requirements_offline.txt" << 'REQEOF'
# AI Service - Offline Requirements
--find-links=./wheels
--no-index
fastapi==0.115.0
uvicorn==0.27.0
pydantic==2.10.0
pydantic-settings==2.6.1
python-multipart==0.0.9
llama-cpp-python==0.2.90
REQEOF

cp "$OUTPUT_DIR/requirements_offline.txt" "$OUTPUT_DIR/ai_service/requirements_offline.txt"
echo -e "${GREEN}  ✅ requirements_offline.txt ساخته شد${NC}"

# ─── ۵. ساخت install.sh ───
echo -e "\n${YELLOW}[۵/۶] ساخت installer یک‌دستوری...${NC}"

cat > "$OUTPUT_DIR/install.sh" << 'INSTALLEOF'
#!/bin/bash
# ============================================
# AI Service - Offline Installer 🚀
# ============================================
# اجرا روی سرور با اینترنت ملی:
#   bash install.sh
# ============================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/ai_install_$DATE.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   AI Service - Offline Installer       ║${NC}"
echo -e "${CYAN}║   یک دستور = استقرار کامل              ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo -e "${YELLOW}📋 لاگ: $LOG_FILE${NC}"
echo ""

# ۰. بررسی سیستم
echo -e "${BLUE}[۰/۵] بررسی سیستم...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ python3 نصب نیست. اجرا: sudo apt install python3 python3-pip python3-venv${NC}"
    exit 1
fi
echo -e "${GREEN}✅ python3: $(python3 --version)${NC}"

# ۱. وابستگی‌های سیستمی
echo -e "\n${BLUE}[۱/۵] نصب وابستگی‌های سیستمی...${NC}"
sudo apt-get update -qq 2>&1 | tee -a "$LOG_FILE"
sudo apt-get install -y -qq build-essential python3 python3-pip python3-venv cmake pkg-config curl 2>&1 | tee -a "$LOG_FILE"
echo -e "${GREEN}✅ وابستگی‌های سیستمی نصب شد${NC}"

# ۲. محیط مجازی
echo -e "\n${BLUE}[۲/۵] ساخت محیط مجازی...${NC}"
VENV_DIR="$HOME/ai_service_venv"
[ -d "$VENV_DIR" ] && rm -rf "$VENV_DIR"
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
echo -e "${GREEN}✅ محیط مجازی: $VENV_DIR${NC}"

# ۳. نصب پکیج‌ها
echo -e "\n${BLUE}[۳/۵] نصب پکیج‌های پایتون...${NC}"
WHEELS_DIR="$SCRIPT_DIR/wheels"
if [ -d "$WHEELS_DIR" ] && [ "$(ls -A "$WHEELS_DIR" 2>/dev/null)" ]; then
    echo -e "${YELLOW}   نصب از ویل‌های محلی ($(ls "$WHEELS_DIR"/*.whl 2>/dev/null | wc -l) فایل)...${NC}"
    pip install --no-cache-dir --no-index --find-links="$WHEELS_DIR" \
        fastapi uvicorn pydantic pydantic-settings python-multipart llama-cpp-python \
        2>&1 | tail -10 | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}   ⚠️ ویل محلی پیدا نشد. نصب از اینترنت...${NC}"
    pip install --no-cache-dir fastapi==0.115.0 uvicorn==0.27.0 pydantic==2.10.0 \
        pydantic-settings==2.6.1 python-multipart==0.0.9 llama-cpp-python==0.2.90 \
        2>&1 | tail -10 | tee -a "$LOG_FILE"
fi
echo -e "${GREEN}✅ پکیج‌ها نصب شد${NC}"

# ۴. سرویس systemd
echo -e "\n${BLUE}[۴/۵] تنظیم سرویس systemd...${NC}"
SERVICE_FILE="/etc/systemd/system/ai-service.service"
sudo tee "$SERVICE_FILE" > /dev/null << SVCEOF
[Unit]
Description=AI Service - FastAPI + llama-cpp-python
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR/ai_service
Environment=PATH=$VENV_DIR/bin:/usr/local/bin:/usr/bin:/bin
Environment=PYTHONPATH=$SCRIPT_DIR/ai_service
Environment=PYTHONUNBUFFERED=1
Environment=N_THREADS=2
Environment=N_GPU_LAYERS=0
Environment=N_CTX=1024
ExecStart=$VENV_DIR/bin/uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 1
Restart=always
RestartSec=5
StandardOutput=append:$SCRIPT_DIR/ai_service/logs/ai-service.log
StandardError=append:$SCRIPT_DIR/ai_service/logs/ai-service-error.log

[Install]
WantedBy=multi-user.target
SVCEOF
sudo systemctl daemon-reload
echo -e "${GREEN}✅ سرویس systemd ایجاد شد${NC}"

# ۵. فایروال
echo -e "\n${BLUE}[۵/۵] تنظیم فایروال...${NC}"
command -v ufw &> /dev/null && sudo ufw allow 5000/tcp 2>/dev/null || true
echo -e "${GREEN}✅ پورت 5000 باز شد${NC}"

# خلاصه
echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   نصب کامل شد! ✅                       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📋 خلاصه:${NC}"
echo -e "  محیط مجازی:  $VENV_DIR"
echo -e "  پورت:         5000"
echo -e "  مسیر:         $SCRIPT_DIR"
echo -e ""
echo -e "${YELLOW}🚀 راه‌اندازی:${NC}"
echo -e "  sudo systemctl enable ai-service"
echo -e "  sudo systemctl start ai-service"
echo -e "  sudo systemctl status ai-service"
echo -e "  curl http://localhost:5000/health"
echo -e "${GREEN}✅ کار تمام${NC}"
INSTALLEOF

chmod +x "$OUTPUT_DIR/install.sh"
echo -e "${GREEN}  ✅ install.sh ساخته شد${NC}"

# ─── ۶. بسته‌بندی ───
echo -e "\n${YELLOW}[۶/۶] بسته‌بندی نهایی...${NC}"
ARCHIVE_NAME="ai_service_offline_${DATE}.tar.gz"
cd "$OUTPUT_DIR"
tar -czf "$SCRIPT_DIR/$ARCHIVE_NAME" --exclude='__pycache__' --exclude='.DS_Store' . 2>&1 | tail -3
cd "$SCRIPT_DIR"
FINAL_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   پکیج آفلاین آماده است! 🎯                     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📦 بسته: $ARCHIVE_NAME${NC}"
echo -e "${GREEN}📏 حجم: $FINAL_SIZE${NC}"
echo ""
echo -e "${YELLOW}🔹 انتقال به سرور:${NC}"
echo -e "   scp $ARCHIVE_NAME user@server:/tmp/"
echo ""
echo -e "${YELLOW}🔹 نصب روی سرور (دیتاسنتر ملی):${NC}"
echo -e "   cd /tmp"
echo -e "   tar -xzf $ARCHIVE_NAME"
echo -e "   bash install.sh"
echo ""
echo -e "${YELLOW}⚠️  نکته: فایل مدل (safetensors) تو این پکیج نیست چون حجیمه.${NC}"
echo -e "${YELLOW}   مدل رو جدا انتقال بده به: ai_service/app/ai_model/${NC}"
