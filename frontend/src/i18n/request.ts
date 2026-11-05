import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales - International Healthcare Platform
// Only include locales that have message files
export const locales = ['en', 'fa'] as const;
export type Locale = typeof locales[number];

// Default locale - Persian for this hospital app
export const defaultLocale: Locale = 'fa';

// Locale metadata for SEO and UI
export const localeConfig: Record<string, {
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  currency: string;
  dateFormat: string;
}> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr', currency: 'USD', dateFormat: 'MM/DD/YYYY' },
  fa: { name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', direction: 'rtl', currency: 'IRR', dateFormat: 'YYYY/MM/DD' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl', currency: 'SAR', dateFormat: 'DD/MM/YYYY' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', direction: 'ltr', currency: 'TRY', dateFormat: 'DD.MM.YYYY' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr', currency: 'EUR', dateFormat: 'DD/MM/YYYY' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr', currency: 'EUR', dateFormat: 'DD/MM/YYYY' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr', currency: 'EUR', dateFormat: 'DD.MM.YYYY' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr', currency: 'CNY', dateFormat: 'YYYY/MM/DD' },
};

// Check if locale is RTL
export const isRTL = (locale: string): boolean => {
  return ['fa', 'ar'].includes(locale);
};

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;
    console.log('getRequestConfig resolved locale:', locale);

    // Validate that the incoming `locale` parameter is valid
    if (!locale || !locales.includes(locale as any)) {
        locale = defaultLocale;
    }

    try {
        const messages = (await import(`../messages/${locale}.json`)).default;
        return {
            locale: locale as string,
            messages
        };
    } catch (error) {
        console.error('Failed to load messages for locale:', locale, error);
        // Fallback to default locale (fa)
        try {
            const defaultMessages = (await import(`../messages/${defaultLocale}.json`)).default;
            return {
                locale: defaultLocale,
                messages: defaultMessages
            };
        } catch {
            // If even default fails, show error
            notFound();
        }
    }
});
