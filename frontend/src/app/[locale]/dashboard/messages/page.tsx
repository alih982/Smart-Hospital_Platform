'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { 
    Loader2, MessageSquare, Search, Send, Phone, Video, 
    MoreVertical, Paperclip, Image, Smile, Check, CheckCheck,
    ChevronLeft, PhoneOff, Circle
} from 'lucide-react';
import { chatService, Conversation, Message } from '@/services/chatService';
import apiClient from '@/services/apiClient';

interface ChatItem {
    id: number;
    doctor_name: string;
    specialty: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: boolean;
    is_online?: boolean;
    conversation_id?: number;
}

export default function MessagesPage() {
    const locale = useLocale();
    const isRTL = locale === 'fa';
    
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [chatEnded, setChatEnded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Demo chats for when no backend is available
    const demoChats: ChatItem[] = [
        { id: 1, doctor_name: 'دکتر سارا احمدی', specialty: 'قلب و عروق', avatar: '👩‍⚕️', lastMessage: 'نتایج آزمایش شما آماده است', time: '2:30 PM', unread: true, is_online: true },
        { id: 2, doctor_name: 'دکتر مریم سعادت', specialty: 'چشم‌پزشکی', avatar: '👩‍⚕️', lastMessage: 'فراموش نکنید که...', time: '1:15 PM', unread: false, is_online: false },
        { id: 3, doctor_name: 'دکتر علی محمدی', specialty: 'داخلی', avatar: '👨‍⚕️', lastMessage: 'دارو را منظم مصرف کنید', time: 'دیروز', unread: false, is_online: true },
    ];

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        setLoading(true);
        try {
            // Try to get conversations from backend
            const token = localStorage.getItem('token');
            if (!token || token.startsWith('mock-token')) {
                // Demo mode - use demo data
                setChats(demoChats);
                setLoading(false);
                return;
            }

            const conversations = await chatService.getConversations();
            
            if (conversations && conversations.length > 0) {
                // Transform backend conversations to chat items
                const chatItems: ChatItem[] = conversations.map((conv: Conversation) => ({
                    id: conv.id,
                    doctor_name: conv.other_participant?.full_name || 'Doctor',
                    specialty: 'پزشک',
                    avatar: '👨‍⚕️',
                    lastMessage: conv.messages?.[0]?.content || '',
                    time: conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    unread: false,
                    is_online: Math.random() > 0.5, // Random online status for demo
                    conversation_id: conv.id,
                }));
                setChats(chatItems);
            } else {
                setChats(demoChats);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
            setChats(demoChats);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChat = async (chat: ChatItem) => {
        setSelectedChat(chat);
        setChatEnded(false);
        setMessages([]);
        
        if (chat.conversation_id) {
            try {
                const msgs = await chatService.getMessages(chat.conversation_id);
                setMessages(msgs);
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedChat) return;
        
        const userMessage: Message = {
            id: Date.now(),
            conversation: selectedChat.conversation_id || selectedChat.id,
            sender: 1,
            sender_name: 'شما',
            content: messageText,
            is_ai: false,
            timestamp: new Date().toISOString(),
            is_read: false,
        };
        
        setMessages(prev => [...prev, userMessage]);
        setMessageText('');
        setSending(true);

        try {
            // Try to send to backend
            const token = localStorage.getItem('token');
            if (token && !token.startsWith('mock-token') && selectedChat.conversation_id) {
                await apiClient.post(`/api/v1/chat/messages/`, {
                    conversation_id: selectedChat.conversation_id,
                    content: messageText,
                });
            }
            
            // Simulate doctor typing and response
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                
                // Simulate doctor response
                const doctorResponse: Message = {
                    id: Date.now() + 1,
                    conversation: selectedChat.conversation_id || selectedChat.id,
                    sender: 2,
                    sender_name: selectedChat.doctor_name,
                    content: getAutoReply(messageText),
                    is_ai: false,
                    timestamp: new Date().toISOString(),
                    is_read: true,
                };
                
                setMessages(prev => [...prev, doctorResponse]);
            }, 1500 + Math.random() * 1500); // 1.5-3 seconds delay
            
        } catch (error) {
            console.error('Failed to send message:', error);
            // In demo mode, still show the simulated response
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                const doctorResponse: Message = {
                    id: Date.now() + 1,
                    conversation: selectedChat.conversation_id || selectedChat.id,
                    sender: 2,
                    sender_name: selectedChat.doctor_name,
                    content: getAutoReply(messageText),
                    is_ai: false,
                    timestamp: new Date().toISOString(),
                    is_read: true,
                };
                setMessages(prev => [...prev, doctorResponse]);
            }, 1500);
        } finally {
            setSending(false);
        }
    };

    const getAutoReply = (message: string): string => {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('سلام') || lowerMsg.includes('hello')) {
            return isRTL ? 'سلام! چطور می‌توانم کمکتان کنم؟' : 'Hello! How can I help you?';
        }
        if (lowerMsg.includes('درد') || lowerMsg.includes('pain')) {
            return isRTL ? 'لطفاً بیشتر توضیح دهید درد در کدام قسمت است؟' : 'Please explain more, where is the pain located?';
        }
        if (lowerMsg.includes('دارو') || lowerMsg.includes('medicine') || lowerMsg.includes('medication')) {
            return isRTL ? 'داروی خاصی مد نظرتان است؟ می‌توانم نسخه‌ای برایتان صادر کنم.' : 'Are you looking for a specific medicine? I can write you a prescription.';
        }
        if (lowerMsg.includes('نوبت') || lowerMsg.includes('appointment')) {
            return isRTL ? 'برای گرفتن نوبت می‌توانید از بخش نوبت‌دهی اقدام کنید.' : 'You can book an appointment from the appointments section.';
        }
        if (lowerMsg.includes('نتیجه') || lowerMsg.includes('result')) {
            return isRTL ? 'نتایج آزمایشات شما آماده است. می‌توانید مراجعه کنید.' : 'Your test results are ready. You can visit us.';
        }
        if (lowerMsg.includes('ممنون') || lowerMsg.includes('thanks') || lowerMsg.includes('thank')) {
            return isRTL ? 'خواهش می‌کنم! اگر سوال دیگری دارید در خدمتم.' : 'You\'re welcome! If you have any other questions, I\'m here to help.';
        }
        
        return isRTL 
            ? 'متوجه شدم. آیا اطلاعات دیگری نیاز دارید؟' 
            : 'I understand. Do you need any other information?';
    };

    const handleEndChat = () => {
        setChatEnded(true);
        setSelectedChat(null);
        setMessages([]);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <div className="h-[calc(100vh-12rem)] md:gap-6 flex flex-col md:flex-row gap-4 animate-in fade-in duration-700" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Chat List - Full width on mobile, sidebar on desktop */}
            <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-mega border border-black/[0.03] overflow-hidden flex-col shrink-0`}>
                <div className="p-5 md:p-7 border-b border-black/[0.03]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl md:text-2xl font-black text-black tracking-tight">{isRTL ? 'پیام‌ها' : 'Messages'}</h1>
                            <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center">{chats.length}</span>
                        </div>
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-black rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                            <MessageSquare size={16} className="text-white md:w-[18px] md:h-[18px]" />
                        </div>
                    </div>
                    <div className="relative">
                        <Search className={`absolute top-1/2 -translate-y-1/2 text-black/20 ${isRTL ? 'right-3 md:right-4 left-auto' : 'left-3 md:left-4'}`} size={18} />
                        <input type="text" placeholder={isRTL ? 'جستجو...' : 'Search...'} className={`w-full py-2.5 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 pr-10 ${isRTL ? 'pl-3' : 'pl-10'}`} />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2">
                    {chats.map((chat) => (
                        <button key={chat.id} onClick={() => handleSelectChat(chat)} className={`w-full p-3 md:p-4 flex items-center gap-3 rounded-xl md:rounded-2xl transition-all duration-300 ${selectedChat?.id === chat.id ? 'bg-black text-white shadow-lg' : 'hover:bg-slate-50'}`}>
                            <div className="relative shrink-0">
                                <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl ${selectedChat?.id === chat.id ? 'bg-white/10' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>{chat.avatar}</div>
                                {chat.is_online && <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 rounded-full border-2 border-white"></div>}
                            </div>
                            <div className="flex-1 min-w-0 text-right md:text-start">
                                <div className="flex items-center justify-between md:justify-start gap-2 mb-1">
                                    <p className={`font-bold text-sm md:text-base truncate ${selectedChat?.id === chat.id ? 'text-white' : 'text-black'}`}>{chat.doctor_name}</p>
                                    <span className={`text-[10px] md:text-xs shrink-0 ${selectedChat?.id === chat.id ? 'text-white/40' : 'text-black/30'}`}>{chat.time}</span>
                                </div>
                                <div className="flex items-center justify-between md:justify-start gap-2">
                                    <p className={`text-xs md:text-sm truncate ${selectedChat?.id === chat.id ? 'text-white/60' : 'text-black/40'}`}>{chat.lastMessage}</p>
                                    {chat.unread && <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full shrink-0 animate-pulse"></div>}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Window - Full width on mobile when selected */}
            <div className={`${!selectedChat ? 'hidden md:flex' : 'flex'} w-full md:flex-1 bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-mega border border-black/[0.03] overflow-hidden flex-col min-h-0`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header - Mobile Optimized */}
                        <div className="p-3 md:p-6 border-b border-black/[0.03] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                                <button onClick={() => { setSelectedChat(null); setMessages([]); }} className={`w-9 h-9 md:w-10 md:h-10 bg-slate-100 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 hover:bg-black hover:text-white transition-all ${isRTL ? 'rotate-180' : ''}`}>
                                    <ChevronLeft size={18} className="md:w-5 md:h-5" />
                                </button>
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl text-white font-bold">{selectedChat.avatar}</div>
                                    {selectedChat.is_online && <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 rounded-full border-2 border-white"></div>}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-sm md:text-base text-black truncate">{selectedChat.doctor_name}</p>
                                    <p className="text-[10px] md:text-xs text-black/40 flex items-center gap-1">
                                        <Circle size={6} className={selectedChat.is_online ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'} />
                                        {selectedChat.is_online ? (isRTL ? 'آنلاین' : 'Online') : (isRTL ? 'آفلاین' : 'Offline')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                <button className="w-9 h-9 md:w-10 md:h-10 bg-slate-100 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"><Phone size={16} className="md:w-[18px] md:h-[18px]" /></button>
                                <button className="w-9 h-9 md:w-10 md:h-10 bg-slate-100 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"><Video size={16} className="md:w-[18px] md:h-[18px]" /></button>
                                <button onClick={handleEndChat} className="w-9 h-9 md:w-10 md:h-10 bg-red-50 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all" title={isRTL ? 'پایان چت' : 'End Chat'}><PhoneOff size={16} className="md:w-[18px] md:h-[18px]" /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-3 md:p-6 overflow-y-auto space-y-3 md:space-y-4">
                            {chatEnded ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                        <CheckCheck size={48} className="text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-black mb-2">
                                        {isRTL ? 'گفتگو پایان یافت' : 'Chat Ended'}
                                    </h3>
                                    <p className="text-black/50">
                                        {isRTL ? 'ممنون از گفتگو با شما' : 'Thank you for chatting'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center">
                                        <span className="text-black/20 text-[10px] font-black uppercase tracking-widest">{isRTL ? 'امروز' : 'Today'}</span>
                                    </div>
                                    
                                    {messages.length === 0 ? (
                                        <div className="text-center py-20">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-6">
                                                <MessageSquare size={40} className="text-black/20" />
                                            </div>
                                            <p className="text-black/30 font-medium">{isRTL ? 'پیامی وجود ندارد' : 'No messages yet'}</p>
                                            <p className="text-black/20 text-sm mt-2">
                                                {isRTL ? 'می‌توانید پیام خود را ارسال کنید' : 'You can send your message'}
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`flex ${msg.sender_name === 'شما' || msg.sender === 1 ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                                            >
                                                <div className={`max-w-[70%] p-6 rounded-[2rem] ${
                                                    msg.sender_name === 'شما' || msg.sender === 1
                                                        ? isRTL 
                                                            ? 'bg-black text-white rounded-bl-sm' 
                                                            : 'bg-black text-white rounded-br-sm'
                                                        : isRTL
                                                            ? 'bg-emerald-500 text-white rounded-br-sm'
                                                            : 'bg-slate-50 text-black rounded-bl-sm'
                                                }`}>
                                                    <p className="font-medium text-lg">{msg.content}</p>
                                                    <div className={`flex items-center gap-1 mt-2 ${msg.sender_name === 'شما' || msg.sender === 1 ? (isRTL ? 'justify-start' : 'justify-end') : ''}`}>
                                                        <span className="text-xs opacity-50">{formatTime(msg.timestamp)}</span>
                                                        {msg.sender_name === 'شما' || msg.sender === 1 ? (
                                                            msg.is_read ? <CheckCheck size={14} /> : <Check size={14} />
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {/* Typing Indicator */}
                                    {isTyping && (
                                        <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-6 rounded-[2rem] bg-slate-50 text-black`}>
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Message Input */}
                        {!chatEnded && (
                            <div className="p-8 border-t border-black/[0.03]">
                                <div className="flex items-center gap-4">
                                    <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all group">
                                        <Paperclip size={20} className="text-black/40 group-hover:text-white" />
                                    </button>
                                    <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all group">
                                        <Image size={20} className="text-black/40 group-hover:text-white" />
                                    </button>
                                    <input 
                                        type="text"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                                        placeholder={isRTL ? 'پیام خود را بنویسید...' : 'Type a message...'}
                                        disabled={sending}
                                        className="flex-1 px-6 py-5 bg-slate-50 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 disabled:opacity-50"
                                    />
                                    <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all group">
                                        <Smile size={20} className="text-black/40 group-hover:text-white" />
                                    </button>
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={!messageText.trim() || sending}
                                        className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-32 h-32 bg-slate-50 rounded-[4rem] flex items-center justify-center mx-auto mb-8">
                                <MessageSquare size={56} className="text-black/10" />
                            </div>
                            <p className="text-black/30 font-black text-xl tracking-tight">{isRTL ? 'یک گفتگو را انتخاب کنید' : 'Select a conversation'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
