'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export default function LoadingSkeleton({
    className = '',
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
}: SkeletonProps) {
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-2xl',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'skeleton-wave',
        none: '',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || '1rem',
    };

    return (
        <div
            className={`
                bg-slate-200 
                ${variantClasses[variant]} 
                ${animationClasses[animation]}
                ${className}
            `}
            style={style}
        />
    );
}

// Preset skeleton components for common use cases
export function CardSkeleton() {
    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100">
            <LoadingSkeleton height={200} className="mb-4" />
            <LoadingSkeleton width="60%" height={24} className="mb-2" />
            <LoadingSkeleton width="40%" height={16} className="mb-4" />
            <div className="flex gap-4">
                <LoadingSkeleton width={80} height={36} />
                <LoadingSkeleton width={80} height={36} />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-slate-100">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <LoadingSkeleton height={16} />
                </td>
            ))}
        </tr>
    );
}

export function StatsCardSkeleton() {
    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100">
            <div className="flex items-center gap-5">
                <LoadingSkeleton width={56} height={56} variant="circular" />
                <div>
                    <LoadingSkeleton width={60} height={12} className="mb-2" />
                    <LoadingSkeleton width={40} height={28} />
                </div>
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="flex items-center gap-6">
            <LoadingSkeleton width={80} height={80} variant="circular" />
            <div className="flex-1">
                <LoadingSkeleton width={150} height={24} className="mb-2" />
                <LoadingSkeleton width={100} height={16} />
            </div>
        </div>
    );
}

