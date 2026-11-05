'use client';

import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            loading = false,
            fullWidth = false,
            leftIcon,
            rightIcon,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
            relative overflow-hidden inline-flex items-center justify-center
            font-semibold transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
        `;

        const variants = {
            primary: `
                bg-slate-900 text-white
                hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20
                focus:ring-slate-500
                active:scale-[0.98]
            `,
            secondary: `
                bg-white text-slate-900 border border-slate-200
                hover:bg-slate-50 hover:border-slate-300
                focus:ring-slate-400
                active:scale-[0.98]
            `,
            outline: `
                bg-transparent border-2 border-slate-900 text-slate-900
                hover:bg-slate-900 hover:text-white
                focus:ring-slate-500
            `,
            ghost: `
                bg-transparent text-slate-600
                hover:bg-slate-100 hover:text-slate-900
                focus:ring-slate-400
            `,
            danger: `
                bg-red-500 text-white
                hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20
                focus:ring-red-400
                active:scale-[0.98]
            `,
        };

        const sizes = {
            sm: 'px-4 py-2 text-sm rounded-xl gap-2',
            md: 'px-6 py-3 text-base rounded-2xl gap-2',
            lg: 'px-8 py-4 text-lg rounded-2xl gap-3',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
                    ${baseStyles}
                    ${variants[variant]}
                    ${sizes[size]}
                    ${fullWidth ? 'w-full' : ''}
                    ${className}
                `}
                {...props}
            >
                {loading ? (
                    <>
                        <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                        <span>{children}</span>
                        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
