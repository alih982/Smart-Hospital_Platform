#!/bin/bash
# ============================================
# Auto Backup Script - اجرا توسط cron
# هر شب ساعت ۲:۳۰ بامداد اجرا می‌شود
# ============================================

set -euo pipefail

BASE_DIR="/Users/alihatami/Documents/django for big projects/correct1"
BACKUP_DIR="$BASE_DIR/backup"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BASE_DIR/logs/backup_$(date +%Y%m%d).log"

mkdir -p "$BACKUP_DIR" "$(dirname "$LOG_FILE")"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] شروع بک‌آپ خودکار..." >> "$LOG_FILE"

# ۱. بک‌آپ Performance History (فایل JSON)
if [ -f "$BASE_DIR/ai_service/app/data/performance_history.json" ]; then
    cp "$BASE_DIR/ai_service/app/data/performance_history.json" "$BACKUP_DIR/performance_history_$DATE.json"
    echo "✅ Performance History: $BACKUP_DIR/performance_history_$DATE.json" >> "$LOG_FILE"
fi

# ۲. بک‌آپ Model Registry
if [ -f "$BASE_DIR/ai_service/app/data/model_registry.json" ]; then
    cp "$BASE_DIR/ai_service/app/data/model_registry.json" "$BACKUP_DIR/model_registry_$DATE.json"
    echo "✅ Model Registry: $BACKUP_DIR/model_registry_$DATE.json" >> "$LOG_FILE"
fi

# ۳. بک‌آپ Training Data
if [ -f "$BASE_DIR/ai_service/app/data/training_data.json" ]; then
    cp "$BASE_DIR/ai_service/app/data/training_data.json" "$BACKUP_DIR/training_data_$DATE.json"
    echo "✅ Training Data: $BACKUP_DIR/training_data_$DATE.json" >> "$LOG_FILE"
fi

# ۴. بک‌آپ مدل فعال (symlink target)
ACTIVE_MODEL="$BASE_DIR/ai_service/app/ai_model/zhaav-gemma3-4B-001.gguf"
if [ -f "$ACTIVE_MODEL" ]; then
    REAL_PATH=$(readlink "$ACTIVE_MODEL" 2>/dev/null || echo "$ACTIVE_MODEL")
    if [ -f "$REAL_PATH" ]; then
        cp "$REAL_PATH" "$BACKUP_DIR/model_backup_$DATE.gguf"
        echo "✅ مدل: $BACKUP_DIR/model_backup_$DATE.gguf" >> "$LOG_FILE"
    fi
fi

# ۵. حذف بک‌آپ‌های قدیمی (قدیمی‌تر از ۱۴ روز)
find "$BACKUP_DIR" -name "performance_history_*.json" -mtime +14 -delete 2>/dev/null
find "$BACKUP_DIR" -name "model_backup_*.gguf" -mtime +14 -delete 2>/dev/null
find "$BACKUP_DIR" -name "training_data_*.json" -mtime +14 -delete 2>/dev/null

echo "✅ بک‌آپ کامل شد. حجم: $(du -sh "$BACKUP_DIR" | cut -f1)" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] پایان بک‌آپ" >> "$LOG_FILE"

# نگه‌داری فقط ۷ روز لاگ بک‌آپ
find "$(dirname "$LOG_FILE")" -name "backup_*.log" -mtime +7 -delete 2>/dev/null
