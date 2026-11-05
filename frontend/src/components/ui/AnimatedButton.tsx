'use client';

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedButtonProps {
    children: ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    fullWidth?: boolean;
}

const variantClasses = {
    primary: 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30 hover:bg-blue-700',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm',
    outline: 'bg-transparent border-2 border-blue-500 text-blue-600 hover:bg-blue-50',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizeClasses = {
    small: 'px-4 py-2 text-sm rounded-xl',
    medium: 'px-6 py-3 text-base rounded-2xl',
    large: 'px-8 py-4 text-lg rounded-2xl',
};

export default function AnimatedButton({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'medium',
    icon: Icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    className = '',
    fullWidth = false,
}: AnimatedButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
        >
            {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />}
                </>
            )}
        </button>
    );
}

