
'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
    DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet,
    Receipt, PiggyBank, BarChart3, PieChart, LineChart,
    ArrowUpRight, ArrowDownRight, Calendar, Download, Filter,
    Plus, Search, RefreshCw, Banknote, Coins, Percent, Target, Gift,
    Building2, FileText, Clock, CheckCircle, AlertCircle,
    XCircle, AlertTriangle, MoreVertical, Eye, Edit
} from 'lucide-react';

export default function AdminFinancePage() {
    const t = useTranslations('dashboard.admin');
    const locale = useLocale();
    const isRTL = locale === 'fa';

    const stats = [
        { label: isRTL ? 'درآمد کل' : 'Total Revenue', value: '$125,430', trend: '+12.5%', trendUp: true, icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
        { label: isRTL ? 'درآمد این ماه' : 'This Month', value: '$18,250', trend: '+8.2%', trendUp: true, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
        { label: isRTL ? 'هزینه‌ها' : 'Expenses', value: '$8,420', trend: '-3.1%', trendUp: false, icon: TrendingDown, color: 'from-red-500 to-orange-500' },
        { label: isRTL ? 'سود خالص' : 'Net Profit', value: '$9,830', trend: '+15.3%', trendUp: true, icon: PiggyBank, color: 'from-purple-500 to-pink-500' },
    ];

    const transactions = [
        { id: '#TRX-8821', desc: isRTL ? 'ویزیت دکتر مورفی' : 'Dr. Murphy Consultation', amount: '+$150', type: 'income', date: isRTL ? '۱۴۰۲/۰۹/۱۵' : '2023-12-06', status: 'completed' },
        { id: '#TRX-8822', desc: isRTL ? 'خرید دارو' : 'Pharmacy Purchase', amount: '-$45', type: 'expense', date: isRTL ? '۱۴۰۲/۰۹/۱۴' : '2023-12-05', status: 'completed' },
        { id: '#TRX-8823', desc: isRTL ? 'ویزیت دکتر سارا' : 'Dr. Sarah Visit', amount: '+$120', type: 'income', date: isRTL ? '۱۴۰۲/۰۹/۱۳' : '2023-12-04', status: 'pending' },
        { id: '#TRX-8824', desc: isRTL ? 'حقوق کارکنان' : 'Staff Salary', amount: '-$2,500', type: 'expense', date: isRTL ? '۱۴۰۲/۰۹/۱۲' : '2023-12-03', status: 'completed' },
        { id: '#TRX-8825', desc: isRTL ? 'بیمه درمانی' : 'Health Insurance', amount: '+$320', type: 'income', date: isRTL ? '۱۴۰۲/۰۹/۱۱' : '2023-12-02', status: 'completed' },
    ];

    return (
        <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-[4rem] p-12 lg:p-16">
                <div className="absolute inset-0 bg-[url('http://www.transparenttextures.com/patterns/noise.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full mb-6">
                            <DollarSign className="text-white" size={16} />
                            <span className="text-white/80 text-xs font-black uppercase tracking-widest">
                                {isRTL ? 'مدیریت مالی' : 'Financial Management'}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
                            {isRTL ? 'امور مالی' : 'Finance'}
                        </h1>
                        <p className="text-white/60 text-lg font-medium max-w-xl">
                            {isRTL 
                                ? 'گزارشات مالی و تراکنش‌های سیستم.'
                                : 'System financial reports and transactions.'}
                        </p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-[2rem] font-black text-sm uppercase tracking-wider hover:bg-white/20 transition-all">
                            <Download size={18} />
                            {isRTL ? 'خروجی گزارش' : 'Export Report'}
                        </button>
                        <button className="flex items-center gap-2 px-8 py-4 bg-white text-emerald-900 rounded-[2rem] font-black text-sm uppercase tracking-wider hover:bg-gray-100 transition-all shadow-2xl">
                            <Plus size={18} />
                            {isRTL ? 'تراکنش جدید' : 'New Transaction'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="group bg-white rounded-[3rem] p-8 shadow-mega border border-black/[0.03] hover:-translate-y-2 transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                                <stat.icon className="text-white" size={24} />
                            </div>
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                        <span className="text-4xl font-black text-black tracking-tighter">{stat.value}</span>
                    </div>
                ))}
            </section>

            {/* Charts Placeholder & Transactions */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-8 bg-white rounded-[4rem] p-12 shadow-mega border border-black/[0.03]">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-3xl font-black text-black tracking-tighter">{isRTL ? 'نمودار درآمد' : 'Revenue Chart'}</h3>
                            <p className="text-black/30 text-sm font-medium mt-2">{isRTL ? 'وضعیت مالی ۱۲ ماه گذشته' : 'Last 12 months financial overview'}</p>
                        </div>
                        <div className="flex gap-3">
                            {['Day', 'Week', 'Month', 'Year'].map((period) => (
                                <button 
                                    key={period}
                                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                                        period === 'Month' 
                                            ? 'bg-black text-white' 
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Chart Visual */}
                    <div className="h-64 flex items-end gap-4 px-4">
                        {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80, 100].map((height, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                    className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <span className="text-[10px] text-gray-400 font-black uppercase">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-8 text-white shadow-mega">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xl font-black">{isRTL ? 'موجودی نقدی' : 'Cash Balance'}</h4>
                            <Wallet className="text-white/60" size={24} />
                        </div>
                        <p className="text-5xl font-black mb-2">$45,230</p>
                        <p className="text-white/60 text-sm font-medium">{isRTL ? 'به‌روزرسانی لحظه‌ای' : 'Real-time update'}</p>
                    </div>

                    <div className="bg-white rounded-[3rem] p-8 shadow-mega border border-black/[0.03]">
                        <h4 className="text-xl font-black text-black mb-6">{isRTL ? 'وضعیت پرداخت' : 'Payment Status'}</h4>
                        <div className="space-y-4">
                            {[
                                { label: isRTL ? 'پرداخت شده' : 'Paid', value: 75, color: 'bg-emerald-500' },
                                { label: isRTL ? 'در انتظار' : 'Pending', value: 15, color: 'bg-amber-500' },
                                { label: isRTL ? 'معوق' : 'Overdue', value: 10, color: 'bg-red-500' },
                            ].map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-black text-gray-600">{item.label}</span>
                                        <span className="text-sm font-black text-gray-900">{item.value}%</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.value}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <section className="bg-white rounded-[4rem] p-8 lg:p-12 shadow-mega border border-black/[0.03]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h3 className="text-3xl font-black text-black tracking-tighter">{isRTL ? 'تراکنش‌های اخیر' : 'Recent Transactions'}</h3>
                        <p className="text-black/30 text-sm font-medium mt-2">{isRTL ? '۵ تراکنش آخر' : 'Last 5 transactions'}</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder={isRTL ? 'جستجو...' : 'Search...'}
                                className="pl-12 pr-4 py-4 bg-gray-50 rounded-[2rem] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-64"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-4 bg-gray-50 rounded-[2rem] text-sm font-black uppercase tracking-wider hover:bg-gray-100 transition-all">
                            <Filter size={18} />
                            {isRTL ? 'فیلتر' : 'Filter'}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="p-6 text-right"><span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'شناسه' : 'ID'}</span></th>
                                <th className="p-6 text-right"><span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'توضیحات' : 'Description'}</span></th>
                                <th className="p-6 text-right"><span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'مبلغ' : 'Amount'}</span></th>
                                <th className="p-6 text-right"><span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'تاریخ' : 'Date'}</span></th>
                                <th className="p-6 text-right"><span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'وضعیت' : 'Status'}</span></th>
                                <th className="p-6 text-right"><span className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'عملیات' : 'Actions'}</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.map((trx, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-all">
                                    <td className="p-6">
                                        <span className="text-sm font-black text-gray-500">{trx.id}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-sm font-black text-gray-900">{trx.desc}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`text-sm font-black ${trx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {trx.amount}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-sm font-medium text-gray-500">{trx.date}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                            trx.status === 'completed' 
                                                ? 'bg-emerald-50 text-emerald-600' 
                                                : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {trx.status === 'completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                            {trx.status === 'completed' ? (isRTL ? 'تکمیل' : 'Done') : (isRTL ? 'در انتظار' : 'Pending')}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex gap-2">
                                            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                                                <Eye size={16} />
                                            </button>
                                            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                                                <FileText size={16} />
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

