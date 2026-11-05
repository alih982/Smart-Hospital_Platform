'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    MessageSquare,
    Activity,
    Clock,
    ChevronRight,
    Stethoscope,
    Video,
    TrendingUp,
    Star,
    ArrowUpRight,
    ArrowRight,
    Loader2,
    ShieldAlert,
    Zap,
    LayoutDashboard,
    LogOut
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/navigation';
import { appointmentService } from '@/services/appointmentService';
import { doctorDashboardService } from '@/services/adminService';

export default function DoctorDashboard() {
    const t = useTranslations('dashboard.doctor');
    const locale = useLocale();
    const router = useRouter();
    const isRTL = locale === 'fa';

    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    // Dynamic State
    const [appointments, setAppointments] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalPatients: 0,
        consultations: 0,
        rating: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);

        // Check auth from localStorage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (!storedUser || !storedToken) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        
        // Redirect if not doctor
        if (userData.role !== 'doctor') {
            router.push('/login');
            return;
        }

        // Only set user once, not on every render
        setUser(userData);

        // Fetch data after setting user
        const fetchData = async () => {
            // Demo mode - use mock data
            setStats({
                totalPatients: 12,
                consultations: 48,
                rating: 4.8
            });

            // Demo appointments
            setAppointments([
                {
                    id: 'demo-1',
                    patient_name: 'علی رضایی',
                    specialty: 'عمومی',
                    appointment_date: new Date().toISOString(),
                    appointment_time: '14:00',
                    status: 'confirmed'
                },
                {
                    id: 'demo-2',
                    patient_name: 'مریم محمدی',
                    specialty: 'قلب',
                    appointment_date: new Date().toISOString(),
                    appointment_time: '15:30',
                    status: 'confirmed'
                }
            ]);
            setLoading(false);
        };

        fetchData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push(`/login`);
    };

    if (!mounted) return null;

    if (loading) return <div className="h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    const statCards = [
        { label: isRTL ? 'کل بیماران' : t('totalPatients') || 'Total Patients', count: stats.totalPatients, icon: <Users className="text-blue-600" />, trend: '+--', color: 'bg-blue-50' },
        { label: isRTL ? 'مشاوره‌ها' : t('consultations') || 'Consultations', count: stats.consultations, icon: <Activity className="text-emerald-600" />, trend: isRTL ? 'ماهانه' : 'Monthly', color: 'bg-emerald-50' },
        { label: isRTL ? 'میانگین امتیاز' : t('avgRating') || 'Avg Rating', count: stats.rating.toFixed(1), icon: <Star className="text-amber-500 fill-amber-500" />, trend: isRTL ? '۵٪ برتر' : 'Top 5%', color: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-16 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* High-Fashion Editorial Hero */}
            <section className="relative h-[450px] rounded-[4rem] overflow-hidden group shadow-premium">
                <div className="absolute inset-0 bg-black">
                    <Image
                        src="http://images.unsplash.com/photo-1631217816660-ad3535598e37?q=80&w=2000"
                        alt="Modern Medicine"
                        fill
                        className="object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                {/* Orbital Design Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/5 rounded-full animate-spin-slow pointer-events-none"></div>

                <div className="relative z-10 h-full flex flex-col justify-end p-12 lg:p-20">
                    <div className="max-w-4xl space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 backdrop-blur-2xl rounded-pill border border-white/20 glass-noise">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
                                {isRTL ? 'سیستم یکپارچه فعال است' : 'Unified Clinical System Active'}
                            </span>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85]">
                            {isRTL ? 'دکتر' : 'Dr.'} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.first_name || 'Operator'}</span>
                        </h1>

                        <div className="flex flex-wrap gap-8 pt-6">
                            <div className="space-y-1">
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{isRTL ? 'بیمارستان' : 'Facility'}</p>
                                <p className="text-white font-bold">{isRTL ? 'بیمارستان مرکزی' : 'Central Medical Complex'}</p>
                            </div>
                            <div className="space-y-1 border-x border-white/10 px-8">
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{isRTL ? 'بخش' : 'Sector'}</p>
                                <p className="text-white font-bold">{isRTL ? 'بخش قلب و عروق' : 'Cardiovascular Division'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{isRTL ? 'وضعیت' : 'Status'}</p>
                                <p className="text-emerald-400 font-bold uppercase tracking-tighter">{isRTL ? 'در دسترس' : 'On-Call'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Asymmetric Insights Grid */}
            <section className="grid lg:grid-cols-12 gap-10">

                {/* Major Stats Column */}
                <div className="lg:col-span-8 grid md:grid-cols-3 gap-8">
                    {statCards.map((stat, idx) => (
                        <div key={idx} className="group relative bg-white glass-noise rounded-[3rem] p-8 shadow-premium border border-black/[0.03] hover-scale-premium overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-0 group-hover:opacity-30 rounded-full blur-3xl transition-opacity`}></div>
                            <div className="relative z-10">
                                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:rotate-12`}>
                                    {stat.icon}
                                </div>
                                <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-black tracking-tighter">{stat.count}</span>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{stat.trend}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Secondary Hero - Clinical Support */}
                    <div className="md:col-span-3 relative overflow-hidden bg-slate-900 rounded-[4rem] p-12 group shadow-mega">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-transparent"></div>
                        <div className="absolute top-0 right-0 w-full h-full glass-noise opacity-20 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="w-32 h-32 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center border border-white/20 animate-mesh">
                                <Zap size={56} className="text-blue-400" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <h3 className="text-3xl font-black text-white tracking-tighter">Gemma-2 Clinical Insights</h3>
                                <p className="text-white/40 text-lg leading-relaxed max-w-xl">
                                    {isRTL
                                        ? 'تحلیل هوشمند نوبت‌ها نشان‌دهنده بهینه بودن راندمان کاری شما در ۷۲ ساعت اخیر است.'
                                        : 'Intelligent scheduling analysis shows optimal throughput efficiency in the last 72 hours.'}
                                </p>
                                <div className="pt-4 flex gap-4">
                                    <button className="h-14 px-8 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                        Optimization Logs
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vertical Monitoring Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-white rounded-[4rem] p-10 shadow-premium border border-black/[0.03] glass-noise">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-black tracking-tighter italic">{isRTL ? 'مانیتورینگ ریسک' : 'Risk Monitor'}</h3>
                            <div className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black rounded-full uppercase tracking-widest">
                                Live Analysis
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { name: isRTL ? 'علی رضایی' : 'John Doe', risk: isRTL ? 'بسیار بالا' : 'Critical', status: 'text-red-500', bg: 'bg-red-50' },
                                { name: isRTL ? 'سارا محمدی' : 'Sarah Wilson', risk: isRTL ? 'متوسط' : 'Moderate', status: 'text-amber-500', bg: 'bg-amber-50' }
                            ].map((alert, idx) => (
                                <div key={idx} className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] hover:bg-black group transition-all duration-500">
                                    <div className={`w-14 h-14 ${alert.bg} rounded-2xl flex items-center justify-center font-black group-hover:scale-75 transition-transform`}>
                                        {alert.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-black group-hover:text-white transition-colors">{alert.name}</p>
                                        <p className={`${alert.status} text-[10px] font-black uppercase tracking-widest group-hover:text-white/60 transition-colors`}>{alert.risk}</p>
                                    </div>
                                    <ArrowUpRight size={18} className="text-black/10 group-hover:text-white transition-colors" />
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-10 py-5 bg-black text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">
                            Triage Terminal
                        </button>
                    </div>

                    {/* Schedule Capsule */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[4rem] p-10 text-white shadow-mega">
                        <h4 className="text-2xl font-black tracking-tighter mb-4">Patient Flow</h4>
                        <p className="text-white/40 text-sm font-medium mb-8">Optimal density achieved for 14:00 - 17:00 block.</p>
                        <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-4">
                                <span>Efficiency Index</span>
                                <span>94%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[94%] shadow-pill opacity-80"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Editorial Appointment List */}
            <section className="bg-white rounded-[4rem] p-12 lg:p-16 shadow-premium border border-black/[0.03]">
                <div className="flex justify-between items-center mb-16">
                    <div>
                        <h3 className="text-4xl font-black text-black tracking-tighter">Clinical Schedule</h3>
                        <p className="text-black/30 text-[10px] font-medium uppercase tracking-[0.4em] mt-2 italic">Chronological Registry of Intakes</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/dashboard/doctor/schedule" className="h-14 px-10 border border-black/10 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                            Export PDF
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {appointments.map((apt, idx) => (
                        <div key={idx} className="group flex items-center gap-8 p-10 bg-slate-50 rounded-[3rem] hover:bg-black transition-all duration-700">
                            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-4xl shadow-soft-xl group-hover:scale-75 group-hover:rotate-12 transition-all">
                                👤
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-2xl font-black text-black group-hover:text-white transition-colors tracking-tight">{apt.patient_name}</p>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold uppercase text-black/20 group-hover:text-white/40">{apt.specialty}</span>
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    <span className="text-[10px] font-black text-blue-600 group-hover:text-blue-400">{apt.appointment_time || '10:00 AM'}</span>
                                </div>
                            </div>
                            <Link href={`/consultation/${apt.id}`} className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all group-hover:translate-x-2">
                                <ArrowRight size={24} />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Prescription Management Section */}
            <section className="bg-white rounded-[4rem] p-12 lg:p-16 shadow-premium border border-black/[0.03]">
                <div className="flex justify-between items-center mb-16">
                    <div>
                        <h3 className="text-4xl font-black text-black tracking-tighter">{isRTL ? 'نسخه‌نویسی' : 'Prescription Management'}</h3>
                        <p className="text-black/30 text-[10px] font-medium uppercase tracking-[0.4em] mt-2 italic">{isRTL ? 'سیستم مدیریت نسخه' : 'Digital Prescription System'}</p>
                    </div>
                    <button className="h-14 px-10 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                        {isRTL ? 'نسخه جدید' : 'New Prescription'}
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Write Prescription Card */}
                    <Link href={`/${locale}/doctors`} className="group p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-[3rem] border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Stethoscope size={28} className="text-white" />
                        </div>
                        <h4 className="text-xl font-black text-black mb-2">{isRTL ? 'نوشتن نسخه' : 'Write Prescription'}</h4>
                        <p className="text-sm text-black/50 font-medium">
                            {isRTL ? 'ثبت نسخه جدید برای بیمار' : 'Create new prescription for patient'}
                        </p>
                    </Link>

                    {/* Send to Pharmacy Card */}
                    <Link href={`/${locale}/pharmacy`} className="group p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[3rem] border-2 border-dashed border-emerald-200 hover:border-emerald-400 transition-all cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.75 6 6 9-13.5"/></svg>
                        </div>
                        <h4 className="text-xl font-black text-black mb-2">{isRTL ? 'ارسال به داروخانه' : 'Send to Pharmacy'}</h4>
                        <p className="text-sm text-black/50 font-medium">
                            {isRTL ? 'ارسال مستقیم نسخه به داروخانه' : 'Direct prescription transfer to pharmacy'}
                        </p>
                    </Link>

                    {/* Patient Pickup Card */}
                    <Link href={`/${locale}/dashboard/patient`} className="group p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[3rem] border-2 border-dashed border-purple-200 hover:border-purple-400 transition-all cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <h4 className="text-xl font-black text-black mb-2">{isRTL ? 'تحویل به بیمار' : 'Patient Pickup'}</h4>
                        <p className="text-sm text-black/50 font-medium">
                            {isRTL ? 'آماده تحویل به بیمار' : 'Ready for patient collection'}
                        </p>
                    </Link>

                    {/* Digital Records Card */}
                    <Link href={`/${locale}/dashboard/patient`} className="group p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[3rem] border-2 border-dashed border-amber-200 hover:border-amber-400 transition-all cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </div>
                        <h4 className="text-xl font-black text-black mb-2">{isRTL ? 'سوابق پزشکی' : 'Medical Records'}</h4>
                        <p className="text-sm text-black/50 font-medium">
                            {isRTL ? 'مشاهده سوابق بیمار' : 'View patient history'}
                        </p>
                    </Link>
                </div>

                {/* Recent Prescriptions */}
                <div className="mt-12">
                    <h4 className="text-2xl font-black text-black mb-8">{isRTL ? 'نسخه‌های اخیر' : 'Recent Prescriptions'}</h4>
                    <div className="space-y-4">
                        {[
                            { patient: 'علی رضایی', date: '1404/09/15', status: 'sent', meds: 3 },
                            { patient: 'سارا محمدی', date: '1404/09/15', status: 'pending', meds: 2 },
                            { patient: 'مریم احمدی', date: '1404/09/14', status: 'completed', meds: 4 },
                        ].map((rx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                                        {rx.patient.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-black">{rx.patient}</p>
                                        <p className="text-sm text-black/50">{rx.date} • {rx.meds} {isRTL ? 'دارو' : 'meds'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                                        rx.status === 'sent' ? 'bg-emerald-100 text-emerald-600' :
                                        rx.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        {rx.status === 'sent' ? (isRTL ? 'ارسال شده' : 'Sent') :
                                         rx.status === 'pending' ? (isRTL ? 'در انتظار' : 'Pending') :
                                         (isRTL ? 'تکمیل شده' : 'Completed')}
                                    </span>
                                    <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors">
                                        <ArrowRight size={18} className="text-blue-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Patients Section */}
            <section className="bg-white rounded-[4rem] p-12 lg:p-16 shadow-premium border border-black/[0.03]">
                <div className="flex justify-between items-center mb-16">
                    <div>
                        <h3 className="text-4xl font-black text-black tracking-tighter">{isRTL ? 'بیماران اخیر' : 'Recent Patients'}</h3>
                        <p className="text-black/30 text-[10px] font-medium uppercase tracking-[0.4em] mt-2 italic">{isRTL ? 'آخرین بیماران ویزیت شده' : 'Latest visited patients'}</p>
                    </div>
                    <Link href={`/${locale}/dashboard/doctor`} className="h-14 px-10 border border-black/10 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        {isRTL ? 'مشاهده همه' : 'View All'}
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { name: 'علی رضایی', age: 45, condition: 'فشار خون بالا', lastVisit: '1404/09/15', avatar: '👨' },
                        { name: 'سارا محمدی', age: 32, condition: 'دیابت نوع 2', lastVisit: '1404/09/14', avatar: '👩' },
                        { name: 'مریم احمدی', age: 58, condition: 'بیماری قلبی', lastVisit: '1404/09/13', avatar: '👩‍🦰' },
                    ].map((patient, idx) => (
                        <div key={idx} className="group p-8 bg-slate-50 rounded-[3rem] hover:bg-black transition-all duration-500">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-4xl shadow-soft group-hover:scale-110 transition-transform">
                                    {patient.avatar}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-black group-hover:text-white transition-colors">{patient.name}</h4>
                                    <p className="text-sm text-black/40 group-hover:text-white/60">{isRTL ? 'سن' : 'Age'}: {patient.age} {isRTL ? 'سال' : 'years'}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-black/30 uppercase group-hover:text-white/40">{isRTL ? 'بیماری' : 'Condition'}</span>
                                    <span className="text-sm font-bold text-black group-hover:text-white">{patient.condition}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-black/30 uppercase group-hover:text-white/40">{isRTL ? 'آخرین ویزیت' : 'Last Visit'}</span>
                                    <span className="text-sm font-bold text-blue-500 group-hover:text-blue-400">{patient.lastVisit}</span>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <Link href={`/consultation/${idx}`} className="flex-1 py-3 bg-white rounded-2xl text-center font-bold text-sm text-black group-hover:bg-white/10 group-hover:text-white transition-all">
                                    {isRTL ? 'مشاوره' : 'Consult'}
                                </Link>
                                <Link href={`/dashboard/patient`} className="flex-1 py-3 bg-blue-500 rounded-2xl text-center font-bold text-sm text-white group-hover:bg-blue-600 transition-all">
                                    {isRTL ? 'پرونده' : 'Record'}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Analytics & Reports Section */}
            <section className="grid lg:grid-cols-2 gap-10">
                {/* Weekly Performance */}
                <div className="bg-white rounded-[4rem] p-10 lg:p-12 shadow-premium border border-black/[0.03]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-black tracking-tighter">{isRTL ? 'عملکرد هفتگی' : 'Weekly Performance'}</h3>
                        <div className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">
                            +12% {isRTL ? 'بهبود' : 'Improvement'}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            { day: isRTL ? 'شنبه' : 'Sat', patients: 8, rate: 95 },
                            { day: isRTL ? 'یکشنبه' : 'Sun', patients: 12, rate: 100 },
                            { day: isRTL ? 'دوشنبه' : 'Mon', patients: 15, rate: 98 },
                            { day: isRTL ? 'سه‌شنبه' : 'Tue', patients: 10, rate: 92 },
                            { day: isRTL ? 'چهارشنبه' : 'Wed', patients: 14, rate: 96 },
                        ].map((day, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <span className="w-16 text-xs font-bold text-black/40">{day.day}</span>
                                <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${day.rate}%` }}
                                    ></div>
                                </div>
                                <span className="w-12 text-xs font-bold text-black text-left">{day.patients} {isRTL ? 'بیمار' : 'pts'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Schedule */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[4rem] p-10 lg:p-12 text-white shadow-mega">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black tracking-tighter">{isRTL ? 'برنامه امروز' : "Today's Schedule"}</h3>
                        <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold">
                            {isRTL ? '۵ نوبت' : '5 Appointments'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { time: '09:00', patient: 'علی رضایی', type: isRTL ? 'ویزیت عمومی' : 'General Checkup', status: 'confirmed' },
                            { time: '10:30', patient: 'سارا محمدی', type: isRTL ? 'پیگیری' : 'Follow-up', status: 'confirmed' },
                            { time: '14:00', patient: 'مریم احمدی', type: isRTL ? 'مشاوره تخصصی' : 'Specialist Consult', status: 'pending' },
                            { time: '15:30', patient: 'حمید رضایی', type: isRTL ? 'ویزیت عمومی' : 'General Checkup', status: 'confirmed' },
                        ].map((apt, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                                <div className="w-16 text-center">
                                    <span className="text-lg font-black">{apt.time}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold">{apt.patient}</p>
                                    <p className="text-xs text-white/50">{apt.type}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    apt.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                    {apt.status === 'confirmed' ? (isRTL ? 'تایید شده' : 'Confirmed') : (isRTL ? 'در انتظار' : 'Pending')}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link href={`/${locale}/dashboard/appointments`} className="mt-8 w-full py-4 bg-white text-black rounded-2xl text-center font-black text-sm uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                        {isRTL ? 'مدیریت نوبت‌ها' : 'Manage Schedule'}
                    </Link>
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

