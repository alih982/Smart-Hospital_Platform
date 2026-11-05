'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Heart, Sparkles, MapPin, Phone, Mail, ArrowRight, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
    const locale = useLocale();
    const t = useTranslations('nav');
    const isRTL = locale === 'fa';

    const footerLinks = {
        quickLinks: {
            title: isRTL ? 'الگوریتم‌های سلامت' : 'Health Algorithms',
            links: [
                { href: `/doctors`, label: isRTL ? 'مسیریابی پزشکان' : 'Find Specialists' },
                { href: `/pharmacy`, label: isRTL ? 'داروخانه دیجیتال' : 'Digital Pharmacy' },
                { href: `/dashboard/patient`, label: isRTL ? 'داشبورد اختصاصی' : 'Personal Dashboard' },
                { href: `/about`, label: isRTL ? 'درباره هسته هوشمند' : 'About Smart Core' },
                { href: `/contact`, label: isRTL ? 'کنسول پشتیبانی' : 'Support Console' },
            ]
        },
        specialties: {
            title: isRTL ? 'دپارتمان‌های برتر' : 'Top Departments',
            links: [
                { href: `/doctors?specialty=قلب`, label: isRTL ? 'انستیتو قلب و عروق' : 'Cardiology Institute' },
                { href: `/doctors?specialty=چشم`, label: isRTL ? 'کلینیک بینایی' : 'Vision Clinic' },
                { href: `/doctors?specialty=مغز`, label: isRTL ? 'علوم اعصاب' : 'Neuroscience' },
                { href: `/doctors?specialty=روان`, label: isRTL ? 'بهداشت روان' : 'Mental Health' },
                { href: `/doctors?specialty=کودک`, label: isRTL ? 'طب اطفال' : 'Pediatrics' },
            ]
        },
        contact: {
            title: isRTL ? 'ارتباط مستقیم' : 'Direct Contact',
            phone: isRTL ? '۰۲۱-۸۸۰۰۰۰۰۰' : '+98-21-88000000',
            email: 'hello@DoctorHub.io',
            location: isRTL ? 'تهران، پارک فناوری پردیس، ساختمان نوآوری سلامت' : 'Health Innovation Bldg, Pardis Tech Park, Tehran',
        },
        brand: {
            description: isRTL
                ? "معماری نوین در اکوسیستم سلامت. ترکیب هوش مصنوعی، داده‌های بیومتریک و تخصص پزشکی برای ارائه درمان‌های پیشگامانه."
                : "A new architecture in the health ecosystem. Combining AI, biometric data, and medical expertise for groundbreaking treatments.",
            tagline: isRTL ? 'الگوریتم‌های سلامتی' : 'Wellness Algorithms',
        },
        bottomBar: {
            copyright: isRTL ? '© ۱۴۰۳ تمامی حقوق برای پلتفرم هوشمند داکتریس محفوظ است.' : '© 2024 All rights reserved. DoctorHub Smart Platform.',
            terms: isRTL ? 'شرایط استفاده' : 'Terms of Service',
            privacy: isRTL ? 'حریم شخصی' : 'Privacy Policy',
            cookies: isRTL ? 'تنظیمات کوکی' : 'Cookie Settings',
        }
    };

    return (
        <footer className="bg-primary-950 text-slate-300 pt-32 pb-12 overflow-hidden relative" dir={isRTL ? "rtl" : "ltr"}>
            {/* Ultra Premium Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-royal-600/10 rounded-full blur-[120px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

            {/* Top Border Glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-royal-500/50 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Pre-Footer Newsletter Area */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="flex-1 space-y-3 relative z-10">
                        <h3 className="text-3xl font-black text-white tracking-tight">
                            {isRTL ? 'خبرنامه تندرستی و نوآوری' : 'Health & Innovation Newsletter'}
                        </h3>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl">
                            {isRTL ? 'آخرین دستاوردهای پزشکی، توصیه‌های سلامتی و امکانات جدید پلتفرم را هفتگی دریافت کنید.' : 'Receive the latest medical breakthroughs, health tips, and platform features weekly.'}
                        </p>
                    </div>
                    <div className="w-full lg:w-[450px] flex gap-2 relative z-10">
                        <input
                            type="email"
                            placeholder={isRTL ? 'آدرس ایمیل شما...' : 'Your email address...'}
                            className="w-full bg-primary-900/50 border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-royal-500 focus:ring-1 focus:ring-royal-500 transition-all placeholder:text-slate-500 font-medium"
                        />
                        <button className="bg-royal-600 text-white px-6 rounded-2xl font-bold hover:bg-royal-500 transition-colors shadow-lg shadow-royal-600/20 flex items-center justify-center min-w-[60px]">
                            <ArrowRight size={24} className={isRTL ? 'rotate-180' : ''} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link href={`/`} className="flex items-center gap-4 group inline-flex">
                            <div className="relative w-14 h-14 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-royal-500 to-primary-600 rounded-2xl rotate-45 group-hover:rotate-90 transition-all duration-500 shadow-glow"></div>
                                <Heart className="w-6 h-6 text-white relative z-10 animate-pulse-glow" fill="currentColor" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-3xl font-black text-white tracking-tight leading-none">DoctorHub</span>
                                <span className="text-[10px] font-bold text-royal-400 tracking-widest uppercase mt-1 flex items-center gap-1">
                                    {footerLinks.brand.tagline} <Sparkles size={12} className="text-amber-400" />
                                </span>
                            </div>
                        </Link>
                        <p className="text-slate-400 font-medium leading-loose text-[15px] pr-4">
                            {footerLinks.brand.description}
                        </p>
                        <div className="flex gap-3">
                            {[
                                { icon: Instagram, color: 'hover:bg-pink-600' },
                                { icon: Twitter, color: 'hover:bg-sky-500' },
                                { icon: Linkedin, color: 'hover:bg-blue-700' },
                                { icon: Facebook, color: 'hover:bg-blue-600' }
                            ].map((social, i) => (
                                <a key={i} href="#" className={`w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-300 ${social.color} hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl`}>
                                    <social.icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-3 lg:col-start-6 space-y-8">
                        <h4 className="text-white font-bold text-lg">{footerLinks.quickLinks.title}</h4>
                        <ul className="space-y-4">
                            {footerLinks.quickLinks.links.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-slate-400 hover:text-royal-400 font-medium transition-colors inline-flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-royal-500 transition-colors"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Specialties */}
                    <div className="lg:col-span-2 space-y-8">
                        <h4 className="text-white font-bold text-lg">{footerLinks.specialties.title}</h4>
                        <ul className="space-y-4">
                            {footerLinks.specialties.links.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-slate-400 hover:text-royal-400 font-medium transition-colors inline-flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-royal-500 transition-colors"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-3 space-y-8">
                        <h4 className="text-white font-bold text-lg">{footerLinks.contact.title}</h4>
                        <div className="space-y-5">
                            <a href={`tel:${footerLinks.contact.phone.replace(/[^0-9+]/g, '')}`} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                <div className="w-10 h-10 bg-royal-500/20 text-royal-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-royal-500 group-hover:text-white transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{isRTL ? 'پشتیبانی ۲۴ ساعته' : '24/7 Hotline'}</span>
                                    <span className="text-white font-black text-lg" dir="ltr">{footerLinks.contact.phone}</span>
                                </div>
                            </a>

                            <a href={`mailto:${footerLinks.contact.email}`} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{isRTL ? 'پست الکترونیک' : 'Email Address'}</span>
                                    <span className="text-white font-bold" dir="ltr">{footerLinks.contact.email}</span>
                                </div>
                            </a>

                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{isRTL ? 'دفتر مرکزی' : 'Headquarters'}</span>
                                    <span className="text-slate-300 font-medium text-sm leading-relaxed">{footerLinks.contact.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 bg-primary-950/80 backdrop-blur-xl relative z-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm font-medium text-slate-500">
                        {footerLinks.bottomBar.copyright}
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href={`/terms`} className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">{footerLinks.bottomBar.terms}</Link>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <Link href={`/privacy`} className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">{footerLinks.bottomBar.privacy}</Link>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <Link href={`/`} className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">{footerLinks.bottomBar.cookies}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
