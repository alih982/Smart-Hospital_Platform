'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
    Brain, Activity, Users, Clock, TrendingUp, AlertTriangle,
    MessageSquare, Shield, Settings, RefreshCw, Download,
    ChevronDown, Search, Filter, Zap, Database, Server,
    CheckCircle, XCircle, AlertCircle, Eye, ThumbsUp, ThumbsDown
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Types
interface AIStats {
    totalConversations: number;
    dailyActiveUsers: number;
    avgResponseTime: number;
    successRate: number;
    userSatisfactionScore: string;
    escalationRate: number;
    totalTokens: number;
    modelLoadTime: number;
    memoryUsage: number;
    uptime: number;
}

interface Conversation {
    id: string;
    userId: string;
    specialty: string;
    messageCount: number;
    duration: number;
    userFeedback: 'positive' | 'negative' | 'neutral' | null;
    wasEscalated: boolean;
    timestamp: string;
}

interface SpecialtyUsage {
    name: string;
    count: number;
    percentage: number;
    avgSatisfaction: number;
}

interface ModelStatus {
    name: string;
    status: 'active' | 'inactive' | 'loading';
    responseTime: number;
    accuracy: number;
}

interface TabItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

// Mock data generators
const generateMockStats = (): AIStats => ({
    totalConversations: Math.floor(Math.random() * 10000) + 5000,
    dailyActiveUsers: Math.floor(Math.random() * 500) + 200,
    avgResponseTime: Math.floor(Math.random() * 1500) + 500,
    successRate: Math.floor(Math.random() * 10) + 90,
    userSatisfactionScore: (Math.random() * 0.5 + 4.2).toFixed(1),
    escalationRate: Math.floor(Math.random() * 5) + 1,
    totalTokens: Math.floor(Math.random() * 1000000) + 500000,
    modelLoadTime: Math.floor(Math.random() * 2000) + 300,
    memoryUsage: Math.floor(Math.random() * 40) + 30,
    uptime: 99.9
});

const generateMockSpecialties = (): SpecialtyUsage[] => [
    { name: 'عمومی', count: 3500, percentage: 35, avgSatisfaction: 4.5 },
    { name: 'قلب و عروق', count: 1800, percentage: 18, avgSatisfaction: 4.7 },
    { name: ' مغز و اعصاب', count: 1200, percentage: 12, avgSatisfaction: 4.3 },
    { name: 'پوست و مو', count: 1000, percentage: 10, avgSatisfaction: 4.6 },
    { name: 'کودکان', count: 900, percentage: 9, avgSatisfaction: 4.4 },
    { name: 'روانپزشکی', count: 800, percentage: 8, avgSatisfaction: 4.2 },
    { name: 'تغذیه', count: 500, percentage: 5, avgSatisfaction: 4.8 },
    { name: 'داروخانه', count: 300, percentage: 3, avgSatisfaction: 4.5 },
];

const generateMockConversations = (): Conversation[] => {
    const specialties = ['عمومی', 'قلب و عروق', 'مغز و اعصاب', 'پوست و مو', 'کودکان'];
    return Array.from({ length: 20 }, (_, i) => ({
        id: `conv-${i}`,
        userId: `user-${Math.floor(Math.random() * 100)}`,
        specialty: specialties[Math.floor(Math.random() * specialties.length)],
        messageCount: Math.floor(Math.random() * 10) + 2,
        duration: Math.floor(Math.random() * 600) + 60,
        userFeedback: ['positive', 'negative', 'neutral', null][Math.floor(Math.random() * 4)] as any,
        wasEscalated: Math.random() > 0.95,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
    }));
};

const generateChartData = () => {
    const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    return days.map(day => ({
        name: day,
        conversations: Math.floor(Math.random() * 200) + 100,
        satisfaction: (Math.random() * 0.5 + 4.2).toFixed(1),
        avgTime: Math.floor(Math.random() * 1000) + 800
    }));
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function AIAnalyticsDashboard() {
    const t = useTranslations('dashboard');
    const locale = useLocale();
    const isRTL = locale === 'fa';

    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<AIStats | null>(null);
    const [specialties, setSpecialties] = useState<SpecialtyUsage[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const [models] = useState<ModelStatus[]>([
        { name: 'Gemma-2B Medical', status: 'active', responseTime: 850, accuracy: 94.5 },
        { name: 'Llama3-Medical', status: 'inactive', responseTime: 1200, accuracy: 92.1 },
        { name: 'Fine-tuned RAG', status: 'active', responseTime: 450, accuracy: 97.2 },
    ]);

    const loadData = useCallback(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setStats(generateMockStats());
            setSpecialties(generateMockSpecialties());
            setConversations(generateMockConversations());
            setChartData(generateChartData());
            setLastUpdate(new Date());
            setLoading(false);
        }, 800);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

const tabs: TabItem[] = [
    { id: 'overview', label: isRTL ? 'نمای کلی' : 'Overview', icon: Activity },
    { id: 'analytics', label: isRTL ? 'تحلیل‌ها' : 'Analytics', icon: TrendingUp },
    { id: 'conversations', label: isRTL ? 'مکالمات' : 'Conversations', icon: MessageSquare },
    { id: 'knowledge', label: isRTL ? 'پایگاه دانش' : 'Knowledge', icon: Database },
    { id: 'models', label: isRTL ? 'مدل‌های AI' : 'AI Models', icon: Brain },
    { id: 'safety', label: isRTL ? 'ایمنی' : 'Safety', icon: Shield },
];

    const StatCard = ({ title, value, unit, icon: Icon, trend, color }: any) => (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-800">{value}</span>
                {unit && <span className="text-sm text-slate-400 font-medium">{unit}</span>}
            </div>
            <p className="text-sm text-slate-500 font-medium mt-2">{title}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800">
                                    {isRTL ? 'پنل مدیریت AI' : 'AI Management Dashboard'}
                                </h1>
                                <p className="text-sm text-slate-500 font-medium">
                                    {isRTL ? 'نظارت و مدیریت سیستم هوش مصنوعی' : 'AI System Monitoring & Management'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">
                                {isRTL ? 'آخرین بروزرسانی:' : 'Last updated:'} {lastUpdate.toLocaleTimeString()}
                            </span>
                            <button
                                onClick={loadData}
                                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                <Download className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">{isRTL ? 'در حال بارگذاری...' : 'Loading...'}</p>
                        </div>
                    </div>
                ) : stats && (
                    <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title={isRTL ? 'کل مکالمات' : 'Total Conversations'}
                                        value={stats.totalConversations.toLocaleString()}
                                        icon={MessageSquare}
                                        trend={12}
                                        color="bg-gradient-to-br from-blue-500 to-cyan-500"
                                    />
                                    <StatCard
                                        title={isRTL ? 'کاربران فعال امروز' : 'Daily Active Users'}
                                        value={stats.dailyActiveUsers}
                                        icon={Users}
                                        trend={8}
                                        color="bg-gradient-to-br from-emerald-500 to-teal-500"
                                    />
                                    <StatCard
                                        title={isRTL ? 'زمان پاسخگویی' : 'Avg Response Time'}
                                        value={stats.avgResponseTime}
                                        unit="ms"
                                        icon={Clock}
                                        trend={-5}
                                        color="bg-gradient-to-br from-purple-500 to-pink-500"
                                    />
                                    <StatCard
                                        title={isRTL ? 'رضایت کاربران' : 'User Satisfaction'}
                                        value={stats.userSatisfactionScore}
                                        unit="/5"
                                        icon={ThumbsUp}
                                        trend={3}
                                        color="bg-gradient-to-br from-amber-500 to-orange-500"
                                    />
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Conversations Chart */}
                                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-black text-slate-800">
                                                {isRTL ? 'روند مکالمات هفتگی' : 'Weekly Conversations Trend'}
                                            </h3>
                                        </div>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                                <YAxis stroke="#94a3b8" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: 'none',
                                                        borderRadius: '1rem',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="conversations"
                                                    stroke="#3B82F6"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorConv)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Specialty Distribution */}
                                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-black text-slate-800 mb-6">
                                            {isRTL ? 'توزیع تخصص‌ها' : 'Specialty Distribution'}
                                        </h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={specialties}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="count"
                                                    nameKey="name"
                                                >
                                                    {specialties.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="space-y-2 mt-4">
                                            {specialties.slice(0, 4).map((s, i) => (
                                                <div key={s.name} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                                        <span className="text-slate-600 font-medium">{s.name}</span>
                                                    </div>
                                                    <span className="text-slate-400">{s.percentage}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* System Health */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <CheckCircle className="w-6 h-6" />
                                            <span className="font-bold">{isRTL ? 'سلامت سیستم' : 'System Health'}</span>
                                        </div>
                                        <div className="text-4xl font-black mb-2">{stats.uptime}%</div>
                                        <p className="text-white/70 text-sm">{isRTL ? 'زمان فعالیت' : 'Uptime'}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-8 text-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Zap className="w-6 h-6" />
                                            <span className="font-bold">{isRTL ? 'استفاده از حافظه' : 'Memory Usage'}</span>
                                        </div>
                                        <div className="text-4xl font-black mb-2">{stats.memoryUsage}%</div>
                                        <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                                            <div className="bg-white h-2 rounded-full" style={{ width: `${stats.memoryUsage}%` }} />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-[2rem] p-8 text-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertTriangle className="w-6 h-6" />
                                            <span className="font-bold">{isRTL ? 'نرخ ارجاع' : 'Escalation Rate'}</span>
                                        </div>
                                        <div className="text-4xl font-black mb-2">{stats.escalationRate}%</div>
                                        <p className="text-white/70 text-sm">{isRTL ? 'ارجاع به پزشک' : 'To Doctors'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Models Tab */}
                        {activeTab === 'models' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xl font-black text-slate-800">
                                    {isRTL ? 'مدل‌های AI فعال' : 'Active AI Models'}
                                </h3>
                                <div className="grid gap-4">
                                    {models.map((model, idx) => (
                                        <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                                    model.status === 'active' ? 'bg-emerald-100' : 'bg-slate-100'
                                                }`}>
                                                    <Brain className={`w-6 h-6 ${model.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{model.name}</h4>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                                            model.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            {model.status === 'active' ? (isRTL ? 'فعال' : 'Active') : (isRTL ? 'غیرفعال' : 'Inactive')}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {isRTL ? 'زمان پاسخ:' : 'Response:'} {model.responseTime}ms
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {isRTL ? 'دقت:' : 'Accuracy:'} {model.accuracy}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="px-6 py-3 bg-slate-800 text-white rounded-2xl font-bold text-sm hover:bg-slate-700 transition-colors">
                                                {isRTL ? 'تنظیمات' : 'Settings'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Conversations Tab */}
                        {activeTab === 'conversations' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-800">
                                        {isRTL ? 'آخرین مکالمات' : 'Recent Conversations'}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder={isRTL ? 'جستجو...' : 'Search...'}
                                                className="pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-2xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl font-medium text-sm">
                                            <Filter className="w-4 h-4" />
                                            {isRTL ? 'فیلتر' : 'Filter'}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-right px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                                                    {isRTL ? 'شناسه' : 'ID'}
                                                </th>
                                                <th className="text-right px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                                                    {isRTL ? 'تخصص' : 'Specialty'}
                                                </th>
                                                <th className="text-right px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                                                    {isRTL ? 'پیام‌ها' : 'Messages'}
                                                </th>
                                                <th className="text-right px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                                                    {isRTL ? 'مدت' : 'Duration'}
                                                </th>
                                                <th className="text-right px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                                                    {isRTL ? 'بازخورد' : 'Feedback'}
                                                </th>
                                                <th className="text-right px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                                                    {isRTL ? 'ارجاع' : 'Escalated'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {conversations.slice(0, 10).map((conv) => (
                                                <tr key={conv.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-800">{conv.id}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                                                            {conv.specialty}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{conv.messageCount}</td>
                                                    <td className="px-6 py-4 text-slate-600">{Math.floor(conv.duration / 60)}:{String(conv.duration % 60).padStart(2, '0')}</td>
                                                    <td className="px-6 py-4">
                                                        {conv.userFeedback === 'positive' && <ThumbsUp className="w-5 h-5 text-emerald-500" />}
                                                        {conv.userFeedback === 'negative' && <ThumbsDown className="w-5 h-5 text-rose-500" />}
                                                        {conv.userFeedback === 'neutral' && <span className="text-slate-400">-</span>}
                                                        {!conv.userFeedback && <span className="text-slate-300">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {conv.wasEscalated ? (
                                                            <XCircle className="w-5 h-5 text-rose-500" />
                                                        ) : (
                                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                                    <h3 className="text-lg font-black text-slate-800 mb-6">
                                        {isRTL ? 'رضایت روزانه' : 'Daily Satisfaction'}
                                    </h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                            <YAxis domain={[3, 5]} stroke="#94a3b8" fontSize={12} />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="satisfaction"
                                                stroke="#10B981"
                                                strokeWidth={3}
                                                dot={{ fill: '#10B981', strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                                    <h3 className="text-lg font-black text-slate-800 mb-6">
                                        {isRTL ? 'زمان پاسخ' : 'Response Time'}
                                    </h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} />
                                            <Tooltip />
                                            <Bar dataKey="avgTime" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Knowledge Tab */}
                        {activeTab === 'knowledge' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xl font-black text-slate-800">
                                    {isRTL ? 'پایگاه دانش' : 'Knowledge Base'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { title: isRTL ? 'مستندات پزشکی' : 'Medical Documents', count: 1250, size: '2.5 GB' },
                                        { title: isRTL ? 'راهنماهای بالینی' : 'Clinical Guidelines', count: 340, size: '150 MB' },
                                        { title: isRTL ? 'اطلاعات دارویی' : 'Drug Database', count: 5200, size: '80 MB' },
                                        { title: isRTL ? 'سوالات متداول' : 'FAQ', count: 890, size: '5 MB' },
                                        { title: isRTL ? 'پرونده‌های بیمار' : 'Patient Records', count: 15000, size: '15 GB' },
                                        { title: isRTL ? 'سیاست‌های بیمارستان' : 'Hospital Policies', count: 120, size: '20 MB' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                                    <Database className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                                                    <p className="text-xs text-slate-500">{item.size}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <span className="text-2xl font-black text-slate-800">{item.count.toLocaleString()}</span>
                                                <span className="text-xs text-slate-400">{isRTL ? 'سند' : 'documents'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Safety Tab */}
                        {activeTab === 'safety' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xl font-black text-slate-800">
                                    {isRTL ? 'ایمنی و نظارت' : 'Safety & Monitoring'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Shield className="w-6 h-6 text-emerald-500" />
                                            <h4 className="font-bold text-slate-800">{isRTL ? 'تشخیص‌های ایمن' : 'Safe Diagnoses'}</h4>
                                        </div>
                                        <div className="text-3xl font-black text-emerald-600">98.5%</div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98.5%' }} />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertCircle className="w-6 h-6 text-amber-500" />
                                            <h4 className="font-bold text-slate-800">{isRTL ? 'هشدارهای بررسی شده' : 'Reviewed Alerts'}</h4>
                                        </div>
                                        <div className="text-3xl font-black text-amber-600">156</div>
                                        <p className="text-xs text-slate-500 mt-2">{isRTL ? 'در ۲۴ ساعت گذشته' : 'Last 24 hours'}</p>
                                    </div>
                                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Eye className="w-6 h-6 text-blue-500" />
                                            <h4 className="font-bold text-slate-800">{isRTL ? 'نظارت بلادرنگ' : 'Real-time Monitoring'}</h4>
                                        </div>
                                        <div className="text-3xl font-black text-blue-600">{isRTL ? 'فعال' : 'Active'}</div>
                                        <p className="text-xs text-slate-500 mt-2">{isRTL ? 'تمام مکالمات تحت نظارت' : 'All conversations monitored'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

