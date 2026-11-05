'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { cmsService, MedicalService } from '@/services/cmsService';
import * as LucideIcons from 'lucide-react';
import {
    ChevronRight, ArrowLeft, Calendar,
    User, Clock, ShieldCheck, Activity
} from 'lucide-react';

export default function SpecialtyDetailPage() {
    const t = useTranslations('common');
    const locale = useLocale();
    const params = useParams();
    const slug = params.slug as string;

    const [service, setService] = useState<MedicalService | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (slug) {
            cmsService.getServiceBySlug(slug)
                .then(data => setService(data))
                .catch(err => {
                    console.error('Error fetching service:', err);
                    window.location.href = `/${locale}/services`;
                })
                .finally(() => setIsLoading(false));
        }
    }, [slug]);

    const renderIcon = (name: string, size = 48, className = "") => {
        const Icon = (LucideIcons as any)[name] || LucideIcons.Activity;
        return <Icon size={size} className={className} />;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !service) {
        const isRTL = locale === 'fa';
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                        <LucideIcons.AlertCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isRTL ? 'تخصص یافت نشد' : 'Specialty Not Found'}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        {isRTL 
                            ? 'تخصص پزشکی که به دنبال آن هستید ممکن است جابه‌جا یا نام‌گذاری شده باشد.'
                            : 'The medical specialty you are looking for might have been moved or renamed.'
                        }
                    </p>
                    <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                        {isRTL ? (
                            <>
                                <ArrowLeft size={18} className="rotate-180" /> بازگشت به خدمات
                            </>
                        ) : (
                            <>
                                <ArrowLeft size={18} /> Back to Services
                            </>
                        )}
                    </Link>
                </div>
            </div>
        );
    }

    const isRTL = locale === 'fa';

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-40 pb-32 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950"></div>
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>

                <div className="relative max-w-7xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8 text-center lg:text-left">
                            <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 text-blue-400 font-black text-sm uppercase tracking-widest hover:text-blue-300 transition-colors">
                                <ArrowLeft size={16} /> All Services
                            </Link>
                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
                                    {locale === 'fa' ? service.title_fa : service.title_en}
                                </h1>
                                <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed italic">
                                    {locale === 'fa' ? service.description_fa : service.description_en}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                                    <ShieldCheck className="text-green-400" size={20} />
                                    <span className="text-white font-bold text-sm tracking-wide">Board Certified Experts</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                                    <Activity className="text-blue-400" size={20} />
                                    <span className="text-white font-bold text-sm tracking-wide">Advanced Diagnostics</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className={`w-48 h-48 md:w-64 md:h-64 rounded-[4rem] ${service.color_class} flex items-center justify-center relative z-10 transition-transform duration-700 group-hover:rotate-12 shadow-3xl`}>
                                {renderIcon(service.icon_name, 96, "group-hover:scale-110 transition-transform duration-700")}
                            </div>
                            <div className="absolute inset-0 bg-blue-600 rounded-[4rem] blur-3xl opacity-20 -z-0 group-hover:opacity-40 transition-opacity"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2 space-y-12">
                            <div className="prose prose-slate prose-xl max-w-none">
                                <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Overview & Specialization</h2>
                                <div className="text-slate-600 font-medium leading-loose text-lg whitespace-pre-line">
                                    {locale === 'fa' ? service.content_fa : service.content_en}
                                </div>
                            </div>

                            {/* Key Highlights */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                                {[
                                    { label: 'State-of-the-Art Technology', icon: LucideIcons.Laptop },
                                    { label: 'Patient-Centered Care', icon: LucideIcons.Heart },
                                    { label: 'Comprehensive Diagnosis', icon: LucideIcons.Search },
                                    { label: 'Post-Treatment Support', icon: LucideIcons.MessageSquare }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                                            <item.icon size={24} />
                                        </div>
                                        <span className="font-black text-slate-800 tracking-tight">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Booking Card */}
                            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                <div className="relative z-10 space-y-8">
                                    <h3 className="text-2xl font-black tracking-tight">Book a Consultation</h3>
                                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                                        Connect with our leading {locale === 'fa' ? service.title_fa : service.title_en} specialists today for a personalized evaluation.
                                    </p>
                                    <ul className="space-y-4 pt-2">
                                        <li className="flex items-center gap-3 text-sm text-slate-300">
                                            <Calendar size={18} className="text-blue-400" /> Instant Appointment
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-300">
                                            <User size={18} className="text-blue-400" /> Expert Consultation
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-300">
                                            <Clock size={18} className="text-blue-400" /> 24/7 Support
                                        </li>
                                    </ul>
                                    <Link href={`/${locale}/doctors`} className="block w-full text-center py-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 pt-4 pb-4">
                                        FIND A DOCTOR
                                    </Link>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-blue-50 p-10 rounded-[3rem] border border-blue-100">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <Activity size={20} className="text-blue-600" /> Why Choose Us?
                                </h3>
                                <div className="space-y-6">
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                        Our {locale === 'fa' ? service.title_fa : service.title_en} department is recognized globally for excellence in patient outcomes and innovation.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-bold">Success Rate</span>
                                            <span className="text-blue-600 font-black">98%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-600 h-full w-[98%] rounded-full"></div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-bold">Patient Satisfaction</span>
                                            <span className="text-blue-600 font-black">4.9/5</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-600 h-full w-[94%] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
