'use client';

import { useEffect, useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { 
    Users, Activity, Server, Brain, TrendingUp, Settings, Shield, 
    Loader2, LogOut, Zap, Database, Wifi, Clock, Eye, Edit, Trash2,
    UserCheck, UserPlus, DollarSign, FileText, MessageSquare, Bell,
    ChevronRight, Crown, Stethoscope, HeartPulse, Sparkles, ShieldAlert,
    ShoppingCart, Calendar, Pill, Upload, Bot
} from 'lucide-react';
import { adminService, systemSettingsService } from '@/services/adminService';
import Image from 'next/image';
import AISettingsModal from '@/components/shared/AISettingsModal';

export default function AdminDashboard() {
    const router = useRouter();
    const locale = useLocale();
    const isRTL = locale === 'fa';

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [systemHealth, setSystemHealth] = useState<any>(null);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const storedUser = localStorage.getItem('user');
            const storedRole = localStorage.getItem('user_role');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                const userRole = userData.role || storedRole;
                if (userRole !== 'admin') {
                    router.push('/login');
                    return;
                }
                setLoading(false);
            } else {
                router.push('/login');
            }
        };
        const timer = setTimeout(checkAuth, 100);
        return () => clearTimeout(timer);
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, usersData, health] = await Promise.all([
                    adminService.getStats(),
                    adminService.getUsers({ role: 'patient' }),
                    systemSettingsService.getHealth()
                ]);

                setStats(statsData);
                setSystemHealth(health);
                setUsers(usersData.slice(0, 5));
            } catch (err) {
                console.error("Failed to load admin dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">{isRTL ? 'در حال بارگذاری...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-16 pb-24 animate-in fade-in slide-in-from-bottom-10 duration-1000" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Editorial Hero Section */}
            <section className="relative h-[400px] rounded-[4rem] overflow-hidden group shadow-mega">
                <div className="absolute inset-0 bg-black">
                    <Image
                        src="http://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=2000&q=80"
                        alt="Admin Control Center"
                        fill
                        className="object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                {/* Animated Orbital Ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full animate-spin-slow pointer-events-none"></div>

                <div className="relative z-10 h-full flex flex-col justify-end p-12 lg:p-20">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Shield className="text-white w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">
                            {isRTL ? 'پنل مدیریت ارشد' : 'Executive Command Center'}
                        </span>
                    </div>
                    
                    <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
                        {isRTL ? 'مدیریت' : 'Control'} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            {isRTL ? 'سیستم' : 'System'}
                        </span>
                    </h1>

                    <div className="flex flex-wrap gap-10 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-white/60 text-sm font-medium">{isRTL ? 'سیستم آنلاین' : 'System Online'}</span>
                        </div>
                        <div className="border-r border-white/20 pr-10">
                            <span className="text-white/40 text-xs font-black uppercase tracking-widest">{isRTL ? 'نسخه' : 'Version'}</span>
                            <p className="text-white font-bold">v2.4.0</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Cards - Editorial Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: isRTL ? 'کل بیماران' : 'Total Patients', value: stats?.total_patients || 0, icon: Users, color: 'from-blue-500 to-cyan-500', trend: '+12%' },
                    { label: isRTL ? 'نوبت‌های فعال' : 'Active', value: stats?.active_appointments || 0, icon: Activity, color: 'from-emerald-500 to-teal-500', trend: '+8%' },
                    { label: isRTL ? 'پزشکان' : 'Doctors', value: stats?.total_doctors || 0, icon: Stethoscope, color: 'from-purple-500 to-pink-500', trend: '+5%' },
                    { label: isRTL ? 'ساعت کاری' : 'Uptime', value: '99.9%', icon: Clock, color: 'from-amber-500 to-orange-500', trend: 'Optimal' },
                ].map((item, idx) => (
                    <div key={idx} className="group relative bg-white rounded-[3rem] p-10 shadow-mega border border-black/[0.03] hover:-translate-y-2 transition-all duration-500">
                        <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-opacity`}></div>
                        <div className="relative z-10">
                            <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                                <item.icon className="text-white" size={24} />
                            </div>
                            <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mb-2">{item.label}</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-black text-black tracking-tighter">{item.value}</span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{item.trend}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Main Content Grid */}
            <section className="grid lg:grid-cols-3 gap-10">
                
                {/* System Health - Editorial Card */}
                <div className="lg:col-span-2 bg-white rounded-[4rem] p-10 lg:p-12 shadow-mega border border-black/[0.03]">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-black tracking-tighter">{isRTL ? 'مانیتورینگ سیستم' : 'System Monitor'}</h2>
                            <p className="text-black/30 text-[10px] font-medium uppercase tracking-[0.3em] mt-2">{isRTL ? 'زیرساخت‌های فنی' : 'Technical Infrastructure'}</p>
                        </div>
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            {isRTL ? 'همه سیستم‌ها سالم' : 'All Systems Operational'}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Database', status: systemHealth?.database || 'healthy', icon: Database, color: 'blue' },
                            { label: 'Redis', status: systemHealth?.redis || 'healthy', icon: Wifi, color: 'purple' },
                            { label: 'Workers', status: systemHealth?.celery || 'healthy', icon: Server, color: 'emerald' },
                        ].map((item, idx) => (
                            <div key={idx} className="relative overflow-hidden bg-slate-50 rounded-[3rem] p-8 group hover:bg-black hover:text-white transition-all duration-500">
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 bg-${item.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors`}>
                                        <item.icon className={`text-${item.color}-600 group-hover:text-white`} size={24} />
                                    </div>
                                    <p className="font-black text-lg mb-1">{item.label}</p>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${
                                        item.status === 'healthy' || item.status === 'unknown' 
                                            ? 'text-emerald-500 group-hover:text-emerald-400' 
                                            : 'text-red-500 group-hover:text-red-400'
                                    }`}>
                                        {item.status === 'healthy' ? (isRTL ? 'سالم' : 'Healthy') : 
                                         item.status === 'unknown' ? (isRTL ? 'ناشناخته' : 'Unknown') :
                                         (isRTL ? 'مشکل' : 'Error')}
                                    </p>
                                </div>
                                <div className={`absolute bottom-0 left-0 h-1 ${
                                    item.status === 'healthy' || item.status === 'unknown'
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                        : 'bg-gradient-to-r from-red-500 to-red-400'
                                } w-full transition-transform duration-500 group-hover:scale-x-100 scale-x-0`}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions - AI Panel */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-[4rem] p-10 text-white shadow-mega relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <Sparkles className="text-blue-400" size={20} />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{isRTL ? 'تنظیمات هوش مصنوعی' : 'AI Configuration'}</span>
                            </div>
                            
                            <div className="space-y-4">
                                {[
                                    { label: isRTL ? 'سیستم RAG' : 'Company Info (RAG)', active: true, icon: Brain },
                                    { label: isRTL ? 'هوش مصنوعی' : 'Fine-tuned AI', active: false, icon: Sparkles },
                                    { label: isRTL ? 'پشتیبانی انسانی' : 'Human Support', active: false, icon: UserCheck },
                                ].map((item, idx) => (
                                    <button 
                                        key={idx}
                                        className={`w-full p-6 rounded-[2rem] flex items-center gap-4 transition-all ${
                                            item.active 
                                                ? 'bg-white/10 border border-white/20 backdrop-blur-xl text-white shadow-lg' 
                                                : 'bg-transparent border border-white/5 text-white/40 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.active ? 'bg-blue-500' : 'bg-white/5'}`}>
                                            <item.icon size={18} />
                                        </div>
                                        <span className="font-black text-sm">{item.label}</span>
                                        {item.active && (
                                            <div className="mr-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[4rem] p-10 text-white shadow-mega relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px]"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <ShoppingCart className="text-emerald-300" size={20} />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{isRTL ? 'دسترسی سریع' : 'Quick Access'}</span>
                            </div>
                            
                            <div className="space-y-4">
                                <Link 
                                    href="/pharmacy"
                                    className="w-full p-5 rounded-[2rem] flex items-center gap-4 bg-white/10 border border-white/20 backdrop-blur-xl text-white hover:bg-white/20 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500">
                                        <Pill size={18} />
                                    </div>
                                    <span className="font-bold text-sm">{isRTL ? 'داروخانه آنلاین' : 'Online Pharmacy'}</span>
                                    <ChevronRight size={16} className="mr-auto" />
                                </Link>
                                
                                <Link 
                                    href="/dashboard/appointments"
                                    className="w-full p-5 rounded-[2rem] flex items-center gap-4 bg-transparent border border-white/5 text-white/60 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
                                        <Calendar size={18} />
                                    </div>
                                    <span className="font-bold text-sm">{isRTL ? 'مدیریت نوبت‌ها' : 'Appointments'}</span>
                                    <ChevronRight size={16} className="mr-auto" />
                                </Link>
                                
                                <Link 
                                    href="/dashboard/users"
                                    className="w-full p-5 rounded-[2rem] flex items-center gap-4 bg-transparent border border-white/5 text-white/60 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
                                        <Users size={18} />
                                    </div>
                                    <span className="font-bold text-sm">{isRTL ? 'مدیریت کاربران' : 'User Management'}</span>
                                    <ChevronRight size={16} className="mr-auto" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Knowledge Base Management */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[4rem] p-10 text-white shadow-mega relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400/20 rounded-full blur-[80px]"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <Brain className="text-indigo-300" size={20} />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{isRTL ? 'پایگاه دانش AI' : 'AI Knowledge Base'}</span>
                            </div>
                            
                            <div className="space-y-4">
                                <Link 
                                    href="/dashboard/ai-knowledge"
                                    className="w-full p-5 rounded-[2rem] flex items-center gap-4 bg-white/10 border border-white/20 backdrop-blur-xl text-white hover:bg-white/20 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500">
                                        <FileText size={18} />
                                    </div>
                                    <span className="font-bold text-sm">{isRTL ? 'مدیریت اسناد' : 'Document Management'}</span>
                                    <ChevronRight size={16} className="mr-auto" />
                                </Link>
                                
                                <button 
                                    onClick={() => {
                                        // Trigger file upload
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = '.pdf,.txt,.md';
                                        input.multiple = true;
                                        input.onchange = async (e: any) => {
                                            const files = e.target.files;
                                            if (files.length > 0) {
                                                // Here you would upload to AI service
                                                alert(`${files.length} ${isRTL ? 'فایل انتخاب شد. آپلود به زودی...' : 'files selected. Upload coming soon...'}`);
                                            }
                                        };
                                        input.click();
                                    }}
                                    className="w-full p-5 rounded-[2rem] flex items-center gap-4 bg-transparent border border-white/5 text-white/60 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
                                        <Upload size={18} />
                                    </div>
                                    <span className="font-bold text-sm">{isRTL ? 'آپلود سند جدید' : 'Upload New Document'}</span>
                                    <ChevronRight size={16} className="mr-auto" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Card */}
                    <div className="bg-white rounded-[4rem] p-10 shadow-mega border border-black/[0.03]">
                        <h3 className="text-2xl font-black text-black tracking-tighter mb-8">{isRTL ? 'آمار مالی' : 'Financial Overview'}</h3>
                        <div className="space-y-6">
                            {[
                                { label: isRTL ? 'درآمد امروز' : "Today's Revenue", value: '$1,250', icon: DollarSign },
                                { label: isRTL ? 'نوبت‌های امروز' : "Today's Appointments", value: '24', icon: Activity },
                                { label: isRTL ? 'پیام‌های جدید' : 'New Messages', value: '8', icon: MessageSquare },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-[2rem] hover:bg-black hover:text-white transition-all duration-300 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-white/10">
                                            <item.icon size={18} className="text-black/40 group-hover:text-white" />
                                        </div>
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </div>
                                    <span className="font-black text-lg">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Users Table */}
            <section className="bg-white rounded-[4rem] p-10 lg:p-12 shadow-mega border border-black/[0.03]">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-black tracking-tighter">{isRTL ? 'کاربران اخیر' : 'Recent Users'}</h2>
                        <p className="text-black/30 text-[10px] font-medium uppercase tracking-[0.3em] mt-2">{isRTL ? 'آخرین فعالیت‌ها' : 'Latest Activity'}</p>
                    </div>
                    <button className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
                        {isRTL ? 'مشاهده همه' : 'View All'}
                        <ChevronRight size={16} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {users.map((user, idx) => (
                        <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[3rem] hover:bg-black hover:text-white transition-all duration-500 group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-[1.5rem] flex items-center justify-center text-white font-black text-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                                    {user.first_name?.[0] || user.phone_number?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="font-black text-lg">
                                        {user.first_name && user.last_name 
                                            ? `${user.first_name} ${user.last_name}` 
                                            : user.phone_number}
                                    </p>
                                    <p className="text-xs text-black/30 group-hover:text-white/40 font-medium">{user.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="px-4 py-2 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest group-hover:bg-white/10 group-hover:text-white">
                                    {isRTL ? 'فعال' : 'Active'}
                                </span>
                                <ChevronRight size={18} className="text-black/10 group-hover:text-white/40" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 60s linear infinite;
                }
            `}</style>
        </div>
    );
}

