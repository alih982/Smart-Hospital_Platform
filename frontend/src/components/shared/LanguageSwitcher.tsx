'use client';

import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useState, useRef, useEffect } from 'react';
import { locales, localeConfig, type Locale } from '@/i18n/request';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get current locale config
    const currentLocale = localeConfig[locale as Locale] || localeConfig.en;

    const toggleLanguage = (newLocale: string) => {
        if (locale === newLocale) {
            setIsOpen(false);
            return;
        }

        // Use router.replace with the current pathname but different locale
        router.replace(pathname, { locale: newLocale as any });
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative overflow-visible" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all font-bold text-sm text-slate-700 ${isOpen ? 'ring-2 ring-blue-500/20 bg-blue-50/50' : ''}`}
                aria-label="Change language"
            >
                <Globe size={16} className="text-blue-600" />
                <span className="hidden sm:inline font-bold">{currentLocale.flag} {currentLocale.nativeName}</span>
                <ChevronDown size={14} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div
                    className="absolute top-full mt-3 z-[9999]"
                    style={locale === 'fa' || locale === 'ar' ? { left: 0 } : { right: 0 }}
                >
                    <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl p-2.5 min-w-[220px] animate-fade-in-up">
                        <div className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50/50 mb-2">
                            {locale === 'fa' || locale === 'ar' ? 'انتخاب زبان' : 'Select Language'}
                        </div>
                        {locales.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => toggleLanguage(lang)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${locale === lang
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'hover:bg-slate-50 text-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{localeConfig[lang].flag}</span>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="font-black text-sm">{localeConfig[lang].nativeName}</span>
                                        <span className="text-[10px] font-bold opacity-60">{localeConfig[lang].name}</span>
                                    </div>
                                </div>
                                {locale === lang && <Check size={16} className="text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

