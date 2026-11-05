'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import {
  Search, Heart, Brain, Eye, Activity, Stethoscope,
  Shield, Star, ArrowLeft, CheckCircle, Calendar, MessageSquare,
  Pill, Hospital, ChevronRight, ShoppingCart, UserCheck, Clock, MapPin,
  Sparkles, ArrowRight, ActivitySquare, BadgeCheck, Stethoscope as StethoscopeIcon,
  HeartPulse, Plus, Truck
} from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === 'fa';
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  // Sample doctors with availability times
  const doctors = [
    { id: 1, name: isRTL ? 'دکتر سارا محمدی' : 'Dr. Sarah Mohammadi', specialty: isRTL ? 'فلوشیپ فوق‌تخصصی قلب' : 'Cardiovascular Fellowship', image: '/images/doctors/01.jpg', rating: 4.9, fee: 150, availableTimes: ['09:00', '10:30', '14:00', '16:30'], city: isRTL ? 'تهران' : 'Tehran', experience: '12 Yrs' },
    { id: 2, name: isRTL ? 'پروفسور علی رضایی' : 'Prof. Ali Rezaei', specialty: isRTL ? 'جراحی پیشرفته مغز و اعصاب' : 'Advanced Neurosurgery', image: '/images/doctors/02.jpg', rating: 4.8, fee: 200, availableTimes: ['08:00', '11:00', '13:30', '15:00'], city: isRTL ? 'تهران' : 'Tehran', experience: '18 Yrs' },
    { id: 3, name: isRTL ? 'دکتر مریم احمدی' : 'Dr. Maryam Ahmadi', specialty: isRTL ? 'میکرو سرجری چشم' : 'Ophthalmic Microsurgery', image: '/images/doctors/03.jpg', rating: 4.9, fee: 120, availableTimes: ['09:30', '12:00', '14:30', '17:00'], city: isRTL ? 'تهران' : 'Tehran', experience: '10 Yrs' },
    { id: 4, name: isRTL ? 'دکتر محمد کریمی' : 'Dr. Mohammad Karimi', specialty: isRTL ? 'متخصص داخلی و غدد' : 'Internal Med & Endocrinology', image: '/images/doctors/04.jpg', rating: 4.7, fee: 100, availableTimes: ['08:30', '10:00', '13:00', '16:00'], city: isRTL ? 'شیراز' : 'Shiraz', experience: '15 Yrs' },
  ];

  // Sample medicines/pharmacy products
  const medicines = [
    { id: 1, name: isRTL ? 'آموکسی‌سیلین ۵۰۰' : 'Amoxicillin 500mg', category: isRTL ? 'آنتی‌بیوتیک' : 'Antibiotic', price: 45000, image: '/images/pharmacy/01.jpg', inStock: true, discount: 15 },
    { id: 2, name: isRTL ? 'متفورمین ۵۰۰' : 'Metformin 500mg', category: isRTL ? 'دیابت' : 'Diabetes', price: 32000, image: '/images/pharmacy/02.jpg', inStock: true, discount: 0 },
    { id: 3, name: isRTL ? 'لوزارتان ۵۰' : 'Losartan 50mg', category: isRTL ? 'فشار خون' : 'Blood Pressure', price: 28000, image: '/images/pharmacy/03.jpg', inStock: true, discount: 10 },
    { id: 4, name: isRTL ? 'آتورواستاتین ۲۰' : 'Atorvastatin 20mg', category: isRTL ? 'کلسترول' : 'Cholesterol', price: 55000, image: '/images/pharmacy/04.jpg', inStock: false, discount: 0 },
    { id: 5, name: isRTL ? 'پاراستامول ۵۰۰' : 'Paracetamol 500mg', category: isRTL ? 'مسکن' : 'Pain Relief', price: 15000, image: '/images/pharmacy/05.jpg', inStock: true, discount: 20 },
    { id: 6, name: isRTL ? 'ستیریزین ۱۰' : 'Cetirizine 10mg', category: isRTL ? 'آلرژی' : 'Allergy', price: 22000, image: '/images/pharmacy/06.jpg', inStock: true, discount: 0 },
  ];

  const departments = [
    { icon: Heart, name: isRTL ? 'قلب و عروق' : 'Cardiology', desc: isRTL ? 'مراقبت‌های قلبی' : 'Heart Care', color: 'from-rose-400 to-red-600', shadow: 'shadow-rose-500/20' },
    { icon: Brain, name: isRTL ? 'علوم اعصاب' : 'Neurology', desc: isRTL ? 'مغز و اعصاب' : 'Brain & Nerves', color: 'from-violet-400 to-purple-600', shadow: 'shadow-purple-500/20' },
    { icon: Eye, name: isRTL ? 'کلینیک بینایی' : 'Ophthalmology', desc: isRTL ? 'چشم‌پزشکی' : 'Eye Care', color: 'from-blue-400 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { icon: Activity, name: isRTL ? 'طب داخلی' : 'Internal Med', desc: isRTL ? 'گوارش و غدد' : 'General Health', color: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { icon: StethoscopeIcon, name: isRTL ? 'طب اطفال' : 'Pediatrics', desc: isRTL ? 'سلامت کودکان' : 'Child Health', color: 'from-amber-400 to-orange-600', shadow: 'shadow-amber-500/20' },
    { icon: Hospital, name: isRTL ? 'ارتوپدی' : 'Orthopedics', desc: isRTL ? 'مفاصل و استخوان' : 'Bones & Joints', color: 'from-sky-400 to-blue-600', shadow: 'shadow-sky-500/20' },
  ];

  const stats = [
    { number: '۵۰۰+', label: isRTL ? 'متخصص خبره' : 'Elite Specialists', icon: BadgeCheck },
    { number: '۱.۲M+', label: isRTL ? 'بیمار درمان‌شده' : 'Patients Treated', icon: UserCheck },
    { number: '۹۹.۸٪', label: isRTL ? 'الگوریتم تشخیص صحیح' : 'Diagnostic Accuracy', icon: ActivitySquare },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? 'fa-IR' : 'en-US').format(price);
  };

  const addToCart = (medicine: any) => {
    const existingCart = JSON.parse(localStorage.getItem('pharmacy_temp_cart') || '[]');
    const existingIndex = existingCart.findIndex((item: any) => item.id === medicine.id);
    if (existingIndex >= 0) {
      existingCart[existingIndex].quantity += 1;
    } else {
      existingCart.push({ ...medicine, quantity: 1 });
    }
    localStorage.setItem('pharmacy_temp_cart', JSON.stringify(existingCart));
    setCartMessage(isRTL ? `${medicine.name} به سبد خرید اضافه شد!` : `${medicine.name} added to cart!`);
    setTimeout(() => setCartMessage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toast Message */}
      {cartMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-5 py-3 rounded-full shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300">
          {cartMessage}
        </div>
      )}

      {/* Hero Section - Centered Design */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden min-h-[85vh] flex items-center bg-mesh">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-royal-400/20 rounded-full blur-[80px] animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-secondary/10 rounded-full blur-[100px] animate-float-delayed"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-royal-200/50 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-royal-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-royal-500"></span>
              </span>
              <span className="text-xs font-bold text-primary-700 tracking-wide uppercase">
                {isRTL ? 'الگوریتم‌های پیشرفته سلامت' : 'Advanced Health AI'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight text-primary-950">
              {isRTL ? 'بیمارستان هوشمند' : 'Smart Hospital System'} <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-royal-600 to-royal-500">
                  {isRTL ? 'در اکوسیستم درمان' : 'in Healthcare.'}
                </span>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-full h-3 bg-royal-200/50 -z-10 rounded-full"></div>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-primary-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {isRTL
                ? 'ترکیب هوش مصنوعی، داده‌های بیومتریک و تخصص پزشکی برای ارائه درمان‌های پیشگامانه.'
                : 'Combining AI, biometric data, and medical expertise to deliver groundbreaking treatments.'}
            </p>

            {/* Search Box - Rounded full */}
            <div className="bg-white/80 backdrop-blur-2xl p-2 sm:p-2.5 rounded-full shadow-premium-lg border border-white/50 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 group">
                <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRTL ? 'right-4 left-auto' : 'left-4 right-auto'}`}>
                  <Search className="w-5 h-5 text-primary-400 group-focus-within:text-royal-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder={isRTL ? 'جستجوی پزشک، تخصص یا بیماری...' : 'Search doctor, specialty, or condition...'}
                  className={`w-full bg-transparent focus:outline-none text-primary-900 font-medium placeholder:text-primary-400 py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-full`}
                />
              </div>
              <div className="h-px sm:h-auto sm:w-px bg-border-strong mx-1"></div>
              <Link
                href="/doctors"
                className="btn-primary-gradient shrink-0 flex items-center justify-center gap-2 group px-6 py-3 rounded-full"
              >
                {isRTL ? 'جستجو' : 'Search'}
                <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-slate-200/50 max-w-lg mx-auto">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-2 group cursor-pointer">
                  <div className="flex items-center justify-center gap-2 text-primary-400 group-hover:text-royal-600 transition-colors">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-primary-950 tabular-nums tracking-tight group-hover:text-royal-600 transition-colors">{stat.number}</div>
                  <div className="text-xs font-bold text-primary-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 lg:py-20 relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-royal-600 font-bold tracking-widest uppercase text-xs mb-3 block">
              {isRTL ? 'دپارتمان‌های تخصصی' : 'Specialized Departments'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-950 tracking-tight">
              {isRTL ? 'مراکز تعالی پزشکی' : 'Centers of Medical Excellence'}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 max-w-6xl mx-auto">
            {departments.map((dept, idx) => (
              <Link
                key={idx}
                href={`/doctors?specialty=${dept.name}`}
                className="group bg-white rounded-3xl p-4 sm:p-5 flex flex-col items-center text-center relative overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-xl border border-slate-100"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${dept.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${dept.color} p-0.5 shadow-lg ${dept.shadow} mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500`}>
                  <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                    <dept.icon className={`w-7 h-7 text-transparent bg-clip-text bg-gradient-to-br ${dept.color}`} />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-primary-800 mb-1 group-hover:text-royal-600 transition-colors">{dept.name}</h3>
                <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{dept.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-16 lg:py-20 bg-slate-50 text-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-royal-400/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-3">
              {isRTL ? 'هسته مرکزی متخصصین' : 'Core Specialist Network'}
            </h2>
            <p className="text-slate-500 text-sm font-medium max-w-xl mx-auto">
              {isRTL
                ? 'دسترسی مستقیم به برترین اساتید و نخبگان پزشکی کشور.'
                : 'Direct access to the nation\'s top medical professors and elites.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-royal-500/15 hover:-translate-y-2 transition-all duration-300">
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full flex items-center gap-1.5 shadow-lg">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-black text-slate-800">{doctor.rating}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1.5 bg-royal-600 text-white rounded-full text-xs font-bold shadow-lg">
                      {doctor.experience}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {doctor.availableTimes.slice(0, 4).map((time, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold rounded-md">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="text-base font-black text-slate-800 mb-1 group-hover:text-royal-600 transition-colors">{doctor.name}</h3>
                  <p className="text-sm font-medium text-slate-500 mb-3 line-clamp-1">{doctor.specialty}</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-4">
                    <MapPin className="w-4 h-4 text-royal-500" />
                    {doctor.city}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isRTL ? 'تعرفه ویزیت' : 'Fee'}</span>
                      <p className="font-bold text-slate-800 text-lg">{formatPrice(doctor.fee)} <span className="text-xs text-slate-500 font-medium">{isRTL ? 'تومان' : 'IRR'}</span></p>
                    </div>
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-royal-50 border border-royal-200 flex items-center justify-center text-royal-600 group-hover:bg-royal-600 group-hover:text-white group-hover:border-royal-600 transition-all duration-300"
                    >
                      <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 text-sm font-semibold text-royal-600 bg-royal-50 px-5 py-2.5 rounded-full hover:bg-royal-100 transition-all"
            >
              {isRTL ? 'مشاهده همه' : 'View All'}
              <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pharmacy/Medicines Section */}
      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-royal-400/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 justify-start mb-3">
                <Pill className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-600 font-bold tracking-widest uppercase text-xs">
                  {isRTL ? 'داروخانه آنلاین' : 'Online Pharmacy'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-950 tracking-tight mb-3">
                {isRTL ? 'داروها و مکمل‌ها' : 'Medications & Supplements'}
              </h2>
              <p className="text-slate-500 text-sm font-medium max-w-xl">
                {isRTL
                  ? 'خرید آنلاین داروها و مکمل‌های غذایی با تحویل سریع.'
                  : 'Order medications and supplements online with fast delivery.'}
              </p>
            </div>
            <Link
              href="/pharmacy"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full hover:bg-emerald-100 transition-all"
            >
              {isRTL ? 'مشاهده همه' : 'View All'}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 max-w-6xl mx-auto">
            {medicines.map((medicine) => (
              <div
                key={medicine.id}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
              >
                <div className="relative h-36 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
                  <Image
                    src={medicine.image}
                    alt={medicine.name}
                    fill
                    className="object-cover p-3 group-hover:scale-105 transition-transform duration-500"
                  />
                  {medicine.discount > 0 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {isRTL ? `${medicine.discount}٪ تخفیف` : `${medicine.discount}% OFF`}
                    </div>
                  )}
                  {!medicine.inStock && (
                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full">{isRTL ? 'ناموجود' : 'Out of Stock'}</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{medicine.category}</span>
                  <h3 className="font-bold text-sm text-slate-800 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">{medicine.name}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">{isRTL ? 'قیمت:' : 'Price:'}</span>
                      <p className="font-black text-slate-800">{formatPrice(medicine.price)} <span className="text-xs text-slate-500 font-medium">{isRTL ? 'تومان' : 'IRR'}</span></p>
                    </div>
                    {medicine.inStock && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(medicine);
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/pharmacy"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-6 py-3 rounded-full hover:bg-emerald-100 transition-all"
            >
              {isRTL ? 'مشاهده داروخانه' : 'View Pharmacy'}
              <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Link>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm">
              <Truck className="w-4 h-4" />
              {isRTL ? 'تحویل رایگان' : 'Free Delivery'}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-[200px] bg-royal-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-2xl p-8 sm:p-10 md:p-12 rounded-[2.5rem] border border-white shadow-premium-lg text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-lg">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-950 mb-4 tracking-tight leading-tight">
              {isRTL ? 'سلامتی شما، مأموریت اصلی ماست.' : 'Your Health, Our Primary Mission.'}
            </h2>
            <p className="text-primary-600 text-sm sm:text-base font-medium mb-8 max-w-xl mx-auto leading-relaxed">
              {isRTL
                ? 'به ده‌ها هزار کاربری بپیوندید که پلتفرم هوشمند داکتریس را برای مدیریت یکپارچه سلامت خود انتخاب کرده‌اند.'
                : 'Join tens of thousands of users who have chosen the DoctorHub smart platform for their integrated health management.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="btn-primary-gradient px-6 sm:px-8 py-3 w-full sm:w-auto text-sm sm:text-base flex items-center justify-center gap-2 group rounded-full"
              >
                {isRTL ? 'عضویت در پلتفرم' : 'Join the Platform'}
                <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </Link>
              <Link
                href="/doctors"
                className="group relative px-6 sm:px-8 py-3 w-full sm:w-auto text-sm sm:text-base font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-royal-500 hover:text-royal-600 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:shadow-royal-500/10"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-royal-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  {isRTL ? 'جستجوی آزاد متخصصین' : 'Browse Network'}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}