'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function AboutPage() {
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const t = useTranslations('home');

    const stats = isRTL ? [
        { label: 'پزشکان متخصص', value: '۱۸۰+', icon: '👨‍⚕️' },
        { label: 'بیماران راضی', value: '۱۵,۰۰۰+', icon: '😊' },
        { label: 'سال تجربه', value: '۱۲+', icon: '🗓️' },
        { label: 'داروخانه‌های همکار', value: '۸۵+', icon: '💊' },
    ] : [
        { label: 'Expert Doctors', value: '180+', icon: '👨‍⚕️' },
        { label: 'Happy Patients', value: '15,000+', icon: '😊' },
        { label: 'Years Experience', value: '12+', icon: '🗓️' },
        { label: 'Partner Pharmacies', value: '85+', icon: '💊' },
    ];

    return (
        <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
                    <h1 className="text-4xl md:text-6xl font-black leading-tight">
                        {isRTL ? 'پلتفرم هوشمند سلامت داکتریس' : 'DoctorHub Smart Health Platform'}
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto font-medium leading-relaxed">
                        {isRTL
                            ? 'ما با بهره‌گیری از هوش مصنوعی و کادری مجرب، فاصله‌ی بین شما و سلامت را به حداقل رسانده‌ایم.'
                            : 'We bridge the gap between you and health through AI and expert medical professionals.'
                        }
                    </p>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="relative z-20 -mt-16 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center space-y-4 hover:transform hover:scale-105 transition-all">
                            <div className="text-4xl">{stat.icon}</div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-800">{stat.value}</h3>
                                <p className="text-sm font-bold text-gray-400 mt-1">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="inline-block px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-black border border-blue-100">
                            {isRTL ? 'مأموریت ما' : 'Our Mission'}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-800 leading-snug">
                            {isRTL
                                ? 'دسترسی برابر به خدمات با کیفیت پزشکی برای همه'
                                : 'Equal Access to Quality Healthcare for All'
                            }
                        </h2>
                        <p className="text-gray-500 font-medium leading-8 text-lg">
                            {isRTL
                                ? 'داکتریس فعالیت خود را از سال ۱۳۹۰ با هدف تحول در نظام سلامت دیجیتال آغاز کرد. ما معتقدیم که هر فردی در هر نقطه‌ای از کشور باید بتواند در کمترین زمان ممکن، بهترین مشاوره‌ی پزشکی را دریافت کند. سیستم هوشمند ما با تحلیل دقیق نیازهای بیمار، او را به تخصصی‌ترین پزشکان متصل می‌کند.'
                                : 'DoctorHub started its journey in 2011 with the goal of transforming digital healthcare. We believe everyone should have access to the best medical consultations quickly. Our smart system connects patients with the most specialized doctors based on their specific needs.'
                            }
                        </p>
                        <ul className="space-y-4 pt-4">
                            {(isRTL
                                ? ['دقت بالا در تشخیص با دستیار هوشمند', 'رزرو نوبت در کمتر از ۳۰ ثانیه', 'ارسال سریع دارو به تمام نقاط']
                                : ['High accuracy with AI-assisted diagnosis', 'Book appointments in under 30 seconds', 'Fast delivery nationwide']
                            ).map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-bold text-gray-700">
                                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative group">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[4rem] overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02]">
                            <Image
                                src="http://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"
                                alt="Healthcare"
                                width={800}
                                height={500}
                                priority
                                className="w-full h-[500px] object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-[280px]">
                            <p className="text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                {isRTL ? 'تکنولوژی مورد استفاده' : 'Technology Used'}
                            </p>
                            <p className="text-sm font-black text-gray-800 leading-relaxed">
                                {isRTL
                                    ? 'هوش مصنوعی مولد Gemma-2 برای تحلیل دقیق علائم بیماران'
                                    : 'Generative AI (Gemma-2) for accurate patient symptom analysis'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-32 px-6 bg-gray-50/50">
                <div className="max-w-7xl mx-auto text-center space-y-16">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-800">
                            {isRTL ? 'چشم‌انداز آینده' : 'Future Vision'}
                        </h2>
                        <p className="text-gray-500 font-medium max-w-3xl mx-auto text-lg leading-relaxed">
                            {isRTL
                                ? 'ما در حال ساختن دنیایی هستیم که در آن پیشگیری بر درمان اولویت داشته باشد و بیماری‌ها قبل از حاد شدن، توسط سنسورهای هوشمند شناسایی شوند.'
                                : 'We are building a world where prevention takes priority over treatment, and diseases are detected by smart sensors before becoming critical.'
                            }
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto">🤖</div>
                            <h4 className="text-xl font-black text-gray-800">
                                {isRTL ? 'هوش مصنوعی فراگیر' : 'AI-Powered Healthcare'}
                            </h4>
                            <p className="text-sm text-gray-500 font-medium leading-6">
                                {isRTL
                                    ? ' استقرار سیستم‌های خودکار پایش سلامت بر بستر اینترنت اشیا.'
                                    : 'Deploying automated health monitoring systems on IoT infrastructure.'
                                }
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6 text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mx-auto">🌍</div>
                            <h4 className="text-xl font-black text-gray-800">
                                {isRTL ? 'توسعه سراسری' : 'Nationwide Expansion'}
                            </h4>
                            <p className="text-sm text-gray-500 font-medium leading-6">
                                {isRTL
                                    ? 'پوشش تمامی شهرهای ایران و مناطق محروم با کلینیک‌های مجازی.'
                                    : 'Coverage across all Iranian cities and remote areas with virtual clinics.'
                                }
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6 text-center">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl mx-auto">🔬</div>
                            <h4 className="text-xl font-black text-gray-800">
                                {isRTL ? 'درمان بومی' : 'Localized Treatment'}
                            </h4>
                            <p className="text-sm text-gray-500 font-medium leading-6">
                                {isRTL
                                    ? 'تحقیق و توسعه پروتکول‌های درمانی اختصاصی بر اساس ژنتیک ایرانیان.'
                                    : 'R&D on customized treatment protocols based on Iranian genetics.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl md:text-4xl font-black text-white">
                        {isRTL ? 'همین الان به ما بپیوندید' : 'Join Us Today'}
                    </h2>
                    <p className="text-blue-100 text-lg font-medium">
                        {isRTL
                            ? 'تجربه‌ی مراقبت‌های بهداشتی متحول شده را با داکتریس تجربه کنید.'
                            : 'Experience transformed healthcare with DoctorHub.'
                        }
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={`/doctors`} className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                            {isRTL ? 'مشاهده پزشکان' : 'View Doctors'}
                        </Link>
                        <Link href={`/signup`} className="px-8 py-4 bg-blue-700 text-white rounded-2xl font-bold border border-blue-500 hover:bg-blue-800 transition-all">
                            {isRTL ? 'ثبت‌نام' : 'Sign Up'}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

