'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useAuthStore } from '@/store/useAuthStore';
import {
    Send,
    Stethoscope,
    Brain,
    FileText,
    Download,
    CheckCircle2,
    X,
    Plus,
    Trash2,
    ShieldCheck,
    Loader2,
    Check,
    LogOut,
    CreditCard
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function ConsultationRoom() {
    const { id: recipientId } = useParams();
    const router = useRouter();
    const locale = useLocale();
    const { user } = useAuthStore();
    const t = useTranslations('dashboard');
    const {
        messages,
        isConnected,
        sendMessage,
        sendPrescription,
        triggerAnalysis
    } = useChat(recipientId as string);

    const [isFinished, setIsFinished] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

    const [input, setInput] = useState('');
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showAIInsights, setShowAIInsights] = useState(false);

    // Prescription Form State
    const [prescriptionForm, setPrescriptionForm] = useState({
        diagnosis: '',
        medications: [{ name: '', dosage: '', frequency: '' }]
    });

    const isDoctor = user?.role === 'doctor';
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        // Check for session finish in last message
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.metadata?.type === 'SESSION_FINISHED') {
            setIsFinished(true);
            setCheckoutUrl(lastMsg.metadata.checkout_url);
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isFinished) return;
        sendMessage(input);
        setInput('');
    };

    const handleFinish = () => {
        if (confirm("Are you sure you want to finish this consultation? The patient will be redirected to checkout.")) {
            sendMessage('Closing session...', 'finish_session');
        }
    };

    const addMedication = () => {
        setPrescriptionForm(prev => ({
            ...prev,
            medications: [...prev.medications, { name: '', dosage: '', frequency: '' }]
        }));
    };

    const removeMedication = (index: number) => {
        setPrescriptionForm(prev => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index)
        }));
    };

    const updateMedication = (index: number, field: string, value: string) => {
        const newMeds = [...prescriptionForm.medications];
        (newMeds[index] as any)[field] = value;
        setPrescriptionForm(prev => ({ ...prev, medications: newMeds }));
    };

    const handleIssuePrescription = () => {
        sendPrescription(prescriptionForm);
        setShowPrescriptionModal(false);
        setPrescriptionForm({
            diagnosis: '',
            medications: [{ name: '', dosage: '', frequency: '' }]
        });
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar / Info */}
            <div className="w-full md:w-80 bg-white border-r border-slate-100 flex flex-col z-20 shadow-sm">
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Stethoscope size={20} />
                        </div>
                        <h1 className="font-black text-slate-800 text-xl tracking-tight">Consultation</h1>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {isConnected ? 'Live Connection' : 'Reconnecting...'}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-600">Secure Room #{recipientId}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Professional Bio / Triage Info */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Session Tools</h4>
                        <div className="grid gap-3">
                            {isDoctor ? (
                                <>
                                    <button
                                        onClick={() => setShowPrescriptionModal(true)}
                                        className="w-full p-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                                        disabled={isFinished}
                                    >
                                        <FileText size={18} /> Issue Prescription
                                    </button>
                                    <button
                                        onClick={handleFinish}
                                        className="w-full p-4 bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                        disabled={isFinished}
                                    >
                                        <LogOut size={18} /> {isFinished ? 'Session Finished' : 'Finish Session'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowAIInsights(!showAIInsights)}
                                        className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                                    >
                                        <Brain size={18} /> AI Symptom Insight
                                    </button>
                                    {isFinished && checkoutUrl && (
                                        <button
                                            onClick={() => router.push(checkoutUrl)}
                                            className="w-full p-4 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                                        >
                                            <CreditCard size={18} /> Proceed to Checkout
                                        </button>
                                    )}
                                </>
                            )}
                            <button className="w-full p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-slate-50 transition-all">
                                <Plus size={18} /> Request Lab Test
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] text-white overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <ShieldCheck className="text-blue-400 mb-4" size={32} />
                        <h5 className="font-black text-sm mb-2">End-to-End Secure</h5>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                            This consultation is private and HIPAA compliant. Your medical data is encrypted.
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">
                {/* AI Insights Panel (Floating Overlay) */}
                {showAIInsights && (
                    <div className="absolute top-6 left-6 right-6 lg:left-12 lg:right-12 z-10 animate-fade-down">
                        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 p-8 rounded-[3rem] shadow-2xl shadow-indigo-200/50">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3 font-black text-indigo-900">
                                    <Brain size={24} className="text-indigo-600" />
                                    AI Health Analysis
                                </div>
                                <button onClick={() => setShowAIInsights(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={20} /></button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h6 className="text-xs font-black uppercase text-indigo-400 tracking-widest">Potential Indicators</h6>
                                    <div className="space-y-2">
                                        {['Symptom Pattern: Acute', 'System: Cardiovascular', 'Priority: Modernate'].map(tag => (
                                            <div key={tag} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                                <CheckCircle2 size={16} className="text-indigo-500" /> {tag}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                                    <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">
                                        "Based on your description, the AI suggests discussing chronic fatigue management with your doctor."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scrollbar-hide">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender_id == user?.user_id ? 'justify-end' : 'justify-start'} group animate-fade-up`}>
                            <div className={`max-w-[80%] md:max-w-[60%] ${msg.sender_id == user?.user_id ? 'order-1' : 'order-2'}`}>
                                <div className={`px-6 py-4 rounded-[2rem] shadow-sm ${msg.sender_id == user?.user_id
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : msg.metadata?.type === 'PRESCRIPTION'
                                        ? 'bg-emerald-50 border-2 border-emerald-100 text-emerald-900 rounded-tl-none'
                                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                                    }`}>
                                    {msg.metadata?.type === 'PRESCRIPTION' ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 font-black text-lg">
                                                <FileText size={20} />
                                                Digital Prescription
                                            </div>
                                            <p className="text-sm font-bold opacity-80">Valid for fulfillment at any partner pharmacy.</p>
                                            <div className="bg-emerald-900/10 p-4 rounded-2xl flex items-center justify-between border border-emerald-900/5">
                                                <span className="text-xs font-black uppercase tracking-tighter">RX Document</span>
                                                <a href={msg.metadata.pdf_url} target="_blank" className="flex items-center gap-2 font-black text-xs hover:underline">
                                                    <Download size={14} /> DOWNLOAD
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                                    )}
                                </div>
                                <div className={`mt-2 flex items-center gap-2 ${msg.sender_id == user?.user_id ? 'justify-end' : 'justify-start'}`}>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.sender_name}</span>
                                    {msg.sender_id == user?.user_id && <Check size={12} className="text-blue-400" />}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 md:p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 sticky bottom-0">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-4">
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full bg-slate-100 border border-slate-200 rounded-[2rem] px-8 py-5 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-800"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <Send size={20} />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Send size={24} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Prescription Modal (Doctor Only) */}
            {showPrescriptionModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-up">
                        <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <FileText className="text-blue-600" /> New Digital Prescription
                                </h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Patient ID: {recipientId}</p>
                            </div>
                            <button onClick={() => setShowPrescriptionModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                                <X />
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Clinical Diagnosis</label>
                                <textarea
                                    className="w-full p-6 bg-slate-50 rounded-3xl border border-slate-100 focus:outline-none focus:border-blue-500 font-bold text-slate-800 h-32"
                                    placeholder="Enter your detailed clinical diagnosis here..."
                                    value={prescriptionForm.diagnosis}
                                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Medications & Dosage</label>
                                    <button
                                        onClick={addMedication}
                                        className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1 hover:underline"
                                    >
                                        <Plus size={14} /> Add Drug
                                    </button>
                                </div>
                                {prescriptionForm.medications.map((med, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-3 items-end p-4 bg-slate-50 rounded-2xl relative group">
                                        <div className="col-span-12 md:col-span-5">
                                            <input
                                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-blue-500"
                                                placeholder="Medication Name"
                                                value={med.name}
                                                onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-5 md:col-span-3">
                                            <input
                                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-blue-500"
                                                placeholder="Dosage"
                                                value={med.dosage}
                                                onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-5 md:col-span-3">
                                            <input
                                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-blue-500"
                                                placeholder="Freq"
                                                value={med.frequency}
                                                onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1 flex justify-center">
                                            <button onClick={() => removeMedication(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                            <button
                                onClick={() => setShowPrescriptionModal(false)}
                                className="px-8 py-4 font-black text-slate-500 hover:text-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleIssuePrescription}
                                className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                                E-Sign & Issue <Check size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up { animation: fade-up 0.4s ease-out forwards; }
                .animate-fade-down { animation: fade-down 0.4s ease-out forwards; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
