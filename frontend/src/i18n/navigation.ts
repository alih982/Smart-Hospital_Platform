import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { useParams as useNextParams } from 'next/navigation';
import { locales, defaultLocale } from './request';

export const routing = defineRouting({
    locales,
    defaultLocale: 'fa', // Keep Persian as default for the hospital app
    localePrefix: 'never' // Let middleware handle locale prefix
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

// Export useParams for use in pages with dynamic routes
export const useParams = useNextParams;
