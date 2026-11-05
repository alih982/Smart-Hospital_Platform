'use client';

import React, { ReactNode } from 'react';

interface PremiumCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'small' | 'medium' | 'large';
    onClick?: () => void;
}

export default function PremiumCard({
    children,
    className = '',
    hover = true,
    padding = 'medium',
    onClick
}: PremiumCardProps) {
    const paddingClasses = {
        none: '',
        small: 'p-4',
        medium: 'p-6',
        large: 'p-8',
    };

    return (
        <div
            onClick={onClick}
            className={`
                bg-white rounded-[2rem] 
                shadow-lg border border-slate-100 
                ${hover ? 'hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1' : ''}
                transition-all duration-500
                ${paddingClasses[padding]}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
}

