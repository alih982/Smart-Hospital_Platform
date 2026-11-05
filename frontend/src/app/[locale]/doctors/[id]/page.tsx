'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
    Star, MapPin, Clock, CheckCircle2, Award, BookOpen, Phone, Share2, 
    Calendar, ChevronRight, Video, Building2, Wallet, Loader2, Check,
    FileText, CreditCard, MessageCircle, AlertCircle
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { doctorService, DoctorDetail } from '@/services/doctorService';

// Mock data for fallback
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
        first_name_fa: 'رضا',
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

interface AppointmentData {
    doctor_id: string;
    doctor_name: string;
    specialty: string;
    date: string;
    time: string;
    type: 'online' | 'clinic';
    fee: number;
    notes?: string;
}

export default function DoctorProfile() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const t = useTranslations();
    const locale = useLocale();
    const isRTL = locale === 'fa';

    const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [bookingType, setBookingType] = useState<'online' | 'clinic'>('clinic');
    const [notes, setNotes] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Fetch doctor data from API
    useEffect(() => {
        const fetchDoctor = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                setError(null);
                const data = await doctorService.getDoctorById(id);
                setDoctor(data);
            } catch (err: any) {
                console.error('Error fetching doctor:', err);
                // Fallback to mock data if API fails
                const mockDoctor = MOCK_DOCTORS.find(d => d.id.toString() === id);
                if (mockDoctor) {
                    setDoctor({
                        ...mockDoctor,
                        bio: 'متخصص قلب و عروق با بیش از 15 سال سابقه درخشان در زمینه تشخیص و درمان بیماری‌های قلبی...',
                        education: 'دکتری تخصصی قلب و عروق از دانشگاه تهران',
                        clinic_address: 'تهران، خیابان ولیعصر، پایین‌تر از میدان ونک، طبقه چهارم',
                        sub_specialty: 'آنژیوگرافی',
                        email: 'doctor@example.com',
                        medical_council_number: '12345678',
                        working_hours: [
                            { day_of_week: 0, day_name: 'شنبه', start_time: '09:00', end_time: '14:00', is_active: true },
                            { day_of_week: 1, day_name: 'یکشنبه', start_time: '09:00', end_time: '14:00', is_active: true },
                            { day_of_week: 2, day_name: 'دوشنبه', start_time: '15:00', end_time: '20:00', is_active: true },
                            { day_of_week: 3, day_name: 'سه‌شنبه', start_time: '09:00', end_time: '14:00', is_active: true },
                            { day_of_week: 4, day_name: 'چهارشنبه', start_time: '15:00', end_time: '20:00', is_active: true },
                        ]
                    } as any);
                } else {
                    setError(err.response?.data?.message || (isRTL ? 'خطا در دریافت اطلاعات پزشک' : 'Error fetching doctor data'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [id, isRTL]);

    const days = isRTL
        ? ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
        : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

    const handleBookAppointment = async () => {
        if (!selectedDate || !selectedTime || !doctor) {
            alert(isRTL ? 'لطفا تاریخ و زمان را انتخاب کنید' : 'Please select date and time');
            return;
        }

        setBookingLoading(true);

        // Get user info
        const storedUser = localStorage.getItem('user');
        let userName = isRTL ? 'بیمار' : 'Patient';
        let userId = '1';
        
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userName;
                userId = userData.id || userData.user_id || '1';
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        // Create appointment data
        const appointment: AppointmentData = {
            doctor_id: doctor.id.toString(),
            doctor_name: doctor.full_name,
            specialty: doctor.specialty_name,
            date: selectedDate,
            time: selectedTime,
            type: bookingType,
            fee: doctor.fee,
            notes: notes
        };

        // Save to localStorage
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const newAppointment = {
            id: `APP-${Date.now()}`,
            ...appointment,
            patient_id: userId,
            patient_name: userName,
            status: 'pending_payment',
            payment_status: 'pending',
            created_at: new Date().toISOString()
        };
        
        appointments.push(newAppointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Simulate API delay
        setTimeout(() => {
            setBookingLoading(false);
            setBookingSuccess(true);
            
            // Redirect to appointment payment page
            setTimeout(() => {
                router.push(`/${locale}/appointment/payment/${newAppointment.id}`);
            }, 2000);
        }, 1500);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                    <p className="text-slate-500 font-medium">
                        {isRTL ? 'در حال بارگذاری...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !doctor) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
                <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <p className="text-slate-500 font-medium">
                        {error || (isRTL ? 'پزشک یافت نشد' : 'Doctor not found')}
                    </p>
                    <Link 
                        href={`/${locale}/doctors`}
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        {isRTL ? 'بازگشت به لیست پزشکان' : 'Back to Doctors'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50" dir={isRTL ? "rtl" : "ltr"}>
            {/* Profile Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-16 lg:px-12">
                    <div className={`flex flex-col lg:flex-row gap-12 items-center lg:items-start ${isRTL ? 'text-center lg:text-right' : 'text-center lg:text-left'}`}>
                        <div className="relative group">
                            <div className="w-56 h-56 rounded-[3.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-1 shadow-2xl overflow-hidden">
                                {doctor.profile_image ? (
                                    <Image src={doctor.profile_image} alt={doctor.full_name} fill className="object-cover rounded-[3.3rem]" />
                                ) : (
                                    <div className="w-full h-full bg-white rounded-[3.3rem] flex items-center justify-center text-7xl">👨‍⚕️</div>
                                )}
                            </div>
                            <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-black px-5 py-2 rounded-full shadow-lg border-2 border-white uppercase tracking-widest`}>
                                {isRTL ? 'آنلاین' : 'Online'}
                            </div>
                        </div>

                        <div className="flex-1 space-y-8 mt-4 lg:mt-0">
                            <div className="space-y-3">
                                <div className="flex items-center justify-center lg:justify-start gap-3">
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{doctor.full_name}</h1>
                                    {doctor.is_verified && <CheckCircle2 className="text-blue-500 fill-blue-50 shrink-0" size={32} />}
                                </div>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                                    <span className="px-5 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black tracking-widest uppercase">
                                        {doctor.specialty_name}
                                    </span>
                                </div>
                            </div>

                            <div className={`flex flex-wrap justify-center lg:justify-start gap-8 md:gap-10 py-6 border-y border-slate-50`}>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-slate-900">{doctor.years_of_experience}+</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                        {isRTL ? 'سال تجربه' : 'Years Exp'}
                                    </p>
                                </div>
                                <div className="text-center px-6 md:px-10 border-x border-slate-100">
                                    <div className="flex items-center gap-2 justify-center">
                                        <Star className="text-yellow-500 fill-yellow-500" size={24} />
                                        <p className="text-3xl font-black text-slate-900">{doctor.rating}</p>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                        {doctor.review_count} {isRTL ? 'نظر' : 'Reviews'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-slate-900">1250+</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                        {isRTL ? 'ویزیت' : 'Visits'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {bookingSuccess && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] p-12 text-center animate-in zoom-in-95 fade-in duration-300">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">
                            {isRTL ? 'نوبت شما ثبت شد!' : 'Appointment Booked!'}
                        </h2>
                        <p className="text-slate-500">
                            {isRTL ? 'به صفحه پرداخت منتقل می‌شوید...' : 'Redirecting to payment...'}
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-16 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Left: About & Location */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="bg-white p-10 md:p-12 rounded-[3rem] shadow-sm border border-slate-50">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                {isRTL ? 'درباره پزشک' : 'About'}
                            </h3>
                        </div>
                        <p className="font-medium text-slate-600 leading-relaxed text-lg mb-8">
                            {doctor.bio}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-start gap-5">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">🎓</div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {isRTL ? 'تحصیلات' : 'Education'}
                                    </p>
                                    <p className="text-sm font-black text-slate-800 leading-relaxed">{doctor.education}</p>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-start gap-5">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">🎖️</div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {isRTL ? 'شماره نظام پزشکی' : 'Council Number'}
                                    </p>
                                    <p className="text-sm font-black text-slate-800">{doctor.medical_council_number}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-10 md:p-12 rounded-[3rem] shadow-sm border border-slate-50">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                <MapPin size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                {isRTL ? 'آدرس مطب' : 'Location'}
                            </h3>
                        </div>
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <p className="text-xl text-slate-900 font-black">{doctor.clinic_name}</p>
                                    <p className="text-slate-500 font-bold leading-relaxed">{doctor.clinic_address}</p>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">
                                        {isRTL ? 'مشاهده روی نقشه' : 'View Map'}
                                    </button>
                                    <button className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                                        {isRTL ? 'تماس' : 'Call'}
                                    </button>
                                </div>
                            </div>
                            <div className="w-full md:w-72 h-56 bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-6 text-center gap-3">
                                <MapPin size={36} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                    {isRTL ? 'نقشه به زودی اضافه می‌شود' : 'Map Integration Coming Soon'}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: Booking Widget */}
                <div className="space-y-8 h-fit lg:sticky lg:top-24">
                    <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-blue-50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

                        {/* Booking Type */}
                        <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                            <button
                                onClick={() => setBookingType('clinic')}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${bookingType === 'clinic' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                <Building2 size={16} />
                                {isRTL ? 'حضوری' : 'In-Clinic'}
                            </button>
                            <button
                                onClick={() => setBookingType('online')}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${bookingType === 'online' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                <Video size={16} />
                                {isRTL ? 'ویدیو' : 'Video Call'}
                            </button>
                        </div>

                        {/* Date Selection */}
                        <div className="space-y-4">
                            <label className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ${isRTL ? 'pr-2' : 'pl-2'}`}>
                                {isRTL ? 'انتخاب روز' : 'Select Day'}
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {(doctor.working_hours || []).filter((wh: any) => wh.is_active).map((wh: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedDate(wh.day_name);
                                            setSelectedTime('');
                                        }}
                                        className={`h-16 md:h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                                            selectedDate === wh.day_name
                                                ? 'bg-blue-600 text-white shadow-xl scale-105'
                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                                        }`}
                                    >
                                        <span className="text-[10px] font-black uppercase">{days[wh.day_of_week]?.substring(0, 3) || ''}</span>
                                        <span className="text-lg font-black mt-1">
                                            {new Date().getDate() + idx + 1}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Selection */}
                        {selectedDate && (
                            <div className="space-y-4 mt-8 animate-fade-in">
                                <label className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ${isRTL ? 'pr-2' : 'pl-2'}`}>
                                    {isRTL ? 'انتخاب زمان' : 'Select Time'}
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-3 rounded-xl font-black text-xs transition-all ${
                                                selectedTime === time
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="mt-8">
                            <label className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ${isRTL ? 'pr-2' : 'pl-2'}`}>
                                {isRTL ? 'یادداشت (اختیاری)' : 'Notes (Optional)'}
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={isRTL ? 'علائم یا سوالات خود را بنویسید...' : 'Write your symptoms or questions...'}
                                className="w-full mt-2 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-sm text-slate-700"
                                rows={3}
                            />
                        </div>

                        {/* Price & Book */}
                        <div className="pt-8 border-t border-slate-50 text-center space-y-6">
                            <div className="flex justify-between items-center bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        {isRTL ? 'هزینه:' : 'Fee:'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-slate-900">${doctor.fee}</span>
                                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        {isRTL ? 'جلسه' : '/ session'}
                                    </span>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleBookAppointment}
                                disabled={!selectedDate || !selectedTime || bookingLoading}
                                className="block w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-6 rounded-[3.5rem] font-black text-lg shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-center group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {bookingLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={22} />
                                        {isRTL ? 'در حال رزرو...' : 'Booking...'}
                                    </span>
                                ) : (
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {isRTL ? 'رزرو نوبت' : 'Book Appointment'}
                                        <Calendar size={22} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>

                            {/* Info */}
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <AlertCircle size={14} />
                                <span>{isRTL ? 'پس از رزرو به صفحه پرداخت هدایت می‌شوید' : 'You will be redirected to payment after booking'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href={`/dashboard/messages`}
                            className="flex items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <MessageCircle className="w-5 h-5 text-slate-600" />
                            <span className="text-xs font-bold text-slate-600">{isRTL ? 'پیام' : 'Message'}</span>
                        </Link>
                        <Link
                            href={`/dashboard/prescriptions`}
                            className="flex items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <FileText className="w-5 h-5 text-slate-600" />
                            <span className="text-xs font-bold text-slate-600">{isRTL ? 'نسخه‌ها' : 'Prescriptions'}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

