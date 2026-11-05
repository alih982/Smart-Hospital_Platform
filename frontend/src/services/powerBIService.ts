/**
 * Power BI Integration Service
 * 
 * متصل به Power BI API در AI Service (FastAPI روی پورت ۵۰۰۱)
 * این سرویس دیتای مورد نیاز داشبورد Power BI رو از ai_service میگیره
 */

export interface KPIData {
  total_requests_last_period: number;
  avg_quality_score: number | null;
  quality_trend: string;
  avg_tokens_per_sec: number | null;
  speed_rating: string;
  total_likes: number;
  total_dislikes: number;
  like_ratio: number | null;
  satisfaction_label: string;
  total_models: number;
  active_models: number;
  total_training_data: number;
}

export interface DashboardSummary {
  kpis: KPIData;
  active_model: any;
  drift_analysis: any;
  daily_trend: any[];
  models_overview: any[];
  training_data: any;
}

export interface TimeSeriesPoint {
  timestamp: string;
  request_count: number;
  avg_quality: number | null;
  avg_tps: number | null;
  likes: number;
  dislikes: number;
  like_ratio: number | null;
  avg_inference_time_s: number | null;
  avg_tokens_generated: number | null;
}

export interface FeedbackAnalysis {
  feedback_overview: {
    total_records: number;
    total_feedback: number;
    feedback_rate: number;
    likes: number;
    dislikes: number;
    like_ratio: number | null;
    dislike_ratio: number | null;
  };
  quality_by_feedback: {
    avg_quality_liked: number | null;
    avg_quality_disliked: number | null;
    quality_gap: number | null;
  };
  satisfaction_metrics: {
    satisfaction_rate: number | null;
    nps_score: number | null;
    nps_label: string;
  };
}

export interface HourlyPattern {
  hour: number;
  hour_label: string;
  request_count: number;
  request_percentage: number;
  avg_quality: number | null;
  avg_tps: number | null;
}

export interface ModelComparison {
  model_id: string;
  name: string;
  status: string;
  avg_quality_score: number | null;
  avg_tokens_per_sec: number | null;
  likes: number;
  dislikes: number;
  like_ratio: number | null;
  total_requests: number;
  composite_score: number;
}

const AI_SERVICE_BASE = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:5001')
  : 'http://localhost:5001';

const API_PREFIX = `${AI_SERVICE_BASE}/api/v1/powerbi`;

async function fetchFromAI<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_PREFIX}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Timeout 5 ثانیه - اگر AI Service جواب نداد fallback به mock
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[PowerBI] AI Service unavailable for ${endpoint}:`, error);
    throw error;
  }
}

export const powerBIService = {
  /** خلاصه کامل داشبورد با KPIها */
  async getDashboardSummary(hours: number = 168): Promise<{success: boolean; dashboard: DashboardSummary}> {
    return fetchFromAI(`/dashboard-summary?hours=${hours}`);
  },

  /** داده سری زمانی برای نمودارها */
  async getTimeseries(
    hours: number = 720, 
    interval: string = 'day',
    dimension: string = 'all'
  ): Promise<{success: boolean; timeseries: TimeSeriesPoint[]}> {
    return fetchFromAI(`/timeseries?hours=${hours}&interval=${interval}&dimension=${dimension}`);
  },

  /** الگوی استفاده ساعتی */
  async getHourlyPattern(hours: number = 720): Promise<{success: boolean; pattern: HourlyPattern[]}> {
    return fetchFromAI(`/hourly-pattern?hours=${hours}`);
  },

  /** الگوی استفاده هفتگی */
  async getWeeklyPattern(hours: number = 720): Promise<{success: boolean; pattern: any[]}> {
    return fetchFromAI(`/weekly-pattern?hours=${hours}`);
  },

  /** تحلیل بازخورد کاربران */
  async getFeedbackAnalysis(hours: number = 720): Promise<{success: boolean} & FeedbackAnalysis> {
    return fetchFromAI(`/feedback-analysis?hours=${hours}`);
  },

  /** مقایسه مدل‌ها */
  async getModelComparison(): Promise<{success: boolean; models: ModelComparison[]}> {
    return fetchFromAI('/model-comparison');
  },

  /** گزارش Drift */
  async getDriftReport(days: number = 30): Promise<any> {
    return fetchFromAI(`/drift-report?days=${days}`);
  },

  /** خروجی CSV برای Power BI Desktop */
  getExportCsvUrl(hours: number = 2160): string {
    return `${API_PREFIX}/export-csv?hours=${hours}`;
  },

  /** وضعیت سرویس Power BI */
  async getHealth(): Promise<any> {
    return fetchFromAI('/health');
  },
};

export default powerBIService;
