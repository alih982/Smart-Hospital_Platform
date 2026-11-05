'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'rose';
    className?: string;
}

const colorMap = {
    blue: {
        bg: 'from-blue-500 to-cyan-500',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        shadow: 'shadow-blue-500/20',
    },
    green: {
        bg: 'from-emerald-500 to-teal-500',
        light: 'bg-emerald-50',
        text: 'text-emerald-600',
        shadow: 'shadow-emerald-500/20',
    },
    purple: {
        bg: 'from-purple-500 to-pink-500',
        light: 'bg-purple-50',
        text: 'text-purple-600',
        shadow: 'shadow-purple-500/20',
    },
    amber: {
        bg: 'from-amber-500 to-orange-500',
        light: 'bg-amber-50',
        text: 'text-amber-600',
        shadow: 'shadow-amber-500/20',
    },
    red: {
        bg: 'from-red-500 to-rose-500',
        light: 'bg-red-50',
        text: 'text-red-600',
        shadow: 'shadow-red-500/20',
    },
    rose: {
        bg: 'from-rose-500 to-pink-500',
        light: 'bg-rose-50',
        text: 'text-rose-600',
        shadow: 'shadow-rose-500/20',
    },
};

export default function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    color = 'blue',
    className = ''
}: StatsCardProps) {
    const colors = colorMap[color];

    return (
        <div 
            className={`
                group relative bg-white rounded-[2rem] p-6 
                shadow-lg hover:shadow-2xl hover:shadow-primary-500/10 
                border border-slate-100 hover:-translate-y-1 
                transition-all duration-500 ${className}
            `}
        >
            {/* Gradient Glow on Hover */}
            <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity`}></div>
            
            <div className="relative z-10 flex items-center gap-5">
                <div className={`w-14 h-14 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon className="text-white" size={26} />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                    <span className="text-3xl font-black text-slate-800">{value}</span>
                </div>
            </div>

            {trend && (
                <div className={`mt-4 flex items-center gap-1 text-sm font-bold ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span>{trend.isPositive ? '↑' : '↓'}</span>
                    <span>{Math.abs(trend.value)}%</span>
                    <span className="text-slate-400 font-normal">vs last month</span>
                </div>
            )}
        </div>
    );
}

