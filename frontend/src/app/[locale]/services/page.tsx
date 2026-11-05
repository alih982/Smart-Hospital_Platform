'use client';

import { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';

// Mock data for services (works without backend)
const MOCK_SERVICES = [
    {
        id: 1,
        slug: 'cardiology',
        title_en: 'Cardiology',
        title_fa: 'قلب و عروق',
        description_en: 'Comprehensive heart care including diagnostics, treatment, and preventive cardiology services.',
        description_fa: 'مراقبت جامع از قلب شامل تشخیص، درمان و خدمات پیشگیری از بیماری‌های قلبی.',
        icon_name: 'Heart',
        color_class: 'bg-red-100 text-red-600',
        image: 'http://images.unsplash.com/photo-1559757175-5700dde675bc?w=800'
    },
    {
        id: 2,
        slug: 'neurology',
        title_en: 'Neurology',
        title_fa: 'مغز و اعصاب',
        description_en: 'Expert care for brain, spine, and nervous system disorders.',
        description_fa: 'مراقبت تخصصی از اختلالات مغز، نخاع و سیستم عصبی.',
        icon_name: 'Brain',
        color_class: 'bg-purple-100 text-purple-600',
        image: 'http://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800'
    },
    {
        id: 3,
        slug: 'ophthalmology',
        title_en: 'Ophthalmology',
        title_fa: 'چشم‌پزشکی',
        description_en: 'Complete eye care services from routine exams to advanced surgeries.',
        description_fa: 'خدمات کامل مراقبت از چشم از معاینات روزانه تا جراحی‌های پیشرفته.',
        icon_name: 'Eye',
        color_class: 'bg-blue-100 text-blue-600',
        image: 'http://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800'
    },
    {
        id: 4,
        slug: 'internal-medicine',
        title_en: 'Internal Medicine',
        title_fa: 'پزشکی داخلی',
        description_en: 'Comprehensive adult medicine focusing on prevention, diagnosis, and treatment.',
        description_fa: 'پزشکی بزرگسالان با تمرکز بر پیشگیری، تشخیص و درمان.',
        icon_name: 'Activity',
        color_class: 'bg-green-100 text-green-600',
        image: 'http://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'
    },
    {
        id: 5,
        slug: 'pediatrics',
        title_en: 'Pediatrics',
        title_fa: 'کودکان',
        description_en: 'Specialized healthcare for infants, children, and adolescents.',
        description_fa: 'مراقبت‌های بهداشتی تخصصی برای نوزادان، کودکان و نوجوانان.',
        icon_name: 'Baby',
        color_class: 'bg-yellow-100 text-yellow-600',
        image: 'http://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800'
    },
    {
        id: 6,
        slug: 'orthopedics',
        title_en: 'Orthopedics',
        title_fa: 'ارتوپدی',
        description_en: 'Bone, joint, and muscle care with advanced surgical techniques.',
        description_fa: 'مراقبت از استخوان، مفاصل و عضلات با تکنیک‌های جراحی پیشرفته.',
        icon_name: 'Bone',
        color_class: 'bg-indigo-100 text-indigo-600',
        image: 'http://images.unsplash.com/photo-1516549655169-df83a092dd14?w=800'
    },
    {
        id: 7,
        slug: 'dermatology',
        title_en: 'Dermatology',
        title_fa: 'پوست و مو',
        description_en: 'Skin, hair, and nail care with latest treatment methods.',
        description_fa: 'مراقبت از پوست، مو و ناخن با جدیدترین روش‌های درمانی.',
        icon_name: 'Sparkles',
        color_class: 'bg-pink-100 text-pink-600',
        image: 'http://images.unsplash.com/photo-1576426863848-c21853a3944b?w=800'
    },
    {
        id: 8,
        slug: 'psychiatry',
        title_en: 'Psychiatry',
        title_fa: 'روان‌پزشکی',
        description_en: 'Mental health services including therapy and medication management.',
        description_fa: 'خدمات سلامت روان شامل درمان و مدیریت دارویی.',
        icon_name: 'BrainCircuit',
        color_class: 'bg-violet-100 text-violet-600',
        image: 'http://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800'
    },
    {
        id: 9,
        slug: 'gynecology',
        title_en: 'Gynecology',
        title_fa: 'زنان و زایمان',
        description_en: "Women's health services including reproductive health and prenatal care.",
        description_fa: 'خدمات سلامت زنان شامل سلامت باروری و مراقبت‌های دوران بارداری.',
        icon_name: 'HeartPulse',
        color_class: 'bg-rose-100 text-rose-600',
        image: 'http://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
    },
    {
        id: 10,
        slug: 'urology',
        title_en: 'Urology',
        title_fa: 'اورولوژی',
        description_en: 'Treatment of urinary tract disorders and male reproductive health.',
        description_fa: 'درمان اختلالات دستگاه ادراری و سلامت باروری مردان.',
        icon_name: 'Shield',
        color_class: 'bg-teal-100 text-teal-600',
        image: 'http://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'
    },
    {
        id: 11,
        slug: 'ent',
        title_en: 'ENT / Otolaryngology',
        title_fa: 'گوش، حلق و بینی',
        description_en: 'Ear, nose, and throat care with advanced diagnostic tools.',
        description_fa: 'مراقبت از گوش، حلق و بینی با ابزارهای تشخیصی پیشرفته.',
        icon_name: 'Ear',
        color_class: 'bg-amber-100 text-amber-600',
        image: 'http://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
    },
    {
        id: 12,
        slug: 'dentistry',
        title_en: 'Dentistry',
        title_fa: 'دندان‌پزشکی',
        description_en: 'Complete dental care including preventive, restorative, and cosmetic dentistry.',
        description_fa: 'مراقبت کامل دندان شامل دندان‌پزشکی پیشگیری، ترمیمی و زیبایی.',
        icon_name: 'Smile',
        color_class: 'bg-cyan-100 text-cyan-600',
        image: 'http://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'
    },
];

export default function ServicesPage() {
    const t = useTranslations('services');
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const [services] = useState(MOCK_SERVICES);

    const renderIcon = (name: string, size = 32) => {
        const Icon = (LucideIcons as any)[name] || LucideIcons.Activity;
        return <Icon size={size} />;
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-12 pt-32" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-20">
                    <span className="px-5 py-2 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6 inline-block">
                        {isRTL ? 'برتری در مراقبت‌های بهداشتی' : 'HEALTHCARE EXCELLENCE'}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter">
                        {isRTL ? 'تخصص‌های پزشکی' : 'Expert Medical'} <span className="text-blue-600">{isRTL ? 'برتر' : 'Specialties'}</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        {isRTL
                            ? 'طیف گسترده‌ای از بخش‌های پزشکی تخصصی را بررسی کنید، جایی که فناوری روز با مراقبت دلسوزانه ترکیب می‌شود.'
                            : 'Explore our comprehensive range of specialized medical departments, where cutting-edge technology meets expert compassionate care.'
                        }
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service) => (
                        <Link
                            key={service.id}
                            href={`/services/${service.slug}`}
                            className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-transparent hover:border-blue-100 flex flex-col items-center text-center"
                        >
                            <div className={`w-20 h-20 rounded-[1.5rem] ${service.color_class} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                                {renderIcon(service.icon_name, 36)}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                                {isRTL ? service.title_fa : service.title_en}
                            </h3>
                            <p className="text-slate-500 font-medium leading-relaxed text-sm mb-6 flex-grow">
                                {isRTL ? service.description_fa : service.description_en}
                            </p>
                            <div className="pt-6 border-t border-slate-50 w-full flex justify-center">
                                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 text-white text-sm font-bold rounded-xl group-hover:gap-3 transition-all shadow-lg shadow-blue-500/20">
                                    {isRTL ? 'کشف کنید' : 'DISCOVER'}
                                    <LucideIcons.ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-32 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden shadow-3xl group">
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black leading-tight max-w-2xl mx-auto">
                            {isRTL ? 'آماده تجربه مراقبت‌های بهداشتی درجه یک هستید؟' : 'Ready to experience world-class healthcare?'}
                        </h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
                            {isRTL
                                ? 'تیم متخصصان ما آماده ارائه مراقبت‌های شخصی‌سازی شده به شماست. امروز با ما تماس بگیرید.'
                                : 'Our team of experts is ready to provide you with the personalized care you deserve. Connect with us today for a consultation.'
                            }
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 pt-6">
                            <Link href={`/doctors`} className="bg-blue-600 text-white px-10 py-5 rounded-luxury font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 hover:scale-105">
                                {isRTL ? 'رزرو نوبت' : 'Book Appointment'}
                            </Link>
                            <button className="bg-white/5 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all border border-white/10">
                                {isRTL ? 'تماس با ما' : 'Contact Us'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

