'use client';

import { Search, Star, MapPin, Filter, ChevronRight, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';

// Mock data for doctors (works without backend)
const MOCK_SPECIALTIES = [
    { id: 1, name_en: 'Cardiology', name_fa: 'قلب و عروق' },
    { id: 2, name_en: 'Neurology', name_fa: 'مغز و اعصاب' },
    { id: 3, name_en: 'Ophthalmology', name_fa: 'چشم‌پزشکی' },
    { id: 4, name_en: 'Internal Medicine', name_fa: 'پزشکی داخلی' },
    { id: 5, name_en: 'Pediatrics', name_fa: 'کودکان' },
    { id: 6, name_en: 'Orthopedics', name_fa: 'ارتوپدی' },
    { id: 7, name_en: 'Dermatology', name_fa: 'پوست و مو' },
    { id: 8, name_en: 'Psychiatry', name_fa: 'روان‌پزشکی' },
];

const MOCK_DOCTORS = [
    {
        id: 1,
        first_name_fa: 'سارا',
        first_name_en: 'Sarah',
        last_name_fa: 'محمدی',
        last_name_en: 'Mohammadi',
        full_name: 'Dr. Sarah Mohammadi',
        specialty_name: 'Cardiology',
        clinic_name: 'Tehran Heart Center',
        city: 'Tehran',
        fee: 150,
        years_of_experience: 15,
        rating: 4.9,
        is_verified: true,
        profile_image: 'http://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop'
    },
    {
        id: 2,
        first_name_fa: 'علی',
        first_name_en: 'Ali',
        last_name_fa: 'رضایی',
        last_name_en: 'Rezaei',
        full_name: 'Dr. Ali Rezaei',
        specialty_name: 'Neurology',
        clinic_name: 'Brain Center',
        city: 'Tehran',
        fee: 200,
        years_of_experience: 12,
        rating: 4.8,
        is_verified: true,
        profile_image: 'http://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop'
    },
    {
        id: 3,
        first_name_fa: 'مریم',
        first_name_en: 'Maryam',
        last_name_fa: 'احمدی',
        last_name_en: 'Ahmadi',
        full_name: 'Dr. Maryam Ahmadi',
        specialty_name: 'Ophthalmology',
        clinic_name: 'Eye Care Clinic',
        city: 'Tehran',
        fee: 120,
        years_of_experience: 10,
        rating: 4.9,
        is_verified: true,
        profile_image: 'http://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=500&fit=crop'
    },
    {
        id: 4,
        first_name_fa: 'محمد',
        first_name_en: 'Mohammad',
        last_name_fa: 'کریمی',
        last_name_en: 'Karimi',
        full_name: 'Dr. Mohammad Karimi',
        specialty_name: 'Internal Medicine',
        clinic_name: 'Shiraz Medical Center',
        city: 'Shiraz',
        fee: 100,
        years_of_experience: 8,
        rating: 4.7,
        is_verified: true,
        profile_image: 'http://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=500&fit=crop'
    },
    {
        id: 5,
        first_name_fa: 'زهرا',
        first_name_en: 'Zahra',
        last_name_fa: 'رمانی',
        last_name_en: 'Ramezani',
        full_name: 'Dr. Zahra Ramezani',
        specialty_name: 'Pediatrics',
        clinic_name: 'Children Hospital',
        city: 'Tehran',
        fee: 110,
        years_of_experience: 14,
        rating: 4.9,
        is_verified: true,
        profile_image: 'http://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=500&fit=crop'
    },
    {
        id: 6,
        first_name_fا: 'رضا',
        first_name_en: 'Reza',
        last_name_fa: 'محمدی',
        last_name_en: 'Mohammadi',
        full_name: 'Dr. Reza Mohammadi',
        specialty_name: 'Orthopedics',
        clinic_name: 'Isfahan Ortho Center',
        city: 'Isfahan',
        fee: 180,
        years_of_experience: 18,
        rating: 4.8,
        is_verified: true,
        profile_image: 'http://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=500&fit=crop'
    },
];

export default function DoctorsPage() {
    const t = useTranslations('doctors');
    const locale = useLocale();
    const isRTL = locale === 'fa';

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');
    const [doctors, setDoctors] = useState(MOCK_DOCTORS);
    const [specialties, setSpecialties] = useState(MOCK_SPECIALTIES);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    // Filter doctors based on search
    useEffect(() => {
        setSearching(true);
        const timer = setTimeout(() => {
            let filtered = MOCK_DOCTORS;

            if (searchTerm) {
                filtered = filtered.filter(doc =>
                    doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doc.specialty_name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            if (selectedSpecialty !== 'all') {
                filtered = filtered.filter(doc =>
                    doc.specialty_name === MOCK_SPECIALTIES.find(s => s.id.toString() === selectedSpecialty)?.name_en
                );
            }

            setDoctors(filtered);
            setSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedSpecialty]);

    return (
        <div className="min-h-screen bg-white">
            {/* Luxury Hero Section */}
            <section className="relative h-[60vh] flex items-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-105">
                        <Image
                            src="http://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop"
                            alt="Background"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-white"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
                    <div className="max-w-4xl space-y-8">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-blue-200 tracking-[0.3em] uppercase">
                                {t('hero.tag')} • GLOBAL SPECIALIST NETWORK
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter">
                            {isRTL ? 'متخصص خود را' : 'Find Your'} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                                {isRTL ? 'پیدا کنید' : 'Exclusive Care.'}
                            </span>
                        </h1>
                        <p className="text-xl text-slate-300 font-bold max-w-2xl leading-relaxed">
                            {t('hero.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 -mt-24 pb-24 relative z-20">
                {/* Search & Filter Section */}
                <div className="bg-white p-6 md:p-10 rounded-ultra shadow-3xl shadow-slate-200/50 border border-slate-100 mb-16">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-[2] relative group">
                            <Search className={`${isRTL ? 'right-8' : 'left-8'} absolute top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:scale-110 transition-transform`} size={24} />
                            <input
                                type="text"
                                placeholder={t('search.placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-20 pl-8' : 'pl-20 pr-8'} py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-indigo-500 focus:outline-none font-bold text-slate-800 shadow-inner transition-all text-lg`}
                            />
                            {searching && (
                                <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-8' : 'right-8'} text-indigo-500 animate-spin`}>
                                    <Loader2 size={24} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 relative">
                            <Filter className={`${isRTL ? 'right-8' : 'left-8'} absolute top-1/2 -translate-y-1/2 text-indigo-500 z-10`} size={24} />
                            <select
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-20 pl-8' : 'pl-20 pr-8'} py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-indigo-500 focus:outline-none font-black text-slate-800 shadow-inner appearance-none transition-all text-lg`}
                            >
                                <option value="all">{t('specialties.all')}</option>
                                {specialties.map(spec => (
                                    <option key={spec.id} value={spec.id}>
                                        {isRTL ? spec.name_fa : spec.name_en}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex justify-between items-center mb-12 px-8">
                    <div className="space-y-1">
                        <p className="text-slate-400 font-black tracking-[0.2em] uppercase text-[10px]">
                            {isRTL ? 'متخصصان برگزیده' : 'Curated Specialists'}
                        </p>
                        <h3 className="text-xl font-black text-slate-900">
                            {t('search.showingResults', { count: doctors.length })}
                        </h3>
                    </div>
                    <div className="h-px flex-1 bg-slate-100 mx-12 hidden md:block"></div>
                    <button className="flex items-center gap-3 text-indigo-600 font-black hover:gap-5 transition-all uppercase text-xs tracking-widest bg-indigo-50 px-8 py-4 rounded-ultra">
                        {t('search.popular')} <ChevronRight size={18} />
                    </button>
                </div>

                {/* Doctors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => <DoctorSkeleton key={i} />)
                    ) : doctors.length > 0 ? (
                        doctors.map(doctor => (
                            <DoctorCard key={doctor.id} doctor={doctor} isRTL={isRTL} t={t} locale={locale} />
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center space-y-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-300 border border-slate-100">
                                <Search size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">{t('search.noResults')}</h3>
                            <p className="text-slate-400 font-bold max-w-sm mx-auto">{t('search.tryDifferent')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DoctorCard({ doctor, isRTL, t, locale }: { doctor: any, isRTL: boolean, t: any, locale: string }) {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all border border-slate-50 group flex flex-col overflow-hidden">
            {/* Doctor Photo */}
            <div className="p-4">
                <div className="relative h-72 rounded-[2rem] overflow-hidden bg-slate-100">
                    {doctor.profile_image ? (
                        <Image
                            src={doctor.profile_image}
                            alt={doctor.full_name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <MapPin size={60} strokeWidth={1} />
                        </div>
                    )}
                    <div className={`absolute top-5 ${isRTL ? 'left-5' : 'right-5'} bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl`}>
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-black text-slate-800">{doctor.rating}</span>
                    </div>
                    <div className={`absolute bottom-5 ${isRTL ? 'right-5' : 'left-5'} bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-blue-500/40`}>
                        {doctor.years_of_experience} {t('card.exp')}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-8 pt-2 space-y-6 flex-1 flex flex-col">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">
                            {doctor.full_name}
                        </h3>
                        {doctor.is_verified && <CheckCircle2 size={20} className="text-blue-500 fill-blue-50 shrink-0" />}
                    </div>
                    <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black tracking-widest uppercase border border-blue-100">
                        {doctor.specialty_name}
                    </span>
                </div>

                <div className="space-y-4 text-sm font-bold text-slate-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                            <MapPin size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-800 font-black">{doctor.clinic_name}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{doctor.city}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center border border-green-100">
                            <Clock size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-green-600 font-black tracking-tight">{t('card.availability.today')}</span>
                            <span className="text-[10px] font-black text-green-600/50 uppercase tracking-widest mt-0.5">Booking Status</span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <div className="space-y-1">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('card.consultation')}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-slate-900">${doctor.fee}</span>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('card.session')}</span>
                        </div>
                    </div>
                    <Link
                        href={`/doctors/${doctor.id}`}
                        className="px-10 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[3rem] font-black hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all shadow-2xl hover:shadow-blue-500/25 active:scale-95 text-xs tracking-widest uppercase group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {t('card.bookNow')}
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function DoctorSkeleton() {
    return (
        <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/40 border border-slate-50 flex flex-col h-full animate-pulse">
            <div className="h-72 bg-slate-100 rounded-[2rem] mb-6"></div>
            <div className="px-4 space-y-6">
                <div className="space-y-3">
                    <div className="h-8 bg-slate-100 rounded-xl w-2/3"></div>
                    <div className="h-6 bg-slate-100 rounded-lg w-1/3"></div>
                </div>
                <div className="space-y-4 pt-4">
                    <div className="h-12 bg-slate-50 rounded-2xl w-full"></div>
                    <div className="h-12 bg-slate-50 rounded-2xl w-full"></div>
                </div>
                <div className="pt-8 flex justify-between items-center mt-auto">
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-16"></div>
                        <div className="h-8 bg-slate-100 rounded w-24"></div>
                    </div>
                    <div className="h-14 bg-slate-100 rounded-[1.5rem] w-32"></div>
                </div>
            </div>
        </div>
    );
}

