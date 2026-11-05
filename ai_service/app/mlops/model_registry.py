"""
Model Registry - ثبت و مدیریت نسخه‌های مدل
هر مدل یک شناسه، مسیر، نوع (GGUF/safetensors) و وضعیت (active/backup/archived) دارد.
"""
import os
import json
import logging
import shutil
from datetime import datetime
from typing import Optional, Dict, List, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)

# دیتابیس محلی (فایل JSON)
REGISTRY_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "model_registry.json")


class ModelRecord:
    """یک رکورد برای یک نسخه از مدل"""
    def __init__(
        self,
        model_id: str,
        name: str,
        path: str,
        model_type: str = "safetensors",  # safetensors | gguf
        format_version: str = "float32",  # float32 | float16 | q4_k_m | q8_0
        status: str = "active",           # active | backup | archived | training
        metrics: Optional[Dict] = None,
        parent_id: Optional[str] = None,  # مدل والد (برای فاین‌تیون)
        created_at: Optional[str] = None,
    ):
        self.model_id = model_id
        self.name = name
        self.path = path
        self.model_type = model_type
        self.format_version = format_version
        self.status = status
        self.metrics = metrics or {}
        self.parent_id = parent_id
        self.created_at = created_at or datetime.now().isoformat()

    def to_dict(self) -> Dict:
        return {
            "model_id": self.model_id,
            "name": self.name,
            "path": self.path,
            "model_type": self.model_type,
            "format_version": self.format_version,
            "status": self.status,
            "metrics": self.metrics,
            "parent_id": self.parent_id,
            "created_at": self.created_at,
        }

    @staticmethod
    def from_dict(data: Dict) -> "ModelRecord":
        return ModelRecord(
            model_id=data["model_id"],
            name=data.get("name", "unknown"),
            path=data["path"],
            model_type=data.get("model_type", "safetensors"),
            format_version=data.get("format_version", "float32"),
            status=data.get("status", "backup"),
            metrics=data.get("metrics", {}),
            parent_id=data.get("parent_id"),
            created_at=data.get("created_at"),
        )


class ModelRegistry:
    """
    ثبت‌نام مدل‌ها:
    - افزودن مدل جدید
    - فعال/غیرفعال کردن
    - یافتن بهترین مدل
    - پشتیبانی از ۱۶-بیت برای فاین‌تیون
    """

    def __init__(self, registry_path: str = REGISTRY_FILE):
        self.registry_path = registry_path
        self._records: Dict[str, ModelRecord] = {}
        self._load()

    def _load(self):
        """بارگذاری رجیستری از فایل"""
        os.makedirs(os.path.dirname(self.registry_path), exist_ok=True)
        if os.path.exists(self.registry_path):
            try:
                with open(self.registry_path, "r") as f:
                    data = json.load(f)
                for item in data:
                    rec = ModelRecord.from_dict(item)
                    self._records[rec.model_id] = rec
                logger.info(f"📂 {len(self._records)} مدل در رجیستری بارگذاری شد")
            except Exception as e:
                logger.warning(f"⚠️ خطا در بارگذاری رجیستری: {e}")

    def _save(self):
        """ذخیره رجیستری در فایل"""
        try:
            data = [rec.to_dict() for rec in self._records.values()]
            os.makedirs(os.path.dirname(self.registry_path), exist_ok=True)
            with open(self.registry_path, "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"❌ خطا در ذخیره رجیستری: {e}")

    def register(
        self,
        name: str,
        path: str,
        model_type: str = "safetensors",
        format_version: str = "float32",
        parent_id: Optional[str] = None,
    ) -> str:
        """ثبت یک مدل جدید در رجیستری"""
        import hashlib
        model_id = hashlib.md5(f"{name}_{datetime.now().isoformat()}".encode()).hexdigest()[:12]

        record = ModelRecord(
            model_id=model_id,
            name=name,
            path=path,
            model_type=model_type,
            format_version=format_version,
            status="active",
            parent_id=parent_id,
        )
        self._records[model_id] = record
        self._save()
        logger.info(f"✅ مدل ثبت شد: {name} ({model_id}) ← {path}")
        return model_id

    def get_active_model(self) -> Optional[ModelRecord]:
        """مدل فعال فعلی را برمی‌گرداند"""
        for rec in self._records.values():
            if rec.status == "active":
                return rec
        return None

    def get_backup_models(self) -> List[ModelRecord]:
        """همه مدل‌های پشتیبان (غیرفعال) را برمی‌گرداند"""
        return [rec for rec in self._records.values() if rec.status == "backup"]

    def get_by_id(self, model_id: str) -> Optional[ModelRecord]:
        return self._records.get(model_id)

    def set_active(self, model_id: str) -> bool:
        """یک مدل را فعال می‌کند و بقیه را backup می‌کند"""
        if model_id not in self._records:
            logger.error(f"❌ مدل {model_id} در رجیستری نیست")
            return False

        # همه را backup کن
        for rec in self._records.values():
            if rec.status == "active":
                rec.status = "backup"

        # مدل جدید را فعال کن
        self._records[model_id].status = "active"
        self._save()
        logger.info(f"🔄 مدل {model_id} فعال شد")
        return True

    def set_status(self, model_id: str, status: str):
        if model_id in self._records:
            self._records[model_id].status = status
            self._save()

    def update_metrics(self, model_id: str, metrics: Dict):
        """به‌روزرسانی معیارهای عملکرد یک مدل"""
        if model_id in self._records:
            self._records[model_id].metrics.update(metrics)
            self._save()

    def get_best_model(self, metric: str = "avg_tps") -> Optional[ModelRecord]:
        """بهترین مدل را بر اساس یک معیار برمی‌گرداند"""
        best = None
        best_val = -float("inf")
        for rec in self._records.values():
            val = rec.metrics.get(metric, -float("inf"))
            if val > best_val:
                best_val = val
                best = rec
        return best

    def swap_with_backup(self, backup_model_id: str) -> bool:
        """
        تعویض مدل فعلی با یک مدل پشتیبان
        اگر مدل جدید بهتر باشد، جایگزین می‌شود
        اگر بدتر باشد، مدل قبلی برمی‌گردد
        """
        backup_rec = self._records.get(backup_model_id)
        if not backup_rec:
            logger.error(f"❌ مدل پشتیبان {backup_model_id} پیدا نشد")
            return False

        active_rec = self.get_active_model()

        # مقایسه معیارها
        if active_rec and backup_rec.metrics:
            current_score = active_rec.metrics.get("quality_score", 0)
            backup_score = backup_rec.metrics.get("quality_score", 0)

            logger.info(f"📊 مقایسه: فعلی={current_score:.3f} vs پشتیبان={backup_score:.3f}")

            if backup_score <= current_score:
                logger.info(f"ℹ️ مدل پشتیبان بهتر نیست. نگه‌داشتن مدل فعلی.")
                return False

        # تعویض
        logger.info(f"🔄 تعویض: {active_rec.name if active_rec else 'هیچ'} ← {backup_rec.name}")
        self.set_active(backup_model_id)

        # ساختن symlink جدید
        self._update_active_symlink(backup_rec)
        return True

    def _update_active_symlink(self, record: ModelRecord):
        """بروزرسانی symlink به مدل فعال"""
        active_link = os.path.join(os.path.dirname(record.path), "..", "ai_model", "active_model")
        try:
            if os.path.exists(active_link):
                os.remove(active_link)
            os.symlink(record.path, active_link)
            logger.info(f"🔗 symlink به {record.path} بروز شد")
        except Exception as e:
            logger.warning(f"⚠️ خطا در ساختن symlink: {e}")

    def has_16bit_model(self) -> bool:
        """بررسی وجود مدل ۱۶-بیتی برای فاین‌تیون"""
        for rec in self._records.values():
            if rec.format_version == "float16" and rec.status == "backup":
                return True
        return False

    def get_best_16bit_model(self) -> Optional[ModelRecord]:
        """بهترین مدل ۱۶-بیتی را برمی‌گرداند (برای فاین‌تیون)"""
        candidates = [
            rec for rec in self._records.values()
            if rec.format_version in ("float16", "bfloat16") and rec.status in ("backup", "training")
        ]
        if not candidates:
            return None
        # بهترین را بر اساس امتیاز کیفیت برمی‌گردانیم
        candidates.sort(key=lambda r: r.metrics.get("quality_score", 0), reverse=True)
        return candidates[0]

    def prepare_for_finetune(self, model_record: ModelRecord, output_dir: str) -> Optional[str]:
        """
        آماده‌سازی یک مدل برای فاین‌تیون:
        - کپی کردن فایل‌ها به پوشه training
        - ثبت در رجیستری با وضعیت training
        """
        import hashlib
        os.makedirs(output_dir, exist_ok=True)

        # کپی فایل‌های مدل
        src_dir = os.path.dirname(model_record.path)
        if os.path.isdir(src_dir):
            for fname in os.listdir(src_dir):
                if fname.endswith((".safetensors", ".json", ".model", ".bin")):
                    shutil.copy2(
                        os.path.join(src_dir, fname),
                        os.path.join(output_dir, fname),
                    )

        # ثبت
        train_id = hashlib.md5(f"train_{datetime.now().isoformat()}".encode()).hexdigest()[:12]
        self._records[train_id] = ModelRecord(
            model_id=train_id,
            name=f"{model_record.name}_training",
            path=output_dir,
            model_type=model_record.model_type,
            format_version=model_record.format_version,
            status="training",
            parent_id=model_record.model_id,
        )
        self._save()
        logger.info(f"🎯 مدل برای فاین‌تیون آماده شد: {train_id}")
        return train_id

    def list_all(self) -> List[Dict]:
        """لیست همه مدل‌ها"""
        return [rec.to_dict() for rec in self._records.values()]

    def count(self) -> int:
        return len(self._records)
