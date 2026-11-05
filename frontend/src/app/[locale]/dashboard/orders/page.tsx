'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { pharmacyService, Order } from '@/services/pharmacyService';
import { 
    Package, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Truck, 
    CreditCard,
    MapPin,
    Phone,
    User,
    ChevronRight,
    Loader2,
    ShoppingBag,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const router = useRouter();
    const t = useTranslations('dashboard');
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'delivered' | 'cancelled'>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const loadFromLocalStorage = () => {
        const localOrders = JSON.parse(localStorage.getItem('pharmacy_orders') || '[]');
        
        const transformedOrders = localOrders.map((order: any) => ({
            id: order.id,
            order_number: order.id,
            status: order.status || 'pending',
            payment_status: 'pending',
            payment_method: 'online',
            total: order.total_price,
            subtotal: order.total_price,
            discount: '0',
            items: order.items.map((item: any) => ({
                medicine_name: item.medicine?.name || item.medicine_name,
                medicine_price: item.price,
                quantity: item.quantity
            })),
            delivery_name: order.delivery_name,
            delivery_phone: order.delivery_phone,
            delivery_address: order.delivery_address,
            notes: '',
            created_at: order.created_at
        }));
        
        setOrders(transformedOrders);
    };

    const fetchOrders = async () => {
        try {
            // Try to get orders from backend
            const data = await pharmacyService.getMyOrders();
            // Even if backend returns empty, still check localStorage for demo orders
            if (data && data.length > 0) {
                setOrders(data);
            } else {
                // Backend returned empty, try localStorage
                loadFromLocalStorage();
            }
        } catch (error) {
            console.log('Backend orders not available, loading from localStorage');
            loadFromLocalStorage();
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'processing':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'shipped':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'delivered':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'processing':
                return <Package className="w-4 h-4" />;
            case 'shipped':
                return <Truck className="w-4 h-4" />;
            case 'delivered':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-emerald-100 text-emerald-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            case 'failed':
                return 'bg-red-100 text-red-700';
            case 'refunded':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (filter === 'all') return true;
        return order.status === filter || (filter === 'pending' && order.status === 'pending');
    });

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseInt(price) : price;
        return new Intl.NumberFormat('fa-IR').format(numPrice) + ' تومان';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'pending': isRTL ? 'در انتظار' : 'Pending',
            'confirmed': isRTL ? 'تأیید شده' : 'Confirmed',
            'processing': isRTL ? 'در حال پردازش' : 'Processing',
            'shipped': isRTL ? 'ارسال شده' : 'Shipped',
            'delivered': isRTL ? 'تحویل داده شده' : 'Delivered',
            'cancelled': isRTL ? 'لغو شده' : 'Cancelled',
        };
        return labels[status] || status;
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
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShoppingBag className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {isRTL ? 'سفارشات من' : 'My Orders'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isRTL 
                                ? 'مشاهده و پیگیری سفارشات داروخانه' 
                                : 'Track and manage your pharmacy orders'
                            }
                        </p>
                    </div>
                </div>

                <Link 
                    href="/pharmacy"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-[1.5rem] font-black text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                    {isRTL ? 'سفارش جدید' : 'New Order'}
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-100">
                {[
                    { key: 'all', label: isRTL ? 'همه' : 'All' },
                    { key: 'pending', label: isRTL ? 'در انتظار' : 'Pending' },
                    { key: 'processing', label: isRTL ? 'در حال پردازش' : 'Processing' },
                    { key: 'delivered', label: isRTL ? 'تحویل داده شده' : 'Delivered' },
                    { key: 'cancelled', label: isRTL ? 'لغو شده' : 'Cancelled' },
                ].map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setFilter(item.key as any)}
                        className={`px-5 py-2.5 rounded-[1.5rem] font-black text-xs uppercase tracking-wider transition-all ${
                            filter === item.key
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                                : 'bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                        {isRTL ? 'سفارشی یافت نشد' : 'No Orders Found'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isRTL 
                            ? 'شما هنوز سفارشی ندارید. می‌توانید از داروخانه خرید کنید.' 
                            : "You don't have any orders yet. Start shopping at the pharmacy."
                        }
                    </p>
                    <Link 
                        href="/pharmacy"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-[1.5rem] font-black text-sm hover:shadow-xl hover:shadow-emerald-500/25 transition-all"
                    >
                        {isRTL ? 'رفتن به داروخانه' : 'Go to Pharmacy'}
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredOrders.map((order) => (
                        <div 
                            key={order.id}
                            className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-soft-md hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => setSelectedOrder(order)}
                        >
                            {/* Order Header */}
                            <div className="p-8 bg-gradient-to-l from-gray-50 to-white border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <span className="text-white font-black text-lg">#</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-xl text-gray-900">{order.order_number}</p>
                                        <p className="text-xs text-gray-400 font-medium mt-1">
                                            {new Date(order.created_at).toLocaleDateString(isRTL ? 'fa-IR' : 'en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 border ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {getStatusLabel(order.status)}
                                    </span>
                                    <span className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider ${getPaymentStatusColor(order.payment_status)}`}>
                                        {order.payment_status === 'paid' 
                                            ? (isRTL ? 'پرداخت شده' : 'Paid')
                                            : order.payment_status === 'pending'
                                            ? (isRTL ? 'در انتظار پرداخت' : 'Pending')
                                            : (isRTL ? 'ناموفق' : 'Failed')
                                        }
                                    </span>
                                    <ChevronRight className={`w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <Package className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-black text-gray-500 uppercase tracking-wider">
                                        {isRTL ? 'داروهای سفارش' : 'Order Items'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-400">
                                        ({order.items?.length || 0} {isRTL ? 'عدد' : 'items'})
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {order.items?.slice(0, 3).map((item: any, idx: number) => (
                                        <div 
                                            key={idx}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl text-sm font-bold text-gray-700 border border-emerald-100"
                                        >
                                            {item.medicine_name} × {item.quantity}
                                        </div>
                                    ))}
                                    {order.items && order.items.length > 3 && (
                                        <div className="px-4 py-2 bg-gray-50 rounded-2xl text-sm font-bold text-gray-400">
                                            +{order.items.length - 3} {isRTL ? 'عدد دیگر' : 'more'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Footer */}
                            <div className="px-8 pb-8 flex items-center justify-between pt-0">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-sm font-medium">{order.payment_method || (isRTL ? 'آنلاین' : 'Online')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Payment Button - Only show for pending payments */}
                                    {order.payment_status === 'pending' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/${locale}/payment/checkout?order_id=${order.id}`);
                                            }}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            {isRTL ? 'پرداخت' : 'Pay Now'}
                                        </button>
                                    )}
                                    <div className="text-left">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                                            {isRTL ? 'مجموع سفارش' : 'Total Amount'}
                                        </p>
                                        <p className="text-2xl font-black text-gray-900">{formatPrice(order.total)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div 
                        className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{selectedOrder.order_number}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(selectedOrder.created_at).toLocaleDateString(isRTL ? 'fa-IR' : 'en-US')}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                    <XCircle className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-8">
                            {/* Status */}
                            <div className="flex flex-wrap gap-4">
                                <span className={`px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 border ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    {getStatusLabel(selectedOrder.status)}
                                </span>
                                <span className={`px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                                    {selectedOrder.payment_status === 'paid' 
                                        ? (isRTL ? 'پرداخت شده' : 'Paid')
                                        : selectedOrder.payment_status === 'pending'
                                        ? (isRTL ? 'در انتظار پرداخت' : 'Pending')
                                        : (isRTL ? 'ناموفق' : 'Failed')
                                    }
                                </span>
                            </div>

                            {/* Delivery Info */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2rem] p-6 space-y-4 border border-emerald-100">
                                <h3 className="font-black text-gray-900 uppercase tracking-wider text-sm">
                                    {isRTL ? 'اطلاعات تحویل' : 'Delivery Information'}
                                </h3>
                                <div className="grid gap-4">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-emerald-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-emerald-600 uppercase tracking-wider">{isRTL ? 'نام تحویل‌گیرنده' : 'Recipient'}</p>
                                            <p className="font-bold text-gray-900">{selectedOrder.delivery_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-emerald-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-emerald-600 uppercase tracking-wider">{isRTL ? 'شماره تماس' : 'Phone'}</p>
                                            <p className="font-bold text-gray-900">{selectedOrder.delivery_phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-emerald-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-emerald-600 uppercase tracking-wider">{isRTL ? 'آدرس تحویل' : 'Delivery Address'}</p>
                                            <p className="font-bold text-gray-900">{selectedOrder.delivery_address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-black text-gray-900 uppercase tracking-wider text-sm mb-4">
                                    {isRTL ? 'داروهای سفارش' : 'Order Items'}
                                </h3>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item: any, idx: number) => (
                                        <div 
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900">{item.medicine_name}</p>
                                                <p className="text-sm text-emerald-600">
                                                    {formatPrice(item.medicine_price)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-black text-gray-900">{formatPrice(parseInt(String(item.medicine_price)) * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="border-t border-gray-100 pt-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">{isRTL ? 'جمع Parts' : 'Subtotal'}</span>
                                    <span className="font-bold text-gray-900">{formatPrice(selectedOrder.subtotal)}</span>
                                </div>
                                {selectedOrder.discount && parseInt(String(selectedOrder.discount)) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-600 font-medium">{isRTL ? 'تخفیف' : 'Discount'}</span>
                                        <span className="font-bold text-emerald-600">-{formatPrice(selectedOrder.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-4 border-t border-gray-100">
                                    <span className="font-black text-gray-900 uppercase tracking-wider">{isRTL ? 'مجموع' : 'Total'}</span>
                                    <span className="text-2xl font-black text-gray-900">{formatPrice(selectedOrder.total)}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-amber-600 uppercase tracking-wider">{isRTL ? 'یادداشت' : 'Notes'}</p>
                                            <p className="text-sm text-gray-700 mt-1">{selectedOrder.notes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

