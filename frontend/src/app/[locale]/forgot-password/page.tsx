'use client';

import React, { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, Phone, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
    const t = useTranslations('auth');
    const locale = useLocale();
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSent(true);
        }, 1500);
    };

    if (sent) {
        return (
            <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
                {/* Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('http://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop')" }}
                >
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"></div>
                </div>

                <div className="relative w-full max-w-md animate-fade-up">
                    <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 shadow-2xl text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShieldCheck className="text-green-400" size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-4">کد ارسال شد!</h1>
                        <p className="text-slate-300 font-medium mb-8">
                            کد بازیابی به شماره {phone} پیامک شد.
                        </p>
                        <Link 
                            href={`/login`} 
                            className="inline-block w-full bg-blue-600 text-white py-4 rounded-[1.5rem] font-black hover:bg-blue-700 transition-all"
                        >
                            بازگشت به صفحه ورود
                        </Link>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes fade-up {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-up {
                        animation: fade-up 0.8s ease-out forwards;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('http://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="relative w-full max-w-md animate-fade-up">
                {/* Back Link */}
                <Link href={`/login`} className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8 font-bold transition-colors">
                    <ArrowLeft size={20} />
                    بازگشت به صفحه ورود
                </Link>

                <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 shadow-2xl shadow-black/20">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-black text-white mb-3">بازیابی رمز عبور</h1>
                        <p className="text-slate-300 font-medium">شماره تلفن همراه خود را وارد کنید</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 backdrop-blur-md text-red-200 p-4 rounded-2xl text-sm font-bold mb-8 text-center border border-red-500/30">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-100 uppercase tracking-widest ml-4">شماره تلفن</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-4.5 text-blue-400 group-focus-within:text-white transition-colors">
                                    <Phone size={22} />
                                </span>
                                <input
                                    type="tel"
                                    required
                                    className="w-full pl-14 pr-6 py-4.5 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-blue-500 focus:outline-none transition-all outline-none font-bold text-white placeholder:text-slate-500"
                                    placeholder="0912 000 0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    ارسال کد تأیید
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 font-medium text-sm">
                            رمز عبور خود را به خاطر دارید؟{' '}
                            <Link href={`/login`} className="text-blue-400 font-black hover:text-white transition-colors">
                                ورود به حساب
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
                    <ShieldCheck size={16} className="text-green-500" />
                    امنیت اطلاعات.health Records
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fade-up 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

