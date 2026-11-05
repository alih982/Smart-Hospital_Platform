'use client';

import React, { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { 
    Heart, 
    Phone, 
    Lock, 
    User, 
    ArrowRight, 
    Loader2, 
    Stethoscope, 
    Shield, 
    ArrowLeft, 
    UserCircle,
    Sparkles
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';

export default function SignupPage() {
    const locale = useLocale();
    const router = useRouter();
    const isRTL = locale === 'fa';

    const login = useAuthStore((state) => state.login);

    const [formData, setFormData] = useState({
        phone_number: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        role: 'patient' as 'patient' | 'doctor' | 'admin'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.phone_number || !formData.password || !formData.first_name || !formData.last_name) {
            setError(isRTL ? 'لطفا تمام فیلدها را پر کنید' : 'Please fill in all fields');
            return;
        }

        if (formData.password !== formData.password_confirm) {
            setError(isRTL ? 'رمزهای عبور مطابقت ندارند' : 'Passwords do not match');
            return;
        }

        if (formData.role === 'admin') {
            setError(isRTL ? 'ثبت‌نام مدیر از این پورتال امکان‌پذیر نیست.' : 'Admin registration not allowed.');
            return;
        }

        if (formData.password.length < 8) {
            setError(isRTL ? 'رمز عبور باید حداقل ۸ کاراکتر باشد' : 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const userData = {
                id: Date.now(),
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_number: formData.phone_number,
                role: formData.role,
                is_verified: false
            };

            localStorage.setItem('demo_role', formData.role);

            const mockToken = 'mock-token-' + Date.now();
            const mockRefresh = 'mock-refresh-' + Date.now();

            const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
            const payload = btoa(unescape(encodeURIComponent(JSON.stringify({
                user_id: userData.id,
                phone_number: userData.phone_number,
                is_patient: formData.role === 'patient',
                is_doctor: formData.role === 'doctor',
                is_superuser: false,
                is_staff: false,
                exp: Math.floor(Date.now() / 1000) + 86400
            }))));
            const signature = "mock-signature";
            const mockJwt = `${header}.${payload}.${signature}`;

            login(mockJwt, mockRefresh);

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user_role', formData.role);

            setSuccess(true);

            setTimeout(() => {
                if (formData.role === 'doctor') {
                    router.push(`/${locale}/dashboard/doctor`);
                } else {
                    router.push(`/${locale}/dashboard/patient`);
                }
            }, 500);

        } catch (err) {
            setError(isRTL ? 'خطا در ثبت‌نام. لطفا دوباره تلاش کنید.' : 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Gradient Orbs */}
                <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-secondary-300/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-100/30 to-secondary-100/30 rounded-full blur-3xl"></div>
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </div>

            <div className="relative w-full max-w-lg animate-scale-in">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
                            <Heart className="w-8 h-8 text-white" />
                        </div>
                    </Link>
                    <h1 className="mt-6 text-3xl font-bold text-text-primary">
                        {isRTL ? 'ثبت‌نام' : 'Create Account'}
                    </h1>
                    <p className="mt-2 text-text-tertiary">
                        {isRTL ? 'حساب کاربری جدید ایجاد کنید' : 'Create a new account to get started'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary-500/10 border border-white/50 p-8 relative overflow-hidden">
                    {/* Card Shine Effect */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-300/50 to-transparent"></div>

                    {/* Success/Error Messages */}
                    {(success || error) && (
                        <div className={`p-4 rounded-2xl mb-6 animate-scale-in ${success ? 'bg-success-50 border border-success-100' : 'bg-error-50 border border-error-100'}`}>
                            <p className={`text-sm text-center font-medium ${success ? 'text-success' : 'text-error'}`}>
                                {success ? (isRTL ? 'ثبت‌نام موفق! در حال انتقال...' : 'Registration successful! Redirecting...') : error}
                            </p>
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-primary-500" />
                            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                                {isRTL ? 'نوع حساب کاربری' : 'Account Type'}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'patient' })}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                    formData.role === 'patient'
                                        ? 'border-primary-500 bg-primary-50/50 shadow-lg shadow-primary-500/10'
                                        : 'border-border hover:border-primary-200'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                                    formData.role === 'patient'
                                        ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                                        : 'bg-background'
                                }`}>
                                    <UserCircle className={`w-6 h-6 ${formData.role === 'patient' ? 'text-white' : 'text-text-muted'}`} />
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${formData.role === 'patient' ? 'text-text-primary' : 'text-text-secondary'}`}>
                                        {isRTL ? 'بیمار' : 'Patient'}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {isRTL ? 'دریافت خدمات' : 'Get Services'}
                                    </p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'doctor' })}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                    formData.role === 'doctor'
                                        ? 'border-secondary-500 bg-secondary-50/50 shadow-lg shadow-secondary-500/10'
                                        : 'border-border hover:border-secondary-200'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                                    formData.role === 'doctor'
                                        ? 'bg-gradient-to-br from-secondary-500 to-secondary-600'
                                        : 'bg-background'
                                }`}>
                                    <Stethoscope className={`w-6 h-6 ${formData.role === 'doctor' ? 'text-white' : 'text-text-muted'}`} />
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${formData.role === 'doctor' ? 'text-text-primary' : 'text-text-secondary'}`}>
                                        {isRTL ? 'پزشک' : 'Doctor'}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {isRTL ? 'ارائه خدمات' : 'Provide Services'}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2.5">
                                    {isRTL ? 'نام' : 'First Name'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-text-muted group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pr-12 pl-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-text-muted"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        placeholder={isRTL ? 'نام' : 'First name'}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2.5">
                                    {isRTL ? 'نام خانوادگی' : 'Last Name'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-text-muted group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pr-12 pl-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-text-muted"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        placeholder={isRTL ? 'نام خانوادگی' : 'Last name'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2.5">
                                {isRTL ? 'شماره موبایل' : 'Phone Number'}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-text-muted group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    className="w-full pr-12 pl-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-text-muted text-left"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    placeholder="0912 000 0000"
                                />
                            </div>
                        </div>

                        {/* Password Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2.5">
                                    {isRTL ? 'رمز عبور' : 'Password'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-text-muted group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full pr-12 pl-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-text-muted"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2.5">
                                    {isRTL ? 'تکرار رمز' : 'Confirm'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <Shield className="h-5 w-5 text-text-muted group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full pr-12 pl-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-text-muted"
                                        value={formData.password_confirm}
                                        onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {isRTL ? 'ثبت‌نام' : 'Create Account'}
                                    <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <p className="text-sm text-text-secondary">
                            {isRTL ? 'قبلا ثبت‌نام کرده‌اید؟' : 'Already have an account?'}
                            <Link href="/login" className="text-primary-600 font-bold mr-1 hover:underline">
                                {isRTL ? 'ورود' : 'Sign In'}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary-600 transition-colors font-medium">
                        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                        {isRTL ? 'بازگشت به صفحه اصلی' : 'Back to Home'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

