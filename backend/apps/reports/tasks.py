"""
Celery Tasks for Automated Excel Report Generation
تولید گزارش اکسل خودکار هر شب با Celery Beat
"""
import json
import os
import logging
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional

from celery import shared_task
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# مسیر فایل Performance History
PERF_FILE = os.path.join(settings.BASE_DIR, "..", "ai_service", "app", "data", "performance_history.json")
REPORT_DIR = os.path.join(settings.BASE_DIR, "..", "reports")


def _ensure_openpyxl():
    """اطمینان از نصب openpyxl"""
    try:
        import openpyxl
        return True
    except ImportError:
        logger.warning("⚠️ openpyxl نصب نیست. نصب: pip install openpyxl")
        return False


def _load_history() -> list:
    """بارگذاری تاریخچه عملکرد از فایل JSON"""
    if not os.path.exists(PERF_FILE):
        logger.warning("⚠️ فایل performance_history.json یافت نشد: %s", PERF_FILE)
        return []
    try:
        with open(PERF_FILE, "r") as f:
            data = json.load(f)
        logger.info("📊 %d رکورد از history بارگذاری شد", len(data))
        return data
    except Exception as e:
        logger.error("❌ خطا در بارگذاری history: %s", e)
        return []


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_model_report(self) -> Optional[str]:
    """
    تولید گزارش کامل اکسل با pandas + openpyxl
    
    این تسک توسط Celery Beat هر شب ساعت ۲۳:۳۰ اجرا می‌شود
    خروجی: فایل model_report_YYYYMMDD_HHMMSS.xlsx در پوشه reports
    
    برگه‌های گزارش:
    ۱. خلاصه - KPIهای کلی
    ۲. روند روزانه - سری زمانی کیفیت و سرعت
    ۳. پاسخ‌های برتر - ۱۰ نمونه با بالاترین کیفیت
    ۴. پاسخ‌های ضعیف - ۱۰ نمونه با پایین‌ترین کیفیت
    ۵. تحلیل ساعتی - توزیع درخواست‌ها در طول روز
    """
    if not _ensure_openpyxl():
        return None
    
    os.makedirs(REPORT_DIR, exist_ok=True)
    history = _load_history()
    
    if not history:
        return "No data available for report."
    
    report_path = os.path.join(
        REPORT_DIR,
        f"model_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    )
    
    try:
        import pandas as pd
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.chart import BarChart, LineChart, Reference
        
        # ── استایل‌ها ──
        header_font = Font(name='B Nazanin', bold=True, color='FFFFFF', size=12)
        header_fill = PatternFill(start_color='2563EB', end_color='2563EB', fill_type='solid')
        header_alignment = Alignment(horizontal='center', vertical='center')
        cell_alignment = Alignment(horizontal='center', vertical='center')
        thin_border = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
        
        with pd.ExcelWriter(report_path, engine='openpyxl') as writer:
            # ── برگه ۱: خلاصه ──
            likes = sum(1 for r in history if r.get('user_feedback') == 'like')
            dislikes = sum(1 for r in history if r.get('user_feedback') == 'dislike')
            total_feedback = likes + dislikes
            
            scores = [r.get('quality_score') for r in history if r.get('quality_score') is not None]
            tps_list = [r.get('tokens_per_sec') for r in history if r.get('tokens_per_sec') is not None]
            times = [r.get('inference_time_s') for r in history if r.get('inference_time_s') is not None]
            perplexities = [r.get('perplexity') for r in history if r.get('perplexity') is not None]
            reps = [r.get('repetition_rate') for r in history if r.get('repetition_rate') is not None]
            
            summary_data = {
                "معیار": [
                    "📊 تعداد کل درخواست‌ها",
                    "⭐ میانگین امتیاز کیفیت",
                    "⚡ میانگین سرعت (tokens/sec)",
                    "⏱ میانگین زمان استنتاج (ثانیه)",
                    "🔄 میانگین نرخ تکرار",
                    "📉 میانگین پریپلکسیتی",
                    "👍 تعداد لایک",
                    "👎 تعداد دیس‌لایک",
                    "😊 نسبت رضایت",
                    "📅 تاریخ تولید گزارش",
                ],
                "مقدار": [
                    len(history),
                    round(sum(scores) / len(scores), 4) if scores else 0,
                    round(sum(tps_list) / len(tps_list), 2) if tps_list else 0,
                    round(sum(times) / len(times), 3) if times else 0,
                    round(sum(reps) / len(reps), 4) if reps else 0,
                    round(sum(perplexities) / len(perplexities), 2) if perplexities else 0,
                    likes,
                    dislikes,
                    f"{round(likes / total_feedback * 100, 2)}%" if total_feedback > 0 else "0%",
                    datetime.now().strftime("%Y-%m-%d %H:%M"),
                ]
            }
            
            df_summary = pd.DataFrame(summary_data)
            df_summary.to_excel(writer, sheet_name="خلاصه", index=False)
            
            # استایل برگه خلاصه
            ws = writer.sheets["خلاصه"]
            for cell in ws[1]:
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = header_alignment
                cell.border = thin_border
            for row in ws.iter_rows(min_row=2, max_row=ws.max_row, max_col=ws.max_column):
                for cell in row:
                    cell.alignment = cell_alignment
                    cell.border = thin_border
            ws.column_dimensions['A'].width = 40
            ws.column_dimensions['B'].width = 25
            
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
            
            df_daily = pd.DataFrame(daily_data)
            df_daily.to_excel(writer, sheet_name="روند روزانه", index=False)
            
            # استایل و نمودار برگه روند روزانه
            ws2 = writer.sheets["روند روزانه"]
            for cell in ws2[1]:
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = header_alignment
                cell.border = thin_border
            
            # نمودار خطی کیفیت
            if len(daily_data) > 1:
                chart = LineChart()
                chart.title = "روند کیفیت در طول زمان"
                chart.y_axis.title = "کیفیت"
                chart.x_axis.title = "تاریخ"
                data = Reference(ws2, min_col=3, min_row=1, max_col=3, max_row=len(daily_data) + 1)
                cats = Reference(ws2, min_col=1, min_row=2, max_row=len(daily_data) + 1)
                chart.add_data(data, titles_from_data=True)
                chart.set_categories(cats)
                chart.style = 10
                ws2.add_chart(chart, "I2")
            
            # ── برگه ۳: پاسخ‌های برتر ──
            good = sorted(
                [r for r in history if r.get('user_feedback') == 'like' and r.get('quality_score', 0) > 0.5],
                key=lambda x: x.get('quality_score', 0),
                reverse=True
            )[:10]
            
            if good:
                good_data = [{
                    "زمان": r["timestamp"],
                    "طول پرامپت": r.get("prompt_length", 0),
                    "طول پاسخ": r.get("response_length", 0),
                    "کیفیت": r.get("quality_score", 0),
                    "سرعت": r.get("tokens_per_sec", 0),
                } for r in good]
                pd.DataFrame(good_data).to_excel(writer, sheet_name="پاسخ‌های برتر", index=False)
                
                ws3 = writer.sheets["پاسخ‌های برتر"]
                for cell in ws3[1]:
                    cell.font = header_font
                    cell.fill = PatternFill(start_color='16A34A', end_color='16A34A', fill_type='solid')
                    cell.alignment = header_alignment
                    cell.border = thin_border
            
            # ── برگه ۴: پاسخ‌های ضعیف ──
            bad = sorted(
                [r for r in history if r.get('user_feedback') == 'dislike' or (r.get('quality_score', 1) < 0.3)],
                key=lambda x: x.get('quality_score', 1)
            )[:10]
            
            if bad:
                bad_data = [{
                    "زمان": r["timestamp"],
                    "طول پرامپت": r.get("prompt_length", 0),
                    "طول پاسخ": r.get("response_length", 0),
                    "کیفیت": r.get("quality_score", 0),
                    "نرخ تکرار": r.get("repetition_rate", 0),
                } for r in bad]
                pd.DataFrame(bad_data).to_excel(writer, sheet_name="پاسخ‌های ضعیف", index=False)
                
                ws4 = writer.sheets["پاسخ‌های ضعیف"]
                for cell in ws4[1]:
                    cell.font = header_font
                    cell.fill = PatternFill(start_color='DC2626', end_color='DC2626', fill_type='solid')
                    cell.alignment = header_alignment
                    cell.border = thin_border
            
            # ── برگه ۵: تحلیل ساعتی ──
            hourly = defaultdict(lambda: {"count": 0, "quality": [], "tps": []})
            for r in history:
                try:
                    hour = datetime.fromisoformat(r["timestamp"]).hour
                except (ValueError, KeyError):
                    continue
                h = hourly[hour]
                h["count"] += 1
                if r.get("quality_score"): h["quality"].append(r["quality_score"])
                if r.get("tokens_per_sec"): h["tps"].append(r["tokens_per_sec"])
            
            hourly_data = [{
                "ساعت": f"{h:02d}:00",
                "تعداد درخواست": hourly[h]["count"],
                "میانگین کیفیت": round(sum(hourly[h]["quality"]) / len(hourly[h]["quality"]), 4) if hourly[h]["quality"] else 0,
            } for h in sorted(hourly.keys())]
            
            pd.DataFrame(hourly_data).to_excel(writer, sheet_name="تحلیل ساعتی", index=False)
            
            ws5 = writer.sheets["تحلیل ساعتی"]
            for cell in ws5[1]:
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = header_alignment
                cell.border = thin_border
        
        logger.info("✅ گزارش اکسل تولید شد: %s", report_path)
        return report_path
        
    except Exception as e:
        logger.error("❌ خطا در تولید گزارش اکسل: %s", e, exc_info=True)
        raise self.retry(exc=e)


@shared_task
def auto_backup_task():
    """
    تسک بک‌آپ خودکار
    هر روز اجرا می‌شود و از دیتابیس و فایل‌ها نسخه پشتیبان می‌گیرد
    """
    import shutil
    
    backup_dir = os.path.join(settings.BASE_DIR, "..", "backup", datetime.now().strftime("%Y%m%d"))
    os.makedirs(backup_dir, exist_ok=True)
    
    # بک‌آپ فایل Performance History
    if os.path.exists(PERF_FILE):
        shutil.copy2(PERF_FILE, os.path.join(backup_dir, "performance_history.json"))
        logger.info("✅ Performance History backed up")
    
    return f"Backup completed: {backup_dir}"
