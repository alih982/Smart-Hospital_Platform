'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { 
    FileText, 
    Search, 
    Filter, 
    Calendar, 
    User, 
    Pill, 
    Stethoscope,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Plus,
    Download,
    Eye,
    CreditCard,
    Loader2,
    Building2,
    ShoppingBag,
    Receipt
} from 'lucide-react';

interface Invoice {
    id: string;
    title: string;
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'failed' | 'refunded';
    method: string;
    type: 'appointment' | 'pharmacy' | 'prescription';
    appointment_id?: string;
    order_id?: string;
    prescription_id?: string;
}

export default function InvoicesPage() {
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const router = useRouter();
    
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
    const [filterType, setFilterType] = useState<'all' | 'appointment' | 'pharmacy'>('all');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const loadFromLocalStorage = () => {
        // Load appointment invoices
        const appointmentInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        
        // Load pharmacy order invoices
        const pharmacyOrders = JSON.parse(localStorage.getItem('pharmacy_orders') || '[]');
        const pharmacyInvoices = pharmacyOrders.map((order: any) => ({
            id: order.id,
            title: isRTL ? 'خرید از داروخانه' : 'Pharmacy Purchase',
            amount: order.total_price,
            date: order.created_at,
            status: 'paid',
            method: 'online',
            type: 'pharmacy',
            order_id: order.id
        }));
        
        // Combine all invoices
        const allInvoices = [...appointmentInvoices, ...pharmacyInvoices];
        setInvoices(allInvoices);
    };

    const fetchInvoices = async () => {
        try {
            // Try to get from API
            const apiBase = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : 'http://magicai.runflare.run/api/v1';
            const response = await fetch(`${apiBase}/invoices/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setInvoices(data);
                } else {
                    loadFromLocalStorage();
                }
            } else {
                loadFromLocalStorage();
            }
        } catch (error) {
            console.log('Loading from localStorage...');
            loadFromLocalStorage();
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'paid':
                return { 
                    label: isRTL ? 'پرداخت شده' : 'Paid', 
                    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                    icon: CheckCircle,
                };
            case 'pending':
                return { 
                    label: isRTL ? 'در انتظار' : 'Pending', 
                    color: 'bg-amber-50 text-amber-600 border-amber-200',
                    icon: AlertCircle,
                };
            case 'failed':
                return { 
                    label: isRTL ? 'ناموفق' : 'Failed', 
                    color: 'bg-red-50 text-red-600 border-red-200',
                    icon: AlertCircle,
                };
            case 'refunded':
                return { 
                    label: isRTL ? 'بازگشت' : 'Refunded', 
                    color: 'bg-purple-50 text-purple-600 border-purple-200',
                    icon: CheckCircle,
                };
            default:
                return { 
                    label: status, 
                    color: 'bg-gray-50 text-gray-600 border-gray-200',
                    icon: AlertCircle,
                };
        }
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'appointment':
                return { 
                    icon: Stethoscope,
                    color: 'from-blue-500 to-cyan-500',
                    label: isRTL ? 'ویزیت' : 'Visit'
                };
            case 'pharmacy':
                return { 
                    icon: Pill,
                    color: 'from-emerald-500 to-teal-500',
                    label: isRTL ? 'داروخانه' : 'Pharmacy'
                };
            default:
                return { 
                    icon: Receipt,
                    color: 'from-purple-500 to-pink-500',
                    label: isRTL ? 'سایر' : 'Other'
                };
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price) + (isRTL ? ' تومان' : ' IRR');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? 'fa-IR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const filteredInvoices = invoices.filter((inv) => {
        const matchesSearch = inv.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
        if (filterType !== 'all' && inv.type !== filterType) return false;
        
        return matchesSearch;
    });

    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

    const handleViewDetails = (invoice: Invoice) => {
        if (invoice.type === 'pharmacy') {
            router.push(`/${locale}/dashboard/orders`);
        } else if (invoice.type === 'appointment') {
            router.push(`/${locale}/dashboard/appointments`);
        }
        setSelectedInvoice(null);
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Receipt className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {isRTL ? 'فاکتورها و تراکنش‌ها' : 'Invoices & Transactions'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isRTL 
                                ? 'مشاهده و مدیریت فاکتورها' 
                                : 'View and manage your invoices'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="text-white" size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">{isRTL ? 'پرداخت شده' : 'Paid'}</p>
                            <p className="text-xl font-black text-gray-900">{formatPrice(totalPaid)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                            <Clock className="text-white" size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">{isRTL ? 'در انتظار' : 'Pending'}</p>
                            <p className="text-xl font-black text-gray-900">{formatPrice(totalPending)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                            <FileText className="text-white" size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">{isRTL ? 'کل فاکتورها' : 'Total Invoices'}</p>
                            <p className="text-xl font-black text-gray-900">{invoices.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-soft-md">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={isRTL ? 'جستجو در فاکتورها...' : 'Search invoices...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all text-gray-800 font-medium"
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { key: 'all', label: isRTL ? 'همه' : 'All' },
                            { key: 'paid', label: isRTL ? 'پرداخت شده' : 'Paid' },
                            { key: 'pending', label: isRTL ? 'در انتظار' : 'Pending' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setFilterStatus(item.key as any)}
                                className={`px-5 py-3 rounded-2xl font-black text-sm transition-all ${
                                    filterStatus === item.key
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-gray-50 text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            {filteredInvoices.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Receipt className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                        {isRTL ? 'فاکتوری یافت نشد' : 'No Invoices Found'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isRTL 
                            ? 'شما هنوز فاکتوری ندارید.' 
                            : "You don't have any invoices yet."
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredInvoices.map((invoice) => {
                        const statusConfig = getStatusConfig(invoice.status);
                        const typeConfig = getTypeConfig(invoice.type);
                        
                        return (
                            <div 
                                key={invoice.id}
                                className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-soft-md hover:shadow-lg transition-all cursor-pointer group"
                                onClick={() => setSelectedInvoice(invoice)}
                            >
                                {/* Invoice Header */}
                                <div className="p-8 bg-gradient-to-l from-gray-50 to-white border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 bg-gradient-to-r ${typeConfig.color} rounded-[1.5rem] flex items-center justify-center shadow-lg`}>
                                            <typeConfig.icon className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-gray-900">
                                                {invoice.title}
                                            </p>
                                            <p className="text-xs text-gray-400 font-medium mt-1">
                                                {invoice.id} • {formatDate(invoice.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 border ${statusConfig.color}`}>
                                            <statusConfig.icon size={14} />
                                            {statusConfig.label}
                                        </span>
                                        <ChevronRight className={`w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {/* Invoice Details */}
                                <div className="p-8">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <CreditCard className="w-5 h-5" />
                                                <span className="font-medium">{invoice.method || (isRTL ? 'آنلاین' : 'Online')}</span>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                invoice.type === 'appointment' ? 'bg-blue-50 text-blue-600' :
                                                invoice.type === 'pharmacy' ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-purple-50 text-purple-600'
                                            }`}>
                                                {typeConfig.label}
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-2xl font-black text-gray-900">{formatPrice(invoice.amount)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="px-8 pb-8 pt-0 flex items-center justify-between">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedInvoice(invoice);
                                        }}
                                        className="flex items-center gap-2 text-gray-400 hover:text-purple-500 transition-colors font-medium text-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        {isRTL ? 'مشاهده جزئیات' : 'View Details'}
                                    </button>
                                    <button className="flex items-center gap-2 text-gray-400 hover:text-purple-500 transition-colors font-medium text-sm">
                                        <Download className="w-4 h-4" />
                                        {isRTL ? 'دانلود PDF' : 'Download PDF'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
                    <div 
                        className="bg-white rounded-[3rem] max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{selectedInvoice.id}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatDate(selectedInvoice.date)}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedInvoice(null)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <AlertCircle className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Title */}
                            <div className="p-6 bg-gray-50 rounded-2xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">{isRTL ? 'شرح' : 'Description'}</p>
                                <p className="font-bold text-gray-900 text-lg">{selectedInvoice.title}</p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase">{isRTL ? 'مبلغ' : 'Amount'}</p>
                                    <p className="font-black text-gray-900 text-xl">{formatPrice(selectedInvoice.amount)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase">{isRTL ? 'روش پرداخت' : 'Payment Method'}</p>
                                    <p className="font-bold text-gray-900">{selectedInvoice.method || (isRTL ? 'آنلاین' : 'Online')}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase">{isRTL ? 'نوع' : 'Type'}</p>
                                    <p className="font-bold text-gray-900">
                                        {selectedInvoice.type === 'appointment' ? (isRTL ? 'ویزیت پزشک' : 'Doctor Visit') :
                                         selectedInvoice.type === 'pharmacy' ? (isRTL ? 'داروخانه' : 'Pharmacy') :
                                         (isRTL ? 'سایر' : 'Other')}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase">{isRTL ? 'وضعیت' : 'Status'}</p>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                        selectedInvoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                        selectedInvoice.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                        'bg-red-50 text-red-600'
                                    }`}>
                                        {getStatusConfig(selectedInvoice.status).label}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                                <button 
                                    onClick={() => handleViewDetails(selectedInvoice)}
                                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                >
                                    {selectedInvoice.type === 'pharmacy' 
                                        ? (isRTL ? 'مشاهده سفارش' : 'View Order')
                                        : (isRTL ? 'مشاهده نوبت' : 'View Appointment')
                                    }
                                </button>
                                <button className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                                    {isRTL ? 'دانلود PDF فاکتور' : 'Download Invoice PDF'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

