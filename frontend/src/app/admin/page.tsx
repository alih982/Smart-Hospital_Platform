'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Shield, Users, DollarSign, Settings, LogOut, BarChart3, Building2, Activity } from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();
    const { user, isAuthenticated, login, logout } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated as admin
        if (!isAuthenticated || user?.role !== 'admin') {
            // Try to check localStorage for admin session
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.role === 'admin') {
                    // Create admin JWT and login
                    const jwtPayload = {
                        user_id: userData.id,
                        phone_number: userData.phone_number,
                        is_patient: false,
                        is_doctor: false,
                        is_superuser: true,
                        is_staff: true,
                        exp: Math.floor(Date.now() / 1000) + 86400
                    };
                    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
                    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(jwtPayload))));
                    const mockJwt = `${header}.${payload}.mock-signature`;
                    login(mockJwt, 'mock-refresh');
                    setLoading(false);
                    return;
                }
            }
            // Not admin - redirect to login
            router.push('/login');
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user, router, login]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        logout();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const stats = [
        { title: 'Total Users', value: '12,345', icon: Users, color: 'bg-blue-500' },
        { title: 'Revenue', value: '$45,678', icon: DollarSign, color: 'bg-green-500' },
        { title: 'Active Doctors', value: '234', icon: Activity, color: 'bg-purple-500' },
        { title: 'Hospitals', value: '56', icon: Building2, color: 'bg-orange-500' },
    ];

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: BarChart3, active: true },
        { name: 'Users', href: '/admin/users', icon: Users, active: false },
        { name: 'Finance', href: '/admin/finance', icon: DollarSign, active: false },
        { name: 'Settings', href: '/admin/settings', icon: Settings, active: false },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Shield className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black">Admin Panel</h1>
                            <p className="text-xs text-slate-400">DoctorHub Dashboard</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-bold ${
                                item.active 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-slate-800 transition-all font-bold"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                <header className="bg-white shadow-sm p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-gray-800">Dashboard Overview</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-bold text-gray-800">{user?.phone_number || 'Admin'}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl">
                            A
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat) => (
                            <div key={stat.title} className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className="text-white" size={24} />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-gray-800 mb-1">{stat.value}</p>
                                <p className="text-sm text-gray-500 font-bold">{stat.title}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-black text-gray-800 mb-6">Recent Activity</h3>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Users size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">New user registered</p>
                                            <p className="text-sm text-gray-500">User #{1000 + i} joined the platform</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-400">{i * 5} min ago</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

