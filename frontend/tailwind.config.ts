import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
colors: {
                // Custom Navy Blue - Premium Hospital Theme
                navy: {
                    50: '#E8EDF3',
                    100: '#D1DCE7',
                    200: '#A3B9CF',
                    300: '#7596B7',
                    400: '#47739F',
                    500: '#2C3A51', // Main Navy Blue
                    600: '#243041',
                    700: '#1C2631',
                    800: '#141C21',
                    900: '#0C1211',
                    DEFAULT: '#2C3A51',
                },
                // Ultra Premium Dark/Black Color Palette
                primary: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a', // Deep Slate
                    950: '#020617', // Ultra Dark
                    DEFAULT: '#1e293b',
                    light: '#475569',
                    dark: '#020617',
                },
                accent: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6', // Teal
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                    DEFAULT: '#14b8a6',
                },
                // Charcoal/Dark theme instead of Blue
                charcoal: {
                    50: '#f8f9fa',
                    100: '#f1f3f5',
                    200: '#e9ecef',
                    300: '#dee2e6',
                    400: '#ced4da',
                    500: '#adb5bd',
                    600: '#868e96',
                    700: '#495057',
                    800: '#343a40',
                    900: '#1d1f23', // Dark charcoal
                    DEFAULT: '#343a40',
                },
                royal: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569', // Dark slate instead of blue
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    DEFAULT: '#64748b',
                },
                success: {
                    DEFAULT: '#10b981', // Emerald
                    light: '#34d399',
                    dark: '#059669',
                },
                warning: {
                    DEFAULT: '#f59e0b',
                    light: '#fbbf24',
                    dark: '#d97706',
                },
                error: {
                    DEFAULT: '#ef4444',
                    light: '#f87171',
                    dark: '#dc2626',
                },
                surface: {
                    DEFAULT: '#ffffff',
                    muted: '#f8fafc',
                    hover: '#f1f5f9',
                    border: '#e2e8f0',
                    dark: '#0f172a',
                },
                background: '#ffffff',
                foreground: '#0f172a',
            },
            fontFamily: {
                persian: ['Vazirmatn', 'Tahoma', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glass-lg': '0 12px 40px 0 rgba(31, 38, 135, 0.1)',
                'glow': '0 0 20px rgba(100, 116, 139, 0.5)',
                'glow-lg': '0 0 30px rgba(100, 116, 139, 0.6)',
                'premium': '0 10px 30px -10px rgba(15, 23, 42, 0.15)',
                'premium-hover': '0 20px 40px -10px rgba(15, 23, 42, 0.2)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-mesh': 'radial-gradient(at 0% 0%, rgba(100, 116, 139, 0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.1) 0px, transparent 50%)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 3s infinite',
                'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
                    '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
                'luxury': '2.5rem',  // Ultra rounded corners for premium buttons
                'pill-luxury': '3rem',  // Pill shaped for CTA buttons
            }
        },
    },
    plugins: [],
};
export default config;
