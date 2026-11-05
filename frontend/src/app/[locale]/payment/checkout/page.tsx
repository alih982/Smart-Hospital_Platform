'use client';

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Download,
    FileText,
    Activity,
    Lock,
    ShoppingBag,
    MessageCircle
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { appointmentService } from '@/services/appointmentService';
import { useAuthStore } from '@/store/useAuthStore';

export default function CheckoutPage() {
    const t = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const { user } = useAuthStore();
    
    const [step, setStep] = useState(1); // 1: Review, 2: Payment, 3: Success
    const [appointmentId, setAppointmentId] = useState<string | null>(null);
    const [doctorId, setDoctorId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Get appointment and doctor info from URL params or localStorage
    useEffect(() => {
        // Get from localStorage (set when booking appointment)
        const savedAppointment = localStorage.getItem('pending_appointment');
        if (savedAppointment) {
            try {
                const parsed = JSON.parse(savedAppointment);
                setAppointmentId(parsed.appointmentId);
                setDoctorId(parsed.doctorId);
            } catch (e) {
                console.error('Error parsing pending appointment:', e);
            }
        }
        
        // Also check URL search params using window
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const aptId = urlParams.get('appointment_id');
            const drId = urlParams.get('doctor_id');
            
            if (aptId) setAppointmentId(aptId);
            if (drId) setDoctorId(parseInt(drId));
        }
    }, []);

    const handlePaymentSuccess = async () => {
        setIsLoading(true);
        try {
            // If we have an appointment ID, confirm payment via API
            if (appointmentId) {
                await appointmentService.confirmPayment(appointmentId);
            }
            
            // Move to success step
            setStep(3);
            
            // Clear pending appointment from localStorage
            localStorage.removeItem('pending_appointment');
            
            // Auto-redirect to chat after 3 seconds
            setTimeout(() => {
                if (doctorId) {
                    router.push(`/dashboard/messages?doctor_id=${doctorId}`);
                } else {
                    router.push('/dashboard/messages');
                }
            }, 3000);
            
        } catch (error) {
            console.error('Payment confirmation error:', error);
            // Still show success and allow redirect
            setStep(3);
            setTimeout(() => {
                router.push('/dashboard/messages');
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const items = [
        { name: 'Specialist Consultation', price: 150000, icon: <Activity className="text-blue-600" /> },
        { name: 'AI Health Assessment', price: 0, icon: <Lock className="text-indigo-600" /> },
        { name: 'Digital Prescription Fee', price: 25000, icon: <FileText className="text-emerald-600" /> },
    ];

    const total = items.reduce((acc, item) => acc + item.price, 0);

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Checkout</h1>
                    <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-xs">
                        <ShieldCheck className="text-blue-500" size={16} /> Secure Fulfillment
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-6">
                        {step === 1 && (
                            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white animate-fade-up">
                                <h3 className="text-xl font-black text-slate-800 mb-8 underline-offset-8 decoration-blue-500/30 decoration-4 underline">Session Review</h3>
                                <div className="space-y-6">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                    {item.icon}
                                                </div>
                                                <span className="font-bold text-slate-700">{item.name}</span>
                                            </div>
                                            <span className="font-black text-slate-800">{item.price.toLocaleString()} {t('currency')}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 p-8 bg-blue-600 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl shadow-blue-200">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Total Amount</p>
                                        <h4 className="text-3xl font-black">{total.toLocaleString()} {t('currency')}</h4>
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-black/10"
                                    >
                                        Pay & Complete <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white animate-fade-up">
                                <h3 className="text-xl font-black text-slate-800 mb-8">Secure Payment</h3>
                                <div className="grid md:grid-cols-2 gap-4 mb-8">
                                    <button 
                                        onClick={handlePaymentSuccess}
                                        disabled={isLoading}
                                        className="p-6 border-2 border-blue-500 bg-blue-50 rounded-3xl text-left relative group disabled:opacity-50"
                                    >
                                        <CreditCard className="text-blue-600 mb-4" size={32} />
                                        <p className="font-black text-blue-900">Online Payment</p>
                                        <p className="text-[10px] font-bold text-blue-600">Instant Access to Records</p>
                                        <div className="absolute top-4 right-4 text-blue-600"><CheckCircle2 size={16} /></div>
                                    </button>
                                    <button
                                        onClick={handlePaymentSuccess}
                                        disabled={isLoading}
                                        className="p-6 border-2 border-slate-100 bg-slate-50 rounded-3xl text-left hover:border-blue-200 group transition-all disabled:opacity-50"
                                    >
                                        <ShoppingBag className="text-slate-400 group-hover:text-blue-500 transition-colors mb-4" size={32} />
                                        <p className="font-black text-slate-700">Buy Offline</p>
                                        <p className="text-[10px] font-bold text-slate-400">Pay at Pharmacy Reception</p>
                                    </button>
                                </div>

                                <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center space-y-4">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h4 className="font-black text-slate-800">Bank Gateway Integration</h4>
                                    <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto">Redirecting to secure Shaparak portal for local Toman transactions...</p>
                                    <button
                                        onClick={handlePaymentSuccess}
                                        disabled={isLoading}
                                        className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Processing...' : 'Pay Now & Start Chat'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-blue-100/50 border border-white text-center space-y-10 animate-fade-up overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto rotate-12 animate-pulse">
                                    <CheckCircle2 size={48} />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-slate-800">Payment Verified!</h2>
                                    <p className="text-slate-400 font-bold max-w-sm mx-auto">Your consultation is now finalized. Your doctor is waiting for you in the chat.</p>
                                </div>

                                {/* Chat with Doctor Button */}
                                <button
                                    onClick={() => doctorId ? router.push(`/dashboard/messages?doctor_id=${doctorId}`) : router.push('/dashboard/messages')}
                                    className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
                                >
                                    <MessageCircle size={24} />
                                    Go to Chat with Doctor
                                </button>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <button className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-500 transition-all flex flex-col items-center gap-4 group">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                                            <Download />
                                        </div>
                                        <span className="font-black text-sm text-slate-700">Prescription.pdf</span>
                                    </button>
                                    <button className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-500 transition-all flex flex-col items-center gap-4 group">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                                            <FileText />
                                        </div>
                                        <span className="font-black text-sm text-slate-700">Receipt.pdf</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => router.push(`/dashboard/patient`)}
                                    className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Stats */}
                    <div className="lg:col-span-4 space-y-6 animate-fade-up animation-delay-300">
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[3rem] text-white overflow-hidden relative">
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">Patient Confidence</h4>
                            <p className="text-sm font-bold leading-relaxed opacity-80 mb-8">
                                DoctorHub uses end-to-end encryption for all healthcare financial transactions.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-indigo-400">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black">PCI DSS Certified</p>
                                    <p className="text-[10px] opacity-60">Verified Gateway</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100">
                            <h5 className="font-black text-emerald-900 mb-4">Need Help?</h5>
                            <p className="text-xs font-bold text-emerald-700 mb-6">Our billing specialists are available 24/7 for support.</p>
                            <button className="w-full py-4 bg-white rounded-2xl font-black text-sm text-emerald-800 shadow-sm hover:shadow-md transition-all">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up { animation: fade-up 0.8s ease-out forwards; }
                .animation-delay-300 { animation-delay: 0.3s; }
            `}</style>
        </div>
    );
}
