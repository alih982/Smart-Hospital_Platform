'use client';

import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import NotificationPanel from '@/components/shared/NotificationPanel';
import {
    LayoutDashboard, Calendar, MessageCircle, Settings,
    LogOut, CreditCard, Users, Shield, Stethoscope,
    FileText, Clock, ChevronRight, Bell, Menu, X, Heart, 
    ShoppingCart, Search, Sun, Moon, Star, Activity,
    TrendingUp, Users2, CalendarDays, Pill, FileCheck,
    ClipboardList, BarChart3, Wallet, FlaskConical
} from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('dashboard.nav');
    const rt = useTranslations('dashboard.roles');
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const isRTL = locale === 'fa';

    const { user, isAuthenticated } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    React.useEffect(() => {
        if (!isAuthenticated) {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    const jwtPayload = {
                        user_id: userData.id || 1,
                        phone_number: userData.phone_number || '',
                        is_patient: userData.role === 'patient',
                        is_doctor: userData.role === 'doctor',
                        is_superuser: false,
                        is_staff: false,
                        exp: Math.floor(Date.now() / 1000) + 86400 * 7
                    };

                    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
                    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(jwtPayload))));
                    const signature = "mock-signature";
                    const mockJwt = `${header}.${payload}.${signature}`;

                    useAuthStore.getState().login(mockJwt, 'mock-refresh');
                } catch (e) {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        }
    }, [isAuthenticated, router, locale]);

    const isDoctor = user?.role === 'doctor';
    const isAdmin = user?.role === 'admin';
    const isPatient = user?.role === 'patient';

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('demo_role');
        authService.logout();
        router.push('/login');
    };

    const getNavItems = () => {
        if (isAdmin) {
            return [
                { name: t('adminPanel'), href: '/dashboard/admin', icon: Shield, color: 'from-indigo-500 to-purple-500', badge: null },
                { name: t('userManagement'), href: '/dashboard/admin/users', icon: Users, color: 'from-blue-500 to-cyan-500', badge: null },
                { name: t('finance'), href: '/dashboard/admin/finance', icon: CreditCard, color: 'from-emerald-500 to-teal-500', badge: null },
                { name: t('systemSettings'), href: '/dashboard/settings', icon: Settings, color: 'from-slate-500 to-zinc-500', badge: null },
            ];
        }
        if (isDoctor) {
            return [
                { name: t('doctorPanel'), href: '/dashboard/doctor', icon: Stethoscope, color: 'from-blue-500 to-indigo-500', badge: null },
                { name: t('prescriptions'), href: '/dashboard/prescriptions/create', icon: FileText, color: 'from-purple-500 to-pink-500', badge: '3' },
                { name: t('myPatients'), href: '/dashboard/doctor/patients', icon: Users2, color: 'from-amber-500 to-orange-500', badge: '12' },
                { name: t('schedule'), href: '/dashboard/doctor/schedule', icon: CalendarDays, color: 'from-emerald-500 to-green-500', badge: null },
                { name: 'آزمایشات', href: '/dashboard/lab', icon: FlaskConical, color: 'from-cyan-500 to-blue-500', badge: null },
                { name: 'گزارشات', href: '/dashboard/reports', icon: BarChart3, color: 'from-rose-500 to-red-500', badge: null },
                { name: t('settings'), href: '/dashboard/settings', icon: Settings, color: 'from-slate-400 to-slate-600', badge: null },
            ];
        }
        return [
            { name: t('myDashboard'), href: '/dashboard/patient', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500', badge: null },
            { name: t('myAppointments'), href: '/dashboard/appointments', icon: Calendar, color: 'from-purple-500 to-pink-500', badge: '2' },
            { name: 'نسخه‌ها', href: '/dashboard/prescriptions', icon: FileCheck, color: 'from-emerald-500 to-teal-500', badge: null },
            { name: 'نتایج آزمایش', href: '/dashboard/lab', icon: FlaskConical, color: 'from-orange-500 to-amber-500', badge: 'NEW' },
            { name: t('invoices'), href: '/dashboard/invoices', icon: Wallet, color: 'from-green-500 to-emerald-500', badge: null },
            { name: t('messages'), href: '/dashboard/messages', icon: MessageCircle, color: 'from-indigo-500 to-purple-500', badge: '5' },
            { name: 'AI Assistant', href: '/dashboard/ai-chat', icon: Star, color: 'from-amber-400 to-yellow-500', badge: 'AI' },
            { name: isRTL ? 'سفارشات' : 'My Orders', href: '/dashboard/orders', icon: ShoppingCart, color: 'from-rose-500 to-pink-500', badge: null },
            { name: isRTL ? 'داروخانه' : 'Pharmacy', href: '/pharmacy', icon: Pill, color: 'from-cyan-500 to-blue-500', badge: null },
            { name: t('settings'), href: '/dashboard/settings', icon: Settings, color: 'from-slate-400 to-slate-600', badge: null },
        ];
    };

    const navItems = getNavItems();

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex" dir={isRTL ? "rtl" : "ltr"}>
            
            {/* Sidebar - Premium Glassmorphism */}
            <aside className={`
                ${mobileMenuOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
                fixed lg:relative inset-y-0 z-50 w-80 bg-white/80 backdrop-blur-xl border-l-2 border-white/20 lg:border-l-0
                shadow-2xl lg:shadow-none transition-all duration-500 ease-out
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo - Modern Design */}
                    <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                        <Link href="/" className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                                <Heart className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-black text-white tracking-tight">HealthHub</span>
                                <span className="block text-xs text-white/70 font-medium">{isRTL ? 'پنل هوشمند' : 'Smart Dashboard'}</span>
                            </div>
                        </Link>
                    </div>

                    {/* User Card */}
                    <div className="p-4 mx-4 -mt-6 bg-white rounded-2xl shadow-xl border border-slate-100 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {isAdmin ? (isRTL ? 'م' : 'A') : isDoctor ? (isRTL ? 'پ' : 'D') : (isRTL ? 'ب' : 'P')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-gray-900 truncate">
                                    {user?.phone_number || (isRTL ? 'کاربر گرامی' : 'Dear User')}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.role ? rt(user.role) : (isRTL ? 'میهمان' : 'Guest')}
                                </p>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                                        group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300
                                        ${isActive
                                            ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg shadow-' + item.color.split(' ')[1].replace('to-', '/') + '/25'
                                            : 'text-gray-600 hover:bg-white hover:shadow-md hover:scale-[1.02]'
                                        }
                                    `}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        isActive ? 'bg-white/20' : 'bg-gradient-to-br ' + item.color + ' text-white'
                                    }`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className="font-bold text-sm flex-1">{item.name}</span>
                                    {item.badge && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive && (
                                        <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Section - Stats */}
                    <div className="p-4 mx-4 mb-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-slate-400">{isRTL ? 'وضعیت سیستم' : 'System Status'}</span>
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full">ONLINE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium">All Services Active</span>
                        </div>
                    </div>

                    {/* Logout */}
                    <div className="p-4 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-2xl transition-all duration-300 group"
                        >
                            <div className="w-10 h-10 bg-red-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center">
                                <LogOut size={20} />
                            </div>
                            <span className="font-bold text-sm">{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                
                {/* Header - Premium Design */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Menu + Search */}
                        <div className="flex items-center gap-4 flex-1">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-3 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-blue-500 hover:to-indigo-500 hover:text-white rounded-xl transition-all duration-300"
                            >
                                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                            
                            {/* Search Box */}
                            <div className="relative flex-1 max-w-md hidden md:block">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={isRTL ? 'جستجوی سریع...' : 'Quick search...'}
                                    className="w-full py-3 pr-12 pl-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                            {/* Dark Mode Toggle */}
                            <button 
                                onClick={() => setDarkMode(!darkMode)}
                                className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-orange-500/25 hover:scale-105 transition-all"
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {/* Quick Stats */}
                            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
                                <TrendingUp size={16} />
                                <span className="text-sm font-bold">{isRTL ? 'آنلاین' : 'Online'}</span>
                            </div>

                            {/* Notifications - Enhanced Panel */}
                            <NotificationPanel />

                            {/* User Profile - Compact */}
                            <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-200">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-900">
                                        {user?.phone_number || (isRTL ? 'کاربر' : 'User')}
                                    </p>
                                    <p className="text-xs text-slate-500">{isRTL ? 'خوش آمدید' : 'Welcome'}</p>
                                </div>
                                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                    {isAdmin ? (isRTL ? 'م' : 'A') : isDoctor ? (isRTL ? 'پ' : 'D') : (isRTL ? 'ب' : 'P')}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

