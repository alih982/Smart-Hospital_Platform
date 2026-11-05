'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useParams } from '@/i18n/navigation';
import {
    CreditCard,
    Shield,
    CheckCircle2,
    Loader2,
    Download,
    Home,
    Calendar,
    Clock,
    User,
    MapPin,
    Phone,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Appointment {
    id: string;
    doctor_id: string;
    doctor_name: string;
    specialty: string;
    date: string;
    time: string;
    type: 'online' | 'clinic';
    fee: number;
    notes?: string;
    patient_id: string;
    patient_name: string;
    status: string;
    payment_status: string;
    created_at: string;
}

export default function AppointmentPaymentPage() {
    const params = useParams();
    const appointmentId = params?.id as string;
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const router = useRouter();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

    const [paymentForm, setPaymentForm] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    });

    useEffect(() => {
        if (appointmentId) {
            fetchAppointment();
        }
    }, [appointmentId]);

    const fetchAppointment = async () => {
        try {
            setLoading(true);

            // Try to get appointment from localStorage
            const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            const appointmentData = appointments.find((app: Appointment) => app.id === appointmentId);

            if (appointmentData) {
                setAppointment(appointmentData);
            } else {
                alert(isRTL ? 'نوبت یافت نشد' : 'Appointment not found');
                router.push(`/${locale}/dashboard/appointments`);
            }
        } catch (error) {
            console.error('Failed to fetch appointment:', error);
            alert(isRTL ? 'خطا در بارگذاری نوبت' : 'Failed to load appointment');
            router.push(`/${locale}/dashboard/appointments`);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!appointment) return;

        // Validate form
        if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardHolderName) {
            alert(isRTL ? 'لطفا تمام فیلدهای پرداخت را پر کنید' : 'Please fill all payment fields');
            return;
        }

        setProcessing(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Update appointment status in localStorage
            const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            const updatedAppointments = appointments.map((app: Appointment) =>
                app.id === appointment.id
                    ? { ...app, status: 'confirmed', payment_status: 'paid' }
                    : app
            );
            localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

            // Create invoice
            const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
            const newInvoice = {
                id: `INV-${Date.now()}`,
                title: isRTL
                    ? `ویزیت ${appointment.specialty} - ${appointment.doctor_name}`
                    : `${appointment.specialty} Visit - ${appointment.doctor_name}`,
                amount: appointment.fee,
                date: new Date().toISOString().split('T')[0],
                status: 'paid',
                method: 'online',
                type: 'appointment',
                appointment_id: appointment.id
            };

            invoices.push(newInvoice);
            localStorage.setItem('invoices', JSON.stringify(invoices));

            // Generate invoice URL (mock)
            setInvoiceUrl(`/api/invoices/appointment/${newInvoice.id}`);

            setPaymentSuccess(true);

        } catch (error) {
            console.error('Payment failed:', error);
            alert(isRTL ? 'پرداخت ناموفق بود' : 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 font-medium">
                        {isRTL ? 'در حال بارگذاری...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                        {isRTL ? 'نوبت یافت نشد' : 'Appointment Not Found'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isRTL ? 'نوبت مورد نظر وجود ندارد' : 'The requested appointment does not exist'}
                    </p>
                    <Link
                        href={`/${locale}/dashboard/appointments`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {isRTL ? 'بازگشت به نوبت‌ها' : 'Back to Appointments'}
                    </Link>
                </div>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="max-w-2xl mx-auto px-4 py-16">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">
                            {isRTL ? 'پرداخت موفق!' : 'Payment Successful!'}
                        </h1>
                        <p className="text-gray-600">
                            {isRTL ? 'نوبت شما با موفقیت پرداخت شد' : 'Your appointment has been paid successfully'}
                        </p>
                    </div>

                    {/* Appointment Summary */}
                    <div className="bg-white rounded-[3rem] p-8 shadow-lg border border-emerald-100 mb-8">
                        <h2 className="text-xl font-black text-gray-900 mb-6">
                            {isRTL ? 'جزئیات نوبت' : 'Appointment Details'}
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600">{isRTL ? 'پزشک' : 'Doctor'}</span>
                                <span className="font-bold text-gray-900">{appointment.doctor_name}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600">{isRTL ? 'تخصص' : 'Specialty'}</span>
                                <span className="font-bold text-gray-900">{appointment.specialty}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600">{isRTL ? 'تاریخ و زمان' : 'Date & Time'}</span>
                                <span className="font-bold text-gray-900">
                                    {appointment.date} - {appointment.time}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600">{isRTL ? 'نوع ویزیت' : 'Visit Type'}</span>
                                <span className="font-bold text-gray-900">
                                    {appointment.type === 'online' ? (isRTL ? 'ویدیو' : 'Video Call') : (isRTL ? 'حضوری' : 'In-Clinic')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-600">{isRTL ? 'مجموع پرداخت' : 'Total Paid'}</span>
                                <span className="font-bold text-emerald-600">{formatPrice(appointment.fee)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Download Invoice */}
                    <div className="bg-white rounded-[3rem] p-8 shadow-lg border border-blue-100 mb-8">
                        <h2 className="text-xl font-black text-gray-900 mb-6">
                            {isRTL ? 'دانلود فاکتور' : 'Download Invoice'}
                        </h2>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">
                                        {isRTL ? 'فاکتور نوبت پزشکی' : 'Medical Appointment Invoice'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {isRTL ? 'فاکتور رسمی نوبت و پرداخت' : 'Official appointment and payment invoice'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => window.open(invoiceUrl!, '_blank')}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                {isRTL ? 'دانلود PDF' : 'Download PDF'}
                            </button>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[2rem] p-6 border border-blue-100 mb-8">
                        <h3 className="font-bold text-blue-900 mb-4">
                            {isRTL ? 'مراحل بعدی:' : 'Next Steps:'}
                        </h3>
                        <div className="space-y-2 text-sm text-blue-800">
                            <p>• {isRTL ? 'در زمان تعیین شده به چت پزشک دسترسی خواهید داشت' : 'You will have access to doctor chat at the scheduled time'}</p>
                            <p>• {isRTL ? 'پزشک پس از مشاوره نسخه را صادر خواهد کرد' : 'Doctor will issue prescription after consultation'}</p>
                            <p>• {isRTL ? 'نسخه را پرداخت کرده و از داروخانه تحویل بگیرید' : 'Pay for prescription and pick up from pharmacy'}</p>
                        </div>
                    </div>

                    {/* Back to Dashboard */}
                    <div className="text-center">
                        <Link
                            href={`/${locale}/dashboard/appointments`}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all"
                        >
                            <Calendar className="w-5 h-5" />
                            {isRTL ? 'مشاهده نوبت‌ها' : 'View Appointments'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}/dashboard/appointments`}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">
                            {isRTL ? 'پرداخت نوبت' : 'Appointment Payment'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isRTL ? 'تکمیل پرداخت نوبت پزشکی' : 'Complete your medical appointment payment'}
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Appointment Summary */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[3rem] p-8 shadow-lg border border-gray-100">
                            <h2 className="text-xl font-black text-gray-900 mb-6">
                                {isRTL ? 'جزئیات نوبت' : 'Appointment Details'}
                            </h2>

                            {/* Doctor Info */}
                            <div className="flex items-start gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                    👨‍⚕️
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{appointment.doctor_name}</p>
                                    <p className="text-sm text-blue-600">{appointment.specialty}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {appointment.type === 'online' ? (isRTL ? 'ویزیت ویدیو' : 'Video Consultation') : (isRTL ? 'ویزیت حضوری' : 'In-Clinic Visit')}
                                    </p>
                                </div>
                            </div>

                            {/* Appointment Info */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-wider">
                                            {isRTL ? 'تاریخ' : 'Date'}
                                        </p>
                                        <p className="font-bold text-gray-900">{appointment.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-wider">
                                            {isRTL ? 'زمان' : 'Time'}
                                        </p>
                                        <p className="font-bold text-gray-900">{appointment.time}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-gray-900 uppercase tracking-wider text-sm">
                                        {isRTL ? 'هزینه ویزیت' : 'Consultation Fee'}
                                    </span>
                                    <span className="text-3xl font-black text-gray-900">{formatPrice(appointment.fee)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Process Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[2rem] p-6 border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-4">
                                {isRTL ? 'فرایند پزشکی:' : 'Medical Process:'}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                                    <span className="text-sm text-blue-800">{isRTL ? 'رزرو و پرداخت نوبت' : 'Book & Pay Appointment'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">2</div>
                                    <span className="text-sm text-gray-600">{isRTL ? 'مشاوره با پزشک' : 'Doctor Consultation'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">3</div>
                                    <span className="text-sm text-gray-600">{isRTL ? 'دریافت نسخه' : 'Get Prescription'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">4</div>
                                    <span className="text-sm text-gray-600">{isRTL ? 'پرداخت و تحویل دارو' : 'Pay & Pickup Medicine'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[3rem] p-8 shadow-lg border border-gray-100">
                            <h2 className="text-xl font-black text-gray-900 mb-6">
                                {isRTL ? 'اطلاعات پرداخت' : 'Payment Information'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {isRTL ? 'شماره کارت' : 'Card Number'}
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentForm.cardNumber}
                                        onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {isRTL ? 'تاریخ انقضا' : 'Expiry Date'}
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentForm.expiryDate}
                                            onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            CVV
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentForm.cvv}
                                            onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                                            placeholder="123"
                                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {isRTL ? 'نام صاحب کارت' : 'Card Holder Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentForm.cardHolderName}
                                        onChange={(e) => setPaymentForm({...paymentForm, cardHolderName: e.target.value})}
                                        placeholder={isRTL ? 'نام و نام خانوادگی' : 'John Doe'}
                                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[2rem] p-6 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <Shield className="w-6 h-6 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="font-bold text-blue-900 mb-1">
                                        {isRTL ? 'پرداخت امن' : 'Secure Payment'}
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        {isRTL
                                            ? 'تمام اطلاعات پرداخت شما با رمزگذاری SSL محافظت می‌شود'
                                            : 'All your payment information is protected with SSL encryption'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {isRTL ? 'در حال پردازش...' : 'Processing...'}
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    {isRTL ? 'پرداخت' : 'Pay'} {formatPrice(appointment.fee)}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
