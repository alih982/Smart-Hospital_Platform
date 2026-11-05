'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
    Brain, Database, Settings, X, Upload, FileText, Check, ChevronRight,
    Sparkles, Cpu, Activity, Zap, Shield, AlertCircle, RefreshCw, 
    ChevronDown, Search, Trash2, Download, Plus, Layers, Bot,
    MessageSquare, Stethoscope, Heart, Pill, Eye, Mic
} from 'lucide-react';

interface AIModel {
    id: string;
    name: string;
    type: 'base' | 'fine_tuned' | 'rag';
    status: 'active' | 'inactive' | 'loading';
    accuracy?: number;
    responseTime?: number;
    description: string;
    icon: React.ReactNode;
}

interface Document {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedAt: string;
    chunks: number;
    status: 'indexed' | 'processing' | 'error';
}

interface AISettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
    const locale = useLocale();
    const isRTL = locale === 'fa';
    
    const [activeTab, setActiveTab] = useState<'models' | 'rag' | 'settings'>('models');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string | null>('gemma-base');
    
    // Mock data - in real app, fetch from API
    const [models] = useState<AIModel[]>([
        {
            id: 'gemma-base',
            name: 'Gemma 2B Base',
            type: 'base',
            status: 'active',
            accuracy: 85,
            responseTime: 1200,
            description: isRTL ? 'مدل پایه Gemma برای پاسخ‌های عمومی' : 'Base Gemma model for general responses',
            icon: <Brain className="w-5 h-5" />
        },
        {
            id: 'medical-ft',
            name: 'Medical Expert (Fine-tuned)',
            type: 'fine_tuned',
            status: 'inactive',
            accuracy: 96,
            responseTime: 800,
            description: isRTL ? 'مدل فاین‌تیون شده پزشکی - در حال آماده‌سازی' : 'Medical fine-tuned model - Ready to activate',
            icon: <Stethoscope className="w-5 h-5" />
        },
        {
            id: 'cardio-ft',
            name: 'Cardiology Expert',
            type: 'fine_tuned',
            status: 'inactive',
            accuracy: 98,
            responseTime: 650,
            description: isRTL ? 'مدل تخصصی قلب و عروق' : 'Cardiology specialist model',
            icon: <Heart className="w-5 h-5" />
        },
        {
            id: 'rag-vector',
            name: 'RAG + Vector Search',
            type: 'rag',
            status: 'active',
            description: isRTL ? 'جستجوی برداری با پایگاه دانش' : 'Vector search with knowledge base',
            icon: <Database className="w-5 h-5" />
        }
    ]);

    const [documents] = useState<Document[]>([
        { id: '1', name: 'راهنمای قلب و عروق.pdf', type: 'medical_literature', size: '2.5 MB', uploadedAt: '1403/09/15', chunks: 1250, status: 'indexed' },
        { id: '2', name: 'داروهای رایج.pdf', type: 'drug_database', size: '1.2 MB', uploadedAt: '1403/09/10', chunks: 580, status: 'indexed' },
        { id: '3', name: 'تغذیه سالم.pdf', type: 'nutrition', size: '800 KB', uploadedAt: '1403/09/05', chunks: 320, status: 'indexed' },
    ]);

    const handleActivateModel = async (modelId: string) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSelectedModel(modelId);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Brain className="w-7 h-7 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">
                                    {isRTL ? 'تنظیمات هوش مصنوعی' : 'AI Settings'}
                                </h2>
                                <p className="text-white/60 text-sm font-medium">
                                    {isRTL ? 'مدیریت مدل‌ها و پایگاه دانش' : 'Model & Knowledge Base Management'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex gap-3 mt-6">
                        {[
                            { id: 'models', label: isRTL ? '🤖 مدل‌های AI' : '🤖 AI Models', icon: Bot },
                            { id: 'rag', label: isRTL ? '📚 پایگاه دانش' : '📚 Knowledge Base', icon: Database },
                            { id: 'settings', label: isRTL ? '⚙️ تنظیمات' : '⚙️ Settings', icon: Settings },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white text-purple-900 shadow-lg'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[60vh]">
                    {/* Models Tab */}
                    {activeTab === 'models' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-800">
                                    {isRTL ? 'انتخاب مدل هوش مصنوعی' : 'Select AI Model'}
                                </h3>
                                <span className="text-sm text-slate-500 font-medium">
                                    {isRTL ? 'مدل فعال:' : 'Active model:'} <span className="text-emerald-600 font-bold">{models.find(m => m.id === selectedModel)?.name}</span>
                                </span>
                            </div>

                            <div className="grid gap-4">
                                {models.map(model => (
                                    <div 
                                        key={model.id}
                                        className={`relative p-6 rounded-[2rem] border-2 transition-all ${
                                            selectedModel === model.id 
                                                ? 'border-purple-500 bg-purple-50/50 shadow-lg shadow-purple-500/10' 
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                                    model.type === 'fine_tuned' 
                                                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                                        : model.type === 'rag'
                                                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                                                            : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {model.icon}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-slate-800">{model.name}</h4>
                                                        {model.type === 'fine_tuned' && (
                                                            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full">
                                                                {isRTL ? 'فاین‌تیون' : 'Fine-tuned'}
                                                            </span>
                                                        )}
                                                        {model.type === 'rag' && (
                                                            <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold rounded-full">
                                                                RAG
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">{model.description}</p>
                                                    
                                                    {model.accuracy && (
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <span className="text-xs font-bold text-slate-400">
                                                                {isRTL ? 'دقت:' : 'Accuracy:'} <span className="text-emerald-600">{model.accuracy}%</span>
                                                            </span>
                                                            <span className="text-xs font-bold text-slate-400">
                                                                {isRTL ? 'زمان پاسخ:' : 'Response:'} <span className="text-blue-600">{model.responseTime}ms</span>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                {model.status === 'active' && (
                                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">
                                                        <Check className="w-3 h-3" />
                                                        {isRTL ? 'فعال' : 'Active'}
                                                    </span>
                                                )}
                                                
                                                {model.type === 'fine_tuned' && model.status === 'inactive' && (
                                                    <button
                                                        onClick={() => handleActivateModel(model.id)}
                                                        disabled={isLoading}
                                                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                                                    >
                                                        {isLoading ? (
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Zap className="w-4 h-4 inline ml-1" />
                                                                {isRTL ? 'فعال‌سازی' : 'Activate'}
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Model Info Card */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[2rem] p-6 border border-amber-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-amber-800">{isRTL ? 'مدل‌های فاین‌تیون شده' : 'Fine-tuned Models'}</h4>
                                        <p className="text-sm text-amber-700 mt-1">
                                            {isRTL 
                                                ? 'برای فعال‌سازی مدل‌های فاین‌تیون شده، ابتدا باید آنها را آموزش دهید. پس از اتمام آموزش، می‌توانید از این بخش فعال کنید.'
                                                : 'To activate fine-tuned models, you need to train them first. After training completes, you can activate them from here.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RAG Tab */}
                    {activeTab === 'rag' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-800">
                                    {isRTL ? 'مدیریت اسناد' : 'Document Management'}
                                </h3>
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    {isRTL ? 'آپلود سند' : 'Upload Document'}
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4" />
                                        <span className="text-xs font-bold opacity-80">{isRTL ? 'کل اسناد' : 'Total Docs'}</span>
                                    </div>
                                    <div className="text-3xl font-black">{documents.length}</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Layers className="w-4 h-4" />
                                        <span className="text-xs font-bold opacity-80">{isRTL ? 'کلChunks' : 'Total Chunks'}</span>
                                    </div>
                                    <div className="text-3xl font-black">{documents.reduce((acc, d) => acc + d.chunks, 0)}</div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-4 h-4" />
                                        <span className="text-xs font-bold opacity-80">{isRTL ? 'ایندکس شده' : 'Indexed'}</span>
                                    </div>
                                    <div className="text-3xl font-black">{documents.filter(d => d.status === 'indexed').length}</div>
                                </div>
                            </div>

                            {/* Documents List */}
                            <div className="space-y-3">
                                {documents.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{doc.name}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-400">{doc.size}</span>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-slate-400">{doc.uploadedAt}</span>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-slate-400">{doc.chunks} chunks</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {doc.status === 'indexed' && (
                                                <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">
                                                    <Check className="w-3 h-3" />
                                                    {isRTL ? 'ایندکس شده' : 'Indexed'}
                                                </span>
                                            )}
                                            <button className="p-2 hover:bg-white rounded-xl transition-colors">
                                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-slate-800">
                                {isRTL ? 'تنظیمات پیشرفته' : 'Advanced Settings'}
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { 
                                        title: isRTL ? 'پاسخ خودکار' : 'Auto Response',
                                        desc: isRTL ? 'AI به صورت خودکار پاسخ دهد' : 'AI responds automatically',
                                        enabled: true 
                                    },
                                    { 
                                        title: isRTL ? 'CITATION' : 'CITATION',
                                        desc: isRTL ? 'نمایش منابع در پاسخ‌ها' : 'Show sources in responses',
                                        enabled: true 
                                    },
                                    { 
                                        title: isRTL ? 'حالت.safe' : 'Safe Mode',
                                        desc: isRTL ? 'فیلتر محتوای نامناسب' : 'Filter inappropriate content',
                                        enabled: true 
                                    },
                                    { 
                                        title: isRTL ? 'تشخیص زبان' : 'Language Detection',
                                        desc: isRTL ? 'تشخیص خودکار زبان کاربر' : 'Auto-detect user language',
                                        enabled: true 
                                    },
                                ].map((setting, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{setting.title}</h4>
                                            <p className="text-sm text-slate-500">{setting.desc}</p>
                                        </div>
                                        <button className={`w-14 h-8 rounded-full transition-colors relative ${setting.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${setting.enabled ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-slate-600">
                                {isRTL ? 'سیستم آماده است' : 'System Ready'}
                            </span>
                        </div>
                        <button 
                            onClick={onClose}
                            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors"
                        >
                            {isRTL ? 'ذخیره و بستن' : 'Save & Close'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

