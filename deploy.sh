#!/bin/bash
# ============================================
# Deploy Script - Smart Health AI Platform
# استقرار خودکار با پشتیبانی از جایگزینی مدل
# ============================================

set -euo pipefail

# ── رنگ‌ها ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ── مسیرها ──
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_MODEL_DIR="$BASE_DIR/ai_service/app/ai_model"
BACKUP_DIR="$BASE_DIR/backup"
REPORT_DIR="$BASE_DIR/reports"
LOG_DIR="$BASE_DIR/logs"

# ── تاریخ ──
DATE=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Smart Health AI Platform Deployer    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# تابع: نمایش راهنما
# ============================================
show_help() {
    echo "کاربرد: ./deploy.sh [COMMAND]"
    echo ""
    echo "COMMANDS:"
    echo "  start              راه‌اندازی همه سرویس‌ها"
    echo "  stop               توقف همه سرویس‌ها"
    echo "  restart            راه‌اندازی مجدد"
    echo "  status             وضعیت سرویس‌ها"
    echo "  logs [service]     مشاهده لاگ (backend, frontend, ai, nginx)"
    echo "  update-model       جایگزینی مدل هوش مصنوعی"
    echo "  backup             بک‌آپ از دیتابیس و لاگ‌ها"
    echo "  restore [FILE]     بازیابی از بک‌آپ"
    echo "  report             تولید گزارش اکسل"
    echo "  monitor            مانیتورینگ سرویس‌ها"
    echo "  clean              پاکسازی فایل‌های موقت"
    echo ""
    echo "EXAMPLES:"
    echo "  ./deploy.sh start"
    echo "  ./deploy.sh update-model ./new_model.gguf"
    echo "  ./deploy.sh logs ai"
}

# ============================================
# تابع: راه‌اندازی سرویس‌ها
# ============================================
start_services() {
    echo -e "${YELLOW}🚀 راه‌اندازی همه سرویس‌ها...${NC}"
    
    # بررسی Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker نصب نیست.${NC}"
        exit 1
    fi
    
    # بررسی docker-compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ docker-compose نصب نیست.${NC}"
        exit 1
    fi
    
    # ایجاد دایرکتوری‌های مورد نیاز
    mkdir -p "$LOG_DIR" "$BACKUP_DIR" "$REPORT_DIR" "$AI_MODEL_DIR"
    
    # بررسی وجود مدل
    if [ ! -f "$AI_MODEL_DIR/zhaav-gemma3-4B-001.gguf" ]; then
        echo -e "${YELLOW}⚠️  مدل GGUF وجود ندارد. لطفاً مدل را در $AI_MODEL_DIR قرار دهید.${NC}"
        echo -e "${YELLOW}⚠️  سرویس AI بدون مدل کار نخواهد کرد.${NC}"
    fi
    
    # ساخت و راه‌اندازی
    echo -e "${GREEN}📦 Building images...${NC}"
    docker-compose build
    
    echo -e "${GREEN}🚀 Starting containers...${NC}"
    docker-compose up -d
    
    # بررسی وضعیت
    sleep 5
    echo ""
    echo -e "${GREEN}✅ وضعیت سرویس‌ها:${NC}"
    docker-compose ps
    
    echo ""
    echo -e "${GREEN}📋 خلاصه:${NC}"
    echo -e "  Frontend:  http://localhost:3000"
    echo -e "  Backend:   http://localhost:8000/admin"
    echo -e "  AI API:    http://localhost:5001/docs"
    echo -e "  Nginx:     http://localhost:80"
    echo ""
    echo -e "${YELLOW}💡 برای مشاهده لاگ: ./deploy.sh logs [service]${NC}"
}

# ============================================
# تابع: توقف سرویس‌ها
# ============================================
stop_services() {
    echo -e "${YELLOW}🛑 توقف همه سرویس‌ها...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ همه سرویس‌ها متوقف شدند.${NC}"
}

# ============================================
# تابع: وضعیت سرویس‌ها
# ============================================
show_status() {
    echo -e "${BLUE}📊 وضعیت سرویس‌ها:${NC}"
    docker-compose ps
    
    echo ""
    echo -e "${BLUE}📈 مصرف منابع:${NC}"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -10
}

# ============================================
# تابع: مشاهده لاگ
# ============================================
show_logs() {
    local service=$1
    case $service in
        backend)
            docker-compose logs -f backend
            ;;
        frontend)
            docker-compose logs -f frontend
            ;;
        ai)
            docker-compose logs -f ai_service
            ;;
        nginx)
            docker-compose logs -f nginx
            ;;
        celery)
            docker-compose logs -f celery_worker
            ;;
        all)
            docker-compose logs -f
            ;;
        *)
            echo -e "${RED}سرویس نامعتبر: $service${NC}"
            echo "سرویس‌های معتبر: backend, frontend, ai, nginx, celery, all"
            exit 1
            ;;
    esac
}

# ============================================
# تابع: جایگزینی مدل هوش مصنوعی
# ============================================
update_model() {
    local new_model_path="${1:-}"
    
    if [ -z "$new_model_path" ]; then
        echo -e "${RED}❌ لطفاً مسیر فایل مدل جدید را وارد کنید.${NC}"
        echo -e "${YELLOW}مثال: ./deploy.sh update-model ./path/to/new_model.gguf${NC}"
        exit 1
    fi
    
    if [ ! -f "$new_model_path" ]; then
        echo -e "${RED}❌ فایل مدل یافت نشد: $new_model_path${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🔄 شروع جایگزینی مدل...${NC}"
    
    # ۱. چک سایز فایل
    local size=$(du -h "$new_model_path" | cut -f1)
    echo -e "  📦 سایز مدل جدید: $size"
    
    # ۲. بک‌آپ از مدل فعلی
    if [ -f "$AI_MODEL_DIR/zhaav-gemma3-4B-001.gguf" ]; then
        echo -e "  💾 بک‌آپ از مدل فعلی..."
        cp "$AI_MODEL_DIR/zhaav-gemma3-4B-001.gguf" "$BACKUP_DIR/model_backup_$DATE.gguf"
    fi
    
    # ۳. جایگزینی با لینک سمبلیک
    echo -e "  🔗 ایجاد لینک سمبلیک..."
    ln -sf "$(realpath "$new_model_path")" "$AI_MODEL_DIR/zhaav-gemma3-4B-001.gguf"
    
    # ۴. ثبت در رجیستری مدل
    echo -e "  📝 ثبت مدل جدید در رجیستری..."
    curl -s -X POST "http://localhost:5001/api/v1/mlops/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"Zhaav Gemma 3 $(basename $new_model_path .gguf)\",
            \"path\": \"$new_model_path\",
            \"model_type\": \"gguf\",
            \"format_version\": \"q4_k_m\"
        }" | python3 -m json.tool 2>/dev/null || echo "  ⚠️ رجیستری غیرفعال است"
    
    # ۵. ریستارت سرویس AI
    echo -e "  🔄 ریستارت سرویس AI..."
    docker-compose restart ai_service
    
    echo -e "${GREEN}✅ مدل با موفقیت جایگزین شد.${NC}"
    echo -e "  مدل جدید: $new_model_path"
    echo -e "  مدل قبلی (بک‌آپ): $BACKUP_DIR/model_backup_$DATE.gguf"
}

# ============================================
# تابع: بک‌آپ
# ============================================
do_backup() {
    echo -e "${YELLOW}💾 شروع بک‌آپ‌گیری...${NC}"
    
    mkdir -p "$BACKUP_DIR/$DATE"
    
    # ۱. بک‌آپ PostgreSQL
    echo -e "  📦 بک‌آپ از دیتابیس..."
    if docker-compose exec -T postgres pg_dump -U smarthealth_user smarthealth > "$BACKUP_DIR/$DATE/database.sql" 2>/dev/null; then
        gzip "$BACKUP_DIR/$DATE/database.sql"
        echo -e "  ✅ دیتابیس: $BACKUP_DIR/$DATE/database.sql.gz"
    else
        echo -e "  ⚠️ خطا در بک‌آپ دیتابیس (ممکن است سرویس در حال اجرا نباشد)"
    fi
    
    # ۲. بک‌آپ لاگ‌ها
    echo -e "  📦 بک‌آپ از لاگ‌ها..."
    if [ -d "$LOG_DIR" ]; then
        tar -czf "$BACKUP_DIR/$DATE/logs.tar.gz" -C "$LOG_DIR" . 2>/dev/null && echo -e "  ✅ لاگ‌ها: $BACKUP_DIR/$DATE/logs.tar.gz"
    fi
    
    # ۳. بک‌آپ گزارشات
    echo -e "  📦 بک‌آپ از گزارشات..."
    if [ -d "$REPORT_DIR" ]; then
        cp -r "$REPORT_DIR" "$BACKUP_DIR/$DATE/reports/" 2>/dev/null && echo -e "  ✅ گزارشات: $BACKUP_DIR/$DATE/reports/"
    fi
    
    # ۴. بک‌آپ کانفیگ
    echo -e "  📦 بک‌آپ از تنظیمات..."
    tar -czf "$BACKUP_DIR/$DATE/config.tar.gz" \
        -C "$BASE_DIR" docker-compose.yml \
        -C "$BASE_DIR/nginx" nginx.conf \
        -C "$BASE_DIR/ai_service" .env 2>/dev/null || true
    echo -e "  ✅ تنظیمات: $BACKUP_DIR/$DATE/config.tar.gz"
    
    # ۵. حذف بک‌آپ‌های قدیمی (قدیمی‌تر از ۳۰ روز)
    echo -e "  🧹 پاکسازی بک‌آپ‌های قدیمی..."
    find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null || true
    
    local total_size=$(du -sh "$BACKUP_DIR/$DATE" | cut -f1)
    echo -e "${GREEN}✅ بک‌آپ کامل شد. حجم: $total_size${NC}"
    echo -e "  مسیر: $BACKUP_DIR/$DATE"
}

# ============================================
# تابع: بازیابی از بک‌آپ
# ============================================
restore_backup() {
    local backup_file="${1:-}"
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ لطفاً فایل بک‌آپ را وارد کنید.${NC}"
        echo "بک‌آپ‌های موجود:"
        ls -1 "$BACKUP_DIR" 2>/dev/null || echo "  (هیچ بک‌آپی یافت نشد)"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ فایل بک‌آپ یافت نشد: $backup_file${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🔄 شروع بازیابی از بک‌آپ: $backup_file${NC}"
    
    # بازیابی دیتابیس
    gunzip -c "$backup_file" | docker-compose exec -T postgres psql -U smarthealth_user smarthealth
    echo -e "${GREEN}✅ بازیابی کامل شد.${NC}"
}

# ============================================
# تابع: تولید گزارش اکسل
# ============================================
generate_report() {
    echo -e "${YELLOW}📊 تولید گزارش اکسل...${NC}"
    mkdir -p "$REPORT_DIR"
    
    # اجرای تسک Celery برای تولید گزارش
    echo -e "  🔄 ارسال درخواست به Celery..."
    
    # اگر دیتابیس فعال است از مدل‌های Django استفاده کن
    if docker-compose exec -T backend python manage.py shell -c "
from apps.reports.tasks import generate_model_report
task = generate_model_report.delay()
print(f'✅ Task ID: {task.id}')
" 2>/dev/null; then
        echo -e "  ✅ تسک گزارش به Celery ارسال شد."
    else
        echo -e "  ⚠️ Celery در دسترس نیست. استفاده از اسکریپت مستقیم..."
        
        # Fallback: اسکریپت پایتون مستقیم
        cat << 'PYEOF' > /tmp/generate_report.py
#!/usr/bin/env python3
"""گزارش اکسل خودکار از عملکرد مدل هوش مصنوعی"""
import json
import os
import sys
from datetime import datetime, timedelta
from collections import defaultdict

# مسیرها
BASE = "/Users/alihatami/Documents/django for big projects/correct1"
PERF_FILE = os.path.join(BASE, "ai_service/app/data/performance_history.json")
REPORT_DIR = os.path.join(BASE, "reports")

try:
    import pandas as pd
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.chart import BarChart, LineChart, Reference
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False
    print("⚠️ openpyxl نصب نیست. نصب: pip install openpyxl")
    sys.exit(1)

def load_history():
    if not os.path.exists(PERF_FILE):
        return []
    with open(PERF_FILE, 'r') as f:
        return json.load(f)

def generate_report():
    os.makedirs(REPORT_DIR, exist_ok=True)
    history = load_history()
    
    if not history:
        print("❌ هیچ داده‌ای برای گزارش وجود ندارد.")
        return
    
    report_path = os.path.join(REPORT_DIR, f"model_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx")
    
    print(f"📊 {len(history)} رکورد برای گزارش...")
    
    with pd.ExcelWriter(report_path, engine='openpyxl') as writer:
        # ── برگه ۱: خلاصه ──
        summary_data = {
            "معیار": ["تعداد کل درخواست‌ها", "میانگین امتیاز کیفیت", "میانگین سرعت (tokens/sec)",
                       "تعداد لایک", "تعداد دیس‌لایک", "نسبت رضایت", "میانگین زمان استنتاج (ثانیه)"],
            "مقدار": [
                len(history),
                round(sum(r.get("quality_score", 0) for r in history if r.get("quality_score")) / max(1, sum(1 for r in history if r.get("quality_score"))), 4),
                round(sum(r.get("tokens_per_sec", 0) for r in history if r.get("tokens_per_sec")) / max(1, sum(1 for r in history if r.get("tokens_per_sec"))), 2),
                sum(1 for r in history if r.get("user_feedback") == "like"),
                sum(1 for r in history if r.get("user_feedback") == "dislike"),
                f"{round(sum(1 for r in history if r.get('user_feedback') == 'like') / max(1, sum(1 for r in history if r.get('user_feedback') in ('like', 'dislike'))) * 100, 2)}%",
                round(sum(r.get("inference_time_s", 0) for r in history if r.get("inference_time_s")) / max(1, sum(1 for r in history if r.get("inference_time_s"))), 3),
            ]
        }
        pd.DataFrame(summary_data).to_excel(writer, sheet_name="خلاصه", index=False)
        
        # ── برگه ۲: روند روزانه ──
        daily = defaultdict(lambda: {"count": 0, "quality": [], "tps": [], "likes": 0, "dislikes": 0})
        for r in history:
            day = r["timestamp"][:10]
            d = daily[day]
            d["count"] += 1
            if r.get("quality_score"): d["quality"].append(r["quality_score"])
            if r.get("tokens_per_sec"): d["tps"].append(r["tokens_per_sec"])
            if r.get("user_feedback") == "like": d["likes"] += 1
            elif r.get("user_feedback") == "dislike": d["dislikes"] += 1
        
        daily_data = []
        for day in sorted(daily.keys()):
            d = daily[day]
            daily_data.append({
                "تاریخ": day,
                "تعداد درخواست": d["count"],
                "کیفیت میانگین": round(sum(d["quality"]) / len(d["quality"]), 4) if d["quality"] else 0,
                "سرعت میانگین": round(sum(d["tps"]) / len(d["tps"]), 2) if d["tps"] else 0,
                "لایک": d["likes"],
                "دیس‌لایک": d["dislikes"],
                "رضایت %": round(d["likes"] / max(1, d["likes"] + d["dislikes"]) * 100, 2),
            })
        pd.DataFrame(daily_data).to_excel(writer, sheet_name="روند روزانه", index=False)
        
        # ── برگه ۳: پاسخ‌های خوب ──
        good = [r for r in history if r.get("user_feedback") == "like" and r.get("quality_score", 0) > 0.5][:10]
        if good:
            good_data = [{
                "زمان": r["timestamp"],
                "طول پرامپت": r.get("prompt_length", 0),
                "طول پاسخ": r.get("response_length", 0),
                "کیفیت": r.get("quality_score", 0),
                "سرعت": r.get("tokens_per_sec", 0),
            } for r in good]
            pd.DataFrame(good_data).to_excel(writer, sheet_name="پاسخ‌های برتر", index=False)
        
        # ── برگه ۴: پاسخ‌های بد ──
        bad = [r for r in history if r.get("user_feedback") == "dislike" or (r.get("quality_score", 1) < 0.3)][:10]
        if bad:
            bad_data = [{
                "زمان": r["timestamp"],
                "طول پرامپت": r.get("prompt_length", 0),
                "طول پاسخ": r.get("response_length", 0),
                "کیفیت": r.get("quality_score", 0),
                "نرخ تکرار": r.get("repetition_rate", 0),
            } for r in bad]
            pd.DataFrame(bad_data).to_excel(writer, sheet_name="پاسخ‌های ضعیف", index=False)
        
        # ── برگه ۵: تحلیل ساعتی ──
        hourly = defaultdict(lambda: {"count": 0, "quality": []})
        for r in history:
            hour = datetime.fromisoformat(r["timestamp"]).hour
            h = hourly[hour]
            h["count"] += 1
            if r.get("quality_score"): h["quality"].append(r["quality_score"])
        
        hourly_data = [{
            "ساعت": f"{h:02d}:00",
            "تعداد درخواست": hourly[h]["count"],
            "میانگین کیفیت": round(sum(hourly[h]["quality"]) / len(hourly[h]["quality"]), 4) if hourly[h]["quality"] else 0,
        } for h in sorted(hourly.keys())]
        pd.DataFrame(hourly_data).to_excel(writer, sheet_name="تحلیل ساعتی", index=False)
    
    print(f"✅ گزارش تولید شد: {report_path}")
    return report_path

if __name__ == "__main__":
    generate_report()
PYEOF
        
        python3 /tmp/generate_report.py 2>/dev/null || echo -e "  ⚠️ خطا در تولید گزارش (openpyxl نصب نیست?)"
    fi
    
    echo -e "${GREEN}✅ گزارش در $REPORT_DIR ذخیره شد.${NC}"
}

# ============================================
# تابع: مانیتورینگ
# ============================================
do_monitor() {
    echo -e "${BLUE}📊 مانیتورینگ سرویس‌ها (برای خروج Ctrl+C):${NC}"
    echo ""
    
    # CPU و RAM
    echo -e "${YELLOW}📈 مصرف منابع:${NC}"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -10
    
    echo ""
    
    # وضعیت API endpoints
    echo -e "${YELLOW}🔍 بررسی APIها:${NC}"
    
    # Backend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null | grep -q "200"; then
        echo -e "  ✅ Backend:    http://localhost:8000/health"
    else
        echo -e "  ❌ Backend:    غیرفعال"
    fi
    
    # AI Service
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health 2>/dev/null | grep -q "200"; then
        echo -e "  ✅ AI Service: http://localhost:5001/health"
    else
        echo -e "  ❌ AI Service: غیرفعال"
    fi
    
    # Frontend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200"; then
        echo -e "  ✅ Frontend:   http://localhost:3000"
    else
        echo -e "  ❌ Frontend:   غیرفعال"
    fi
    
    # Nginx
    if curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null | grep -q "200"; then
        echo -e "  ✅ Nginx:      http://localhost/"
    else
        echo -e "  ❌ Nginx:      غیرفعال"
    fi
    
    echo ""
    
    # وضعیت دیسک
    echo -e "${YELLOW}💾 فضای دیسک:${NC}"
    df -h / | tail -1 | awk '{print "  استفاده: " $3 " / " $2 " (" $5 ")"}'
}

# ============================================
# تابع: پاکسازی
# ============================================
clean_up() {
    echo -e "${YELLOW}🧹 شروع پاکسازی...${NC}"
    
    # حذف کانتینرهای متوقف
    docker container prune -f
    
    # حذف images بدون استفاده
    docker image prune -f
    
    # حذف volumes بدون استفاده
    docker volume prune -f
    
    # پاکسازی لاگ‌های قدیمی (قدیمی‌تر از ۷ روز)
    find "$LOG_DIR" -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    # پاکسازی بک‌آپ‌های قدیمی (قدیمی‌تر از ۳۰ روز)
    find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null || true
    
    echo -e "${GREEN}✅ پاکسازی کامل شد.${NC}"
}

# ============================================
# MAIN
# ============================================
case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        start_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "${2:-all}"
        ;;
    update-model)
        update_model "${2:-}"
        ;;
    backup)
        do_backup
        ;;
    restore)
        restore_backup "${2:-}"
        ;;
    report)
        generate_report
        ;;
    monitor)
        do_monitor
        ;;
    clean)
        clean_up
        ;;
    help|*)
        show_help
        ;;
esac
