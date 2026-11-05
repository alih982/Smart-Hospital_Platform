'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Video, 
    Phone, 
    User, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    ChevronRight, 
    Search, 
    FileText,
    MessageCircle,
    Loader2,
    Stethoscope
} from 'lucide-react';

interface AppointmentData {
    id: string;
    doctor_name: string;
    specialty?: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    type?: string;
    notes?: string;
    patient_id?: string;
    patient_name?: string;
    created_at?: string;
    fee?: number;
}

export default function AppointmentsPage() {
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const router = useRouter();
    
    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'completed'>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const loadFromLocalStorage = () => {
        const localAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        setAppointments(localAppointments);
    };

    const fetchAppointments = async () => {
        try {
            // Try to get from API
            const apiBase = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : 'http://magicai.runflare.run/api/v1';
            const response = await fetch(`${apiBase}/appointments/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setAppointments(data);
                } else {
                    loadFromLocalStorage();
                }
            } else {
                loadFromLocalStorage();
            }
        } catch (error) {
            console.log('Loading from localStorage...');
            loadFromLocalStorage();
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'confirmed':
                return { 
                    label: isRTL ? 'تایید شده' : 'Confirmed', 
                    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                    icon: CheckCircle,
                };
            case 'pending':
                return { 
                    label: isRTL ? 'در انتظار' : 'Pending', 
                    color: 'bg-amber-50 text-amber-600 border-amber-200',
                    icon: AlertCircle,
                };
            case 'completed':
                return { 
                    label: isRTL ? 'تکمیل شده' : 'Completed', 
                    color: 'bg-slate-50 text-slate-600 border-slate-200',
                    icon: CheckCircle,
                };
            case 'cancelled':
                return {
                    label: isRTL ? 'لغو شده' : 'Cancelled',
                    color: 'bg-red-50 text-red-600 border-red-200',
                    icon: XCircle,
                };
            default:
                return { 
                    label: status, 
                    color: 'bg-gray-50 text-gray-600 border-gray-200',
                    icon: AlertCircle,
                };
        }
    };

    const getTypeIcon = (type: string) => {
        if (type === 'online') return Video;
        if (type === 'clinic') return MapPin;
        return Calendar;
    };

    const filteredAppointments = appointments.filter((apt) => {
        const matchesSearch = apt.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && apt.status === filterStatus;
    });

    const upcomingCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
    const completedCount = appointments.filter(a => a.status === 'completed').length;

    const handleViewPrescription = (appointment: AppointmentData) => {
        router.push(`/${locale}/dashboard/prescriptions`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 font-medium">
                        {isRTL ? 'در حال بارگذاری...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Calendar className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {isRTL ? 'نوبت‌های من' : 'My Appointments'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isRTL 
                                ? 'مدیریت و پیگیری نوبت‌های پزشکی' 
                                : 'Manage and track your medical appointments'
                            }
                        </p>
                    </div>
                </div>

                <Link 
                    href="/doctors"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-[1.5rem] font-black text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                    {isRTL ? 'رزرو نوبت جدید' : 'Book New'}
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: isRTL ? 'نوبت‌های آینده' : 'Upcoming', value: upcomingCount, color: 'from-blue-500 to-cyan-500', icon: Calendar },
                    { label: isRTL ? 'در انتظار' : 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: 'from-amber-500 to-orange-500', icon: Clock },
                    { label: isRTL ? 'تکمیل شده' : 'Completed', value: completedCount, color: 'from-emerald-500 to-teal-500', icon: CheckCircle },
                ].map((stat, idx) => (
                    <div key={idx} className="group relative bg-white rounded-[2rem] p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:-translate-y-1 transition-all duration-300">
                        <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity`}></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                <stat.icon className="text-white" size={22} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-soft-md">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={isRTL ? 'جستجو در نوبت‌ها...' : 'Search appointments...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 font-medium"
                        />
                    </div>
                    <div className="flex gap-3">
                        {[
                            { key: 'all', label: isRTL ? 'همه' : 'All' },
                            { key: 'confirmed', label: isRTL ? 'تایید شده' : 'Confirmed' },
                            { key: 'pending', label: isRTL ? 'در انتظار' : 'Pending' },
                            { key: 'completed', label: isRTL ? 'تکمیل شده' : 'Completed' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setFilterStatus(item.key as any)}
                                className={`px-5 py-3 rounded-2xl font-black text-sm transition-all ${
                                    filterStatus === item.key
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                        {isRTL ? 'نوبتی یافت نشد' : 'No Appointments Found'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isRTL 
                            ? 'شما هنوز نوبتی ندارید.' 
                            : "You don't have any appointments yet."
                        }
                    </p>
                    <Link 
                        href="/doctors"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-[1.5rem] font-black text-sm hover:shadow-xl hover:shadow-blue-500/25 transition-all"
                    >
                        {isRTL ? 'رزرو نوبت' : 'Book Appointment'}
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredAppointments.map((appointment) => {
                        const statusConfig = getStatusConfig(appointment.status);
                        const TypeIcon = getTypeIcon(appointment.type || 'clinic');
                        
                        return (
                            <div 
                                key={appointment.id}
                                className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-soft-md hover:shadow-lg transition-all cursor-pointer group"
                                onClick={() => setSelectedAppointment(appointment)}
                            >
                                {/* Appointment Header */}
                                <div className="p-8 bg-gradient-to-l from-gray-50 to-white border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <Stethoscope className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-gray-900">
                                                {appointment.doctor_name || (isRTL ? 'پزشک معالج' : 'Doctor')}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                                    <User className="w-3 h-3" />
                                                    {appointment.specialty || (isRTL ? 'تخصص' : 'Specialty')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium mt-1">
                                                {appointment.id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 border ${statusConfig.color}`}>
                                            <statusConfig.icon size={14} />
                                            {statusConfig.label}
                                        </span>
                                        <ChevronRight className={`w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {/* Appointment Details */}
                                <div className="p-8">
                                    <div className="flex flex-wrap items-center gap-6 mb-6">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-5 h-5 text-blue-500" />
                                            <span className="font-bold">{appointment.appointment_date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="w-5 h-5 text-blue-500" />
                                            <span className="font-bold">{appointment.appointment_time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <TypeIcon className="w-5 h-5 text-blue-500" />
                                            <span className="font-bold">
                                                {appointment.type === 'online' 
                                                    ? (isRTL ? 'مشاوره آنلاین' : 'Online Consultation')
                                                    : (isRTL ? 'ویزیت حضوری' : 'In-Person Visit')
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {appointment.notes && (
                                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
                                            <p className="text-sm text-amber-800 font-medium">{appointment.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Footer */}
                                <div className="px-8 pb-8 pt-0 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {appointment.status === 'confirmed' && (
                                            <>
                                                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all">
                                                    <Video className="w-4 h-4" />
                                                    {isRTL ? 'شروع ویدیو چت' : 'Start Video Chat'}
                                                </button>
                                                <Link 
                                                    href="/dashboard/messages"
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-600 rounded-2xl font-bold text-sm hover:bg-purple-100 transition-all"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    {isRTL ? 'پیام به پزشک' : 'Message Doctor'}
                                                </Link>
                                            </>
                                        )}
                                        {(appointment.status === 'completed' || appointment.status === 'confirmed') && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewPrescription(appointment);
                                                }}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all"
                                            >
                                                <FileText className="w-4 h-4" />
                                                {isRTL ? 'مشاهده نسخه' : 'View Prescription'}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {appointment.status === 'pending' && (
                                        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all">
                                            <XCircle className="w-4 h-4" />
                                            {isRTL ? 'لغو نوبت' : 'Cancel Appointment'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Appointment Detail Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedAppointment(null)}>
                    <div 
                        className="bg-white rounded-[3rem] max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{selectedAppointment.doctor_name}</h2>
                                    <p className="text-sm text-gray-500">{selectedAppointment.specialty}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedAppointment(null)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <XCircle className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase">{isRTL ? 'تاریخ' : 'Date'}</p>
                                    <p className="font-black text-gray-900">{selectedAppointment.appointment_date}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase">{isRTL ? 'زمان' : 'Time'}</p>
                                    <p className="font-black text-gray-900">{selectedAppointment.appointment_time}</p>
                                </div>
                            </div>

                            {selectedAppointment.notes && (
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <p className="text-xs font-bold text-amber-600 uppercase">{isRTL ? 'یادداشت‌ها' : 'Notes'}</p>
                                    <p className="text-sm text-gray-700 mt-1">{selectedAppointment.notes}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                                {selectedAppointment.status === 'confirmed' && (
                                    <>
                                        <Link 
                                            href="/dashboard/messages"
                                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl font-bold text-center hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                                        >
                                            {isRTL ? 'پیام به پزشک' : 'Message Doctor'}
                                        </Link>
                                        <button className="w-full py-4 bg-purple-50 text-purple-600 rounded-2xl font-bold hover:bg-purple-100 transition-all">
                                            {isRTL ? 'شروع ویدیو چت' : 'Start Video Chat'}
                                        </button>
                                    </>
                                )}
                                <button 
                                    onClick={() => setSelectedAppointment(null)}
                                    className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    {isRTL ? 'بستن' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

