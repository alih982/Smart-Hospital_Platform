#!/bin/bash
# ============================================
# Auto Fine-tune Script - چرخه خودکار فاین‌تیون
# اجرای این اسکریپت در Google Colab یا سرور GPU
# ============================================
#
# این اسکریپت ۳ کار انجام می‌دهد:
# ۱. جمع‌آوری داده‌های آموزشی (از بازخورد کاربران)
# ۲. اجرای فاین‌تیون با QLoRA
# ۳. کوانتیزه‌سازی به GGUF و جایگزینی مدل
#
# نحوه اجرا:
#   ./auto_finetune.sh [--colab | --local]
#
# ============================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_DIR="/Users/alihatami/Documents/django for big projects/correct1"
TRAINING_DIR="$BASE_DIR/ai_service/training"
OUTPUT_DIR="$BASE_DIR/ai_service/app/ai_model"
DATE=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Auto Fine-tune Pipeline v1.0      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# مرحله ۱: جمع‌آوری داده‌های آموزشی
# ============================================
collect_training_data() {
    echo -e "${YELLOW}[1/5] 📥 جمع‌آوری داده‌های آموزشی...${NC}"
    mkdir -p "$TRAINING_DIR"
    
    # داده‌های لایک شده از Performance Tracker
    PERF_FILE="$BASE_DIR/ai_service/app/data/performance_history.json"
    
    if [ -f "$PERF_FILE" ]; then
        python3 -c "
import json, os

perf_file = '$PERF_FILE'
train_data = []
with open(perf_file, 'r') as f:
    history = json.load(f)

# داده‌های با بازخورد مثبت
liked = [r for r in history if r.get('user_feedback') == 'like']
for r in liked:
    train_data.append({
        'instruction': 'لطفاً به سوال زیر پاسخ دهید.',
        'input': r.get('prompt', ''),
        'output': r.get('response', ''),
        'source': 'user_like',
        'quality_score': r.get('quality_score', 0),
    })

# داده‌های با کیفیت بالا (حتی بدون بازخورد)
high_quality = [r for r in history if r.get('quality_score', 0) > 0.7 and r.get('user_feedback') != 'dislike']
for r in high_quality[:100]:  # حداکثر ۱۰۰ تا
    if r.get('prompt') and r.get('response'):
        train_data.append({
            'instruction': 'لطفاً به سوال زیر پاسخ دهید.',
            'input': r.get('prompt', ''),
            'output': r.get('response', ''),
            'source': 'high_quality',
            'quality_score': r.get('quality_score', 0),
        })

# ذخیره
output_path = '$TRAINING_DIR/training_data_$DATE.json'
with open(output_path, 'w') as f:
    json.dump(train_data, f, ensure_ascii=False, indent=2)

print(f'✅ {len(train_data)} نمونه جمع‌آوری شد')
print(f'📁 {output_path}')
print(f'👍 {len(liked)} نمونه لایک شده')
"
    else
        echo -e "${RED}❌ فایل performance_history.json یافت نشد.${NC}"
        echo "فعلاً از داده‌های نمونه استفاده می‌شود."
        
        # داده‌های نمونه
        cat > "$TRAINING_DIR/training_data_$DATE.json" << 'JSONEOF'
[
    {
        "instruction": "لطفاً به سوال زیر پاسخ دهید.",
        "input": "سلام، من سردرد دارم و احساس خستگی می‌کنم. چه کار کنم؟",
        "output": "سلام. برای سردرد و خستگی توصیه می‌کنم: ۱. استراحت کافی داشته باشید ۲. آب کافی بنوشید ۳. در صورت ادامه علائم به پزشک مراجعه کنید.",
        "source": "sample"
    }
]
JSONEOF
        echo -e "  ⚠️ داده نمونه ایجاد شد."
    fi
}

# ============================================
# مرحله ۲: تبدیل داده به فرمت Alpaca
# ============================================
prepare_dataset() {
    echo -e "${YELLOW}[2/5] 🔄 آماده‌سازی دیتاست...${NC}"
    
    python3 << 'PYEOF'
import json
import os

# خواندن داده‌ها
train_dir = "$TRAINING_DIR"
train_dir = os.path.expanduser(train_dir)
files = [f for f in os.listdir(train_dir) if f.startswith("training_data_") and f.endswith(".json")]
if not files:
    print("❌ هیچ فایل داده‌ای یافت نشد")
    exit(1)

latest = sorted(files)[-1]
with open(os.path.join(train_dir, latest), "r") as f:
    data = json.load(f)

# تبدیل به فرمت Alpaca
alpaca_data = []
for item in data:
    alpaca_data.append({
        "instruction": item.get("instruction", ""),
        "input": item.get("input", ""),
        "output": item.get("output", ""),
    })

# ذخیره
output_path = os.path.join(train_dir, "alpaca_dataset.json")
with open(output_path, "w") as f:
    json.dump(alpaca_data, f, ensure_ascii=False, indent=2)

print(f"✅ دیتاست Alpaca با {len(alpaca_data)} نمونه ایجاد شد")
print(f"📁 {output_path}")
PYEOF
}

# ============================================
# مرحله ۳: اجرای فاین‌تیون (در Colab یا local)
# ============================================
run_finetune() {
    local mode="${1:-colab}"
    
    case $mode in
        colab)
            echo -e "${YELLOW}[3/5] ☁️ ایجاد نوت‌بوک برای Google Colab...${NC}"
            
            cat > "$TRAINING_DIR/finetune_colab.ipynb" << 'NBEOF'
{
 "cells": [
  {
   "cell_type": "markdown",
   "source": ["# فاین‌تیون مدل Zhaav Gemma 3 با QLoRA\n## اجرا در Google Colab (نیاز به GPU T4)"],
   "metadata": {}
  },
  {
   "cell_type": "code",
   "source": ["# نصب dependencies\n!pip install -q transformers datasets accelerate peft trl bitsandbytes"],
   "metadata": {}
  },
  {
   "cell_type": "code",
   "source": ["import json\nfrom datasets import Dataset\nfrom transformers import (\n    AutoModelForCausalLM, AutoTokenizer,\n    BitsAndBytesConfig, TrainingArguments\n)\nfrom peft import LoraConfig, get_peft_model\nfrom trl import SFTTrainer\n\n# بارگذاری داده‌ها\nfrom google.colab import files\nuploaded = files.upload()\n\nwith open(list(uploaded.keys())[0], 'r') as f:\n    data = json.load(f)\n\nprint(f\"✅ {len(data)} نمونه آموزشی\")"],
   "metadata": {}
  },
  {
   "cell_type": "code",
   "source": ["# مدل پایه (Gemma 2 2B)\nbase_model = \"google/gemma-2-2b-it\"\n\n# Quantization 4-bit\nbnb_config = BitsAndBytesConfig(\n    load_in_4bit=True,\n    bnb_4bit_quant_type=\"nf4\",\n    bnb_4bit_compute_dtype=\"bfloat16\",\n)\n\nmodel = AutoModelForCausalLM.from_pretrained(\n    base_model,\n    quantization_config=bnb_config,\n    device_map=\"auto\",\n    trust_remote_code=True\n)\ntokenizer = AutoTokenizer.from_pretrained(base_model)\ntokenizer.pad_token = tokenizer.eos_token"],
   "metadata": {}
  },
  {
   "cell_type": "code",
   "source": ["# LoRA config\nlora_config = LoraConfig(\n    r=16, lora_alpha=32, lora_dropout=0.1,\n    target_modules=[\"q_proj\", \"k_proj\", \"v_proj\", \"o_proj\"],\n    task_type=\"CAUSAL_LM\",\n)\n\nmodel = get_peft_model(model, lora_config)\nprint(f\"🇰 پارامترهای قابل آموزش: {model.num_parameters(only_trainable=True):,}\")"],
   "metadata": {}
  },
  {
   "cell_type": "code",
   "source": ["# تبدیل داده به فرمت Alpaca\ndef format_example(example):\n    text = f\"<start_of_turn>user\\n{example['instruction']}\\n{example['input']}<end_of_turn>\\n<start_of_turn>model\\n{example['output']}<end_of_turn>\"\n    return {\"text\": text}\n\ndataset = Dataset.from_list([format_example(d) for d in data])\ndataset = dataset.train_test_split(test_size=0.1)\nprint(dataset)"],
   "metadata": {}
  },
  {
   "cell_type": "code",
   "source": ["# تنظیمات آموزش\ntraining_args = TrainingArguments(\n    output_dir=\"./results\",\n    num_train_epochs=3,\n    per_device_train_batch_size=2,\n    gradient_accumulation_steps=4,\n    learning_rate=2e-4,\n    warmup_steps=20,\n    logging_steps=10,\n    save_strategy=\"epoch\",\n    report_to=\"none\",\n)\n\ntrainer = SFTTrainer(\n    model=model,\n    args=training_args,\n    train_dataset=dataset[\"train\"],\n    eval_dataset=dataset[\"test\"],\n    tokenizer=tokenizer,\n    dataset_text_field=\"text\",\n    max_seq_length=512,\n)\n\ntrainer.train()\nprint(\"✅ فاین‌تیون کامل شد!\")"],
   "metadata": {}
  },
  {
   "cell_type": "code",
   "source": ["# ذخیره مدل\nmodel.save_pretrained(\"./trained_model\")\ntokenizer.save_pretrained(\"./trained_model\")\n\n# تبدیل به GGUF (نیاز به llama.cpp)\n# !git clone https://github.com/ggerganov/llama.cpp\n# !cd llama.cpp && make\n# !python3 llama.cpp/convert.py ./trained_model --outfile ./trained_model.gguf --outtype q4_k_m\n\nprint(\"✅ مدل ذخیره شد\")\n\n# دانلود فایل GGUF\n# from google.colab import files\n# files.download(\"./trained_model.gguf\")"],
   "metadata": {}
  }
 ],
 "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}}
}
NBEOF
            echo -e "✅ نوت‌بوک Colab ایجاد شد: $TRAINING_DIR/finetune_colab.ipynb"
            echo -e "📤 داده آموزشی: $TRAINING_DIR/alpaca_dataset.json"
            echo ""
            echo -e "${YELLOW}📋 مراحل در Colab:${NC}"
            echo "  1. آپلود دیتاست: $TRAINING_DIR/alpaca_dataset.json"
            echo "  2. اجرای نوت‌بوک: $TRAINING_DIR/finetune_colab.ipynb"
            echo "  3. دانلود فایل trained_model.gguf"
            echo ""
            ;;
        local)
            echo -e "${YELLOW}[3/5] 💻 اجرای فاین‌تیون روی CPU (فقط تست محدود)...${NC}"
            
            if python3 -c "import torch; print(torch.cuda.is_available())" 2>/dev/null | grep -q "True"; then
                echo -e "  ✅ GPU در دسترس است!"
                python3 "$BASE_DIR/ai_service/app/scripts/finetune_gemma.py" --mode local 2>&1 || echo -e "  ⚠️ خطا در فاین‌تیون"
            else
                echo -e "  ⚠️ GPU در دسترس نیست. فقط برای تست با داده محدود."
                echo -e "  لطفاً از گزینه --colab استفاده کنید."
            fi
            ;;
    esac
}

# ============================================
# مرحله ۴: کوانتیزه‌سازی به GGUF
# ============================================
convert_to_gguf() {
    local input_model="${1:-$TRAINING_DIR/trained_model}"
    
    echo -e "${YELLOW}[4/5] 🔄 کوانتیزه‌سازی به GGUF...${NC}"
    
    if [ ! -d "$input_model" ] && [ ! -f "$input_model" ]; then
        echo -e "${RED}❌ مدل یافت نشد: $input_model${NC}"
        echo -e "لطفاً فایل trained_model.gguf را در $TRAINING_DIR قرار دهید."
        return
    fi
    
    # بررسی وجود llama.cpp
    LLAMA_CPP_DIR="$BASE_DIR/llama.cpp"
    if [ ! -d "$LLAMA_CPP_DIR" ]; then
        echo -e "  📥 کلون کردن llama.cpp..."
        git clone https://github.com/ggerganov/llama.cpp.git "$LLAMA_CPP_DIR" 2>/dev/null || {
            echo -e "${RED}❌ خطا در کلون کردن llama.cpp${NC}"
            return
        }
    fi
    
    # ساخت llama.cpp
    if [ ! -f "$LLAMA_CPP_DIR/main" ]; then
        echo -e "  🔧 ساخت llama.cpp..."
        cd "$LLAMA_CPP_DIR" && make -j4 2>/dev/null || {
            echo -e "${RED}❌ خطا در ساخت llama.cpp${NC}"
            cd "$BASE_DIR"
            return
        }
        cd "$BASE_DIR"
    fi
    
    # تبدیل safetensors به GGUF
    OUTPUT_GGUF="$OUTPUT_DIR/zhaav-gemma3-4B-001_$DATE.gguf"
    
    if [ -f "$input_model" ]; then
        # فایل GGUF مستقیم
        cp "$input_model" "$OUTPUT_GGUF"
        echo -e "  ✅ فایل مستقیم: $OUTPUT_GGUF"
    elif [ -d "$input_model" ]; then
        # پوشه مدل → تبدیل
        if [ -f "$LLAMA_CPP_DIR/convert.py" ]; then
            python3 "$LLAMA_CPP_DIR/convert.py" \
                "$input_model" \
                --outfile "$OUTPUT_GGUF" \
                --outtype q4_k_m 2>&1 || {
                echo -e "  ⚠️ خطا در تبدیل. تلاش با q8_0..."
                python3 "$LLAMA_CPP_DIR/convert.py" \
                    "$input_model" \
                    --outfile "$OUTPUT_GGUF" \
                    --outtype q8_0 2>&1 || {
                    echo -e "${RED}❌ خطا در کوانتیزه‌سازی${NC}"
                    return
                }
            }
            echo -e "  ✅ GGUF: $OUTPUT_GGUF"
        else
            echo -e "${RED}❌ convert.py در llama.cpp یافت نشد${NC}"
            return
        fi
    fi
    
    # ثبت در رجیستری
    echo -e "  📝 ثبت در رجیستری..."
    curl -s -X POST "http://localhost:5001/api/v1/mlops/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"Zhaav Gemma 3 (Fine-tuned $DATE)\",
            \"path\": \"$OUTPUT_GGUF\",
            \"model_type\": \"gguf\",
            \"format_version\": \"q4_k_m\"
        }" 2>/dev/null || echo -e "  ⚠️ رجیستری غیرفعال"
    
    echo ""
    echo -e "${GREEN}✅ مدل GGUF آماده است:${NC}"
    echo -e "  📁 $OUTPUT_GGUF"
    echo -e "  📦 $(du -h "$OUTPUT_GGUF" | cut -f1)"
}

# ============================================
# مرحله ۵: جایگزینی خودکار مدل
# ============================================
auto_deploy_model() {
    local gguf_file="${1:-$OUTPUT_DIR/zhaav-gemma3-4B-001_$DATE.gguf}"
    
    echo -e "${YELLOW}[5/5] 🔄 جایگزینی خودکار مدل...${NC}"
    
    if [ ! -f "$gguf_file" ]; then
        echo -e "${RED}❌ فایل GGUF یافت نشد: $gguf_file${NC}"
        # آخرین فایل GGUF را پیدا کن
        gguf_file=$(ls -t "$OUTPUT_DIR"/*.gguf 2>/dev/null | head -1)
        if [ -z "$gguf_file" ]; then
            echo -e "${RED}❌ هیچ فایل GGUF دیگری وجود ندارد${NC}"
            return
        fi
        echo -e "  استفاده از آخرین فایل: $gguf_file"
    fi
    
    # سایز فایل
    local size=$(du -h "$gguf_file" | cut -f1)
    echo -e "  📦 سایز: $size"
    
    # بک‌آپ از مدل فعلی
    ACTIVE_LINK="$OUTPUT_DIR/zhaav-gemma3-4B-001.gguf"
    BACKUP_DIR="$BASE_DIR/backup"
    mkdir -p "$BACKUP_DIR"
    
    if [ -f "$ACTIVE_LINK" ]; then
        REAL_PATH=$(readlink "$ACTIVE_LINK" 2>/dev/null || echo "$ACTIVE_LINK")
        if [ "$REAL_PATH" != "$gguf_file" ]; then
            cp "$REAL_PATH" "$BACKUP_DIR/model_backup_$DATE.gguf" 2>/dev/null || true
            echo -e "  💾 بک‌آپ: model_backup_$DATE.gguf"
        fi
    fi
    
    # جایگزینی با لینک سمبلیک
    ln -sf "$gguf_file" "$ACTIVE_LINK"
    echo -e "  🔗 لینک سمبلیک: $ACTIVE_LINK → $gguf_file"
    
    # ریستارت سرویس
    echo -e "  🔄 ریستارت سرویس AI..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health 2>/dev/null | grep -q "200"; then
        # API دارد، از طریق MLOps
        curl -s -X POST "http://localhost:5001/api/v1/mlops/swap" \
            -H "Content-Type: application/json" \
            -d "{\"model_path\": \"$gguf_file\", \"format_version\": \"q4_k_m\"}" 2>/dev/null || {
            # ریستارت مستقیم
            docker-compose restart ai_service 2>/dev/null || \
            pkill -f "uvicorn app.main" 2>/dev/null || true
        }
    else
        # ریستارت مستقیم
        docker-compose restart ai_service 2>/dev/null || \
        pkill -f "uvicorn app.main" 2>/dev/null || true
    fi
    
    echo ""
    echo -e "${GREEN}✅ مدل با موفقیت جایگزین شد!${NC}"
    echo -e "  مدل جدید: $(basename $gguf_file)"
    echo -e "  مسیر: $gguf_file"
    echo -e "  سایز: $size"
    echo ""
    echo -e "${YELLOW}📊 برای بررسی: ./deploy.sh monitor${NC}"
}

# ============================================
# MAIN
# ============================================
case "${1:-help}" in
    --colab)
        echo -e "${BLUE}🧪 حالت Google Colab (با GPU T4)${NC}"
        echo ""
        collect_training_data
        prepare_dataset
        run_finetune colab
        echo -e "${GREEN}✅ نوت‌بوک Colab آماده است!${NC}"
        echo -e "۱. فایل $TRAINING_DIR/alpaca_dataset.json را دانلود کنید"
        echo -e "۲. به Google Colab بروید"
        echo -e "۳. نوت‌بوک $TRAINING_DIR/finetune_colab.ipynb را آپلود کنید"
        echo -e "۴. مراحل را اجرا کنید"
        echo -e "۵. فایل trained_model.gguf را دانلود کنید"
        echo -e "۶. سپس اجرا کنید: ./auto_finetune.sh --deploy ./trained_model.gguf"
        ;;
    --local)
        echo -e "${BLUE}💻 حالت محلی (تست محدود)${NC}"
        collect_training_data
        prepare_dataset
        run_finetune local
        ;;
    --convert)
        convert_to_gguf "${2:-}"
        ;;
    --deploy)
        auto_deploy_model "${2:-}"
        ;;
    --full)
        echo -e "${BLUE}🚀 اجرای کامل چرخه فاین‌تیون${NC}"
        collect_training_data
        prepare_dataset
        run_finetune colab
        echo ""
        echo -e "${GREEN}✅ مرحله ۱ تا ۳ کامل شد.${NC}"
        echo -e "پس از دریافت فایل .gguf، دستور زیر را اجرا کنید:"
        echo -e "  ./auto_finetune.sh --deploy path/to/model.gguf"
        ;;
    help|*)
        echo "کاربرد: ./auto_finetune.sh [OPTION]"
        echo ""
        echo "OPTIONS:"
        echo "  --colab              آماده‌سازی داده + ایجاد نوت‌بوک Colab"
        echo "  --local              اجرای فاین‌تیون روی دستگاه (فقط GPU)"
        echo "  --convert [PATH]     کوانتیزه‌سازی مدل به GGUF"
        echo "  --deploy [GGUF]      جایگزینی خودکار مدل (با لینک سمبلیک)"
        echo "  --full               اجرای کامل چرخه (داده + Colab)"
        echo ""
        echo "EXAMPLES:"
        echo "  ./auto_finetune.sh --colab"
        echo "  ./auto_finetune.sh --deploy ./trained_model.gguf"
        echo "  ./auto_finetune.sh --full"
        ;;
esac
