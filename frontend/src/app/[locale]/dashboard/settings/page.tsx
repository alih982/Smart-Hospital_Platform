'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
    User, Lock, Bell, Shield, Camera, Mail, Phone, 
    Eye, EyeOff, Check, X, ChevronRight, Loader2,
    KeyRound, AlertTriangle, CheckCircle, Save
} from 'lucide-react';

export default function UserSettings() {
    const t = useTranslations('dashboard.settings');
    const locale = useLocale();
    const isRTL = locale === 'fa';
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);

    const tabs = [
        { id: 'profile', name: isRTL ? 'پروفایل' : 'Profile', icon: User },
        { id: 'security', name: isRTL ? 'امنیت' : 'Security', icon: Lock },
        { id: 'notifications', name: isRTL ? 'اعلان‌ها' : 'Notifications', icon: Bell },
    ];

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
    };

    return (
        <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-10 duration-1000" dir={isRTL ? "rtl" : "ltr"}>
            
            {/* Editorial Header */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-[4rem] p-12 lg:p-16">
                <div className="absolute inset-0 bg-[url('http://www.transparenttextures.com/patterns/noise.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Shield className="text-white w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">
                            {isRTL ? 'تنظیمات حساب' : 'Account Settings'}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
                        {isRTL ? 'تنظیمات' : 'Settings'}
                    </h1>
                    <p className="text-white/60 text-lg font-medium max-w-xl">
                        {isRTL 
                            ? 'مدیریت اطلاعات شخصی و امنیت حساب کاربری.'
                            : 'Manage your personal information and account security.'}
                    </p>
                </div>
            </section>

            {/* Tabs */}
            <div className="flex bg-white p-3 rounded-[3rem] shadow-mega border border-black/[0.03] items-center justify-between">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-3 py-5 px-6 rounded-[2.5rem] transition-all duration-500 font-black text-sm ${activeTab === tab.id
                            ? 'bg-black text-white shadow-lg'
                            : 'text-black/30 hover:text-black hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon size={18} />
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[4rem] p-10 lg:p-12 shadow-mega border border-black/[0.03]">
                {activeTab === 'profile' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col sm:flex-row items-center gap-10 pb-12 border-b border-black/[0.03]">
                            <div className="relative group cursor-pointer">
                                <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-5xl text-white shadow-2xl overflow-hidden">
                                    {isRTL ? 'ع' : 'A'}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-[3rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <div className={`text-center space-y-3 ${isRTL ? 'sm:text-right' : 'sm:text-left'}`}>
                                <h3 className="text-2xl font-black text-black">{isRTL ? 'علی حاتمی' : 'Ali Hatami'}</h3>
                                <p className="text-black/30 font-medium max-w-md">
                                    {isRTL 
                                        ? 'تصویر پروفایل خود را تغییر دهید. حداکثر اندازه ۲ مگابایت.'
                                        : 'Change your profile picture. Maximum size 2MB.'}
                                </p>
                                <div className={`flex gap-3 pt-2 justify-center ${isRTL ? 'sm:justify-start' : 'sm:justify-start'}`}>
                                    <button className="px-6 py-3 bg-black text-white text-xs font-black rounded-2xl hover:bg-blue-600 transition-all">
                                        {isRTL ? 'آپلود جدید' : 'Upload New'}
                                    </button>
                                    <button className="px-6 py-3 bg-red-50 text-red-600 text-xs font-black rounded-2xl hover:bg-red-100 transition-all">
                                        {isRTL ? 'حذف' : 'Remove'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mr-2">{isRTL ? 'نام' : 'First Name'}</label>
                                <input 
                                    type="text" 
                                    defaultValue={isRTL ? 'علی' : 'Ali'} 
                                    className="w-full bg-slate-50 border border-black/[0.03] px-8 py-5 rounded-[2rem] font-bold text-black focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mr-2">{isRTL ? 'نام خانوادگی' : 'Last Name'}</label>
                                <input 
                                    type="text" 
                                    defaultValue={isRTL ? 'حاتمی' : 'Hatami'} 
                                    className="w-full bg-slate-50 border border-black/[0.03] px-8 py-5 rounded-[2rem] font-bold text-black focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mr-2">{isRTL ? 'شماره تماس' : 'Phone Number'}</label>
                                <input 
                                    type="text" 
                                    defaultValue={isRTL ? '۰۹۱۲۳۴۵۶۷۸۹' : '+989123456789'} 
                                    disabled 
                                    className="w-full bg-slate-100 border border-black/[0.03] px-8 py-5 rounded-[2rem] font-bold text-black/40 cursor-not-allowed" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mr-2">{isRTL ? 'ایمیل' : 'Email'}</label>
                                <input 
                                    type="email" 
                                    defaultValue="ali@example.com" 
                                    className="w-full bg-slate-50 border border-black/[0.03] px-8 py-5 rounded-[2rem] font-bold text-black focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mr-2">{isRTL ? 'بیوگرافی' : 'Bio'}</label>
                                <textarea 
                                    rows={4} 
                                    className="w-full bg-slate-50 border border-black/[0.03] px-8 py-5 rounded-[2.5rem] font-bold text-black focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none" 
                                    placeholder={isRTL ? 'چند جمله‌ای درباره خودتان بنویسید...' : 'Write a few sentences about yourself...'} 
                                />
                            </div>
                            <div className="md:col-span-2 pt-6">
                                <button 
                                    type="button"
                                    onClick={handleSave}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-blue-500/20 hover:bg-black transition-all transform active:scale-95"
                                >
                                    {saving ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            {isRTL ? 'ذخیره تغییرات' : 'Save Changes'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="pb-8 border-b border-black/[0.03]">
                            <h3 className="text-2xl font-black text-black mb-2">{isRTL ? 'تغییر رمز عبور' : 'Change Password'}</h3>
                            <p className="text-black/30 font-medium">
                                {isRTL 
                                    ? 'برای امنیت بیشتر، رمز عبور خود را به صورت دوره‌ای تغییر دهید.'
                                    : 'For better security, change your password periodically.'}
                            </p>
                        </div>

                        <form className="max-w-lg space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mr-2">{isRTL ? 'رمز عبور فعلی' : 'Current Password'}</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-slate-50 border border-black/[0.03] px-8 py-5 rounded-[2rem] font-bold text-black focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mr-2">{isRTL ? 'رمز عبور جدید' : 'New Password'}</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-slate-50 border border-black/[0.03] px-8 py-5 rounded-[2rem] font-bold text-black focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mr-2">{isRTL ? 'تکرار رمز عبور' : 'Confirm Password'}</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-slate-50 border border-black/[0.03] px-8 py-5 rounded-[2rem] font-bold text-black focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                />
                            </div>
                            <div className="pt-4">
                                <button 
                                    type="button"
                                    onClick={handleSave}
                                    className="w-full bg-black text-white py-5 rounded-[2rem] font-black shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                                >
                                    {saving ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <>
                                            <KeyRound size={18} />
                                            {isRTL ? 'به‌روزرسانی رمز' : 'Update Password'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="pt-10 border-t border-black/[0.03]">
                            <div className="bg-red-50 p-10 rounded-[3rem] border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className={isRTL ? 'sm:text-right' : 'sm:text-left'}>
                                    <h4 className="font-black text-red-600 text-xl mb-2">{isRTL ? 'حذف حساب کاربری' : 'Delete Account'}</h4>
                                    <p className="text-red-400 text-sm font-medium">
                                        {isRTL 
                                            ? 'این عملیات برگشت‌ناپذیر است. تمام اطلاعات شما حذف خواهد شد.'
                                            : 'This action is irreversible. All your data will be permanently deleted.'}
                                    </p>
                                </div>
                                <button className="bg-white text-red-600 px-8 py-4 rounded-2xl font-black text-sm border border-red-100 hover:bg-red-600 hover:text-white transition-all whitespace-nowrap">
                                    {isRTL ? 'حذف دائمی' : 'Delete Permanently'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="pb-6 border-b border-black/[0.03]">
                            <h3 className="text-2xl font-black text-black mb-2">{isRTL ? 'اعلان‌ها' : 'Notifications'}</h3>
                            <p className="text-black/30 font-medium">
                                {isRTL 
                                    ? 'نوع اعلان‌هایی که می‌خواهید دریافت کنید را مدیریت کنید.'
                                    : 'Manage the types of notifications you want to receive.'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: 'reminders', title: isRTL ? 'یادآورها' : 'Reminders', desc: isRTL ? 'نوبت‌ها و داروها' : 'Appointments & medications', enabled: true },
                                { key: 'newsletter', title: isRTL ? 'خبرنامه' : 'Newsletter', desc: isRTL ? 'اخبار و به‌روزرسانی‌ها' : 'News & updates', enabled: false },
                                { key: 'discounts', title: isRTL ? 'تخفیف‌ها' : 'Discounts', desc: isRTL ? 'پیشنهادات ویژه' : 'Special offers', enabled: true },
                                { key: 'updates', title: isRTL ? 'به‌روزرسانی‌ها' : 'Updates', desc: isRTL ? 'تغییرات سیستم' : 'System changes', enabled: true },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-8 rounded-[3rem] bg-slate-50 hover:bg-black hover:text-white transition-all duration-500 group">
                                    <div className={isRTL ? 'text-right' : 'text-left'}>
                                        <p className="font-black text-lg text-black group-hover:text-white">{item.title}</p>
                                        <p className="text-sm text-black/30 group-hover:text-white/40 font-medium">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <button 
                                onClick={handleSave}
                                className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-xl shadow-blue-500/20 hover:bg-black transition-all flex items-center justify-center gap-3"
                            >
                                {saving ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {isRTL ? 'ذخیره تنظیمات' : 'Save Preferences'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

