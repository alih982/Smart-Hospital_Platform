"use client";

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Bot, FileText, Plus, Trash2 } from 'lucide-react';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
}

export default function CreatePrescriptionForm() {
    const router = useRouter();
    const locale = useLocale();
    const [patientId, setPatientId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Medication List State
    const [medications, setMedications] = useState<Medication[]>([
        { name: '', dosage: '', frequency: '' }
    ]);

    const handleAIAssist = async () => {
        if (!symptoms) return;
        setLoadingAI(true);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : 'http://magicai.runflare.run/api/v1';
            const response = await fetch(`${apiBase}/prescriptions/ai-suggest/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // TODO: Add auth token
                },
                body: JSON.stringify({ symptoms })
            });
            const data = await response.json();
            if (data.suggestion) {
                setAiSuggestion(data.suggestion);
            }
        } catch (e) {
            console.error("AI Error", e);
            setAiSuggestion("Error connecting to AI Assistant.");
        } finally {
            setLoadingAI(false);
        }
    };

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '' }]);
    };

    const removeMedication = (index: number) => {
        const newMeds = [...medications];
        newMeds.splice(index, 1);
        setMedications(newMeds);
    };

    const updateMedication = (index: number, field: keyof Medication, value: string) => {
        const newMeds = [...medications];
        newMeds[index][field] = value;
        setMedications(newMeds);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : 'http://magicai.runflare.run/api/v1';
            const payload = {
                patient_id: patientId, // Ideally this is a UUID
                diagnosis,
                medications,
                ai_log: { symptoms, suggestion: aiSuggestion }
            };

            const response = await fetch(`${apiBase}/prescriptions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                alert(`Error: ${JSON.stringify(err)}`);
                throw new Error('Failed to create prescription');
            }

            const data = await response.json();

            // Auto-Download PDF if available (mocking the download flow)
            // Ideally backend returns URL or we fetch the PDF endpoint
            if (data.pdf_file) {
                window.open(`${data.pdf_file}`, '_blank'); // Opens PDF in new tab
            }
            alert('Prescription Issued Successfully!');
            router.push(`/dashboard/doctor`); // Redirect back

        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 p-8 space-y-8">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                    <FileText size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Rx details</h2>
                    <p className="text-sm text-gray-500">Fill in clinical details below</p>
                </div>
            </div>

            {/* Patient Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Patient ID (UUID)</label>
                <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                />
            </div>

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Bot size={100} />
                </div>
                <div className="relative z-10">
                    <label className="flex items-center gap-2 text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-3">
                        <Bot /> AI Clinical Assistant (Gemma 3)
                    </label>
                    <div className="flex gap-3 mb-4">
                        <input
                            type="text"
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="flex-1 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white/80 dark:bg-black/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Describe symptoms for rapid analysis..."
                        />
                        <button
                            onClick={handleAIAssist}
                            disabled={loadingAI}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 min-w-[120px]"
                        >
                            {loadingAI ? 'Scanning...' : 'Analyze'}
                        </button>
                    </div>
                    {aiSuggestion && (
                        <div className="p-4 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-indigo-200 dark:border-indigo-700 shadow-sm">
                            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">AI Suggestion</h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{aiSuggestion}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Diagnosis */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Official Diagnosis</label>
                <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Enter confirmed diagnosis..."
                />
            </div>

            {/* Medications Table */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Prescribed Medications</label>
                    <button
                        onClick={addMedication}
                        className="text-xs flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full hover:bg-green-200 transition-colors font-medium"
                    >
                        <Plus size={10} /> Add Drug
                    </button>
                </div>
                <div className="space-y-3">
                    {medications.map((med, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    placeholder="Drug Name"
                                    value={med.name}
                                    onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                                    className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:border-blue-500 outline-none"
                                />
                                <input
                                    placeholder="Dosage (e.g. 500mg)"
                                    value={med.dosage}
                                    onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                                    className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:border-blue-500 outline-none"
                                />
                                <input
                                    placeholder="Freq (e.g. 2x daily)"
                                    value={med.frequency}
                                    onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                                    className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            {medications.length > 1 && (
                                <button
                                    onClick={() => removeMedication(idx)}
                                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-xl font-bold shadow-xl shadow-blue-500/20 transition-all transform hover:scale-[1.01] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                        <>Processing Secure Signature...</>
                    ) : (
                        <>
                            <FileText size={20} /> Issue Secure Prescription
                        </>
                    )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                    * This prescription will be digitally signed using SHA-256 hashing and stored immutably.
                </p>
            </div>
        </div>
    );
}
