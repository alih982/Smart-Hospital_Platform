'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Shield, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPage() {
    const locale = useLocale();
    const isRTL = locale === 'fa';

    return (
        <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-900 to-slate-900 py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <Shield className="text-white" size={40} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                        {isRTL ? 'سیاست حریم خصوصی' : 'Privacy Policy'}
                    </h1>
                    <p className="text-indigo-200 text-lg font-medium">
                        {isRTL 
                            ? 'ما متعهد به حفاظت از اطلاعات شخصی شما هستیم.'
                            : 'We are committed to protecting your personal information.'
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
                                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                    <Lock className="text-indigo-600" size={24} />
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

                        {/* Privacy Content */}
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                                    {isRTL ? 'اطلاعات جمع‌آوری شده' : 'Information We Collect'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'ما اطلاعات زیر را جمع‌آوری می‌کنیم:'
                                        : 'We collect the following information:'
                                    }
                                </p>
                                <ul className="space-y-3 text-slate-600 font-medium leading-relaxed list-disc list-inside bg-slate-50 p-6 rounded-2xl">
                                    {isRTL ? (
                                        <>
                                            <li>اطلاعات شخصی (نام، شماره تلفن، ایمیل)</li>
                                            <li>اطلاعات پزشکی و سلامتی</li>
                                            <li>سوابق نوبت‌دهی و ویزیت</li>
                                            <li>اطلاعات پرداخت</li>
                                            <li>اطلاعات دستگاه و موقعیت مکانی</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Personal information (name, phone, email)</li>
                                            <li>Medical and health information</li>
                                            <li>Appointment and visit history</li>
                                            <li>Payment information</li>
                                            <li>Device and location information</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">2</span>
                                    {isRTL ? 'استفاده از اطلاعات' : 'How We Use Your Information'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'اطلاعات شما برای موارد زیر استفاده می‌شود:'
                                        : 'Your information is used for the following purposes:'
                                    }
                                </p>
                                <ul className="space-y-3 text-slate-600 font-medium leading-relaxed list-disc list-inside bg-slate-50 p-6 rounded-2xl">
                                    {isRTL ? (
                                        <>
                                            <li>ارائه خدمات پزشکی و مراقبتی</li>
                                            <li>هماهنگی نوبت‌دهی بین بیماران و پزشکان</li>
                                            <li>ارتباط با شما در مورد خدمات</li>
                                            <li>بهبود کیفیت خدمات</li>
                                            <li>رعایت تعهدات قانونی</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Providing medical and healthcare services</li>
                                            <li>Coordinating appointments between patients and doctors</li>
                                            <li>Communicating with you about services</li>
                                            <li>Improving service quality</li>
                                            <li>Complying with legal obligations</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">3</span>
                                    {isRTL ? 'حفاظت از اطلاعات' : 'Data Protection'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'ما از تدابیر امنیتی پیشرفته برای حفاظت از اطلاعات شما استفاده می‌کنیم. تمامی داده‌ها با استفاده از پروتکل‌های SSL/TLS رمزنگاری می‌شوند و ما دسترسی غیرمجاز را محدود می‌کنیم.'
                                        : 'We use advanced security measures to protect your information. All data is encrypted using SSL/TLS protocols, and we limit unauthorized access.'
                                    }
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-green-50 p-6 rounded-2xl text-center">
                                        <Lock className="text-green-600 mx-auto mb-3" size={32} />
                                        <p className="font-black text-green-800">
                                            {isRTL ? 'رمزنگاری' : 'Encryption'}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-6 rounded-2xl text-center">
                                        <Shield className="text-blue-600 mx-auto mb-3" size={32} />
                                        <p className="font-black text-blue-800">
                                            {isRTL ? 'احراز هویت' : 'Authentication'}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-6 rounded-2xl text-center">
                                        <Database className="text-purple-600 mx-auto mb-3" size={32} />
                                        <p className="font-black text-purple-800">
                                            {isRTL ? 'ذخیره‌سازی امن' : 'Secure Storage'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">4</span>
                                    {isRTL ? 'اشتراک‌گذاری اطلاعات' : 'Information Sharing'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'ما اطلاعات شما را با اشخاص ثالث به اشتراک نمی‌گذاریم، مگر در موارد زیر:'
                                        : 'We do not share your information with third parties, except in the following cases:'
                                    }
                                </p>
                                <ul className="space-y-3 text-slate-600 font-medium leading-relaxed list-disc list-inside bg-slate-50 p-6 rounded-2xl">
                                    {isRTL ? (
                                        <>
                                            <li>با پزشکان و مراکز درمانی برای ارائه خدمات</li>
                                            <li>با رعایت الزامات قانونی</li>
                                            <li>با رضایت صریح شما</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>With doctors and medical centers for service provision</li>
                                            <li>With your explicit consent</li>
                                            <li>To comply with legal requirements</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">5</span>
                                    {isRTL ? 'حقوق شما' : 'Your Rights'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'شما حقوق زیر را دارید:'
                                        : 'You have the following rights:'
                                    }
                                </p>
                                <ul className="space-y-3 text-slate-600 font-medium leading-relaxed list-disc list-inside bg-slate-50 p-6 rounded-2xl">
                                    {isRTL ? (
                                        <>
                                            <li>دسترسی به اطلاعات شخصی خود</li>
                                            <li>درخواست تصحیح اطلاعات نادرست</li>
                                            <li>درخواست حذف اطلاعات</li>
                                            <li>اعتراض به پردازش اطلاعات</li>
                                            <li>درخواست خروج داده‌ها</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Access to your personal information</li>
                                            <li>Request correction of inaccurate information</li>
                                            <li>Request deletion of information</li>
                                            <li>Object to processing of information</li>
                                            <li>Request data portability</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">6</span>
                                    {isRTL ? 'تماس با ما' : 'Contact Us'}
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {isRTL
                                        ? 'در صورت داشتن هرگونه سوال یا نگرانی regarding حریم خصوصی، لطفاً با ما تماس بگیرید.'
                                        : 'If you have any questions or concerns about privacy, please contact us.'
                                    }
                                </p>
                                <div className="bg-indigo-50 p-6 rounded-2xl space-y-2">
                                    <p className="font-bold text-indigo-900">Email: privacy@DoctorHub.com</p>
                                    <p className="font-bold text-indigo-900">Phone: 021-88000000</p>
                                    <p className="font-bold text-indigo-900">{isRTL ? 'آدرس: تهران، سعادت‌آباد' : 'Address: Tehran, Saadat Abad'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Back Link */}
                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <Link 
                                href={`/${locale}`} 
                                className="inline-flex items-center gap-2 text-indigo-600 font-black hover:gap-4 transition-all"
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

