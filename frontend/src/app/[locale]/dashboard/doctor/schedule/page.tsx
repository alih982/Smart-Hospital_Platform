'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function DoctorSchedulePage() {
    const t = useTranslations('dashboard.doctor');
    const ct = useTranslations('common');
    const dt = useTranslations('days');
    const locale = useLocale();
    const isRTL = locale === 'fa';

    const schedule = [
        { day: 'sat', start: isRTL ? '۰۸:۰۰' : '08:00', end: isRTL ? '۱۶:۰۰' : '16:00', slots: 16, status: 'active' },
        { day: 'sun', start: isRTL ? '۱۰:۰۰' : '10:00', end: isRTL ? '۱۸:۰۰' : '18:00', slots: 14, status: 'active' },
        { day: 'mon', start: isRTL ? '۰۹:۰۰' : '09:00', end: isRTL ? '۱۷:۰۰' : '17:00', slots: 15, status: 'active' },
        { day: 'tue', start: '-', end: '-', slots: 0, status: 'closed' },
        { day: 'wed', start: isRTL ? '۰۸:۰۰' : '08:00', end: isRTL ? '۱۴:۰۰' : '14:00', slots: 12, status: 'active' },
    ];

    return (
        <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
            <div className={`flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm gap-6`}>
                <div className={`space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h1 className="text-3xl font-black text-gray-800">{t('scheduleManagement')}</h1>
                    <p className="text-sm font-bold text-gray-400">{t('scheduleDesc')}</p>
                </div>
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 italic">{t('updateCalendar')}</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h3 className={`text-xl font-black text-gray-800 mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>{t('myWeeklySchedule')}</h3>
                    <div className="space-y-4">
                        {schedule.map((s) => (
                            <div key={s.day} className={`p-6 rounded-3xl border transition-all flex items-center justify-between ${s.status === 'closed' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-50 hover:border-indigo-200'
                                }`}>
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${s.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        {dt(s.day).charAt(0)}
                                    </div>
                                    <div className={isRTL ? 'text-right' : 'text-left'}>
                                        <p className="font-black text-gray-800">{dt(s.day)}</p>
                                        <p className="text-xs font-bold text-gray-400">{s.status === 'active' ? `${s.start} ${t('until')} ${s.end}` : t('absence')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className={isRTL ? 'text-right' : 'text-left'}>
                                        <p className="text-xs font-black text-gray-400 mb-1">{t('capacity')}</p>
                                        <p className="font-black text-gray-800">{s.slots} {t('slots')}</p>
                                    </div>
                                    <button className="text-indigo-600 font-black text-xs hover:underline">{ct('edit')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                        <h3 className={`text-xl font-black ${isRTL ? 'text-right' : 'text-left'}`}>{t('bookingSettings')}</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className={`text-[10px] font-black text-indigo-300 uppercase block ${isRTL ? 'text-right' : 'text-left'}`}>{t('visitDuration')}</label>
                                <input type="number" defaultValue={isRTL ? "۳۰" : "30"} className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 ring-white/50" />
                            </div>
                            <div className="space-y-2">
                                <label className={`text-[10px] font-black text-indigo-300 uppercase block ${isRTL ? 'text-right' : 'text-left'}`}>{t('reserveAdvance')}</label>
                                <input type="number" defaultValue={isRTL ? "۱۴" : "14"} className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl font-black focus:outline-none focus:ring-2 ring-white/50" />
                            </div>
                            <div className={`flex items-center gap-3 pt-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                                <div className="w-12 h-6 bg-green-500 rounded-full relative shadow-inner">
                                    <div className={`absolute ${isRTL ? 'left-1' : 'right-1'} top-1 w-4 h-4 bg-white rounded-full`}></div>
                                </div>
                                <span className="text-xs font-black text-indigo-100">{t('emergencyAccept')}</span>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all shadow-xl">{t('saveSettings')}</button>
                    </div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}
