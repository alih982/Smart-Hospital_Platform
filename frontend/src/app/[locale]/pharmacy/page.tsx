'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Search, ShoppingCart, Check, FileText, AlertCircle, X, LogIn, Plus, Minus, Sparkles, Star, MapPin, Clock, Truck, Shield, Heart, ChevronDown } from 'lucide-react';
import { pharmacyService, Category, Medicine, Cart } from '@/services/pharmacyService';
import { prescriptionService, Prescription } from '@/services/prescriptionService';
import { useAuthStore } from '@/store/useAuthStore';
import { Link } from '@/i18n/navigation';

function PharmacyPageContent() {
    const router = useRouter();
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const searchParams = useSearchParams();

    const prescriptionId = searchParams?.get('prescription_id');

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Medicine[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [cart, setCart] = useState<Cart | null>(null);
    const [localCartItems, setLocalCartItems] = useState<{medicine: Medicine; quantity: number}[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [addingToCart, setAddingToCart] = useState<string | null>(null);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [checkoutForm, setCheckoutForm] = useState({
        delivery_address: '',
        delivery_phone: '',
        delivery_name: '',
        notes: ''
    });
    const authStore = useAuthStore();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = authStore.accessToken || localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, [authStore.accessToken]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchTerm, selectedCategory, products]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [catsData, prodsData] = await Promise.all([
                pharmacyService.getCategories(),
                pharmacyService.getMedicines(),
            ]);
            setCategories(catsData);
            setProducts(prodsData);
            setFilteredProducts(prodsData);

            const token = authStore.accessToken || localStorage.getItem('token');
            if (token) {
                try {
                    const [cartData, pxData] = await Promise.all([
                        pharmacyService.getCart(),
                        prescriptionService.getMyPrescriptions()
                    ]);
                    setCart(cartData);
                    setPrescriptions(pxData);
                    setIsAuthenticated(true);
                } catch (apiError: any) {
                    console.log('Cart/Prescription API not available or user has no profile yet');
                    setIsAuthenticated(true);
                }
            }
        } catch (err: any) {
            console.error('Failed to load pharmacy data:', err);
            setCategories([
                { id: '1', name: isRTL ? 'سلامت قلب' : 'Heart Health', slug: 'heart-health', icon: '❤️', is_active: true },
                { id: '2', name: isRTL ? 'تسکین درد' : 'Pain Relief', slug: 'pain-relief', icon: '💊', is_active: true },
                { id: '3', name: isRTL ? 'ویتامین‌ها' : 'Vitamins', slug: 'vitamins', icon: '🌿', is_active: true },
                { id: '4', name: isRTL ? 'سرماخوردگی' : 'Cold & Flu', slug: 'cold-flu', icon: '🤒', is_active: true },
                { id: '5', name: isRTL ? 'مراقبت از پوست' : 'Skin Care', slug: 'skin-care', icon: '✨', is_active: true },
                { id: '6', name: isRTL ? 'دیابت' : 'Diabetes', slug: 'diabetes', icon: '🩸', is_active: true },
            ]);
            setProducts([
                { id: '1', name: 'آسپرین قلبی ۱۰۰mg', slug: 'cardio-aspirin-100mg', category: '1', category_name: 'Heart Health', description: 'Heart medication', specifications: '', image: null, price: '15000', stock: 50, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: true },
                { id: '2', name: 'ویتامین D3 1000IU', slug: 'vitamin-d3-1000iu', category: '3', category_name: 'Vitamins', description: 'Vitamin supplement', specifications: '', image: null, price: '25000', stock: 100, pharmacy_name: 'Health Store', is_active: true, is_prescription_required: false },
                { id: '3', name: 'ایبوپروفن ۴۰۰mg', slug: 'ibuprofen-400mg', category: '2', category_name: 'Pain Relief', description: 'Pain reliever', specifications: '', image: null, price: '8000', stock: 75, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: false },
                { id: '4', name: 'امگا-۳ ماهی', slug: 'omega-3-fish-oil', category: '1', category_name: 'Heart Health', description: 'Heart health supplement', specifications: '', image: null, price: '35000', stock: 30, pharmacy_name: 'Natural Health', is_active: true, is_prescription_required: false },
                { id: '5', name: 'ویتامین C 1000mg', slug: 'vitamin-c-1000mg', category: '3', category_name: 'Vitamins', description: 'Immune system support', specifications: '', image: null, price: '18000', stock: 200, pharmacy_name: 'Health Store', is_active: true, is_prescription_required: false },
                { id: '6', name: 'دفاع سرماخوردگی', slug: 'cold-defense', category: '4', category_name: 'Cold & Flu', description: 'Cold and flu relief', specifications: '', image: null, price: '22000', stock: 45, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: false },
                { id: '7', name: 'کرم مرطوب‌کننده', slug: 'moisturizing-cream', category: '5', category_name: 'Skin Care', description: 'Skin moisturizer', specifications: '', image: null, price: '28000', stock: 60, pharmacy_name: 'Beauty Care', is_active: true, is_prescription_required: false },
                { id: '8', name: 'متformin 500mg', slug: 'metformin-500mg', category: '6', category_name: 'Diabetes', description: 'Diabetes medication', specifications: '', image: null, price: '12000', stock: 25, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: true },
            ]);
            setFilteredProducts([
                { id: '1', name: 'آسپرین قلبی ۱۰۰mg', slug: 'cardio-aspirin-100mg', category: '1', category_name: 'Heart Health', description: 'Heart medication', specifications: '', image: null, price: '15000', stock: 50, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: true },
                { id: '2', name: 'ویتامین D3 1000IU', slug: 'vitamin-d3-1000iu', category: '3', category_name: 'Vitamins', description: 'Vitamin supplement', specifications: '', image: null, price: '25000', stock: 100, pharmacy_name: 'Health Store', is_active: true, is_prescription_required: false },
                { id: '3', name: 'ایبوپروفن ۴۰۰mg', slug: 'ibuprofen-400mg', category: '2', category_name: 'Pain Relief', description: 'Pain reliever', specifications: '', image: null, price: '8000', stock: 75, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: false },
                { id: '4', name: 'امگا-۳ ماهی', slug: 'omega-3-fish-oil', category: '1', category_name: 'Heart Health', description: 'Heart health supplement', specifications: '', image: null, price: '35000', stock: 30, pharmacy_name: 'Natural Health', is_active: true, is_prescription_required: false },
                { id: '5', name: 'ویتامین C 1000mg', slug: 'vitamin-c-1000mg', category: '3', category_name: 'Vitamins', description: 'Immune system support', specifications: '', image: null, price: '18000', stock: 200, pharmacy_name: 'Health Store', is_active: true, is_prescription_required: false },
                { id: '6', name: 'دفاع سرماخوردگی', slug: 'cold-defense', category: '4', category_name: 'Cold & Flu', description: 'Cold and flu relief', specifications: '', image: null, price: '22000', stock: 45, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: false },
                { id: '7', name: 'کرم مرطوب‌کننده', slug: 'moisturizing-cream', category: '5', category_name: 'Skin Care', description: 'Skin moisturizer', specifications: '', image: null, price: '28000', stock: 60, pharmacy_name: 'Beauty Care', is_active: true, is_prescription_required: false },
                { id: '8', name: 'متformin 500mg', slug: 'metformin-500mg', category: '6', category_name: 'Diabetes', description: 'Diabetes medication', specifications: '', image: null, price: '12000', stock: 25, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: true },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];
        if (searchTerm) {
            filtered = filtered.filter(prod =>
                prod.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedCategory) {
            filtered = filtered.filter(prod => {
                const categoryId = typeof prod.category === 'object' ? prod.category.id : prod.category;
                return categoryId === selectedCategory;
            });
        }
        setFilteredProducts(filtered);
    };

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseInt(price) : price;
        return numPrice.toLocaleString(isRTL ? 'fa-IR' : 'en-US');
    };

    const handleAddToCart = async (medicine: Medicine) => {
        if (medicine.is_prescription_required) {
            setSelectedMedicine(medicine);
            setShowPrescriptionModal(true);
            return;
        }
        
        setLocalCartItems(prev => {
            const existing = prev.find(item => item.medicine.id === medicine.id);
            if (existing) {
                return prev.map(item => 
                    item.medicine.id === medicine.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { medicine, quantity: 1 }];
        });
        
        // Don't auto-open cart sidebar - removed setShowCart(true)
    };

    const handleAddWithPrescription = async (medicine: Medicine, prescriptionId: string) => {
        setLocalCartItems(prev => {
            const existing = prev.find(item => item.medicine.id === medicine.id);
            if (existing) {
                return prev.map(item => 
                    item.medicine.id === medicine.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { medicine, quantity: 1 }];
        });
        
        setShowPrescriptionModal(false);
        setSelectedMedicine(null);
        setShowCart(true);
    };

    const handleUpdateQuantity = async (itemId: string, quantity: number) => {
        try {
            const updatedCart = await pharmacyService.updateCartItem(itemId, quantity);
            setCart(updatedCart);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        try {
            const updatedCart = await pharmacyService.removeCartItem(itemId);
            setCart(updatedCart);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            alert(isRTL ? 'لطفا ابتدا وارد شوید' : 'Please login first');
            return;
        }
        
        const hasLocalItems = localCartItems.length > 0;
        const hasBackendItems = cart && cart.items.length > 0;
        
        if (!hasLocalItems && !hasBackendItems) {
            alert(isRTL ? 'سبد خالی است' : 'Cart is empty');
            return;
        }
        
        if (authStore.user) {
            const u = authStore.user as any;
            setCheckoutForm(prev => ({
                ...prev,
                delivery_name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.phone_number,
                delivery_phone: u.phone_number
            }));
        }
        setShowCheckoutModal(true);
    };

    const handleConfirmCheckout = async () => {
        if (!checkoutForm.delivery_address || !checkoutForm.delivery_phone || !checkoutForm.delivery_name) {
            alert(isRTL ? 'لطفا فیلدها را پر کنید' : 'Please fill all fields');
            return;
        }
        setLoading(true);
        
        // Use local checkout directly (demo mode)
        const orderTotal = localCartItems.reduce((sum, item) => sum + (Number(item.medicine.price) * item.quantity), 0);
        
        const orders = JSON.parse(localStorage.getItem('pharmacy_orders') || '[]');
        const newOrder = {
            id: `ORD-${Date.now()}`,
            items: localCartItems.map(item => ({
                medicine: item.medicine,
                quantity: item.quantity,
                price: item.medicine.price
            })),
            total_price: orderTotal,
            status: 'pending',
            delivery_address: checkoutForm.delivery_address,
            delivery_phone: checkoutForm.delivery_phone,
            delivery_name: checkoutForm.delivery_name,
            created_at: new Date().toISOString()
        };
        orders.push(newOrder);
        localStorage.setItem('pharmacy_orders', JSON.stringify(orders));
        
        alert(isRTL 
            ? `سفارش شما با شماره ${newOrder.id} ثبت شد!\nمجموع: ${formatPrice(orderTotal)} تومان`
            : `Your order has been placed! Order ID: ${newOrder.id}\nTotal: ${formatPrice(orderTotal)} IRR`
        );
        
        setShowCheckoutModal(false);
        setShowCart(false);
        setLocalCartItems([]);
        setCart(null);
        
        setCheckoutForm({
            delivery_address: '',
            delivery_phone: '',
            delivery_name: '',
            notes: ''
        });
        
        router.push(`/${locale}/dashboard/orders`);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-xl shadow-primary-500/25 animate-pulse-slow">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <p className="text-text-secondary font-medium">{isRTL ? 'در حال بارگذاری...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-error to-error-light rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-error/25">
                        <AlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-text-secondary font-medium mb-4">{error}</p>
                    <button 
                        onClick={loadData} 
                        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-primary-500/25 transition-all"
                    >
                        {isRTL ? 'تلاش مجدد' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Hero Header - Clean Blue Design */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900">
                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                        <div className="max-w-xl space-y-5">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                                <Sparkles className="w-4 h-4 text-white" />
                                <span className="text-white/90 text-sm font-semibold">
                                    {isRTL ? 'تحویل سریع به درب منزل' : 'Fast Home Delivery'}
                                </span>
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                                {isRTL ? 'داروخانه آنلاین' : 'Online Pharmacy'}
                            </h1>
                            <p className="text-white/70 text-lg leading-relaxed">
                                {isRTL 
                                    ? 'خرید آسان و سریع داروها و مکمل‌های سلامتی با بهترین قیمت و ارسال به درب منزل'
                                    : 'Easy and fast purchase of medicines and health supplements with the best price and home delivery'}
                            </p>
                            
                            {/* Features Row - Cleaner */}
                            <div className="flex flex-wrap gap-6 mt-6">
                                {[
                                    { icon: Truck, label: isRTL ? 'ارسال سریع' : 'Fast Delivery', color: 'bg-emerald-500' },
                                    { icon: Shield, label: isRTL ? 'تضمین اصالت' : 'Original Guarantee', color: 'bg-blue-500' },
                                    { icon: Clock, label: isRTL ? 'پشتیبانی ۲۴/۷' : '24/7 Support', color: 'bg-amber-500' },
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5 text-white/90">
                                        <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <feature.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-medium text-sm">{feature.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Search Box - Clean Design */}
                        <div className="w-full md:w-auto md:min-w-[380px]">
                            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-1 shadow-xl">
                                <div className="relative">
                                    <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRTL ? 'right-4 left-auto' : 'left-4 right-auto'}`}>
                                        <Search className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={isRTL ? 'جستجوی دارو...' : 'Search for medicine...'}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`w-full py-3.5 pr-12 pl-4 bg-white rounded-xl border-0 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base font-medium`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-20">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
                    </svg>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Categories - Horizontal Scroll */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                            selectedCategory === null
                                ? 'bg-royal-600 text-white shadow-lg shadow-royal-500/25'
                                : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-royal-600 border border-slate-200'
                        }`}
                    >
                        {isRTL ? 'همه داروها' : 'All Medicines'}
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                                selectedCategory === cat.id
                                    ? 'bg-royal-600 text-white shadow-lg shadow-royal-500/25'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-royal-600 border border-slate-200'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Products Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {isRTL ? 'محصولات دارویی' : 'Pharmaceutical Products'}
                        </h2>
                        <p className="text-slate-500 mt-1 font-medium">
                            {filteredProducts.length} {isRTL ? 'محصول یافت شد' : 'products found'}
                        </p>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                            {isRTL ? 'محصولی یافت نشد' : 'No products found'}
                        </h3>
                        <p className="text-slate-500">
                            {isRTL ? 'لطفا عبارت دیگری را جستجو کنید' : 'Please try a different search term'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {filteredProducts.map((prod) => (
                            <div 
                                key={prod.id} 
                                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-royal-500/10 hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Image */}
                                <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-royal-500/0 to-emerald-500/0 group-hover:from-royal-500/5 group-hover:to-emerald-500/5 transition-all duration-300"></div>
                                    
                                    {prod.image ? (
                                        <Image 
                                            src={prod.image} 
                                            alt={prod.name} 
                                            fill 
                                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" 
                                        />
                                    ) : (
                                        <div className="text-4xl">💊</div>
                                    )}
                                    
                                    {prod.is_prescription_required && (
                                        <div className="absolute top-2 right-2 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                                            {isRTL ? 'نسخه' : 'Rx'}
                                        </div>
                                    )}
                                    
                                    {/* Favorite Button */}
                                    <button className="absolute top-2 left-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-500 shadow-sm">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-royal-600 transition-colors">
                                        {prod.name}
                                    </h3>
                                    
                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                                key={star} 
                                                className={`w-3 h-3 ${star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                                            />
                                        ))}
                                        <span className="text-xs text-slate-400 mr-1">(4.2)</span>
                                    </div>
                                    
                                    {/* Price & Add */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{isRTL ? 'قیمت' : 'Price'}</p>
                                            <p className="text-lg font-bold text-royal-600">{formatPrice(prod.price)}</p>
                                            <p className="text-[10px] text-slate-400">{isRTL ? 'تومان' : 'IRR'}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddToCart(prod)}
                                            disabled={addingToCart === prod.id}
                                            className="w-10 h-10 bg-royal-50 hover:bg-royal-600 text-royal-600 hover:text-white rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-royal-500/25 hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {addingToCart === prod.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Plus className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

{/* Floating Cart Button - Enhanced Prominent Design */}
            {(localCartItems.length > 0 || (cart && cart.items.length > 0)) && (
                <button
                    onClick={() => setShowCart(true)}
                    className={`fixed bottom-6 z-40 group ${isRTL ? 'right-6' : 'left-6'}`}
                >
                    {/* Glow Effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                    
                    {/* Main Button */}
                    <div className="relative px-6 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-3xl hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all flex items-center gap-3 border border-white/20">
                        {/* Cart Icon with Bounce Animation */}
                        <div className="relative">
                            <ShoppingCart size={22} className="group-hover:scale-110 transition-transform duration-300" />
                            {/* Animated Badge */}
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-emerald-600 text-xs font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-emerald-400 animate-bounce">
                                {localCartItems.reduce((sum, item) => sum + item.quantity, 0) + (cart?.items.length || 0)}
                            </span>
                        </div>
                        
                        {/* Price Display */}
                        <div className="flex flex-col items-start">
                            <span className="text-xs opacity-80">{isRTL ? 'مجموع' : 'Total'}</span>
                            <span className="text-sm font-bold">{formatPrice(localCartItems.reduce((sum, item) => sum + (Number(item.medicine.price) * item.quantity), 0) + (cart?.total_price || 0))}</span>
                        </div>
                        
                        {/* Checkout Arrow */}
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all">
                            <ChevronDown size={16} className={`${isRTL ? 'rotate-90' : '-rotate-90'} transform`} />
                        </div>
                    </div>
                </button>
            )}

            {/* Why Choose Us Section */}
            <div className="bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                            {isRTL ? 'چرا داروخانه آنلاین ما؟' : 'Why Choose Our Online Pharmacy?'}
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            {isRTL 
                                ? 'ما بهترین تجربه خرید آنلاین دارو را با تضمین اصالت کالا و تحویل سریع فراهم می‌کنیم'
                                : 'We provide the best online medicine shopping experience with product authenticity guarantee and fast delivery'}
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: isRTL ? 'تضمین اصالت' : 'Authenticity Guaranteed', desc: isRTL ? 'تمامی داروها از کارخانه‌های معتبر' : 'All medicines directly from reputable factories', color: 'bg-emerald-500' },
                            { icon: Truck, title: isRTL ? 'ارسال سریع' : 'Fast Delivery', desc: isRTL ? 'تحویل درب منزل در کمترین زمان' : 'Home delivery in the shortest time', color: 'bg-blue-500' },
                            { icon: Clock, title: isRTL ? 'پشتیبانی ۲۴/۷' : '24/7 Support', desc: isRTL ? 'مشاوره رایگان در تمام ساعات' : 'Free consultation at all hours', color: 'bg-amber-500' },
                        ].map((item, idx) => (
                            <div key={idx} className="text-center p-6 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-colors">
                                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                    <item.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Sidebar */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-slide-in-right">
                        <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                                            <ShoppingCart className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-text-primary">
                                                {isRTL ? 'سبد خرید' : 'Shopping Cart'}
                                            </h2>
                                            <p className="text-sm text-text-muted">
                                                {cart?.items.length} {isRTL ? 'محصول' : 'items'}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowCart(false)} 
                                        className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                                    >
                                        <X size={20} className="text-text-secondary" />
                                    </button>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Show local cart items if any */}
                                {localCartItems.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                            {isRTL ? 'سبد خرید شما' : 'Your Cart'}
                                        </h3>
                                        {localCartItems.map((item, idx) => (
                                            <div key={`local-${item.medicine.id}-${idx}`} className="flex gap-4 p-4 bg-gradient-to-r from-royal-50 to-emerald-50 rounded-2xl border border-royal-100 hover:shadow-md transition-all">
                                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">💊</div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm text-text-primary line-clamp-1">{item.medicine.name}</h4>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button 
                                                            onClick={() => {
                                                                if (item.quantity > 1) {
                                                                    setLocalCartItems(prev => prev.map((i, x) => x === idx ? { ...i, quantity: i.quantity - 1 } : i));
                                                                } else {
                                                                    setLocalCartItems(prev => prev.filter((_, x) => x !== idx));
                                                                }
                                                            }} 
                                                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-text-secondary hover:bg-primary-50 hover:text-primary-600 transition-colors shadow-sm"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => setLocalCartItems(prev => prev.map((i, x) => x === idx ? { ...i, quantity: i.quantity + 1 } : i))} 
                                                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-text-secondary hover:bg-primary-50 hover:text-primary-600 transition-colors shadow-sm"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-sm text-royal-600">{formatPrice(Number(item.medicine.price) * item.quantity)}</p>
                                                    <button 
                                                        onClick={() => setLocalCartItems(prev => prev.filter((_, x) => x !== idx))} 
                                                        className="text-xs text-red-500 mt-2 hover:underline"
                                                    >
                                                        {isRTL ? 'حذف' : 'Remove'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Backend cart items */}
                                {!isAuthenticated || !cart || cart.items.length === 0 ? (
                                    localCartItems.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <ShoppingCart className="w-10 h-10 text-text-muted" />
                                            </div>
                                            <h3 className="text-lg font-bold text-text-primary mb-2">
                                                {isRTL ? 'سبد خالی است' : 'Cart is empty'}
                                            </h3>
                                            <p className="text-text-muted">
                                                {isRTL ? 'محصولی به سبد اضافه نکرده‌اید' : 'No products added yet'}
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-4">
                                        {localCartItems.length > 0 && (
                                            <div className="h-px bg-slate-200 my-4"></div>
                                        )}
                                        {cart.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-2xl">💊</div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm text-text-primary line-clamp-1">{item.medicine.name}</h4>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} 
                                                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-text-secondary hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} 
                                                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-text-secondary hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-sm text-primary-600">{formatPrice(Number(item.medicine.price) * item.quantity)}</p>
                                                    <button 
                                                        onClick={() => handleRemoveItem(item.id)} 
                                                        className="text-xs text-error mt-2 hover:underline"
                                                    >
                                                        {isRTL ? 'حذف' : 'Remove'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

{/* Footer - Enhanced Checkout Button */}
                            {(localCartItems.length > 0 || (isAuthenticated && cart && cart.items.length > 0)) && (
                                <div className="p-6 border-t border-slate-100 bg-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-medium text-text-secondary">{isRTL ? 'مجموع:' : 'Total:'}</span>
                                        <div className="text-left">
                                            <p className="text-xl font-bold text-emerald-600">
                                                {formatPrice(
                                                    localCartItems.reduce((sum, item) => sum + (Number(item.medicine.price) * item.quantity), 0) + 
                                                    (cart?.total_price || 0)
                                                )}
                                            </p>
                                            <p className="text-xs text-text-muted">{isRTL ? 'تومان' : 'IRR'}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Enhanced Checkout Button */}
                                    <button 
                                        onClick={handleCheckout} 
                                        className="group relative w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        {/* Button Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        {/* Button Content */}
                                        <div className="relative flex items-center justify-center gap-2">
                                            <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                                            <span>{isRTL ? 'تکمیل خرید' : 'Checkout'}</span>
                                            {/* Arrow */}
                                            <div className={`w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
                                                <ChevronDown size={14} className={`${isRTL ? 'rotate-90' : '-rotate-90'} transform`} />
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Prescription Modal */}
            {showPrescriptionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPrescriptionModal(false)}></div>
                    <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-text-primary">
                                {isRTL ? 'انتخاب نسخه' : 'Select Prescription'}
                            </h2>
                            <button 
                                onClick={() => setShowPrescriptionModal(false)} 
                                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                            >
                                <X size={20} className="text-text-secondary" />
                            </button>
                        </div>
                        {prescriptions.length === 0 ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-text-muted" />
                                </div>
                                <p className="text-text-muted">{isRTL ? 'نسخه‌ای یافت نشد' : 'No prescriptions found'}</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {prescriptions.map((px) => (
                                    <button
                                        key={px.id}
                                        onClick={() => selectedMedicine && handleAddWithPrescription(selectedMedicine, px.id)}
                                        className="w-full p-4 bg-slate-50 rounded-2xl text-start hover:bg-primary-50 hover:border-primary-200 transition-all border border-transparent"
                                    >
                                        <p className="font-bold text-sm text-text-primary">{px.diagnosis_text || (isRTL ? 'نسخه پزشک' : 'Medical Prescription')}</p>
                                        <p className="text-xs text-text-muted mt-1">{px.doctor_name}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                        <button 
                            onClick={() => setShowPrescriptionModal(false)} 
                            className="w-full mt-4 py-3 border border-slate-200 rounded-xl text-text-secondary font-medium hover:bg-slate-50 transition-colors"
                        >
                            {isRTL ? 'انصراف' : 'Cancel'}
                        </button>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {showCheckoutModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCheckoutModal(false)}></div>
                    <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-text-primary">
                                {isRTL ? 'تکمیل سفارش' : 'Checkout'}
                            </h2>
                            <button 
                                onClick={() => setShowCheckoutModal(false)} 
                                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                            >
                                <X size={20} className="text-text-secondary" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    {isRTL ? 'نام کامل' : 'Full Name'}
                                </label>
                                <input 
                                    type="text" 
                                    value={checkoutForm.delivery_name} 
                                    onChange={(e) => setCheckoutForm({...checkoutForm, delivery_name: e.target.value})} 
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    {isRTL ? 'شماره تماس' : 'Phone'}
                                </label>
                                <input 
                                    type="text" 
                                    value={checkoutForm.delivery_phone} 
                                    onChange={(e) => setCheckoutForm({...checkoutForm, delivery_phone: e.target.value})} 
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    {isRTL ? 'آدرس تحویل' : 'Delivery Address'}
                                </label>
                                <textarea 
                                    value={checkoutForm.delivery_address} 
                                    onChange={(e) => setCheckoutForm({...checkoutForm, delivery_address: e.target.value})} 
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 min-h-[80px]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setShowCheckoutModal(false)} 
                                className="flex-1 py-3 bg-slate-100 rounded-xl text-text-secondary font-medium hover:bg-slate-200 transition-colors"
                            >
                                {isRTL ? 'بازگشت' : 'Cancel'}
                            </button>
                            <button 
                                onClick={handleConfirmCheckout} 
                                disabled={loading} 
                                className="flex-1 group relative py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold rounded-xl overflow-hidden hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            >
                                {/* Button Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                {/* Button Content */}
                                <div className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span>{isRTL ? 'تأیید و پرداخت' : 'Confirm & Pay'}</span>
                                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all">
                                                <ChevronDown size={12} className={`${isRTL ? 'rotate-90' : '-rotate-90'} transform`} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PharmacyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        }>
            <PharmacyPageContent />
        </Suspense>
    );
}

