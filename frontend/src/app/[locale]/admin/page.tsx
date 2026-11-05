'use client';

import React, { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { LogIn, Shield, Lock, ArrowRight, Loader2, ShieldCheck, HeartPulse } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLoginPage() {
    const t = useTranslations('auth');
    const locale = useLocale();
    const router = useRouter();
    const isRTL = locale === 'fa';

    // Get auth store functions
    const login = useAuthStore((state) => state.login);

    const [formData, setFormData] = useState({ phone_number: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Hardcoded or storage-based check for admin role
            const storedUser = localStorage.getItem('user');
            let userData: any;

            if (storedUser) {
                userData = JSON.parse(storedUser);
                if (userData.role !== 'admin') {
                    setError(isRTL ? 'شما دسترسی مدیریت ندارید' : 'You do not have admin access');
                    setLoading(false);
                    return;
                }
            } else {
                // Demo Admin Login
                userData = {
                    id: 999,
                    first_name: isRTL ? 'مدیر' : 'Admin',
                    last_name: isRTL ? 'کل' : 'Root',
                    phone_number: formData.phone_number,
                    role: 'admin',
                    is_verified: true
                };
            }

            // Create mock tokens
            const mockToken = 'admin-token-' + Date.now();
            const mockRefresh = 'admin-refresh-' + Date.now();

            const mockJwt = btoa(JSON.stringify({
                user_id: userData.id,
                phone_number: userData.phone_number,
                is_patient: false,
                is_doctor: false,
                is_superuser: true,
                is_staff: true,
                exp: Math.floor(Date.now() / 1000) + 86400
            }));

            login(mockJwt, mockRefresh);

            localStorage.setItem('token', mockToken);
            localStorage.setItem('user_role', 'admin');
            localStorage.setItem('user', JSON.stringify(userData));
            setSuccess(true);

            setTimeout(() => {
                router.push(`/dashboard/admin`);
            }, 500);
        } catch (err) {
            setError(isRTL ? 'خطا در ورود مدیریت. لطفا دوباره تلاش کنید.' : 'Admin login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[20000ms] hover:scale-110"
                style={{ backgroundImage: "url('http://images.unsplash.com/photo-1573164060897-59fecdea8243?q=80&w=2000&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[4px]"></div>
            </div>

            <div className="relative w-full max-w-md animate-fade-up">
                {/* Brand Logo */}
                <div className="flex justify-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-indigo-500/30 rotate-3 animate-bounce-slow">
                            <Shield className="text-white" size={28} />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">
                            Admin Portal
                        </span>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl shadow-black/40">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-black text-white mb-3">
                            {isRTL ? 'پنل مدیریت' : 'Secure Login'}
                        </h1>
                        <p className="text-slate-400 font-medium">
                            {isRTL ? 'برای ورود به بخش مدیریت اطلاعات خود را وارد کنید' : 'Enter administrative credentials to proceed'}
                        </p>
                    </div>

                    {success && (
                        <div className="bg-emerald-500/20 backdrop-blur-md text-emerald-200 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-emerald-500/30">
                            {isRTL ? 'ورود مدیر موفق! در حال انتقال...' : 'Admin authenticated! Redirecting...'}
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-500/20 backdrop-blur-md text-rose-200 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-rose-500/30">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <div className="relative group">
                                <Shield className={`absolute ${isRTL ? 'right-5' : 'left-5'} top-5 text-indigo-400 group-focus-within:text-white transition-colors`} size={20} />
                                <input
                                    type="text"
                                    required
                                    className={`w-full ${isRTL ? 'pr-12 pl-5' : 'pl-12 pr-5'} py-4.5 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-indigo-500 focus:outline-none transition-all font-bold text-white placeholder:text-slate-600`}
                                    placeholder={isRTL ? 'نام کاربری یا شماره تماس' : 'Admin Username / Phone'}
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <Lock className={`absolute ${isRTL ? 'right-5' : 'left-5'} top-5 text-indigo-400 group-focus-within:text-white transition-colors`} size={20} />
                                <input
                                    type="password"
                                    required
                                    className={`w-full ${isRTL ? 'pr-12 pl-5' : 'pl-12 pr-5'} py-4.5 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-indigo-500 focus:outline-none transition-all font-bold text-white placeholder:text-slate-600`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-15 bg-indigo-600 text-white rounded-[1.5rem] font-black text-base hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {isRTL ? 'ورود مدیریت' : 'AUTHENTICATE'}
                                    <ArrowRight size={20} className={`group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
                    <ShieldCheck size={16} className="text-indigo-500" />
                    Administrative Access Only
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0) rotate(3deg); }
                    50% { transform: translateY(-5px) rotate(3deg); }
                }
                .animate-fade-up { animation: fade-up 0.8s ease-out forwards; }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                .py-4\.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
            `}</style>
        </div>
    );
}
