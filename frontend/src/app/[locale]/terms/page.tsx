'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

export default function TermsPage() {
    const locale = useLocale();
    const isRTL = locale === 'fa';

    return (
        <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                        {isRTL ? 'قوانین و مقررات' : 'Terms & Conditions'}
                    </h1>
                    <p className="text-slate-400 text-lg font-medium">
                        {isRTL 
                            ? 'لطفاً قوانین و مقررات استفاده از پلتفرم داکتریس را به دقت مطالعه کنید.'
                            : 'Please read our terms and conditions carefully before using the DoctorHub platform.'
                        }
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/40">
                        
                        {/* Last Updated */}
                        <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <span className="text-2xl">📋</span>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                        {isRTL ? 'آخرین بروزرسانی' : 'Last Updated'}
                                    </p>
                                    <p className="font-bold text-slate-800">
                                        {isRTL ? 'دی ۱۴۰۳' : 'January 2025'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Terms Content */}
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                                    {isRTL ? 'پذیرش شرایط' : 'Acceptance of Terms'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'با استفاده از پلتفرم داکتریس، شما موافقت می‌کنید که این قوانین و مقررات را پذیرفته‌اید. اگر با هر بخش از این شرایط موافق نیستید، لطفاً از استفاده از خدمات ما خودداری کنید.'
                                        : 'By using the DoctorHub platform, you agree that you have read and accept these terms and conditions. If you do not agree with any part of these terms, please do not use our services.'
                                    }
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">2</span>
                                    {isRTL ? 'خدمات پزشکی' : 'Medical Services'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'داکتریس یک پلتفرم اتصال بین بیماران و پزشکان است. ما خدمات پزشکی مستقیم ارائه نمی‌دهیم و تمامی خدمات پزشکی توسط پزشکان و متخصصان مستقل ارائه می‌شود.'
                                        : 'DoctorHub is a platform connecting patients with doctors. We do not provide direct medical services; all medical services are provided by independent physicians and specialists.'
                                    }
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">3</span>
                                    {isRTL ? 'حریم خصوصی' : 'Privacy'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'ما متعزل به حفاظت از حریم خصوصی شما هستیم. اطلاعات شخصی شما طبق سیاست حریم خصوصی ما جمع‌آوری، ذخیره و استفاده می‌شود.'
                                        : 'We are committed to protecting your privacy. Your personal information is collected, stored, and used in accordance with our privacy policy.'
                                    }
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">4</span>
                                    {isRTL ? 'مسئولیت‌های کاربر' : 'User Responsibilities'}
                                </h2>
                                <ul className="space-y-3 text-slate-600 font-medium leading-relaxed list-disc list-inside">
                                    {isRTL ? (
                                        <>
                                            <li>ارائه اطلاعات صحیح و واقعی</li>
                                            <li>حفظ محرمانگی اطلاعات حساب کاربری</li>
                                            <li>استفاده از خدمات برای اهداف قانونی</li>
                                            <li>عدم تلاش برای دسترسی غیرمجاز</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Provide accurate and truthful information</li>
                                            <li>Keep your account credentials confidential</li>
                                            <li>Use services for legitimate purposes</li>
                                            <li>Not attempt unauthorized access</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">5</span>
                                    {isRTL ? 'سلب مسئولیت' : 'Disclaimer'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'خدمات پزشکی ارائه شده توسط پزشکان تحت مسئولیت خود آنهاست. داکتریس مسئولیتی در قبال تشخیص، درمان یا توصیه‌های پزشکی ندارد.'
                                        : 'Medical services provided by doctors are at their own responsibility. DoctorHub is not responsible for any medical diagnoses, treatments, or recommendations.'
                                    }
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">6</span>
                                    {isRTL ? 'تماس با ما' : 'Contact Us'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'در صورت داشتن هرگونه سوال یا نگرانی regarding این قوانین، لطفاً با ما تماس بگیرید.'
                                        : 'If you have any questions or concerns regarding these terms, please contact us.'
                                    }
                                </p>
                                <div className="bg-slate-50 p-6 rounded-2xl">
                                    <p className="font-bold text-slate-800">Email: support@DoctorHub.com</p>
                                    <p className="font-bold text-slate-800">Phone: 021-88000000</p>
                                </div>
                            </div>
                        </div>

                        {/* Back Link */}
                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <Link 
                                href={`/${locale}`} 
                                className="inline-flex items-center gap-2 text-blue-600 font-black hover:gap-4 transition-all"
                            >
                                <ArrowRight className={isRTL ? 'rotate-180' : ''} size={20} />
                                {isRTL ? 'بازگشت به صفحه اصلی' : 'Back to Home'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

