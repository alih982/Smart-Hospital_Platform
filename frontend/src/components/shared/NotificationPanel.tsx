'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    Bell, X, Info, CheckCircle, AlertTriangle, AlertCircle, 
    ExternalLink, Calendar as CalendarIcon, MessageSquare, ChevronDown, 
    Pill, Stethoscope, Clock, FileText, Activity, Heart, 
    Settings, Trash2, Eye, Check, Filter, Search, RefreshCw,
    User, StickyNote, CreditCard, Package, Mail, Phone, 
    Mic, FileCheck, Syringe, Thermometer, HeartPulse,
    Brain, Eye as EyeIcon, Bone, Baby
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import apiClient from '@/services/apiClient';

interface Notification {
    id: number;
    title: string;
    message: string;
    notification_type: 
        | 'info' | 'success' | 'warning' | 'error' 
        | 'appointment' | 'message' | 'prescription' | 'pharmacy'
        | 'lab' | 'payment' | 'document' | 'system'
        | 'health_alert' | 'reminder' | 'emergency';
    link?: string;
    created_at: string;
    is_read: boolean;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    action_required?: boolean;
}

// Extended demo notifications with more types
const demoNotifications: Notification[] = [
    {
        id: 1,
        title: 'نوبت جدید',
        message: 'شما یک نوبت جدید با دکتر سارا احمدی در تاریخ ۱۵ آذر ماه ساعت ۹:۳۰ صبح دارید.',
        notification_type: 'appointment',
        link: '/dashboard/appointments',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        is_read: false,
        priority: 'high',
        action_required: true
    },
    {
        id: 2,
        title: 'نسخه جدید صادر شد',
        message: 'دکتر احمدی برای شما یک نسخه جدید صادر کرده است. لطفاً برای دریافت داروها به داروخانه مراجعه کنید.',
        notification_type: 'prescription',
        link: '/dashboard/prescriptions',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        is_read: false,
        priority: 'medium'
    },
    {
        id: 3,
        title: 'پیام جدید از پزشک',
        message: 'دکتر مریم سعادت برای شما پیامی ارسال کرده است: "نتایج آزمایشات شما آماده است..."',
        notification_type: 'message',
        link: '/dashboard/messages',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        is_read: false,
        priority: 'medium'
    },
    {
        id: 4,
        title: 'آماده تحویل',
        message: 'داروهای شما آماده تحویل از داروخانه مرکزی می‌باشد. لطفاً ظرف ۴۸ ساعت مراجعه کنید.',
        notification_type: 'pharmacy',
        link: '/pharmacy',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        is_read: true,
        priority: 'medium'
    },
    {
        id: 5,
        title: 'نتایج آزمایش آماده شد',
        message: 'نتایج آزمایش خون شما آماده شده است. می‌توانید از طریق پنل خود مشاهده کنید.',
        notification_type: 'lab',
        link: '/dashboard/lab',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        is_read: true,
        priority: 'high'
    },
    {
        id: 6,
        title: 'یادآوری مصرف دارو',
        message: 'فراموش نکنید که داروهای خود را به موقع مصرف کنید. قرص آهن - ساعت ۸ صبح',
        notification_type: 'reminder',
        link: '/dashboard/prescriptions',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        is_read: true,
        priority: 'low'
    },
    {
        id: 7,
        title: 'پرداخت موفق',
        message: 'پرداخت شما برای ویزیت دکتر احمدی با موفقیت انجام شد. شماره پیگیری: #TXN-۱۲۳۴۵',
        notification_type: 'payment',
        link: '/dashboard/invoices',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        is_read: true,
        priority: 'low'
    },
    {
        id: 8,
        title: 'هشدار سلامتی',
        message: 'به نظر می‌رسد فشار خون شما در محدوده بالا قرار دارد. لطفاً با پزشک مشورت کنید.',
        notification_type: 'health_alert',
        link: '/dashboard/ai-chat',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
        is_read: false,
        priority: 'urgent',
        action_required: true
    },
];

// Notification type configurations
const getNotificationConfig = (type: string) => {
    const configs: Record<string, { icon: React.ReactNode; bgGradient: string; iconColor: string; label: string }> = {
        success: { icon: <CheckCircle size={18} />, bgGradient: 'from-emerald-500 to-teal-500', iconColor: 'text-emerald-500', label: 'موفق' },
        warning: { icon: <AlertTriangle size={18} />, bgGradient: 'from-amber-500 to-orange-500', iconColor: 'text-amber-500', label: 'هشدار' },
        error: { icon: <AlertCircle size={18} />, bgGradient: 'from-red-500 to-rose-500', iconColor: 'text-red-500', label: 'خطا' },
        appointment: { icon: <CalendarIcon size={18} />, bgGradient: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-500', label: 'نوبت' },
        message: { icon: <MessageSquare size={18} />, bgGradient: 'from-purple-500 to-pink-500', iconColor: 'text-purple-500', label: 'پیام' },
        prescription: { icon: <FileText size={18} />, bgGradient: 'from-indigo-500 to-violet-500', iconColor: 'text-indigo-500', label: 'نسخه' },
        pharmacy: { icon: <Pill size={18} />, bgGradient: 'from-emerald-500 to-green-500', iconColor: 'text-emerald-500', label: 'دارو' },
        lab: { icon: <Syringe size={18} />, bgGradient: 'from-rose-500 to-pink-500', iconColor: 'text-rose-500', label: 'آزمایش' },
        payment: { icon: <CreditCard size={18} />, bgGradient: 'from-amber-500 to-yellow-500', iconColor: 'text-amber-500', label: 'پرداخت' },
        document: { icon: <StickyNote size={18} />, bgGradient: 'from-slate-500 to-zinc-500', iconColor: 'text-slate-500', label: 'سند' },
        system: { icon: <Settings size={18} />, bgGradient: 'from-slate-400 to-slate-600', iconColor: 'text-slate-500', label: 'سیستم' },
        health_alert: { icon: <HeartPulse size={18} />, bgGradient: 'from-red-500 to-orange-500', iconColor: 'text-red-500', label: 'سلامت' },
        reminder: { icon: <Clock size={18} />, bgGradient: 'from-violet-500 to-purple-500', iconColor: 'text-violet-500', label: 'یادآوری' },
        emergency: { icon: <Phone size={18} />, bgGradient: 'from-red-600 to-rose-600', iconColor: 'text-red-600', label: 'اورژانس' },
    };
    return configs[type] || { icon: <Info size={18} />, bgGradient: 'from-blue-400 to-slate-500', iconColor: 'text-blue-500', label: 'اطلاعات' };
};

// Priority badge
const getPriorityBadge = (priority?: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
        urgent: { bg: 'bg-red-100', text: 'text-red-600', label: 'فوری' },
        high: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'بالا' },
        medium: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'متوسط' },
        low: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'کم' },
    };
    return badges[priority || 'low'];
};

export default function NotificationPanel() {
    const t = useTranslations('notifications');
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState<'all' | 'unread' | 'appointment' | 'prescription' | 'message'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications from API
    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get('/notifications/');
                const data = response.data;
                if (Array.isArray(data) && data.length > 0) {
                    setNotifications(data);
                    setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
                } else {
                    // Use demo notifications
                    setNotifications(demoNotifications);
                    setUnreadCount(demoNotifications.filter(n => !n.is_read).length);
                }
            } catch (error) {
                // Use demo notifications in case of API failure
                setNotifications(demoNotifications);
                setUnreadCount(demoNotifications.filter(n => !n.is_read).length);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (item: Notification) => {
        // Mark as read in backend
        if (!item.is_read) {
            try {
                await apiClient.patch(`/notifications/${item.id}/`, { is_read: true });
                setNotifications(prev => prev.map(n => 
                    n.id === item.id ? { ...n, is_read: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark notification as read');
            }
        }
        
        // Navigate if link exists
        if (item.link) {
            window.location.href = item.link;
        }
    };

    const markAllAsRead = async () => {
        setIsLoading(true);
        try {
            await apiClient.post('/notifications/mark-all-read/', {});
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
           (0);
        setUnreadCount } catch (error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNotification = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
        const item = notifications.find(n => n.id === id);
        if (item && !item.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return isRTL ? 'الان' : 'Just now';
        if (diffMins < 60) return isRTL ? `${diffMins} دقیقه پیش` : `${diffMins}m ago`;
        if (diffHours < 24) return isRTL ? `${diffHours} ساعت پیش` : `${diffHours}h ago`;
        if (diffDays < 7) return isRTL ? `${diffDays} روز پیش` : `${diffDays}d ago`;
        return date.toLocaleDateString(isRTL ? 'fa-IR' : 'en-US');
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'appointment') return n.notification_type === 'appointment';
        if (filter === 'prescription') return n.notification_type === 'prescription';
        if (filter === 'message') return n.notification_type === 'message';
        return true;
    }).filter(n => 
        searchQuery === '' || 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Toggle Button - Premium Design */}
            <button
                onClick={togglePanel}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    isOpen 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-slate-100 text-slate-600 hover:bg-white hover:shadow-md border border-slate-200'
                }`}
            >
                <div className="relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                            {unreadCount > 9 ? '+9' : unreadCount}
                        </span>
                    )}
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

{/* Dropdown Panel - Premium Design */}
            {isOpen && (
                <div className={`absolute top-full mt-3 ${isRTL ? 'left-0' : 'right-0'} w-[420px] bg-white rounded-3xl shadow-2xl shadow-slate-300/50 border border-slate-100 overflow-hidden z-[100] animate-scale-in origin-top-${isRTL ? 'left' : 'right'}`}>
                    
                    {/* Header - Enhanced */}
                    <div className="p-5 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Bell size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">
                                        {isRTL ? 'اعلان‌ها' : 'Notifications'}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        {unreadCount > 0 
                                            ? `${unreadCount} ${isRTL ? 'پیام جدید' : 'New messages'}`
                                            : `${notifications.length} ${isRTL ? 'پیام' : 'Messages'}`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        disabled={isLoading}
                                        className="text-xs font-bold text-blue-500 hover:text-blue-700 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all flex items-center gap-1"
                                    >
                                        {isLoading ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                                        {isRTL ? 'همه خوانده شده' : 'Mark all read'}
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <X size={18} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={isRTL ? 'جستجو...' : 'Search...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pr-9 pl-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                                className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="all">{isRTL ? 'همه' : 'All'}</option>
                                <option value="unread">{isRTL ? 'خوانده نشده' : 'Unread'}</option>
                                <option value="appointment">{isRTL ? 'نوبت‌ها' : 'Appointments'}</option>
                                <option value="prescription">{isRTL ? 'نسخه‌ها' : 'Prescriptions'}</option>
                                <option value="message">{isRTL ? 'پیام‌ها' : 'Messages'}</option>
                            </select>
                        </div>
                    </div>

                    {/* Notification Categories - Quick Filters */}
                    <div className="flex gap-2 p-3 border-b border-slate-100 overflow-x-auto">
                        {[
                            { type: 'all', label: isRTL ? 'همه' : 'All', icon: Bell, count: notifications.length },
                            { type: 'appointment', label: isRTL ? 'نوبت' : 'Appointment', icon: CalendarIcon, count: notifications.filter(n => n.notification_type === 'appointment').length },
                            { type: 'prescription', label: isRTL ? 'نسخه' : 'Prescription', icon: FileText, count: notifications.filter(n => n.notification_type === 'prescription').length },
                            { type: 'message', label: isRTL ? 'پیام' : 'Message', icon: MessageSquare, count: notifications.filter(n => n.notification_type === 'message').length },
                            { type: 'lab', label: isRTL ? 'آزمایش' : 'Lab', icon: Syringe, count: notifications.filter(n => n.notification_type === 'lab').length },
                        ].map((cat) => (
                            <button
                                key={cat.type}
                                onClick={() => setFilter(cat.type as any)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                    filter === cat.type
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <cat.icon size={12} />
                                {cat.label}
                                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                                    filter === cat.type ? 'bg-white/20' : 'bg-slate-200'
                                }`}>
                                    {cat.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[500px] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <RefreshCw size={32} className="text-blue-500 animate-spin mb-4" />
                                <p className="text-sm font-bold text-slate-500">{isRTL ? 'در حال بارگذاری...' : 'Loading...'}</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                                    <Bell size={36} className="text-slate-400" />
                                </div>
                                <p className="text-base font-black text-slate-600 mb-2">
                                    {isRTL ? 'هیچ اعلانی یافت نشد' : 'No notifications found'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {isRTL ? 'اعلان‌های شما اینجا نمایش داده می‌شود' : 'Your notifications will appear here'}
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((item, idx) => {
                                const config = getNotificationConfig(item.notification_type);
                                const priorityBadge = getPriorityBadge(item.priority);
                                
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`relative p-4 border-b border-slate-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 cursor-pointer transition-all duration-300 group ${
                                            !item.is_read ? 'bg-blue-50/30' : ''
                                        } ${item.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            {/* Icon */}
                                            <div className={`mt-1 shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${config.bgGradient} shadow-lg ${
                                                !item.is_read ? 'shadow-blue-500/20' : ''
                                            }`}>
                                                {item.is_read ? (
                                                    <span className="text-white">{config.icon}</span>
                                                ) : (
                                                    <Bell size={18} className="text-white" />
                                                )}
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="text-sm font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        {!item.is_read && (
                                                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                                                        )}
                                                        {item.action_required && (
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black rounded-full uppercase">
                                                                {isRTL ? 'نیاز به اقدام' : 'Action'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">
                                                    {item.message}
                                                </p>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {getTimeAgo(item.created_at)}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${priorityBadge.bg} ${priorityBadge.text}`}>
                                                            {priorityBadge.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {item.link && (
                                                            <span className="text-xs font-bold text-blue-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                                {isRTL ? 'مشاهده' : 'View'} 
                                                                <ExternalLink size={10} />
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={(e) => deleteNotification(item.id, e)}
                                                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer - Enhanced */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-100 bg-gradient-to-l from-slate-50 to-white">
                            <div className="flex gap-2">
                                <Link
                                    href="/dashboard/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 block text-center text-sm font-black text-blue-600 hover:text-blue-700 py-3 rounded-2xl hover:bg-blue-50 transition-all shadow-sm border border-blue-100"
                                >
                                    {isRTL ? 'مشاهده همه اعلان‌ها' : 'View All Notifications'}
                                </Link>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"
                                >
                                    <Settings size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

