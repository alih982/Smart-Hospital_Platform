'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';

export default function ContactPage() {
    const locale = useLocale();
    const t = useTranslations('nav');
    const isRTL = locale === 'fa';

    return (
        <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Header */}
            <section className="bg-gray-50 py-24 border-b border-gray-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl space-y-4">
                        <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-black tracking-widest uppercase">
                            {isRTL ? 'ارتباط فعال' : 'Active Contact'}
                        </div>
                        <h1 className="text-5xl font-black text-gray-800 leading-tight">
                            {isRTL ? 'با ما در تماس باشید' : 'Get in Touch with Us'}
                        </h1>
                        <p className="text-lg text-gray-500 font-bold">
                            {isRTL ? 'تیم پشتیبانی ما ۲۴ ساعته در تمامی ایام هفته آماده پاسخگویی به شماست.' : 'Our support team is available 24/7 to assist you with any inquiries.'}
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 -skew-x-12 translate-x-1/4"></div>
            </section>

            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
                    {/* Contact Info Cards */}
                    <div className="space-y-6">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">📞</div>
                            <h4 className="text-lg font-black text-gray-800 mb-2">تماس تلفنی</h4>
                            <p className="text-sm text-gray-500 font-bold mb-4 leading-6">برای فوریت‌های پزشکی و مشاوره سریع با ما تماس بگیرید.</p>
                            <a href="tel:+982188000000" className="text-xl font-black text-blue-600 tracking-wider">۰۲۱-۸۸۰۰۰۰۰۰</a>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">📧</div>
                            <h4 className="text-lg font-black text-gray-800 mb-2">ایمیل مستقیم</h4>
                            <p className="text-sm text-gray-500 font-bold mb-4 leading-6">سوالات فنی و پیشنهادات خود را برای ما ارسال کنید.</p>
                            <a href="mailto:support@DoctorHub.com" className="text-lg font-black text-indigo-600">support@DoctorHub.com</a>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">📍</div>
                            <h4 className="text-lg font-black text-gray-800 mb-2">دفتر مرکزی</h4>
                            <p className="text-sm text-gray-500 font-bold mb-4 leading-6">تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۵۰</p>
                            <button className="text-sm font-black text-purple-600 hover:underline">مشاهده روی نقشه</button>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white p-12 rounded-[3rem] shadow-2xl shadow-blue-50 border border-blue-50">
                        <div className="mb-10">
                            <h3 className="text-2xl font-black text-gray-800 mb-2">ارسال پیام مستقیم</h3>
                            <p className="text-sm text-gray-400 font-bold">لطفاً فرم زیر را پر کنید تا کارشناسان ما در کمترین زمان با شما تماس بگیرند.</p>
                        </div>

                        <form className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">نام و نام خانوادگی</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: علی حسینی"
                                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">آدرس ایمیل</label>
                                    <input
                                        type="email"
                                        placeholder="ali@example.com"
                                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-left"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">موضوع گفتگو</label>
                                <select className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all appearance-none cursor-pointer">
                                    <option>پشتیبانی فنی</option>
                                    <option>نوبت‌دهی و رزرو</option>
                                    <option>همکاری با سازمان‌ها</option>
                                    <option>گزارش تخلف</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">پیام شما</label>
                                <textarea
                                    rows={5}
                                    placeholder="شرح درخواست یا سوال خود را اینجا بنویسید..."
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all resize-none"
                                ></textarea>
                            </div>

                            <button className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-[0.98]">
                                ارسال پیام به داکتریس
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Map Section Shell */}
            <section className="h-96 w-full bg-gray-100 flex items-center justify-center text-4xl grayscale opacity-30 border-y border-gray-200">
                🗺️ نقشه تعاملی داکتریس
            </section>
        </div>
    );
}
