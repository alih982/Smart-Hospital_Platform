import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

export default createMiddleware({
    locales,
    defaultLocale: 'fa', // Persian is default for this hospital app
    localePrefix: 'never', // Let Link component handle locale prefix
    localeDetection: true,
});

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
