'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { 
    Calendar, MessageSquare, FileText, Pill, Heart, 
    Clock, Bell, Settings, LogOut, ChevronRight,
    Activity, Thermometer, Wind, Droplets, Brain, Search,
    Plus, ArrowRight, HeartPulse, Sparkles, Shield,
    RefreshCw, Phone, Mail, MapPin, Eye, FlaskConical, 
    Ambulance, Wallet, TrendingUp, Award, Stethoscope,
    AlertTriangle, Check, X, Moon, Sun, Video, User,
    Star, Moon as MoonIcon, Sun as SunIcon, BellDot,
    ActivitySquare, HeartHandshake, CalendarCheck,
    FileSignature, FlaskRound, CreditCard, Package,
    ArrowUpRight, ArrowDownRight, MoreVertical,
    Play, Pause, Mic, MicOff, Send, Paperclip,
    Smile, Frown, Meh, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface HealthMetric {
    label: string;
    value: string;
    unit: string;
    icon: string;
    color: string;
    status: 'normal' | 'warning' | 'critical';
    trend?: 'up' | 'down' | 'stable';
    change?: string;
}

interface Appointment {
    id: string;
    doctor: string;
    specialty: string;
    date: string;
    time: string;
    type: 'clinic' | 'online';
    status: 'confirmed' | 'pending' | 'completed';
    avatar?: string;
}

interface Activity {
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
    icon: string;
    color: string;
}

interface QuickAction {
    icon: React.ComponentType<{size?: number; className?: string}>;
    label: string;
    href: string;
    gradient: string;
    badge?: string | null;
    description: string;
}

export default function PatientDashboard() {
    const t = useTranslations('dashboard.patient');
    const locale = useLocale();
    const { user } = useAuthStore();
    const router = useRouter();
    const isRTL = locale === 'fa';
    const [mounted, setMounted] = useState(false);
    const [greeting, setGreeting] = useState('');
    const [liveTime, setLiveTime] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        setMounted(true);
        
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours();
            if (hours < 12) setGreeting(isRTL ? 'صبح بخیر' : 'Good Morning');
            else if (hours < 18) setGreeting(isRTL ? 'ظهر بخیر' : 'Good Afternoon');
            else setGreeting(isRTL ? 'شب بخیر' : 'Good Evening');
            
            setLiveTime(now.toLocaleTimeString(locale === 'fa' ? 'fa-IR' : 'en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }));
        };
        
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [isRTL, locale]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (!mounted) return null;

    const healthMetrics: HealthMetric[] = [
        { label: isRTL ? 'فشار خون' : 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: '❤️', color: 'rose', status: 'normal', trend: 'stable', change: '0%' },
        { label: isRTL ? 'ضربان قلب' : 'Heart Rate', value: '72', unit: 'BPM', icon: '💓', color: 'pink', status: 'normal', trend: 'down', change: '-2%' },
        { label: isRTL ? 'دمای بدن' : 'Temperature', value: '36.8', unit: '°C', icon: '🌡️', color: 'orange', status: 'normal', trend: 'stable', change: '0%' },
        { label: isRTL ? 'اکسیژن خون' : 'SpO2', value: '98', unit: '%', icon: '💨', color: 'cyan', status: 'normal', trend: 'up', change: '+1%' },
    ];

    const appointments: Appointment[] = [
        { id: '1', doctor: isRTL ? 'دکتر سارا احمدی' : 'Dr. Sarah Ahmadi', specialty: isRTL ? 'قلب و عروق' : 'Cardiology', date: isRTL ? '۱۵ آذر' : 'Dec 5', time: '09:30', type: 'clinic', status: 'confirmed' },
        { id: '2', doctor: isRTL ? 'دکتر مریم سعادت' : 'Dr. Maryam Saadat', specialty: isRTL ? 'چشم‌پزشکی' : 'Ophthalmology', date: isRTL ? '۲۰ آذر' : 'Dec 10', time: '11:00', type: 'online', status: 'pending' },
        { id: '3', doctor: isRTL ? 'دکتر علیرضا محمدی' : 'Dr. Alireza Mohammadi', specialty: isRTL ? 'ارتوپدی' : 'Orthopedics', date: isRTL ? '۲۵ آذر' : 'Dec 15', time: '14:30', type: 'clinic', status: 'confirmed' },
    ];

    const activities: Activity[] = [
        { id: '1', type: 'appointment', title: isRTL ? 'ویزیت دکتر احمدی' : 'Dr. Ahmadi Visit', description: isRTL ? 'بررسی قلب و عروق' : 'Cardiovascular checkup', time: isRTL ? '۲ ساعت پیش' : '2 hours ago', icon: '🩺', color: 'blue' },
        { id: '2', type: 'prescription', title: isRTL ? 'نسخه جدید صادر شد' : 'New Prescription', description: isRTL ? 'داروهای قلبی - ۳ قلم' : 'Cardiac medications - 3 items', time: isRTL ? '۵ ساعت پیش' : '5 hours ago', icon: '💊', color: 'purple' },
        { id: '3', type: 'pharmacy', title: isRTL ? 'سفارش تکمیل شد' : 'Order Completed', description: isRTL ? 'داروخانه مرکزی - تحویل داده شد' : 'Central Pharmacy - Delivered', time: isRTL ? 'دیروز' : 'Yesterday', icon: '✅', color: 'emerald' },
        { id: '4', type: 'lab', title: isRTL ? 'نتایج آزمایش آماده' : 'Lab Results Ready', description: isRTL ? 'آزمایش خون کامل' : 'Complete Blood Count', time: isRTL ? '۲ روز پیش' : '2 days ago', icon: '🔬', color: 'indigo' },
    ];

    const quickActions: QuickAction[] = [
        { icon: Calendar, label: isRTL ? 'رزرو نوبت' : 'Book Appointment', href: '/doctors', gradient: 'from-blue-500 via-cyan-500 to-teal-500', badge: null, description: isRTL ? 'رزرو آنلاین' : 'Online booking' },
        { icon: MessageSquare, label: isRTL ? 'پیام به پزشک' : 'Message Doctor', href: '/dashboard/messages', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', badge: '3', description: isRTL ? 'مشاوره تخصصی' : 'Expert consultation' },
        { icon: FileText, label: isRTL ? 'نسخه‌ها' : 'Prescriptions', href: '/dashboard/prescriptions', gradient: 'from-emerald-500 via-teal-500 to-cyan-500', badge: null, description: isRTL ? 'تاریخچه نسخ' : 'Prescription history' },
        { icon: Brain, label: isRTL ? 'مشاور AI' : 'AI Assistant', href: '/dashboard/ai-chat', gradient: 'from-amber-500 via-orange-500 to-rose-500', badge: 'NEW', description: isRTL ? 'هوش مصنوعی' : 'Artificial Intelligence' },
    ];

    const menuItems = [
        { icon: Calendar, label: isRTL ? 'نوبت‌های من' : 'My Appointments', href: '/dashboard/appointments', color: 'blue', count: '2' },
        { icon: FileSignature, label: isRTL ? 'نسخه‌ها' : 'Prescriptions', href: '/dashboard/prescriptions', color: 'purple', count: null },
        { icon: Pill, label: isRTL ? 'داروخانه' : 'Pharmacy', href: '/pharmacy', color: 'emerald', count: null },
        { icon: MessageSquare, label: isRTL ? 'پیام‌ها' : 'Messages', href: '/dashboard/messages', color: 'amber', count: '5' },
        { icon: Wallet, label: isRTL ? 'فاکتورها' : 'Invoices', href: '/dashboard/invoices', color: 'indigo', count: null },
        { icon: FlaskRound, label: isRTL ? 'آزمایشات' : 'Lab Results', href: '/dashboard/lab', color: 'cyan', count: 'NEW' },
        { icon: Settings, label: isRTL ? 'تنظیمات' : 'Settings', href: '/dashboard/settings', color: 'slate', count: null },
    ];

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'completed': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'confirmed': return isRTL ? 'تایید شده' : 'Confirmed';
            case 'pending': return isRTL ? 'در انتظار' : 'Pending';
            case 'completed': return isRTL ? 'انجام شده' : 'Completed';
            default: return status;
        }
    };

    return (
        <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Hero Header - Full Width Premium Design */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-8 lg:p-10">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 -right-20 w-80 h-80 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                </div>
                
                <div className="relative z-10">
                    {/* Top Row: Welcome + Actions */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                                    {isRTL ? 'پنل بیمار' : 'Patient Portal'}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    {isRTL ? 'آنلاین' : 'Online'}
                                </span>
                            </div>
                            
                            <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                                {greeting} 👋
                            </h1>
                            <p className="text-slate-400 text-lg">
                                {isRTL ? 'سلامتی شما، اولویت ماست' : 'Your health is our priority'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-white text-sm font-medium">
                                {liveTime}
                            </div>
                            <button className="relative p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all">
                                <BellDot className="w-5 h-5 text-white" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">5</span>
                            </button>
                            <button onClick={handleLogout} className="p-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl transition-all">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <CalendarCheck className="w-5 h-5 text-blue-400" />
                                <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> +2
                                </span>
                            </div>
                            <p className="text-2xl font-black text-white">2</p>
                            <p className="text-slate-400 text-xs">{isRTL ? 'نوبت فعال' : 'Active Appointments'}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <FileSignature className="w-5 h-5 text-purple-400" />
                                <span className="text-slate-400 text-xs font-medium">3</span>
                            </div>
                            <p className="text-2xl font-black text-white">3</p>
                            <p className="text-slate-400 text-xs">{isRTL ? 'نسخه جدید' : 'New Prescriptions'}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <MessageSquare className="w-5 h-5 text-amber-400" />
                                <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> +5
                                </span>
                            </div>
                            <p className="text-2xl font-black text-white">5</p>
                            <p className="text-slate-400 text-xs">{isRTL ? 'پیام خوانده نشده' : 'Unread Messages'}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <HeartPulse className="w-5 h-5 text-rose-400" />
                                <span className="text-green-400 text-xs font-medium">Normal</span>
                            </div>
                            <p className="text-2xl font-black text-white">98%</p>
                            <p className="text-slate-400 text-xs">{isRTL ? 'سلامت کلی' : 'Overall Health'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Icon Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, idx) => (
                    <Link
                        key={idx}
                        href={action.href}
                        className="group relative bg-white rounded-[2rem] p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-transparent transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        
                        {action.badge && (
                            <span className="absolute top-4 right-4 px-2.5 py-1 bg-red-500 text-white text-[10px] font-black rounded-full uppercase shadow-lg z-10">
                                {action.badge}
                            </span>
                        )}
                        
                        <div className="relative z-10">
                            <div className={`w-14 h-14 mx-auto bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                <action.icon className="text-white" size={26} />
                            </div>
                            <p className="font-bold text-base text-gray-900 group-hover:text-white text-center">{action.label}</p>
                            <p className="text-xs text-gray-500 group-hover:text-white/70 text-center mt-1">{action.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Health Metrics & Upcoming */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Health Metrics */}
                    <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-lg border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{isRTL ? 'شاخص‌های سلامتی' : 'Health Metrics'}</h2>
                                <p className="text-sm text-gray-500 mt-1">{isRTL ? 'آخرین اندازه‌گیری - امروز' : 'Latest measurements - Today'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                                    <RefreshCw size={18} />
                                </button>
                                <button className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all">
                                    <Settings size={18} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {healthMetrics.map((metric, idx) => (
                                <div 
                                    key={idx} 
                                    className="group relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white transition-all duration-500 border border-slate-100 hover:border-transparent"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl">{metric.icon}</span>
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            metric.trend === 'up' ? 'bg-green-100 text-green-600 group-hover:bg-white/20 group-hover:text-white' :
                                            metric.trend === 'down' ? 'bg-red-100 text-red-600 group-hover:bg-white/20 group-hover:text-white' :
                                            'bg-slate-100 text-slate-500 group-hover:bg-white/20 group-hover:text-white'
                                        }`}>
                                            {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
                                             metric.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : 
                                             <Minus className="w-3 h-3" />}
                                            {metric.change}
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black mb-0.5">{metric.value}</p>
                                    <p className="text-xs text-gray-500 group-hover:text-white/70 font-medium">{metric.unit}</p>
                                    <p className="text-xs text-gray-400 group-hover:text-white/60 font-bold uppercase tracking-wider mt-2">{metric.label}</p>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-5 py-3.5 bg-gradient-to-r from-slate-50 to-white rounded-2xl text-sm font-bold text-gray-600 hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                            <Eye size={18} />
                            {isRTL ? 'مشاهده تمام داده‌های سلامتی' : 'View All Health Data'}
                            <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                        </button>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-lg border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{isRTL ? 'نوبت‌های آینده' : 'Upcoming Appointments'}</h2>
                                <p className="text-sm text-gray-500 mt-1">{isRTL ? 'برنامه ریزی شده' : 'Scheduled appointments'}</p>
                            </div>
                            <Link 
                                href="/dashboard/appointments" 
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-blue-500/25 transition-all"
                            >
                                {isRTL ? 'مشاهده همه' : 'View All'}
                            </Link>
                        </div>
                        
                        <div className="space-y-4">
                            {appointments.map((apt, idx) => (
                                <div 
                                    key={idx} 
                                    className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 hover:from-blue-50 hover:to-indigo-50 transition-all duration-500 border border-slate-100 hover:border-blue-200"
                                >
                                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-l-2xl"></div>
                                    
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                {apt.doctor.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-gray-900">{apt.doctor}</p>
                                                <p className="text-sm text-gray-500">{apt.specialty}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="text-left">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    <p className="font-bold text-sm">{apt.date}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    <p className="text-sm text-gray-500">{apt.time}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${apt.type === 'online' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {apt.type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                                    {apt.type === 'online' ? (isRTL ? 'آنلاین' : 'Online') : (isRTL ? 'حضوری' : 'In-Person')}
                                                </span>
                                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusColor(apt.status)}`}>
                                                    {getStatusLabel(apt.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Quick Menu & Emergency */}
                <div className="space-y-6">
                    {/* Quick Menu */}
                    <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-lg border border-slate-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">{isRTL ? 'دسترسی سریع' : 'Quick Access'}</h3>
                        <div className="space-y-3">
                            {menuItems.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group border border-transparent hover:border-blue-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 bg-${item.color}-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <item.icon size={20} className={`text-${item.color}-500`} />
                                        </div>
                                        <span className="font-bold text-sm text-gray-900">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.count && (
                                            <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full">
                                                {item.count}
                                            </span>
                                        )}
                                        <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* AI Health Assistant Card */}
                    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-[2.5rem] p-6 lg:p-8 shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">{isRTL ? 'هوش مصنوعی' : 'AI Assistant'}</span>
                            </div>
                            <h3 className="text-2xl font-black mb-3">{isRTL ? 'مشاور سلامت هوشمند' : 'Smart Health Advisor'}</h3>
                            <p className="text-white/70 text-sm mb-6">
                                {isRTL 
                                    ? 'پاسخ سوالات پزشکی خود را در لحظه دریافت کنید.'
                                    : 'Get instant answers to your medical questions.'
                                }
                            </p>
                            <Link 
                                href="/dashboard/ai-chat"
                                className="w-full py-4 bg-white text-purple-600 rounded-2xl font-bold text-sm hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Brain className="w-5 h-5" />
                                {isRTL ? 'شروع گفتگو' : 'Start Chat'}
                            </Link>
                        </div>
                    </div>

                    {/* Emergency Card */}
                    <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-[2.5rem] p-6 lg:p-8 shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Ambulance className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">{isRTL ? 'اورژانس' : 'Emergency'}</span>
                            </div>
                            <h3 className="text-2xl font-black mb-3">{isRTL ? 'تماس اضطراری' : 'Emergency Contact'}</h3>
                            <p className="text-white/70 text-sm mb-6">
                                {isRTL 
                                    ? 'در صورت نیاز به کمک فوری با ما تماس بگیرید.'
                                    : 'Contact us if you need immediate assistance.'
                                }
                            </p>
                            <button className="w-full py-4 bg-white text-red-600 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                                <Phone className="w-5 h-5" />
                                {isRTL ? 'تماس با اورژانس' : 'Call Emergency'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-lg border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{isRTL ? 'فعالیت‌های اخیر' : 'Recent Activity'}</h2>
                        <p className="text-sm text-gray-500 mt-1">{isRTL ? 'آخرین فعالیت‌های شما' : 'Your latest activities'}</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                        {isRTL ? 'مشاهده همه' : 'View All'}
                    </button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activities.map((activity, idx) => (
                        <div 
                            key={idx} 
                            className="flex items-start gap-4 p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl hover:shadow-lg transition-all border border-slate-100"
                        >
                            <div className={`w-12 h-12 bg-${activity.color}-100 rounded-2xl flex items-center justify-center text-xl shadow-sm`}>
                                {activity.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-gray-900 truncate">{activity.title}</p>
                                <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                                <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Minus({className}: {className?: string}) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14" />
        </svg>
    );
}

