'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useWebSocketChat, ChatMessage } from '@/services/websocketChat';
import { visionService, VisionMessage } from '@/services/visionService';
import { X, Camera, Loader2, Sparkles, Zap, MessageCircle, Bot } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: Array<{ content: string; similarity: number }>;
    imageAnalysis?: {
        skinType: string;
        skinTypeFa: string;
        concerns: string[];
        products: Array<{
            name: string;
            name_fa: string;
            category: string;
            description: string;
            confidence: number;
        }>;
    };
}

type ViewMode = 'chat' | 'camera';

export default function AIChat() {
    const t = useTranslations('chat');
    const locale = useLocale();
    const isRTL = locale === 'fa';

    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [visionConnected, setVisionConnected] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { sendAIChat } = useWebSocketChat({
        onMessage: (message: ChatMessage) => {
            try {
                if (message.type === 'ai_response_chunk') {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        if (lastMsg && lastMsg.role === 'assistant') {
                            lastMsg.content += message.content;
                        }
                        return newMsgs;
                    });
                }
                if (message.type === 'ai_response_complete') {
                    setIsTyping(false);
                }
                if (message.type === 'error') {
                    setError(message.content || t('error'));
                    setIsTyping(false);
                }
            } catch (err) {
                console.warn('Error handling message:', err);
            }
        },
        onError: (error: Error) => {
            console.warn('WebSocket error:', error.message);
            setError(t('connectionError'));
        }
    });

    const generateSkinAnalysisMessage = useCallback((result: VisionMessage): string => {
        const skinType = result.skin_type_fa || result.skin_type || 'نامشخص';
        const concerns = result.concerns || [];
        let message = `🌟 **تحلیل پوست شما**\n\n`;
        message += `📋 **نوع پوست**: ${skinType}\n\n`;
        if (concerns.length > 0) {
            message += `⚠️ **مشکلات شناسایی شده**:\n`;
            concerns.forEach(c => { message += `• ${c}\n`; });
            message += `\n`;
        }
        if (result.products && result.products.length > 0) {
            message += `💊 **محصولات پیشنهادی**:\n`;
            result.products.slice(0, 3).forEach((p, i) => {
                message += `${i + 1}. ${p.name_fa || p.name} (${p.category})\n`;
            });
        }
        return message;
    }, []);

    const handleVisionMessage = useCallback((message: VisionMessage) => {
        if (message.type === 'status') return;
        if (message.type === 'result' && message.success) {
            setIsAnalyzing(false);
            const analysisMessage: Message = {
                role: 'assistant',
                content: generateSkinAnalysisMessage(message),
                imageAnalysis: {
                    skinType: message.skin_type || '',
                    skinTypeFa: message.skin_type_fa || '',
                    concerns: message.concerns || [],
                    products: message.products || []
                }
            };
            setMessages(prev => [...prev, analysisMessage]);
            setViewMode('chat');
        }
        if (message.type === 'error') {
            setIsAnalyzing(false);
            setError(message.message || t('error'));
        }
    }, [t, generateSkinAnalysisMessage]);

    useEffect(() => {
        if (isOpen && viewMode === 'camera') {
            if (visionConnected) return;
            
            let isMounted = true;
            
            visionService.connect()
                .then(() => {
                    if (isMounted) setVisionConnected(true);
                })
                .catch(err => console.error('Vision connection failed:', err.message));
            
            const unsubscribe = visionService.onMessage(handleVisionMessage);
            return () => {
                isMounted = false;
                unsubscribe();
            };
        }
        if (isOpen && viewMode === 'chat' && visionConnected) {
            visionService.disconnect();
            setVisionConnected(false);
        }
    }, [isOpen, viewMode, visionConnected, handleVisionMessage]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isAnalyzing]);

    const handleSend = useCallback(() => {
        if (!input.trim()) return;
        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
        setInput('');
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        sendAIChat(input, false);
    }, [input, sendAIChat]);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setShowCamera(true);
                setCapturedImage(null);
            }
        } catch (err: unknown) {
            const error = err as Error;
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setError(isRTL ? 'دسترسی به دوربین رد شد. لطفاً مجوز دوربین را در تنظیمات مرورگر فعال کنید.' : 'Camera permission denied. Please enable camera access in browser settings.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                setError(isRTL ? 'دوربین یافت نشد.' : 'Camera not found.');
            } else {
                setError(isRTL ? 'دسترسی به دوربین ممکن نیست' : 'Camera access denied');
            }
        }
    }, [isRTL]);

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
        setShowCamera(false);
        setCapturedImage(null);
    }, []);

    const captureImage = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg', 0.85);
                setCapturedImage(imageData);
                stopCamera();
            }
        }
    }, [stopCamera]);

    const sendImageForAnalysis = useCallback(() => {
        if (!capturedImage) return;
        setIsAnalyzing(true);
        setError(null);
        const userMessage: Message = { 
            role: 'user', 
            content: isRTL ? '📸 تحلیل پوست من' : '📸 Analyze my skin'
        };
        setMessages(prev => [...prev, userMessage]);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        try {
            visionService.sendImage(capturedImage);
        } catch (err) {
            console.error('Error sending image:', err);
            setIsAnalyzing(false);
            setError(t('error'));
        }
    }, [capturedImage, isRTL, t]);

    const handleFloatingButtonClick = () => setIsOpen(!isOpen);
    const handleChatClick = () => { setIsOpen(true); setViewMode('chat'); };
    const handleCameraClick = () => { setIsOpen(true); setViewMode('camera'); };

    return (
        <div className={`fixed bottom-6 ${isRTL ? 'left-4' : 'right-4'} z-50`}>
            <div className="relative group">
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} bottom-0 mb-2 flex flex-col gap-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform ${isRTL ? 'translate-x-2' : 'translate-x-[-3.5rem]'}`}>
                    <button onClick={handleChatClick} className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all">
                        <MessageCircle size={20} />
                    </button>
                    <button onClick={handleCameraClick} className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all">
                        <Camera size={20} />
                    </button>
                </div>
                <button onClick={handleFloatingButtonClick} className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all">
                    {isOpen ? <X size={20} className="sm:w-5 sm:h-5" /> : <Bot size={20} className="sm:w-5 sm:h-5" />}
                </button>
            </div>

            {isOpen && (
                <div className={`absolute bottom-14 ${isRTL ? 'left-0' : 'right-0'} w-[280px] max-w-[70vw] h-[80px] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden`}>
                    <div className="flex border-b border-gray-100">
                        <button onClick={() => setViewMode('camera')} className={`flex-1 py-2 text-sm font-bold flex items-center justify-center gap-1 ${viewMode === 'camera' ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}>
                            <Camera size={14} /> {isRTL ? 'دوربین' : 'Camera'}
                        </button>
                        <button onClick={() => setViewMode('chat')} className={`flex-1 py-2 text-sm font-bold flex items-center justify-center gap-1 ${viewMode === 'chat' ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}>
                            <MessageCircle size={14} /> {isRTL ? 'چت' : 'Chat'}
                        </button>
                    </div>

                    {viewMode === 'camera' && (
                        <div className="flex-1 flex flex-col">
                            {showCamera ? (
                                <div className="flex-1 relative bg-black">
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    <canvas ref={canvasRef} className="hidden" />
                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                                        <button onClick={stopCamera} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><X size={20} className="text-white" /></button>
                                        <button onClick={captureImage} className="w-16 h-16 bg-white rounded-full flex items-center justify-center"><div className="w-12 h-12 bg-purple-500 rounded-full border-4 border-white"></div></button>
                                    </div>
                                </div>
                            ) : capturedImage ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                                    <img src={capturedImage} alt="Captured" className="w-48 h-48 object-cover rounded-2xl border-4 border-purple-200" />
                                    <div className="flex gap-3">
                                        <button onClick={() => { setCapturedImage(null); startCamera(); }} className="px-4 py-2 bg-gray-100 rounded-xl">{isRTL ? 'عکس مجدد' : 'Retake'}</button>
                                        <button onClick={sendImageForAnalysis} disabled={isAnalyzing} className="px-6 py-2 bg-purple-500 text-white rounded-xl flex items-center gap-2">
                                            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                            {isRTL ? 'تحلیل' : 'Analyze'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                                    <Camera size={48} className="text-purple-400" />
                                    <p className="text-gray-500">{isRTL ? 'از پوست خود عکس بگیرید' : 'Take a photo of your skin'}</p>
                                    <button onClick={startCamera} className="px-8 py-3 bg-purple-500 text-white rounded-2xl font-bold">{isRTL ? 'باز کردن دوربین' : 'Open Camera'}</button>
                                </div>
                            )}
                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="bg-white px-6 py-4 rounded-2xl flex items-center gap-3">
                                        <Sparkles size={16} className="text-purple-500 animate-pulse" />
                                        <span>{isRTL ? 'در حال تحلیل...' : 'Analyzing...'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === 'chat' && (
                        <>
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <p className="text-4xl mb-2">💬</p>
                                        <p className="text-gray-400">{t('greeting')}</p>
                                    </div>
                                )}
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                            {msg.imageAnalysis ? (
                                                <div>
                                                    <div className="font-bold text-purple-600">{msg.imageAnalysis.skinTypeFa}</div>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {msg.imageAnalysis.concerns.map((c, i) => (
                                                            <span key={i} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">{c}</span>
                                                        ))}
                                                    </div>
                                                    {msg.imageAnalysis.products.slice(0,2).map((p, i) => (
                                                        <div key={i} className="text-xs bg-emerald-50 p-2 rounded mt-1">{p.name_fa}</div>
                                                    ))}
                                                </div>
                                            ) : msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 px-4 py-2 rounded-2xl flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t border-gray-100">
                                <div className="flex gap-2 items-center bg-gray-50 rounded-2xl p-2">
                                    <button onClick={() => setViewMode('camera')} className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                        <Camera size={18} />
                                    </button>
                                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t('placeholder')} className="flex-1 bg-transparent border-none outline-none text-sm" />
                                    <button onClick={handleSend} disabled={!input.trim()} className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

