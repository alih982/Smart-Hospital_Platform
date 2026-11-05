
'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
    Users, Search, Filter, Plus, Download, MoreVertical, 
    UserCheck, UserX, Mail, Phone, MapPin, Calendar,
    Shield, Stethoscope, Crown, Edit, Trash2, Eye,
    ChevronDown, ArrowUpDown, ArrowRight, CheckCircle,
    XCircle, Clock, AlertTriangle, ArrowUp, ArrowDown,
    RefreshCw, Upload, FileText, MessageSquare, Star
} from 'lucide-react';

export default function AdminUsersPage() {
    const t = useTranslations('dashboard.admin');
    const locale = useLocale();
    const isRTL = locale === 'fa';

    const users = [
        { id: '#U-4401', name: isRTL ? 'علی حاتمی' : 'Ali Hatami', role: 'patient', email: 'ali@example.com', phone: '+98 912 345 6789', joined: isRTL ? '۱۴۰۲/۰۷/۰۱' : '2023-09-22', status: 'active', avatar: '👤' },
        { id: '#D-9923', name: isRTL ? 'دکتر مورفی' : 'Dr. Murphy', role: 'doctor', email: 'murphy@health.com', phone: '+98 912 345 6790', joined: isRTL ? '۱۴۰۱/۱۲/۱۵' : '2023-03-06', status: 'approved', specialty: isRTL ? 'قلب' : 'Cardiology', avatar: '🫀' },
        { id: '#U-1105', name: isRTL ? 'زهرا علوی' : 'Zahra Alavi', role: 'patient', email: 'zahra@test.ir', phone: '+98 912 345 6791', joined: isRTL ? '۱۴۰۲/۰۹/۱۰' : '2023-12-01', status: 'blocked', avatar: '👩' },
        { id: '#A-0001', name: isRTL ? 'مدیر ارشد' : 'Super Admin', role: 'admin', email: 'admin@system.com', phone: '+98 912 345 6792', joined: isRTL ? '۱۴۰۰/۰۱/۰۱' : '2021-03-21', status: 'online', avatar: '👑' },
        { id: '#D-5543', name: isRTL ? 'دکتر سارا' : 'Dr. Sarah', role: 'doctor', email: 'sarah@health.com', phone: '+98 912 345 6793', joined: isRTL ? '۱۴۰۲/۰۲/۲۰' : '2023-05-10', status: 'approved', specialty: isRTL ? 'پوست' : 'Dermatology', avatar: '🧴' },
    ];

    const getRoleBadge = (role: string) => {
        const styles = {
            doctor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
            patient: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
            admin: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
        };
        const labels = {
            doctor: isRTL ? 'پزشک' : 'Doctor',
            patient: isRTL ? 'بیمار' : 'Patient',
            admin: isRTL ? 'مدیر' : 'Admin'
        };
        
        return (
            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${styles[role as keyof typeof styles] || styles.patient}`}>
                {labels[role as keyof typeof labels] || labels.patient}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle },
            online: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle },
            approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle },
            pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock },
            blocked: { bg: 'bg-red-50', text: 'text-red-600', icon: XCircle }
        };
        const labels = {
            active: isRTL ? 'فعال' : 'Active',
            online: isRTL ? 'آنلاین' : 'Online',
            approved: isRTL ? 'تایید شده' : 'Approved',
            pending: isRTL ? 'در انتظار' : 'Pending',
            blocked: isRTL ? 'مسدود' : 'Blocked'
        };
        
        const style = styles[status as keyof typeof styles] || styles.pending;
        const Icon = style.icon;
        
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${style.bg} ${style.text}`}>
                <Icon size={12} />
                {labels[status as keyof typeof labels] || labels.pending}
            </span>
        );
    };

    return (
        <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-[4rem] p-12 lg:p-16">
                <div className="absolute inset-0 bg-[url('http://www.transparenttextures.com/patterns/noise.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full mb-6">
                            <Shield className="text-white" size={16} />
                            <span className="text-white/80 text-xs font-black uppercase tracking-widest">
                                {isRTL ? 'مدیریت کاربران' : 'User Management'}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
                            {isRTL ? 'کاربران' : 'Users'}
                        </h1>
                        <p className="text-white/60 text-lg font-medium max-w-xl">
                            {isRTL 
                                ? 'تمام کاربران سیستم را مدیریت کنید.'
                                : 'Manage all system users.'}
                        </p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-[2rem] font-black text-sm uppercase tracking-wider hover:bg-white/20 transition-all">
                            <Download size={18} />
                            {isRTL ? 'خروجی Excel' : 'Export Excel'}
                        </button>
                        <button className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-wider hover:bg-gray-100 transition-all shadow-2xl">
                            <Plus size={18} />
                            {isRTL ? 'افزودن کاربر' : 'Add User'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: isRTL ? 'کل کاربران' : 'Total Users', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
                    { label: isRTL ? 'پزشکان' : 'Doctors', value: users.filter(u => u.role === 'doctor').length, icon: Stethoscope, color: 'from-purple-500 to-pink-500' },
                    { label: isRTL ? 'بیماران' : 'Patients', value: users.filter(u => u.role === 'patient').length, icon: UserCheck, color: 'from-emerald-500 to-teal-500' },
                    { label: isRTL ? 'مدیران' : 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Crown, color: 'from-amber-500 to-orange-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="group bg-white rounded-[3rem] p-8 shadow-mega border border-black/[0.03] hover:-translate-y-2 transition-all duration-500">
                        <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                            <stat.icon className="text-white" size={24} />
                        </div>
                        <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                        <span className="text-4xl font-black text-black tracking-tighter">{stat.value}</span>
                    </div>
                ))}
            </section>

            {/* Users Table */}
            <section className="bg-white rounded-[4rem] p-8 lg:p-12 shadow-mega border border-black/[0.03]">
                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex gap-3 flex-wrap">
                        {['all', 'doctors', 'patients', 'admins'].map((filter) => (
                            <button 
                                key={filter}
                                className={`px-6 py-3 rounded-[2rem] text-sm font-black uppercase tracking-wider transition-all ${
                                    filter === 'all' 
                                        ? 'bg-black text-white shadow-lg' 
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {filter === 'all' ? (isRTL ? 'همه' : 'All') :
                                 filter === 'doctors' ? (isRTL ? 'پزشکان' : 'Doctors') :
                                 filter === 'patients' ? (isRTL ? 'بیماران' : 'Patients') :
                                 (isRTL ? 'مدیران' : 'Admins')}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder={isRTL ? 'جستجو...' : 'Search...'}
                                className="pl-12 pr-4 py-4 bg-gray-50 rounded-[2rem] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-64"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-4 bg-gray-50 rounded-[2rem] text-sm font-black uppercase tracking-wider hover:bg-gray-100 transition-all">
                            <Filter size={18} />
                            {isRTL ? 'فیلتر' : 'Filter'}
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="p-6 text-right">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'کاربر' : 'User'}</span>
                                </th>
                                <th className="p-6 text-right">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'نقش' : 'Role'}</span>
                                </th>
                                <th className="p-6 text-right">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'تاریخ عضویت' : 'Joined'}</span>
                                </th>
                                <th className="p-6 text-right">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'وضعیت' : 'Status'}</span>
                                </th>
                                <th className="p-6 text-right">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'عملیات' : 'Actions'}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-[1.5rem] flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                                                {user.avatar}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                                                <p className="text-xs text-gray-400 font-medium">{user.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {getRoleBadge(user.role)}
                                        {user.specialty && (
                                            <p className="text-xs text-gray-400 mt-2 font-medium">{user.specialty}</p>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <p className="text-sm font-black text-gray-700">{user.joined}</p>
                                    </td>
                                    <td className="p-6">
                                        {getStatusBadge(user.status)}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex gap-2">
                                            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                                                <Eye size={16} />
                                            </button>
                                            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all">
                                                <Edit size={16} />
                                            </button>
                                            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

