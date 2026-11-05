'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { powerBIService } from '@/services/powerBIService';

export default function AIAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [dashboard, setDashboard] = useState<any>(null);
  const hoursMap: Record<string, number> = { '24h': 24, '7d': 168, '30d': 720 };

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const hours = hoursMap[timeRange] ?? 168;
      const res = await powerBIService.getDashboardSummary(hours);
      setDashboard(res.dashboard);
    } catch { setError('AI Service unavailable'); }
    finally { setLoading(false); }
  }, [timeRange]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return React.createElement('div', { className: 'flex justify-center py-20' }, React.createElement('div', { className: 'w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin' }));

  if (error) return React.createElement('div', { className: 'bg-amber-50 p-6 rounded-2xl' }, React.createElement('p', { className: 'text-amber-800 font-medium' }, error));

  if (!dashboard) return React.createElement('div', { className: 'bg-slate-100 p-6 rounded-2xl text-center' }, React.createElement('p', { className: 'text-slate-600' }, 'No data available.'));

  const kpis = dashboard.kpis || {};
  const cards = [
    { icon: '\U0001f4ac', label: 'Total Requests', key: 'total_requests_last_period', color: 'bg-blue-500' },
    { icon: '\U0001f9e0', label: 'Avg Quality', key: 'avg_quality_score', color: 'bg-purple-500' },
    { icon: '\u26a1', label: 'Speed', key: 'avg_tokens_per_sec', color: 'bg-emerald-500' },
    { icon: '\U0001f44d', label: 'Satisfaction', key: 'like_ratio', color: 'bg-amber-500' },
  ];

  const renderVal = (k: string) => { const v = kpis[k]; if (v == null) return '-'; if (k==='total_requests_last_period') return Number(v).toLocaleString(); if (k==='avg_quality_score'||k==='like_ratio') return (Number(v)*100).toFixed(0)+'%'; if (k==='avg_tokens_per_sec') return Number(v).toFixed(1)+' t/s'; return String(v); };

  return React.createElement('div', { className: 'space-y-10 pb-20' },
    React.createElement('div', { className: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-10 lg:p-14' },
      React.createElement('div', { className: 'flex flex-wrap items-center justify-between gap-4 mb-8' },
        React.createElement('div', null,
          React.createElement('div', { className: 'inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-4' },
            React.createElement('span', { className: 'text-white/70 text-xs font-bold uppercase tracking-wider' }, 'AI Analytics Dashboard')
          ),
          React.createElement('h1', { className: 'text-4xl font-black text-white' }, 'Model Performance Analytics'),
          React.createElement('p', { className: 'text-white/50 text-sm' }, 'Performance data, response quality, and user feedback')
        ),
        React.createElement('div', { className: 'flex flex-wrap items-center gap-3' },
          React.createElement('div', { className: 'flex gap-1 p-1 bg-white/5 rounded-xl' },
            ['24h','7d','30d'].map(r => React.createElement('button', { key: r, onClick: () => setTimeRange(r), className: 'px-4 py-2 rounded-lg text-xs font-bold ' + (timeRange===r?'bg-white text-slate-900':'text-white/50') }, r))
          ),
          React.createElement('button', { onClick: loadData, className: 'px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold' }, 'Refresh'),
          React.createElement('a', { href: powerBIService.getExportCsvUrl(hoursMap[timeRange]??168), target: '_blank', rel: 'noopener noreferrer', className: 'px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold' }, 'CSV Export')
        )
      ),
      React.createElement('div', { className: 'grid grid-cols-2 lg:grid-cols-4 gap-5' },
        cards.map((s,i) => React.createElement('div', { key: i, className: 'bg-white rounded-2xl p-6 shadow-sm border border-slate-100' },
          React.createElement('div', { className: s.color + ' w-10 h-10 rounded-xl flex items-center justify-center mb-3' },
            React.createElement('span', { className: 'text-white text-lg' }, s.icon)
          ),
          React.createElement('p', { className: 'text-xs font-bold text-slate-400 uppercase tracking-wide mb-1' }, s.label),
          React.createElement('span', { className: 'text-2xl font-black text-slate-800' }, renderVal(s.key))
        ))
      )
    ),
    React.createElement('div', { className: 'bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-10 border border-indigo-100' },
      React.createElement('h3', { className: 'text-2xl font-black text-indigo-900 mb-4' }, 'Connect to Power BI Desktop'),
      React.createElement('p', { className: 'text-indigo-600 text-sm mb-6' }, 'Download CSV and open in Power BI Desktop for professional dashboards.'),
      React.createElement('div', { className: 'grid sm:grid-cols-3 gap-4 mb-6' },
        [['Step 1','Click Export CSV'],['Step 2','Open in Power BI Desktop'],['Step 3','Set Auto-refresh (hourly)']].map(([step,desc],i) => React.createElement('div', { key: i, className: 'bg-white rounded-xl p-4 border border-indigo-100' },
          React.createElement('p', { className: 'text-xs font-bold text-indigo-500 mb-1' }, step),
          React.createElement('p', { className: 'font-bold text-indigo-900 text-sm' }, desc)
        ))
      ),
      React.createElement('div', { className: 'bg-indigo-100/50 rounded-xl p-4' },
        React.createElement('code', { className: 'text-xs text-indigo-800 break-all' }, 'GET http://localhost:5001/api/v1/powerbi/export-csv')
      )
    )
  );
}
