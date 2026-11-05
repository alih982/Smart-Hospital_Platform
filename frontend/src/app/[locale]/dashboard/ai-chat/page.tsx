'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { 
    Send, Paperclip, Image, Smile, Bot, 
    Loader2, X, MessageCircle, User, Camera, Zap, Sparkles
} from 'lucide-react';
import { useWebSocketChat, ChatMessage } from '@/services/websocketChat';
import { visionService, VisionMessage } from '@/services/visionService';
import { useAuthStore } from '@/store/useAuthStore';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
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

export default function AIChatPage() {
    const t = useTranslations('chat');
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const router = useRouter();
    const { user } = useAuthStore();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Camera states
    const [showCamera, setShowCamera] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [visionConnected, setVisionConnected] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const promptKeys = ['cold', 'heart', 'allergy', 'pharmacy', 'headache', 'fever'];

    // Vision WebSocket connection
    useEffect(() => {
        // Prevent multiple connection attempts
        if (visionConnected || isAnalyzing) return;
        
        let isMounted = true;
        
        visionService.connect()
            .then(() => {
                if (isMounted) {
                    setVisionConnected(true);
                }
            })
            .catch(() => {
                // Silently fail - service may not be available
            });

        const unsubscribe = visionService.onMessage((message: VisionMessage) => {
            if (isMounted) {
                handleVisionMessage(message);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []); // Empty deps - run once on mount

    const handleVisionMessage = useCallback((message: VisionMessage) => {
        if (message.type === 'status') return;
        
        if (message.type === 'result' && message.success) {
            setIsAnalyzing(false);
            
            const analysisMessage: Message = {
                role: 'assistant',
                content: generateSkinAnalysisMessage(message),
                timestamp: new Date(),
                imageAnalysis: {
                    skinType: message.skin_type || '',
                    skinTypeFa: message.skin_type_fa || '',
                    concerns: message.concerns || [],
                    products: message.products || []
                }
            };
            
            setMessages(prev => [...prev, analysisMessage]);
            setShowCamera(false);
            setCapturedImage(null);
        }
        
        if (message.type === 'error') {
            setIsAnalyzing(false);
            setError(message.message || t('error'));
        }
    }, [t]);

    const generateSkinAnalysisMessage = (result: VisionMessage): string => {
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
    };

    // Camera functions
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
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
                setError(isRTL ? 'دسترسی به دوربین امکان‌پذیر نیست' : 'Camera access denied');
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
            content: isRTL ? '📸 تحلیل پوست من' : '📸 Analyze my skin',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        try {
            visionService.sendImage(capturedImage);
        } catch {
            setIsAnalyzing(false);
            setError(t('error'));
        }
    }, [capturedImage, isRTL, t]);

    const retakePhoto = useCallback(() => {
        setCapturedImage(null);
        startCamera();
    }, [startCamera]);

    const {
        isConnected, 
        messages: wsMessages, 
        sendAIChat,
        clearMessages 
    } = useWebSocketChat({
        onMessage: (message: ChatMessage) => {
            // Handle AI response chunks
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
            
            // Handle AI response complete
            if (message.type === 'ai_response_complete') {
                setIsTyping(false);
            }
            
            // Handle errors
            if (message.content && message.content.toLowerCase().includes('error')) {
                setError(t('error'));
                setIsTyping(false);
            }
        },
    });

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = useCallback(async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        // Add user message
        const userMessage: Message = { 
            role: 'user', 
            content: messageText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
        setInput('');
        setError(null);

        // Add placeholder for AI response
        setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

        // Send via WebSocket
        const success = sendAIChat(messageText);
        
        if (!success) {
            setError(t('connectionError'));
            setIsTyping(false);
            // Remove the placeholder message
            setMessages(prev => prev.slice(0, -1));
        }
    }, [input, sendAIChat, t]);

    const handleClear = useCallback(() => {
        setMessages([]);
        clearMessages();
    }, [clearMessages]);

    const handleQuickPrompt = (prompt: string) => {
        handleSend(prompt);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[2rem] p-8 text-white mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10">
                            <Bot className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">{t('title')}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className="text-sm text-blue-100">
                                    {isConnected ? (isRTL ? 'متصل' : 'Connected') : (isRTL ? 'خطا در اتصال' : 'Connection Error')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleClear}
                        className="p-3 hover:bg-white/10 rounded-xl transition-all"
                        title={t('clear')}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="mt-4 text-blue-100 font-medium">
                    {t('subtitle')}
                </p>
            </div>

            {/* Quick Prompts */}
            {messages.length === 0 && (
                <div className="bg-white rounded-[2rem] p-6 mb-6 shadow-sm border border-gray-100">
                    <h3 className="font-black text-gray-800 mb-4">
                        {isRTL ? 'پرسش‌های سریع' : 'Quick Questions'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {promptKeys.map((key) => (
                            <button
                                key={key}
                                onClick={() => handleQuickPrompt(t(`prompts.${key}`))}
                                className="text-sm font-bold text-gray-600 bg-gray-50 border border-gray-100 py-3 px-4 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-center"
                            >
                                {t(`prompts.${key}`)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50/30"
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl">
                                <MessageCircle className="w-10 h-10 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-800">
                                    {isRTL ? 'با هوش مصنوعی گفتگو کنید' : 'Chat with AI Assistant'}
                                </h3>
                                <p className="text-gray-400 mt-2 max-w-md">
                                    {isRTL 
                                        ? 'سوالات پزشکی خود را بپرسید و پاسخ‌های سریع دریافت کنید'
                                        : 'Ask medical questions and get instant responses'}
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600'
                                }`}>
                                    {msg.role === 'user' ? (
                                        <User className="w-4 h-4" />
                                    ) : (
                                        <Bot className="w-4 h-4" />
                                    )}
                                </div>
                                
                                {/* Message Bubble */}
                                <div
                                    className={`p-4 rounded-[1.5rem] text-sm leading-7 shadow-sm ${
                                        msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}
                                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                >
                                    {msg.content || (isTyping && idx === messages.length - 1 ? '...' : '')}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex items-center gap-3 animate-in fade-in duration-300">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex gap-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-100">
                    {/* Camera View - when camera is active */}
                    {showCamera && (
                        <div className="mb-4 rounded-2xl overflow-hidden bg-black">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover mirror" />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="p-4 flex justify-center gap-4 bg-black/80">
                                <button onClick={stopCamera} className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                    <X size={20} className="text-white" />
                                </button>
                                <button onClick={captureImage} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full border-4 border-white"></div>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Captured Image Preview */}
                    {capturedImage && !showCamera && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
                            <img src={capturedImage} alt="Captured" className="w-32 h-32 object-cover rounded-xl mx-auto mb-3 border-2 border-blue-200" />
                            <div className="flex justify-center gap-3">
                                <button onClick={retakePhoto} className="px-4 py-2 bg-gray-200 rounded-xl text-sm font-bold text-gray-600">
                                    {isRTL ? 'عکس مجدد' : 'Retake'}
                                </button>
                                <button onClick={sendImageForAnalysis} disabled={isAnalyzing} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-sm font-bold text-white flex items-center gap-2">
                                    {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                    {isRTL ? 'تحلیل کن' : 'Analyze'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Analyzing Overlay */}
                    {isAnalyzing && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <span className="font-bold text-blue-700">{isRTL ? 'در حال تحلیل پوست...' : 'Analyzing skin...'}</span>
                        </div>
                    )}
                    
                    <div className="flex gap-4 items-center bg-gray-50 p-3 pr-5 rounded-[2rem] focus-within:ring-4 focus-within:ring-blue-100 focus-within:bg-white transition-all border border-gray-100">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-xl">
                            <Paperclip size={20} />
                        </button>
                        <button 
                            onClick={startCamera}
                            className="p-2 text-gray-400 hover:text-pink-600 transition-colors rounded-xl"
                            title={isRTL ? 'تحلیل پوست' : 'Skin Analysis'}
                        >
                            <Camera size={20} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder={isRTL ? 'پیام خود را بنویسید...' : 'Type your message...'}
                            className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-gray-700 font-bold placeholder:text-gray-400"
                            dir={isRTL ? 'rtl' : 'ltr'}
                            disabled={isTyping}
                        />
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-xl">
                            <Smile size={20} />
                        </button>
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isTyping ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                    {isRTL 
                        ? '⚠️ این ربات صرفاً برای اطلاع‌رسانی است و جایگزین تشخیص پزشکی نیست'
                        : '⚠️ This AI is for informational purposes only and is not a substitute for medical diagnosis'}
                </p>
            </div>
        </div>
    );
}

