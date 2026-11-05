'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowLeft, Stethoscope, User, Loader2, KeyRound, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const router = useRouter();
    const { login } = useAuthStore();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Demo accounts
    const demoAccounts = [
        { role: 'doctor', phone: '09120000002', password: 'doctor123', name: isRTL ? 'پروفسور رضایی' : 'Prof. Rezaei', specialty: isRTL ? 'جراح مغز' : 'Neurosurgeon' },
        { role: 'patient', phone: '09120000003', password: 'patient123', name: isRTL ? 'حساب کاربری رز' : 'Jane Doe', specialty: isRTL ? 'بیمار VIP' : 'VIP Patient' },
    ];

    const handleQuickLogin = (account: typeof demoAccounts[0]) => {
        setPhone(account.phone);
        setPassword(account.password);
        handleLogin(account.phone, account.password, account.role);
    };

    const handleLogin = async (phoneNumber?: string, passwordValue?: string, role?: string) => {
        const phoneNum = phoneNumber || phone;
        const pass = passwordValue || password;
        const userRole = role;

        if (!phoneNum || !pass) {
            setError(isRTL ? 'لطفا شماره موبایل و رمز عبور را وارد کنید' : 'Please enter phone and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const jwtPayload = {
                user_id: 1,
                phone_number: phoneNum,
                is_patient: userRole === 'patient',
                is_doctor: userRole === 'doctor',
                is_superuser: false,
                is_staff: false,
                exp: Math.floor(Date.now() / 1000) + 86400 * 7
            };

            const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
            const payload = btoa(unescape(encodeURIComponent(JSON.stringify(jwtPayload))));
            const mockJwt = `${header}.${payload}.mock-signature`;

            localStorage.setItem('token', mockJwt);
            localStorage.setItem('refresh_token', 'mock-refresh');
            localStorage.setItem('user', JSON.stringify({
                id: 1,
                phone_number: phoneNum,
                role: userRole,
                first_name: userRole === 'doctor' ? (isRTL ? 'سارا' : 'Sarah') : (isRTL ? 'علی' : 'Ali'),
                last_name: userRole === 'doctor' ? (isRTL ? 'محمدی' : 'Mohammadi') : (isRTL ? 'رضایی' : 'Rezaei')
            }));

            login(mockJwt, 'mock-refresh');

            if (userRole === 'doctor') {
                router.push(`/${locale}/dashboard/doctor`);
            } else if (userRole === 'patient') {
                router.push(`/${locale}/dashboard/patient`);
            } else {
                router.push(`/${locale}/dashboard/admin`);
            }
        } catch (err) {
            setError(isRTL ? 'شماره موبایل یا رمز عبور اشتباه است' : 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-low flex items-center justify-center p-4 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Ambient Base Layer */}
            <div className="absolute inset-0 bg-mesh opacity-50 z-0"></div>

            <div className="w-full max-w-6xl relative z-10 my-8">
                <Link href="/" className="absolute top-4 sm:-top-12 left-4 sm:left-0 z-20 flex flex-col items-center gap-2 group p-2 hover:bg-white/50 rounded-xl transition-colors backdrop-blur-sm -mb-4 sm:mb-0">
                    <div className="w-10 h-10 bg-white shadow-premium-sm rounded-xl flex items-center justify-center border border-border-strong group-hover:scale-105 transition-transform">
                        <Heart className="w-5 h-5 text-royal-600 animate-pulse-glow" fill="currentColor" />
                    </div>
                </Link>

                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-premium-lg border border-white overflow-hidden">
                    <div className="grid lg:grid-cols-12 min-h-[750px] lg:min-h-[800px]">

                        {/* Interactive Form Panel */}
                        <div className="lg:col-span-6 p-8 lg:p-16 flex flex-col justify-center relative">
                            <div className="max-w-md mx-auto w-full relative z-10">

                                <div className="text-center sm:text-start mb-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-royal-50 border border-royal-100 rounded-full mb-6">
                                        <KeyRound className="w-3.5 h-3.5 text-royal-600" />
                                        <span className="text-xs font-bold text-royal-800 uppercase tracking-widest">{isRTL ? 'پرتال یکپارچه ابری' : 'Unified Cloud Portal'}</span>
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-black text-primary-950 tracking-tight leading-none mb-3">
                                        {isRTL ? 'ورود به ایستگاه مدیریت سلامت' : 'Access Health Station'}
                                    </h2>
                                    <p className="text-primary-500 font-medium">
                                        {isRTL ? 'با وارد کردن اطلاعات خود وارد اکوسیستم هوشمند شوید.' : 'Enter your credentials to access the intelligent ecosystem.'}
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">
                                            {isRTL ? 'شماره تماس' : 'Phone Number'}
                                        </label>
                                        <div className="relative group">
                                            <div className={`absolute inset-y-0 flex items-center pointer-events-none transition-colors group-focus-within:text-royal-600 text-primary-400 ${isRTL ? 'right-4 left-auto' : 'left-4 right-auto'}`}>
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="0912..."
                                                className={`w-full bg-surface-mid border border-transparent focus:border-royal-400 focus:bg-white focus:shadow-glow rounded-2xl py-4 font-medium text-primary-900 transition-all ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} `}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-bold text-primary-500 uppercase tracking-widest">
                                                {isRTL ? 'رمز عبور امنیتی' : 'Security Password'}
                                            </label>
                                            <a href="#" className="text-xs font-bold text-royal-600 hover:text-royal-700 hover:underline">
                                                {isRTL ? 'فراموشی رمز عبور' : 'Forgot Password?'}
                                            </a>
                                        </div>
                                        <div className="relative group">
                                            <div className={`absolute inset-y-0 flex items-center pointer-events-none transition-colors group-focus-within:text-royal-600 text-primary-400 ${isRTL ? 'right-4 left-auto' : 'left-4 right-auto'}`}>
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder={isRTL ? 'حداقل ۸ کاراکتر' : 'Minimum 8 characters'}
                                                className={`w-full bg-surface-mid border border-transparent focus:border-royal-400 focus:bg-white focus:shadow-glow rounded-2xl py-4 font-medium text-primary-900 transition-all ${isRTL ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={`absolute inset-y-0 flex items-center text-primary-400 hover:text-royal-600 transition-colors ${isRTL ? 'left-4 right-auto' : 'right-4 left-auto'}`}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl animate-fade-in">
                                            <p className="text-sm text-rose-600 text-center font-bold tracking-wide">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn-primary-gradient py-4 flex items-center justify-center gap-2 group mt-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <span className="text-lg">{isRTL ? 'استقرار و ورود' : 'Authenticate & Enter'}</span>
                                                <ArrowLeft className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${isRTL ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-10 mb-8 flex items-center gap-4 opacity-70">
                                    <div className="flex-1 h-px bg-primary-200"></div>
                                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{isRTL ? 'مسیر میان‌بر استقرار' : 'Deployment Shortcut'}</span>
                                    <div className="flex-1 h-px bg-primary-200"></div>
                                </div>

                                {/* Demo Accounts */}
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {demoAccounts.map((account, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleQuickLogin(account)}
                                                disabled={loading}
                                                className={`group flex items-center gap-3 p-3 bg-white border rounded-2xl transition-all shadow-sm hover:shadow-md text-start ${account.role === 'doctor' ? 'hover:border-royal-400 hover:bg-royal-50/50' : 'hover:border-emerald-400 hover:bg-emerald-50/50'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${account.role === 'doctor' ? 'bg-royal-100 text-royal-600 group-hover:bg-royal-600 group-hover:text-white' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                                                    {account.role === 'doctor' ? <Stethoscope size={20} /> : <User size={20} />}
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{account.specialty}</span>
                                                    <span className="font-bold text-primary-900 text-sm truncate">{account.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer Links */}
                                <div className="mt-12 text-center">
                                    <p className="text-primary-500 font-medium text-sm">
                                        {isRTL ? 'پرونده سلامت ندارید؟' : "No health record yet?"}
                                        <Link href="/signup" className="text-royal-600 font-bold mx-2 hover:underline inline-flex items-center gap-1 group">
                                            {isRTL ? 'ایجاد پرونده هوشمند' : 'Create Smart Record'}
                                            <ArrowLeft className={`w-3 h-3 transition-transform group-hover:-translate-x-1 ${isRTL ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Right Side - Editorial Cover Photo Layout */}
                        <div className="lg:col-span-6 relative hidden lg:block overflow-hidden bg-primary-950">
                            {/* Color Gradients Overlays */}
                            <div className="absolute top-0 right-0 w-full h-[60%] bg-gradient-to-b from-primary-900/50 to-transparent z-10"></div>
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-primary-950 via-primary-900/40 to-transparent z-10"></div>

                            <Image
                                src="http://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=1600&fit=crop"
                                alt="Modern Clinical Environment"
                                fill
                                className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-[20s] ease-linear grayscale-0 opacity-80 mix-blend-luminosity"
                            />

                            {/* Accent Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-royal-500/30 rounded-full blur-[120px] mix-blend-screen z-10 pointer-events-none"></div>

                            <div className="absolute bottom-16 left-16 right-16 z-20 space-y-6">
                                <div className="inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-glass-lg animate-float">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-royal-500 rounded-xl flex items-center justify-center shadow-glow">
                                            <Heart className="w-6 h-6 text-white animate-pulse" fill="currentColor" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="text-white font-black text-lg tracking-tight leading-none">DoctorHub Core OS</h4>
                                            <span className="text-royal-300 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">{isRTL ? 'نسل بعدی مدیریت درمان' : 'Next-Gen Care OS'}</span>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-4xl text-white font-black leading-tight tracking-tight">
                                    {isRTL ? 'اکوسیستم دیجیتال، برای سلامتی پایدار شما.' : 'Digital Ecosystem for Your Sustainable Health.'}
                                </h3>
                                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                    <div className="flex -space-x-4">
                                        <div className="w-12 h-12 rounded-full border-2 border-primary-950 bg-royal-500 flex items-center justify-center text-white font-black text-xs">V.3</div>
                                        <div className="w-12 h-12 rounded-full border-2 border-primary-950 bg-emerald-500 flex items-center justify-center text-white font-black text-xs"><Shield size={16} /></div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-300 w-2/3 leading-relaxed">
                                        {isRTL ? 'ایمن‌سازی شده توسط پلتفرم پردازش ابری یکپارچه و الگوریتم‌های رمزنگاری لایه دفاعی.' : 'Secured by integrated cloud computing & defense-layer cryptographic algorithms.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
