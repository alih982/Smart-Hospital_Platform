'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import Link from 'next/link';
import { 
    FileText, 
    Search, 
    Filter, 
    Calendar, 
    User, 
    Pill, 
    Stethoscope,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Plus,
    Download,
    Eye,
    MoreVertical,
    RefreshCw,
    Loader2,
    Sparkles,
    Building2,
    CreditCard,
    ShoppingBag
} from 'lucide-react';
import { prescriptionService, Prescription } from '@/services/prescriptionService';

export default function PrescriptionsPage() {
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const router = useRouter();
    const t = useTranslations('dashboard');
    
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const loadFromLocalStorage = () => {
        // Load from localStorage for demo
        const localRx = JSON.parse(localStorage.getItem('prescriptions') || '[]');
        
        const transformedPrescriptions = localRx.map((rx: any) => ({
            id: rx.id,
            patient_id: rx.patient_id,
            patient_name: rx.patient_name,
            doctor_name: rx.doctor_name,
            doctor: rx.doctor || { id: '1', first_name: 'دکتر', last_name: 'سارا احمدی' },
            diagnosis_text: rx.diagnosis_text || rx.diagnosis,
            created_at: rx.created_at || new Date().toISOString(),
            status: rx.status || 'active',
            medications: rx.medications || [],
            notes: rx.notes || '',
            is_paid: rx.is_paid || false,
            pharmacy_name: rx.pharmacy_name
        }));
        
        setPrescriptions(transformedPrescriptions);
    };

    const fetchPrescriptions = async () => {
        try {
            const data = await prescriptionService.getMyPrescriptions();
            if (data && data.length > 0) {
                setPrescriptions(data);
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

    const getStatusColor = (status: string | undefined, isPaid: boolean | undefined) => {
        if (!isPaid) return 'bg-amber-100 text-amber-700 border-amber-200';
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'completed':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string | undefined, isPaid: boolean | undefined) => {
        if (!isPaid) return <CreditCard className="w-4 h-4" />;
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const filteredPrescriptions = prescriptions.filter((rx) => {
        const matchesSearch = rx.diagnosis_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rx.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus === 'all') return matchesSearch;
        if (filterStatus === 'active') return matchesSearch && rx.status === 'active';
        if (filterStatus === 'completed') return matchesSearch && rx.status === 'completed';
        return matchesSearch;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(isRTL ? 'fa-IR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleBuyFromPharmacy = (prescription: Prescription) => {
        // Save prescription to localStorage for pharmacy to use
        const pharmacyOrders = JSON.parse(localStorage.getItem('prescription_orders') || '[]');
        pharmacyOrders.push({
            prescription_id: prescription.id,
            diagnosis: prescription.diagnosis_text,
            medications: prescription.medications,
            doctor_name: prescription.doctor_name,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('prescription_orders', JSON.stringify(pharmacyOrders));
        
        // Navigate to pharmacy
        router.push(`/${locale}/pharmacy?prescription_id=${prescription.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
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
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <FileText className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {isRTL ? 'نسخه‌های من' : 'My Prescriptions'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isRTL 
                                ? 'مشاهده و مدیریت نسخه‌های پزشکی' 
                                : 'View and manage your medical prescriptions'
                            }
                        </p>
                    </div>
                </div>

                <Link 
                    href="/dashboard/prescriptions/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-[1.5rem] font-black text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                    {isRTL ? 'نسخه جدید' : 'New Prescription'}
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-soft-md">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={isRTL ? 'جستجو در نسخه‌ها...' : 'Search prescriptions...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all text-gray-800 font-medium"
                        />
                    </div>
                    <div className="flex gap-3">
                        {[
                            { key: 'all', label: isRTL ? 'همه' : 'All' },
                            { key: 'active', label: isRTL ? 'فعال' : 'Active' },
                            { key: 'completed', label: isRTL ? 'تکمیل شده' : 'Completed' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setFilterStatus(item.key as any)}
                                className={`px-5 py-3 rounded-2xl font-black text-sm transition-all ${
                                    filterStatus === item.key
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-gray-50 text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Prescriptions List */}
            {filteredPrescriptions.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                        {isRTL ? 'نسخه‌ای یافت نشد' : 'No Prescriptions Found'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isRTL 
                            ? 'شما هنوز نسخه‌ای ندارید.' 
                            : "You don't have any prescriptions yet."
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredPrescriptions.map((prescription) => (
                        <div 
                            key={prescription.id}
                            className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-soft-md hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => setSelectedPrescription(prescription)}
                        >
                            {/* Prescription Header */}
                            <div className="p-8 bg-gradient-to-l from-gray-50 to-white border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-purple-500/20">
                                        <Stethoscope className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-xl text-gray-900">
                                            {prescription.diagnosis_text || (isRTL ? 'تشخیص پزشک' : 'Medical Diagnosis')}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <User className="w-3 h-3" />
                                                {prescription.doctor_name || (prescription.doctor ? `${prescription.doctor.first_name} ${prescription.doctor.last_name}` : isRTL ? 'پزشک معالج' : 'Doctor')}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(prescription.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 border ${getStatusColor(prescription.status, prescription.is_paid)}`}>
                                        {getStatusIcon(prescription.status, prescription.is_paid)}
                                        {prescription.is_paid 
                                            ? (isRTL ? 'پرداخت شده' : 'Paid')
                                            : (isRTL ? 'در انتظار پرداخت' : 'Unpaid')
                                        }
                                    </span>
                                    <ChevronRight className={`w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Medications Preview */}
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <Pill className="w-5 h-5 text-purple-500" />
                                    <span className="text-sm font-black text-gray-500 uppercase tracking-wider">
                                        {isRTL ? 'داروهای تجویز شده' : 'Prescribed Medications'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-400">
                                        ({prescription.medications?.length || 0} {isRTL ? 'دارو' : 'meds'})
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {prescription.medications?.slice(0, 3).map((med: any, idx: number) => (
                                        <div 
                                            key={idx}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl text-sm font-bold text-gray-700 border border-purple-100"
                                        >
                                            {med.name || med.medicine_name} - {med.dosage || med.frequency}
                                        </div>
                                    ))}
                                    {prescription.medications && prescription.medications.length > 3 && (
                                        <div className="px-4 py-2 bg-gray-50 rounded-2xl text-sm font-bold text-gray-400">
                                            +{prescription.medications.length - 3} {isRTL ? 'داروی دیگر' : 'more'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="px-8 pb-8 pt-0 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {prescription.is_paid ? (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBuyFromPharmacy(prescription);
                                            }}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            {isRTL ? 'خرید از داروخانه' : 'Buy from Pharmacy'}
                                        </button>
                                    ) : (
                                        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all">
                                            <CreditCard className="w-4 h-4" />
                                            {isRTL ? 'پرداخت نسخه' : 'Pay for Prescription'}
                                        </button>
                                    )}
                                </div>
                                <button className="flex items-center gap-2 text-gray-400 hover:text-purple-500 transition-colors font-medium text-sm">
                                    <Download className="w-4 h-4" />
                                    {isRTL ? 'دانلود PDF' : 'Download PDF'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Prescription Detail Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPrescription(null)}>
                    <div 
                        className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">
                                        {selectedPrescription.diagnosis_text || (isRTL ? 'نسخه پزشکی' : 'Medical Prescription')}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatDate(selectedPrescription.created_at)}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedPrescription(null)}
                                    className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                    <AlertCircle className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-8">
                            {/* Doctor Info */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[2rem] p-6 border border-purple-100">
                                <h3 className="font-black text-gray-900 uppercase tracking-wider text-sm mb-4">
                                    {isRTL ? 'اطلاعات پزشک' : 'Doctor Information'}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                        {selectedPrescription.doctor_name?.charAt(0) || 'D'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">
                                            {selectedPrescription.doctor_name || (isRTL ? 'دکتر سارا احمدی' : 'Dr. Sarah Ahmadi')}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {isRTL ? 'متخصص قلب و عروق' : 'Cardiologist'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Medications List */}
                            <div>
                                <h3 className="font-black text-gray-900 uppercase tracking-wider text-sm mb-4">
                                    {isRTL ? 'داروهای تجویز شده' : 'Prescribed Medications'}
                                </h3>
                                <div className="space-y-3">
                                    {selectedPrescription.medications?.map((med: any, idx: number) => (
                                        <div 
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                                    <Pill className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{med.name || med.medicine_name}</p>
                                                    <p className="text-sm text-purple-600">
                                                        {med.dosage} - {med.frequency}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedPrescription.notes && (
                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-amber-600 uppercase tracking-wider">{isRTL ? 'یادداشت‌ها' : 'Notes'}</p>
                                            <p className="text-sm text-gray-700 mt-1">{selectedPrescription.notes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                                {selectedPrescription.is_paid ? (
                                    <button 
                                        onClick={() => handleBuyFromPharmacy(selectedPrescription)}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-emerald-500/25 transition-all"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        {isRTL ? 'خرید از داروخانه' : 'Buy from Pharmacy'}
                                    </button>
                                ) : (
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-amber-500/25 transition-all">
                                        <CreditCard className="w-5 h-5" />
                                        {isRTL ? 'پرداخت نسخه' : 'Pay for Prescription'}
                                    </button>
                                )}
                                <button className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                                    <Download className="w-5 h-5" />
                                    {isRTL ? 'دانلود PDF' : 'Download PDF'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

