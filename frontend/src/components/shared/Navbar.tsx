'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationPanel from './NotificationPanel';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Heart, ShoppingCart, Phone, MessageCircle, Bot, Sparkles, Stethoscope, Calendar, Pill } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Navbar() {
    const t = useTranslations('nav');
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const store = useAuthStore();
    const { user, logout } = store;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [displayRole, setDisplayRole] = useState<string>('patient');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (store.isAuthenticated && store.user) {
            setIsAuthenticated(true);
            setDisplayRole(store.user.role);
        } else {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('user_role');
            if (token && role) {
                setIsAuthenticated(true);
                setDisplayRole(role);
            }
        }
    }, [store.isAuthenticated, store.user]);

    useEffect(() => {
        const unsubscribe = useAuthStore.subscribe((state) => {
            setIsAuthenticated(state.isAuthenticated);
            if (state.user) {
                setDisplayRole(state.user.role);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: `/`, label: t('home'), icon: Heart },
        { href: `/doctors`, label: t('doctors'), icon: Stethoscope },
        { href: `/pharmacy`, label: isRTL ? 'داروخانه' : 'Pharmacy', icon: Pill },
        { href: `/services`, label: t('services'), icon: Calendar },
        { href: `/about`, label: t('about'), icon: MessageCircle },
    ];

    // Quick Links for Header - Enhanced with more options
    const quickLinks = [
        { href: `/dashboard/appointments`, label: isRTL ? 'نوبت‌های من' : 'My Appointments', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
        { href: `/dashboard/prescriptions`, label: isRTL ? 'نسخه‌ها' : 'Prescriptions', icon: Pill, color: 'from-emerald-500 to-teal-500' },
        { href: `/dashboard/orders`, label: isRTL ? 'سفارشات' : 'Orders', icon: ShoppingCart, color: 'from-purple-500 to-pink-500' },
        { href: `/dashboard/messages`, label: isRTL ? 'پیام‌ها' : 'Messages', icon: MessageCircle, color: 'from-amber-500 to-orange-500' },
    ];

    const getDashboardLink = () => {
        if (!isAuthenticated) return '/dashboard/patient';
        switch (displayRole) {
            case 'admin': return '/dashboard/admin';
            case 'doctor': return '/dashboard/doctor';
            default: return '/dashboard/patient';
        }
    };

    const handleLogout = () => {
        logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user');
        window.location.href = `/${locale}`;
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.user-menu')) setIsUserMenuOpen(false);
            if (!target.closest('.chat-menu')) setIsChatMenuOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (!mounted) {
        return (
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-rose-400 to-primary-500 rounded-2xl rotate-6 animate-pulse"></div>
                                <div className="absolute inset-0.5 bg-white rounded-xl"></div>
                                <div className="absolute inset-2 bg-gradient-to-br from-rose-500 to-primary-500 rounded-lg flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-white" fill="currentColor" />
                                </div>
                            </div>
                            <span className="font-black text-2xl text-slate-800 tracking-tight">DoctorHub</span>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
                isScrolled || isMobileMenuOpen
                    ? 'py-2 bg-white/95 backdrop-blur-2xl shadow-lg shadow-slate-200/50'
                    : 'py-3 bg-white/80 backdrop-blur-xl'
            }`}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo Section - Premium Medical Design */}
                    <Link href={`/`} className="flex items-center gap-3 group">
                        <div className="relative w-14 h-14">
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 via-cyan-400 to-indigo-500 rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                            {/* Main container */}
                            <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl shadow-slate-900/30 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                {/* Pattern overlay */}
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '8px 8px' }}></div>
                                </div>
                                {/* Icon container - Medical Cross + Heart */}
                                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/90 via-cyan-500/90 to-indigo-500/90">
                                    <div className="relative">
                                        <Stethoscope className="w-8 h-8 text-white drop-shadow-lg" />
                                        {/* Sparkle effect */}
                                        <div className="absolute -top-1 -right-1 w-3 h-3">
                                            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                                            <div className="absolute inset-0 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">DoctorHub</span>
                            <span className="text-[9px] font-bold text-slate-400 tracking-[0.25em] uppercase mt-1 flex items-center gap-1">
                                {isRTL ? 'پلتفرم هوشمند پزشکی' : 'Smart Medical Platform'} 
                                <Sparkles size={10} className="text-cyan-400" />
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation - Premium Tabs */}
                    <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 backdrop-blur-md px-1 py-1.5 rounded-2xl">
                        {navLinks.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.href}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-white rounded-xl transition-all duration-300 group relative overflow-hidden"
                            >
                                <link.icon size={16} className="relative z-10 transition-transform group-hover:scale-110" />
                                <span className="relative z-10">{link.label}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-rose-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl"></div>
                            </Link>
                        ))}
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-2">
{/* Notification & Language */}
                        <div className="hidden md:flex items-center gap-1 bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl">
                            <NotificationPanel />
                            <div className="w-px h-6 bg-slate-200 mx-1"></div>
                            <LanguageSwitcher />
                        </div>

                        <div className="md:hidden flex items-center gap-2">
                            <LanguageSwitcher />
                        </div>

                        {/* Chat Dropdown - Premium */}
                        <div className="relative chat-menu">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsChatMenuOpen(!isChatMenuOpen);
                                }}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl transition-all duration-300 ${
                                    isChatMenuOpen
                                        ? 'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg shadow-primary-500/25'
                                        : 'bg-slate-100 text-slate-600 hover:bg-white hover:shadow-md border border-slate-200'
                                }`}
                            >
                                <MessageCircle size={18} />
                                <span className="hidden lg:block">{isRTL ? 'دسترسی سریع' : 'Quick Access'}</span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isChatMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isChatMenuOpen && (
                                <div className={`absolute top-full mt-3 w-80 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-300/50 border border-slate-100 p-3 transform origin-top-right transition-all animate-scale-in z-50 ${isRTL ? 'left-0' : 'right-0'}`}>
                                    {/* Quick Access Links */}
                                    {quickLinks.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.href}
                                            onClick={() => setIsChatMenuOpen(false)}
                                            className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r transition-all duration-300"
                                            style={{ background: `linear-gradient(to left, var(--tw-gradient-stops))`, }}
                                        >
                                            <div className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                <link.icon size={22} className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{link.label}</p>
                                                <p className="text-xs text-slate-500 font-medium">{isRTL ? 'مشاهده و مدیریت' : 'View & Manage'}</p>
                                            </div>
                                            <ChevronDown size={16} className={`opacity-0 group-hover:opacity-100 transition-all ${isRTL ? 'rotate-90' : '-rotate-90'} text-indigo-600`} />
                                        </Link>
                                    ))}

                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-3"></div>

                                    {/* AI Chat */}
                                    <Link
                                        href={`/dashboard/ai-chat`}
                                        onClick={() => setIsChatMenuOpen(false)}
                                        className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                            <Bot size={22} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{isRTL ? 'دستیار هوشمند AI' : 'AI Smart Assistant'}</p>
                                            <p className="text-xs text-slate-500 font-medium">{isRTL ? 'پاسخگویی سریع ۲۴/۷' : 'Instant 24/7 Answers'}</p>
                                        </div>
                                        <ChevronDown size={16} className={`opacity-0 group-hover:opacity-100 transition-all ${isRTL ? 'rotate-90' : '-rotate-90'} text-indigo-600`} />
                                    </Link>

                                    {/* Medical Consult */}
                                    <Link
                                        href={`/dashboard/messages`}
                                        onClick={() => setIsChatMenuOpen(false)}
                                        className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 mt-1"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                            <User size={22} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">{isRTL ? 'مشاوره پزشکی' : 'Medical Consult'}</p>
                                            <p className="text-xs text-slate-500 font-medium">{isRTL ? 'ارتباط مستقیم با پزشک' : 'Direct Doctor Chat'}</p>
                                        </div>
                                        <ChevronDown size={16} className={`opacity-0 group-hover:opacity-100 transition-all ${isRTL ? 'rotate-90' : '-rotate-90'} text-emerald-600`} />
                                    </Link>

                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-3"></div>

                                    {/* Emergency */}
                                    <a
                                        href="tel:1900"
                                        className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50 transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                                            <Phone size={22} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">{isRTL ? 'تماس اضطراری' : 'Emergency Help'}</p>
                                            <p className="text-xs font-bold text-rose-500 tracking-wider">1900</p>
                                        </div>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* User Menu - Premium */}
                        {isAuthenticated ? (
                            <div className="relative user-menu">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsUserMenuOpen(!isUserMenuOpen);
                                    }}
                                    className="flex items-center gap-2 px-2 py-1.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-2xl shadow-lg shadow-slate-900/20 transition-all duration-300"
                                >
                                    <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-primary-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-inner">
                                        {displayRole === 'admin' ? (isRTL ? 'م' : 'A') : displayRole === 'doctor' ? (isRTL ? 'پ' : 'D') : (isRTL ? 'ب' : 'P')}
                                    </div>
                                    <span className="hidden lg:block text-sm font-bold">
                                        {displayRole === 'admin' ? (isRTL ? 'مدیریت' : 'Admin') :
                                            displayRole === 'doctor' ? (isRTL ? 'پنل پزشک' : 'Doctor') :
                                                (isRTL ? 'پروفایل' : 'Profile')}
                                    </span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isUserMenuOpen && (
                                    <div className={`absolute top-full mt-3 w-64 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-300/50 border border-slate-100 p-2 transform origin-top-right transition-all animate-scale-in z-50 ${isRTL ? 'left-0' : 'right-0'}`}>
                                        <Link
                                            href={getDashboardLink()}
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-rose-50 rounded-2xl transition-colors group"
                                        >
                                            <LayoutDashboard size={18} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
                                            <span className="font-bold text-slate-700 group-hover:text-primary-600 transition-colors">{isRTL ? 'داشبورد سلامت' : 'Health Dashboard'}</span>
                                        </Link>
                                        <Link
                                            href={`/dashboard/messages`}
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-rose-50 rounded-2xl transition-colors group"
                                        >
                                            <MessageCircle size={18} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
                                            <span className="font-bold text-slate-700 group-hover:text-primary-600 transition-colors">{isRTL ? 'صندوق پیام' : 'Inbox'}</span>
                                        </Link>
                                        {displayRole !== 'admin' && (
                                            <Link
                                                href={`/${locale}/pharmacy`}
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-2xl transition-colors group"
                                            >
                                                <ShoppingCart size={18} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                                <span className="font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{isRTL ? 'داروخانه هوشمند' : 'Smart Pharmacy'}</span>
                                            </Link>
                                        )}
                                        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-3 w-full text-rose-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50 rounded-2xl transition-colors group"
                                        >
                                            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                                            <span className="font-bold">{isRTL ? 'خروج از حساب' : 'Logout'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link
                                    href={`/login`}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                >
                                    {t('login')}
                                </Link>
                                <Link
                                    href={`/signup`}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
                                >
                                    {t('signup')}
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2.5 bg-slate-100 hover:bg-white shadow-sm hover:shadow-md rounded-xl transition-all"
                        >
                            {isMobileMenuOpen ? <X size={20} className="text-slate-700" /> : <Menu size={20} className="text-slate-700" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Premium */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-4 right-4 mt-4 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-300/50 border border-slate-100 p-4 transform origin-top animate-scale-in z-50">
                        <div className="space-y-1">
                            {navLinks.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-5 py-3.5 text-base font-bold text-slate-700 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-colors"
                                >
                                    <link.icon size={20} />
                                    {link.label}
                                </Link>
                            ))}

                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4"></div>

                            <Link
                                href={`/dashboard/ai-chat`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 px-5 py-3.5 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl font-bold transition-colors"
                            >
                                <Bot size={20} className="text-indigo-500" />
                                {isRTL ? 'هوش مصنوعی پزشکی' : 'Medical AI Assistant'}
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href={getDashboardLink()}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-4 px-5 py-3.5 text-primary-600 hover:bg-primary-50 rounded-2xl font-bold transition-colors"
                                    >
                                        <LayoutDashboard size={20} />
                                        {isRTL ? 'داشبورد سلامت' : 'Health Dashboard'}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full gap-4 px-5 py-3.5 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold transition-colors"
                                    >
                                        <LogOut size={20} />
                                        {isRTL ? 'خروج از حساب' : 'Logout'}
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 pt-4 pb-2 px-2">
                                    <Link
                                        href={`/login`}
                                        className="px-4 py-3 text-center text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        {t('login')}
                                    </Link>
                                    <Link
                                        href={`/signup`}
                                        className="px-4 py-3 text-center text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-rose-500 rounded-xl hover:shadow-lg transition-all"
                                    >
                                        {t('signup')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
