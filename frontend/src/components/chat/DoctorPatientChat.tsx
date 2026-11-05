'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { 
    Send, 
    Loader2, 
    ChevronLeft, 
    Phone, 
    Video, 
    MoreVertical, 
    User, 
    LogIn,
    FileText,
    Pill,
    Plus,
    X,
    Check,
    Stethoscope,
    Sparkles,
    AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { chatService, AppointmentDoctor } from '@/services/chatService';
import { useWebSocketChat, ChatMessage } from '@/services/websocketChat';

interface Message {
    id: number;
    sender_id: string | number;
    sender_name: string;
    content: string;
    time: string;
    metadata?: any;
    type?: 'text' | 'prescription';
}

interface PrescriptionItem {
    name: string;
    dosage: string;
    frequency: string;
}

function ChatContent() {
    const locale = useLocale();
    const router = useRouter();
    const isRTL = locale === 'fa';
    const isEnglish = locale === 'en';
    const { user } = useAuthStore();
    
    const [doctors, setDoctors] = useState<AppointmentDoctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<AppointmentDoctor | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [showConversations, setShowConversations] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Prescription modal state
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
        { name: '', dosage: '', frequency: '' }
    ]);
    const [prescriptionDiagnosis, setPrescriptionDiagnosis] = useState('');
    const [creatingPrescription, setCreatingPrescription] = useState(false);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token && !token.startsWith('mock-'));
    }, [user]);

    // Fetch doctors from appointments
    useEffect(() => {
        if (isAuthenticated) {
            loadDoctors();
        } else {
            setLoadingDoctors(false);
        }
    }, [isAuthenticated]);

    const loadDoctors = async () => {
        setLoadingDoctors(true);
        try {
            const doctorsData = await chatService.getAppointmentDoctors();
            setDoctors(doctorsData);
        } catch (error) {
            console.error('Failed to load doctors:', error);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // WebSocket integration
    const {
        isConnected,
        sendPrivateMessage,
    } = useWebSocketChat({
        onMessage: (message: ChatMessage) => {
            if (message.type === 'chat_message' && selectedDoctor) {
                const newMessage: Message = {
                    id: message.message_id || Date.now(),
                    sender_id: message.sender_id,
                    sender_name: message.sender_name,
                    content: message.content,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    metadata: message.metadata,
                };
                setMessages(prev => [...prev, newMessage]);
            }
            
            if (message.type === 'system_message' || message.type === 'error') {
                const sysMessage: Message = {
                    id: Date.now(),
                    sender_id: 'system',
                    sender_name: 'System',
                    content: message.content,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages(prev => [...prev, sysMessage]);
            }
        },
        onConnected: () => {
            console.log('WebSocket connected for private chat');
        },
        onDisconnected: () => {
            console.log('WebSocket disconnected');
        },
    });

    // Demo messages when a doctor is selected
    useEffect(() => {
        if (selectedDoctor && messages.length === 0) {
            const welcomeMessage: Message = {
                id: 1,
                sender_id: 'doctor',
                sender_name: selectedDoctor.full_name,
                content: isEnglish 
                    ? `Hello! I'm ${selectedDoctor.full_name}. How can I help you today?`
                    : `سلام! من ${selectedDoctor.full_name} هستم. چطور می‌تونم کمکتون کنم؟`,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([welcomeMessage]);
        }
    }, [selectedDoctor, isEnglish]);

    const handleSendMessage = () => {
        if (!inputMessage.trim() || !selectedDoctor) return;

        const newMessage: Message = {
            id: Date.now(),
            sender_id: 'patient',
            sender_name: isEnglish ? 'Patient' : 'بیمار',
            content: inputMessage,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);

        if (isConnected && selectedDoctor.user_id) {
            const success = sendPrivateMessage(selectedDoctor.user_id, inputMessage);
            if (!success) {
                simulateDoctorResponse();
            }
        } else {
            simulateDoctorResponse();
        }

        setInputMessage('');
    };

    const simulateDoctorResponse = () => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            const responses = isEnglish ? [
                'I understand. Let me check your symptoms.',
                'Please take this medication as prescribed.',
                'Don\'t worry, your condition is manageable.',
                'I recommend some tests to be done.',
                'Based on your symptoms, I\'ll prepare a prescription for you.',
            ] : [
                'متوجه شدم. اجازه بدید علائم شما رو بررسی کنم.',
                'لطفاً این دارو رو طبق نسخه مصرف کنید.',
                'نگران نباشید، وضعیت شما قابل کنترل است.',
                'توصیه می‌کنم آزمایشاتی انجام بدید.',
                'بر اساس علائم شما، یک نسخه برایتان می‌نویسم.',
            ];
            const response: Message = {
                id: Date.now() + 1,
                sender_id: 'doctor',
                sender_name: selectedDoctor?.full_name || 'Doctor',
                content: responses[Math.floor(Math.random() * responses.length)],
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, response]);
        }, 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Prescription functions
    const addPrescriptionItem = () => {
        setPrescriptionItems([...prescriptionItems, { name: '', dosage: '', frequency: '' }]);
    };

    const removePrescriptionItem = (index: number) => {
        setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
    };

    const updatePrescriptionItem = (index: number, field: keyof PrescriptionItem, value: string) => {
        const updated = [...prescriptionItems];
        updated[index][field] = value;
        setPrescriptionItems(updated);
    };

    const handleCreatePrescription = async () => {
        if (!prescriptionDiagnosis || prescriptionItems.some(item => !item.name)) {
            alert(isRTL ? 'لطفا تشخیص و داروها را وارد کنید' : 'Please enter diagnosis and medications');
            return;
        }

        setCreatingPrescription(true);

        // Get user info from localStorage
        const storedUser = localStorage.getItem('user');
        let userName = isRTL ? 'بیمار' : 'Patient';
        let userId = '1';
        
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userName;
                userId = userData.id || userData.user_id || '1';
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        // Save prescription to localStorage
        const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
        const newPrescription = {
            id: `RX-${Date.now()}`,
            patient_id: userId,
            patient_name: userName,
            doctor_name: selectedDoctor?.full_name,
            doctor: selectedDoctor,
            diagnosis_text: prescriptionDiagnosis,
            medications: prescriptionItems,
            created_at: new Date().toISOString(),
            status: 'active',
            is_paid: false,
            notes: ''
        };
        
        prescriptions.push(newPrescription);
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));

        // Add prescription message to chat
        const prescriptionMessage: Message = {
            id: Date.now() + 2,
            sender_id: 'doctor',
            sender_name: selectedDoctor?.full_name || 'Doctor',
            content: isEnglish 
                ? `I've prepared a prescription for you. Please check your prescriptions list.`
                : `برای شما یک نسخه تجویز کردم. لطفاً لیست نسخه‌ها را بررسی کنید.`,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: 'prescription',
            metadata: { prescription: newPrescription }
        };
        
        setMessages(prev => [...prev, prescriptionMessage]);

        // Reset and close modal
        setShowPrescriptionModal(false);
        setPrescriptionDiagnosis('');
        setPrescriptionItems([{ name: '', dosage: '', frequency: '' }]);
        setCreatingPrescription(false);

        alert(isRTL ? 'نسخه با موفقیت صادر شد!' : 'Prescription created successfully!');
    };

    return (
        <div className="flex h-[calc(100vh-200px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sidebar */}
            <div className={`${showConversations ? 'w-80' : 'w-0'} transition-all duration-300 border-l border-gray-200 bg-gray-50 flex flex-col`}>
                <div className="p-5 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">
                        {isEnglish ? 'Conversations' : 'گفتگوها'}
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loadingDoctors ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="animate-spin text-purple-600" size={24} />
                        </div>
                    ) : !isAuthenticated ? (
                        <div className="p-8 text-center">
                            <LogIn className="mx-auto text-gray-300 mb-4" size={32} />
                            <p className="text-sm text-gray-500">
                                {isEnglish ? 'Please login to view conversations' : 'لطفاً وارد شوید'}
                            </p>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="p-8 text-center">
                            <User className="mx-auto text-gray-300 mb-4" size={32} />
                            <p className="text-sm text-gray-500">
                                {isEnglish ? 'No doctors found' : 'پزشکی یافت نشد'}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                {isEnglish ? 'Book an appointment first' : 'ابتدا یک قرار ملاقات رزرو کنید'}
                            </p>
                        </div>
                    ) : (
                        doctors.map((doctor) => (
                            <div
                                key={doctor.id}
                                onClick={() => setSelectedDoctor(doctor)}
                                className={`p-4 cursor-pointer hover:bg-white transition-all border-b border-gray-100 ${
                                    selectedDoctor?.id === doctor.id ? 'bg-white border-l-4 border-l-purple-500' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-2xl">
                                            👨‍⚕️
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-800 text-sm">{doctor.full_name}</h4>
                                        <p className="text-xs text-gray-500">{doctor.specialty}</p>
                                        <p className="text-[10px] text-purple-500 mt-1">
                                            {doctor.appointment_date} {doctor.appointment_time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedDoctor ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowConversations(!showConversations)} className="lg:hidden p-1 hover:bg-gray-100 rounded-lg">
                                    <ChevronLeft className={isRTL ? 'rotate-180' : ''} />
                                </button>
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-xl">
                                        👨‍⚕️
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${isConnected ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{selectedDoctor.full_name}</h3>
                                    <p className="text-xs text-gray-500">
                                        {selectedDoctor.specialty}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setShowPrescriptionModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                >
                                    <FileText size={16} />
                                    {isRTL ? 'نسخه' : 'Rx'}
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender_id === 'patient' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                                        msg.sender_id === 'patient' 
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-br-sm' 
                                            : msg.sender_id === 'system'
                                                ? 'bg-amber-100 text-amber-800 text-center text-sm'
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                    }`}>
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${msg.sender_id === 'patient' ? 'text-purple-200' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-gray-200">
                            <div className="flex gap-2 items-center bg-gray-50 p-1.5 pr-3 rounded-full border border-gray-200">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={isEnglish ? 'Type a message...' : 'پیام خود را بنویسید...'}
                                    className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 text-gray-800"
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim()}
                                    className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                >
                                    <Send size={16} className={isRTL ? 'rotate-180' : ''} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">
                            💬
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            {isEnglish ? 'Select a Doctor' : 'یک پزشک را انتخاب کنید'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEnglish ? 'Choose a doctor to start chatting' : 'برای شروع چت، پزشک مورد نظر را انتخاب کنید'}
                        </p>
                    </div>
                )}
            </div>

            {/* Prescription Modal */}
            {showPrescriptionModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPrescriptionModal(false)}>
                    <div 
                        className="bg-white rounded-[2rem] max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-[2rem]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                                        <FileText className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900">
                                            {isRTL ? 'نسخه جدید' : 'New Prescription'}
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            {selectedDoctor?.full_name}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowPrescriptionModal(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* AI Assistant Badge */}
                            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-bold text-purple-700">
                                    {isRTL ? 'هوش مصنوعی به کمک شما می‌آید' : 'AI Assistant helps you'}
                                </span>
                            </div>

                            {/* Diagnosis */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {isRTL ? 'تشخیص پزشک' : 'Medical Diagnosis'}
                                </label>
                                <textarea
                                    value={prescriptionDiagnosis}
                                    onChange={(e) => setPrescriptionDiagnosis(e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all text-gray-800 font-medium"
                                    placeholder={isRTL ? 'تشخیص خود را وارد کنید...' : 'Enter diagnosis...'}
                                />
                            </div>

                            {/* Medications */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-bold text-gray-700">
                                        {isRTL ? 'داروهای تجویزی' : 'Prescribed Medications'}
                                    </label>
                                    <button
                                        onClick={addPrescriptionItem}
                                        className="flex items-center gap-1 text-xs bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1.5 rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                    >
                                        <Plus size={12} /> 
                                        {isRTL ? 'افزودن دارو' : 'Add Drug'}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {prescriptionItems.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-start">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <input
                                                    placeholder={isRTL ? 'نام دارو' : 'Drug Name'}
                                                    value={item.name}
                                                    onChange={(e) => updatePrescriptionItem(idx, 'name', e.target.value)}
                                                    className="p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                                                />
                                                <input
                                                    placeholder={isRTL ? 'دوز (مثلاً 500mg)' : 'Dosage (e.g. 500mg)'}
                                                    value={item.dosage}
                                                    onChange={(e) => updatePrescriptionItem(idx, 'dosage', e.target.value)}
                                                    className="p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                                                />
                                                <input
                                                    placeholder={isRTL ? 'زمان (مثلاً 2 بار در روز)' : 'Frequency (e.g. 2x daily)'}
                                                    value={item.frequency}
                                                    onChange={(e) => updatePrescriptionItem(idx, 'frequency', e.target.value)}
                                                    className="p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                                                />
                                            </div>
                                            {prescriptionItems.length > 1 && (
                                                <button
                                                    onClick={() => removePrescriptionItem(idx)}
                                                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-amber-800">
                                        {isRTL ? 'توجه' : 'Note'}
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1">
                                        {isRTL 
                                            ? 'این نسخه برای بیمار ارسال می‌شود و می‌تواند از داروخانه خرید کند.'
                                            : 'This prescription will be sent to the patient and they can purchase from the pharmacy.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-[2rem]">
                            <button
                                onClick={handleCreatePrescription}
                                disabled={creatingPrescription}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {creatingPrescription ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        {isRTL ? 'در حال صدور...' : 'Issuing...'}
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        {isRTL ? 'صدور نسخه' : 'Issue Prescription'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DoctorPatientChat() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="animate-spin text-purple-600 w-6 h-6" />
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}

