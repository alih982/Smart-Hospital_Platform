'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function DoctorPatientsPage() {
    const t = useTranslations('dashboard.doctor');
    const ct = useTranslations('common');
    const locale = useLocale();
    const isRTL = locale === 'fa';

    const patients = [
        { id: '#P-1001', name: isRTL ? 'سارا احمدی' : 'Sara Ahmadi', age: 28, gender: 'female', lastVisit: ct('daysAgo', { count: 2 }), blood: 'O+', status: 'monitoring' },
        { id: '#P-1002', name: isRTL ? 'محمد رستمی' : 'Mohammad Rostami', age: 45, gender: 'male', lastVisit: ct('weeksAgo', { count: 1 }), blood: 'A-', status: 'discharged' },
        { id: '#P-1003', name: isRTL ? 'زهرا علوی' : 'Zahra Alavi', age: 32, gender: 'female', lastVisit: ct('yesterday'), blood: 'B+', status: 'inpatient' },
        { id: '#P-1004', name: isRTL ? 'امیر قاسمی' : 'Amir Ghasemi', age: 54, gender: 'male', lastVisit: ct('weeksAgo', { count: 3 }), blood: 'AB+', status: 'monitoring' },
    ];

    return (
        <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
            <div className={`flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm gap-6`}>
                <div className={`space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h1 className="text-3xl font-black text-gray-800">{t('myPatientsBank')}</h1>
                    <p className="text-sm font-bold text-gray-400">{t('pBankDesc')}</p>
                </div>
                <div className="flex gap-4">
                    <button className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-xl hover:bg-gray-100 transition-all">🔍</button>
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">{t('addPatient')}</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {patients.map((p) => (
                    <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                {p.gender === 'male' ? '👨' : '👩'}
                            </div>
                            <span className="text-[10px] font-black text-gray-300">{p.id}</span>
                        </div>
                        <h3 className={`text-xl font-black text-gray-800 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{p.name}</h3>
                        <div className={`flex gap-4 text-[10px] font-black text-gray-400 mb-6 border-b border-gray-50 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                            <span>{p.age} {t('years')}</span>
                            <span>•</span>
                            <span>{t('bloodGroup')}: {p.blood}</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-gray-400">{t('lastVisit')}</span>
                                <span className="text-gray-700">{p.lastVisit}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold items-center">
                                <span className="text-gray-400">{t('status.status')}</span>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${p.status === 'monitoring' ? 'bg-blue-50 text-blue-600' :
                                    p.status === 'inpatient' ? 'bg-orange-50 text-orange-600' :
                                        'bg-green-50 text-green-600'
                                    }`}>{t(`status.${p.status}`)}</span>
                            </div>
                        </div>
                        <button className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-gray-200">{t('viewProfile')}</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
