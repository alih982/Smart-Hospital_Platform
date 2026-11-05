"""
Model Swapper - جایگزینی هوشمند مدل‌ها
اگر مدل جدید بهتر بود → جایگزین می‌شود
اگر مدل جدید بدتر بود → مدل قبلی برمی‌گردد
پشتیبانی از ۱۶-بیت برای فاین‌تیون
"""
import os
import json
import logging
import shutil
from datetime import datetime
from typing import Optional, Dict, List, Tuple

from .model_registry import ModelRegistry, ModelRecord
from .performance_tracker import PerformanceTracker

logger = logging.getLogger(__name__)

# مسیر ذخیره مدل‌ها
AI_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "ai_model")
LORA_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "lora_model")
FLOAT16_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "float16_model")
TRAINING_DIR = os.path.join(os.path.dirname(__file__), "..", "training_model")


class ModelSwapper:
    """
    ماژول تعویض هوشمند مدل
    
    قابلیت‌ها:
    - تعویض خودکار بر اساس امتیاز کیفیت
    - بازگشت به مدل قبلی در صورت افت کیفیت
    - پشتیبانی از مدل‌های ۱۶-بیت برای فاین‌تیون
    - استخراج LoRA adapter
    """

    def __init__(self):
        self.registry = ModelRegistry()
        self.tracker = PerformanceTracker()

    def evaluate_and_swap(
        self,
        new_model_name: str,
        new_model_path: str,
        format_version: str = "q4_k_m",
        min_quality_threshold: float = 0.3,
    ) -> Dict:
        """
        ارزیابی یک مدل جدید و تعویض در صورت بهتر بودن
        
        Args:
            new_model_name: نام مدل جدید
            new_model_path: مسیر فایل مدل جدید
            format_version: نسخه فرمت (q4_k_m, q8_0, float16, float32)
            min_quality_threshold: حداقل امتیاز کیفیت برای پذیرش
            
        Returns:
            dict: نتیجه تعویض
        """
        logger.info(f"🔄 شروع ارزیابی مدل جدید: {new_model_name}")

        # ۱. ثبت مدل جدید در رجیستری
        new_id = self.registry.register(
            name=new_model_name,
            path=new_model_path,
            model_type=self._detect_type(new_model_path),
            format_version=format_version,
        )

        # ۲. گرفتن مدل فعال فعلی
        active = self.registry.get_active_model()

        if active is None:
            # اولین مدل است، مستقیم فعالش کن
            logger.info(f"ℹ️ اولین مدل: فعال‌سازی {new_model_name}")
            self.registry.set_active(new_id)
            self._update_active_model(new_model_path)
            return {
                "success": True,
                "action": "first_model_activated",
                "new_model_id": new_id,
                "message": f"مدل {new_model_name} به عنوان اولین مدل فعال شد",
            }

        # ۳. مقایسه امتیازها
        active_stats = self.tracker.get_model_stats(active.model_id)
        new_stats = self.tracker.get_model_stats(new_id)

        active_quality = active_stats.get("avg_quality_score", 0.5)
        new_quality = new_stats.get("avg_quality_score", 0.5)

        logger.info(f"📊 امتیاز فعلی: {active_quality:.3f} | جدید: {new_quality:.3f}")

        # اگر امتیاز کافی نیست
        if new_quality < min_quality_threshold:
            self.registry.set_status(new_id, "archived")
            logger.warning(f"❌ مدل جدید امتیاز کافی ندارد: {new_quality} < {min_quality_threshold}")
            return {
                "success": False,
                "action": "rejected_low_quality",
                "new_model_id": new_id,
                "active_quality": active_quality,
                "new_quality": new_quality,
                "message": f"مدل جدید امتیاز کافی ندارد ({new_quality:.2f} < {min_quality_threshold})",
            }

        # مقایسه
        if new_quality > active_quality:
            # مدل جدید بهتر است → جایگزین کن
            logger.info(f"✅ مدل جدید بهتر است: {new_quality:.3f} > {active_quality:.3f}")
            self.registry.set_active(new_id)
            self._update_active_model(new_model_path)
            
            return {
                "success": True,
                "action": "swapped_to_new",
                "new_model_id": new_id,
                "old_model_id": active.model_id,
                "active_quality": active_quality,
                "new_quality": new_quality,
                "improvement": round(new_quality - active_quality, 4),
                "message": f"مدل {new_model_name} جایگزین مدل قبلی شد (بهبود: {new_quality - active_quality:.2%})",
            }
        else:
            # مدل قبلی بهتر است
            logger.info(f"ℹ️ مدل فعلی بهتر است: {active_quality:.3f} >= {new_quality:.3f}")
            self.registry.set_status(new_id, "backup")
            
            return {
                "success": True,
                "action": "new_model_backup",
                "new_model_id": new_id,
                "active_model_id": active.model_id,
                "active_quality": active_quality,
                "new_quality": new_quality,
                "message": f"مدل جدید به عنوان پشتیبان ذخیره شد. مدل فعلی ({active_quality:.2f}) بهتر است.",
            }

    def rollback_to_backup(self, backup_id: Optional[str] = None) -> Dict:
        """
        بازگشت به یک مدل پشتیبان (در صورت افت کیفیت)
        
        Args:
            backup_id: شناسه مدل پشتیبان (اگر None، بهترین پشتیبان انتخاب می‌شود)
            
        Returns:
            dict: نتیجه بازگشت
        """
        if backup_id:
            backup_rec = self.registry.get_by_id(backup_id)
            if not backup_rec:
                return {"success": False, "message": f"مدل {backup_id} پیدا نشد"}
        else:
            # بهترین پشتیبان را انتخاب کن
            backups = self.registry.get_backup_models()
            if not backups:
                return {"success": False, "message": "هیچ مدل پشتیبانی وجود ندارد"}
            # بهترین بر اساس امتیاز کیفیت
            backups.sort(
                key=lambda r: r.metrics.get("quality_score", 0),
                reverse=True,
            )
            backup_rec = backups[0]

        active = self.registry.get_active_model()
        if active:
            logger.info(f"🔄 بازگشت: {active.name} ← {backup_rec.name}")

        self.registry.set_active(backup_rec.model_id)
        self._update_active_model(backup_rec.path)

        return {
            "success": True,
            "action": "rolled_back",
            "new_active_id": backup_rec.model_id,
            "previous_active_id": active.model_id if active else None,
            "message": f"✅ بازگشت به مدل {backup_rec.name} انجام شد",
        }

    def auto_rollback_if_drifted(self, model_id: str, drift_threshold: float = 0.1) -> Dict:
        """
        بررسی خودکار و بازگشت در صورت افت کیفیت
        
        Args:
            model_id: شناسه مدل برای بررسی
            drift_threshold: آستانه افت (پیش‌فرض ۱۰٪)
            
        Returns:
            dict: نتیجه
        """
        has_drift, drift_amount = self.tracker.detect_drift(model_id, threshold=drift_threshold)

        if has_drift:
            logger.warning(f"⚠️ افت کیفیت تشخیص داده شد: {drift_amount:.2%}")
            result = self.rollback_to_backup()
            result["drift_detected"] = True
            result["drift_amount"] = round(drift_amount, 4)
            return result

        return {
            "success": True,
            "action": "no_drift",
            "drift_detected": False,
            "message": "✅ مدل پایدار است",
        }

    def extract_lora_adapter(self, source_model_path: str, output_path: str) -> bool:
        """
        استخراج LoRA adapter از یک مدل فاین‌تیون شده
        برای مواقعی که می‌خواهیم فقط adapter را ذخیره کنیم
        """
        try:
            from peft import PeftModel
            from transformers import AutoModelForCausalLM
            import torch

            logger.info(f"🔌 استخراج LoRA از {source_model_path}")

            base = AutoModelForCausalLM.from_pretrained(source_model_path, torch_dtype=torch.float32)
            # اگر مدل LoRA داشته باشد
            if hasattr(base, "peft_config"):
                base.save_pretrained(output_path)
                logger.info(f"✅ LoRA استخراج شد در: {output_path}")
                return True
            else:
                logger.warning("⚠️ مدل LoRA ندارد")
                return False
        except Exception as e:
            logger.error(f"❌ خطا در استخراج LoRA: {e}")
            return False

    def prepare_16bit_model(self, source_model_path: str) -> Optional[str]:
        """
        تبدیل مدل به ۱۶-بیت برای فاین‌تیون
        
        Args:
            source_model_path: مسیر مدل مبدأ
            
        Returns:
            str: مسیر مدل ۱۶-بیتی یا None در صورت خطا
        """
        try:
            from transformers import AutoModelForCausalLM
            import torch

            logger.info(f"🔄 تبدیل به ۱۶-بیت: {source_model_path}")

            os.makedirs(FLOAT16_MODEL_DIR, exist_ok=True)

            model = AutoModelForCausalLM.from_pretrained(
                source_model_path,
                torch_dtype=torch.bfloat16,  # bfloat16
                device_map="cpu",
                local_files_only=True,
            )
            model.save_pretrained(FLOAT16_MODEL_DIR, save_format="safetensors")

            # ثبت در رجیستری
            self.registry.register(
                name="gemma2_2b_float16",
                path=FLOAT16_MODEL_DIR,
                model_type="safetensors",
                format_version="float16",
            )

            logger.info(f"✅ مدل ۱۶-بیتی ذخیره شد در: {FLOAT16_MODEL_DIR}")
            return FLOAT16_MODEL_DIR

        except Exception as e:
            logger.error(f"❌ خطا در تبدیل به ۱۶-بیت: {e}")
            return None

    def prepare_training_copy(self) -> Optional[str]:
        """
        آماده‌سازی یک کپی از مدل فعال برای فاین‌تیون
        مدل به ۱۶-بیت کد می‌شود تا حجم کمتر و کیفیت مناسب داشته باشد
        """
        active = self.registry.get_active_model()
        if not active:
            logger.error("❌ مدل فعالی وجود ندارد")
            return None

        logger.info(f"🎯 آماده‌سازی برای فاین‌تیون: {active.name}")

        # اگر مدل ۱۶-بیتی نداریم، بسازیم
        if not self.registry.has_16bit_model():
            float16_path = self.prepare_16bit_model(active.path)
            if not float16_path:
                return None
        else:
            float16_path = self.registry.get_best_16bit_model().path

        # کپی به پوشه training
        os.makedirs(TRAINING_DIR, exist_ok=True)
        if os.path.isdir(float16_path):
            for fname in os.listdir(float16_path):
                if fname.endswith((".safetensors", ".json", ".model", ".bin")):
                    shutil.copy2(
                        os.path.join(float16_path, fname),
                        os.path.join(TRAINING_DIR, fname),
                    )

        # ثبت
        train_id = self.registry.register(
            name=f"{active.name}_training",
            path=TRAINING_DIR,
            model_type="safetensors",
            format_version="float16",
            parent_id=active.model_id,
        )
        self.registry.set_status(train_id, "training")

        logger.info(f"✅ مدل برای فاین‌تیون آماده شد: {train_id}")
        return TRAINING_DIR

    def _detect_type(self, path: str) -> str:
        """تشخیص نوع فایل مدل"""
        if path.endswith(".gguf"):
            return "gguf"
        elif path.endswith(".safetensors"):
            return "safetensors"
        else:
            return "unknown"

    def _update_active_model(self, model_path: str):
        """بروزرسانی active model path در فایل کانفیگ"""
        # این تابع توسط main.py فراخوانی می‌شود تا مدل جدید بارگذاری شود
        config_file = os.path.join(os.path.dirname(__file__), "..", ".active_model")
        try:
            with open(config_file, "w") as f:
                f.write(f"{model_path}\n")
            logger.info(f"📝 مسیر مدل فعال ذخیره شد: {config_file}")
        except Exception as e:
            logger.warning(f"⚠️ خطا در ذخیره مسیر مدل فعال: {e}")
