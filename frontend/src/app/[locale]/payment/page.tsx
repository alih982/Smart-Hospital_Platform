'use client';

import React, { useState } from 'react';

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const [paymentDone, setPaymentDone] = useState(false);

    const orderSummary = {
        items: [
            { name: 'ویزیت تخصصی قلب (دکتر مورفی)', price: '۱۲۰,۰۰۰ تومان' },
            { name: 'خدمات رزرو آنلاین', price: '۵,۰۰۰ تومان' },
        ],
        total: '۱۲۵,۰۰۰ تومان'
    };

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
        setTimeout(() => {
            setStep(3);
            setPaymentDone(true);
        }, 2500);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50/50" dir="rtl">
            <div className="w-full max-w-5xl bg-white rounded-[4rem] shadow-2xl shadow-blue-100 overflow-hidden flex flex-col md:flex-row border border-gray-100">

                {/* Left: Summary */}
                <div className="w-full md:w-2/5 bg-gradient-to-br from-blue-700 to-indigo-900 p-12 text-white flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-black mb-8 border-b border-white/10 pb-6">خلاصه صورت‌حساب</h2>
                        <div className="space-y-6">
                            {orderSummary.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-blue-100">{item.name}</span>
                                    <span className="text-sm font-black">{item.price}</span>
                                </div>
                            ))}
                            <div className="pt-6 border-t border-white/20 flex justify-between items-center">
                                <span className="text-lg font-black text-blue-200">مبلغ قابل پرداخت:</span>
                                <span className="text-3xl font-black">{orderSummary.total}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                        <div className="flex gap-4 items-center mb-4">
                            <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center text-xl">🛡️</div>
                            <h4 className="font-black text-sm text-green-300">پرداخت امن و تضمین شده</h4>
                        </div>
                        <p className="text-[10px] font-bold text-blue-100 leading-5">اطلاعات پرداختی شما به صورت رمزنگاری شده ارسال می‌شود و تنها توسط درگاه بانکی قابل مشاهده است.</p>
                    </div>
                </div>

                {/* Right: Payment Form */}
                <div className="flex-1 p-12 relative">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <h3 className="text-2xl font-black text-gray-800 mb-2">روش پرداخت را انتخاب کنید</h3>
                            <p className="text-sm font-bold text-gray-400 mb-10">لطفاً اطلاعات کارت خود را با دقت وارد نمایید.</p>

                            <form onSubmit={handlePayment} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 pr-2">شماره ۱۶ رقمی کارت</label>
                                    <div className="relative">
                                        <input type="text" placeholder="**** **** **** ****" className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-black text-lg tracking-[0.2em] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" maxLength={19} required />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">💳</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 pr-2">CVV2</label>
                                        <input type="password" placeholder="***" className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-black text-center focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" maxLength={4} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 pr-2">تاریخ انقضا</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="ماه" className="w-full bg-gray-50 border border-gray-100 px-2 py-4 rounded-2xl font-black text-center focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" maxLength={2} required />
                                            <input type="text" placeholder="سال" className="w-full bg-gray-50 border border-gray-100 px-2 py-4 rounded-2xl font-black text-center focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" maxLength={2} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 pr-2">رمز اینترنتی (پویا)</label>
                                    <div className="flex gap-4">
                                        <input type="password" placeholder="******" className="flex-1 bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-black focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" required />
                                        <button type="button" className="bg-blue-50 text-blue-600 px-6 py-4 rounded-2xl font-black text-xs hover:bg-blue-100 transition-all whitespace-nowrap">دریافت رمز پویا</button>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95">پرداخت و تکمیل رزرو</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-gray-800 mb-2">در حال تایید تراکنش...</h3>
                                <p className="text-sm font-bold text-gray-400">لطفاً از صفحه خارج نشوید.</p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 fade-in duration-500">
                            <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-6xl text-white shadow-2xl shadow-green-100 animate-bounce">✓</div>
                            <div className="text-center">
                                <h3 className="text-3xl font-black text-gray-800 mb-2">پرداخت با موفقیت انجام شد!</h3>
                                <p className="text-sm font-bold text-gray-400 leading-7 px-10">کد رهگیری تراکنش شما: <span className="text-gray-800 font-black">TRX-۹۸۴۵۷۱</span><br />جزییات نوبت برای شما پیامک شد.</p>
                            </div>
                            <div className="flex gap-4">
                                <Link href="/dashboard/messages" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
                                    <span>گفتگو با پزشک</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                                </Link>
                                <Link href="/dashboard/patient" className="bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">
                                    بازگشت به پیشخوان
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
import { Link } from '@/i18n/navigation';
