'use client';

import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            children,
            variant = 'default',
            padding = 'md',
            hover = false,
            className = '',
            ...props
        },
        ref
    ) => {
        const baseStyles = `
            relative overflow-hidden rounded-3xl transition-all duration-300
        `;

        const variants = {
            default: 'bg-white border border-slate-200',
            elevated: 'bg-white shadow-lg shadow-slate-200/50 border border-slate-100',
            outlined: 'bg-white border-2 border-slate-200',
            glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg',
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        const hoverStyles = hover ? `
            hover:shadow-xl hover:shadow-slate-200/60
            hover:-translate-y-1
            cursor-pointer
        ` : '';

        return (
            <div
                ref={ref}
                className={`
                    ${baseStyles}
                    ${variants[variant]}
                    ${paddings[padding]}
                    ${hoverStyles}
                    ${className}
                `}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ title, subtitle, action, children, className = '', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`flex items-start justify-between mb-6 ${className}`}
                {...props}
            >
                <div>
                    {title && (
                        <h3 className="text-xl font-bold text-slate-900">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-slate-500 mt-1">
                            {subtitle}
                        </p>
                    )}
                    {children}
                </div>
                {action && <div>{action}</div>}
            </div>
        );
    }
);

CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, className = '', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, className = '', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-100 ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardFooter.displayName = 'CardFooter';

export default Card;
