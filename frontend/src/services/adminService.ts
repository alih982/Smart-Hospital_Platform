
import apiClient from './apiClient';

export interface User {
    id: string;
    phone_number: string;
    first_name?: string;
    last_name?: string;
    role: 'patient' | 'doctor' | 'admin';
    is_active?: boolean;
    date_joined?: string;
}

export interface AdminStats {
    total_users: number;
    total_doctors: number;
    total_patients: number;
    active_appointments: number;
    system_health: number;
}

export interface DoctorStats {
    total_patients: number;
    upcoming_appointments: number;
    completed_consultations: number;
    rating: number;
}

export interface SystemSettings {
    chat_mode: 'rag' | 'fine_tuned' | 'human_support';
    chat_mode_display: string;
    ai_provider: string;
    ai_model_name: string;
    rag_enabled: boolean;
    human_support_active: boolean;
    company_name: string;
    company_description: string;
    support_start_time: string | null;
    support_end_time: string | null;
}

export interface PublicSystemSettings {
    chat_mode: 'rag' | 'fine_tuned' | 'human_support';
    chat_mode_display: string;
    human_support_active: boolean;
    company_name: string;
}

export interface SystemHealth {
    database: string;
    redis: string;
    celery: string;
    workers: string[];
}

// Mock data for demo mode
const mockAdminStats: AdminStats = {
    total_users: 1248,
    total_doctors: 42,
    total_patients: 1206,
    active_appointments: 89,
    system_health: 98
};

const mockDoctorStats: DoctorStats = {
    total_patients: 156,
    upcoming_appointments: 8,
    completed_consultations: 423,
    rating: 4.8
};

const mockUsers: User[] = [
    { id: '1', phone_number: '0912 000 0001', first_name: 'سارا', last_name: 'محمدی', role: 'patient', is_active: true, date_joined: '2024-01-15' },
    { id: '2', phone_number: '0912 000 0002', first_name: 'علی', last_name: 'رضایی', role: 'patient', is_active: true, date_joined: '2024-02-20' },
    { id: '3', phone_number: '0912 000 0003', first_name: 'مریم', last_name: 'احمدی', role: 'doctor', is_active: true, date_joined: '2024-01-10' },
    { id: '4', phone_number: '0912 000 0004', first_name: 'حمید', last_name: 'کریمی', role: 'patient', is_active: false, date_joined: '2024-03-05' },
    { id: '5', phone_number: '0912 000 0005', first_name: 'زهرا', last_name: 'عابدینی', role: 'patient', is_active: true, date_joined: '2024-03-12' },
];

const mockPatients: any[] = [
    { id: 1, name: 'John Doe', specialty: 'Cardiology', time: '09:00 AM', status: 'confirmed', date: new Date().toISOString() },
    { id: 2, name: 'Sarah Wilson', specialty: 'General', time: '10:30 AM', status: 'confirmed', date: new Date().toISOString() },
    { id: 3, name: 'Mike Johnson', specialty: 'Dermatology', time: '02:00 PM', status: 'pending', date: new Date().toISOString() },
    { id: 4, name: 'Emily Brown', specialty: 'General', time: '03:30 PM', status: 'confirmed', date: new Date().toISOString() },
];

// Check if we're in demo mode (no backend)
const isDemoMode = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return !token || token.startsWith('mock-token');
};

export const adminService = {
    getUsers: async (params?: { role?: string; search?: string }) => {
        if (isDemoMode()) {
            // Return mock users
            let users = [...mockUsers];
            if (params?.role) {
                users = users.filter(u => u.role === params.role);
            }
            if (params?.search) {
                const search = params.search.toLowerCase();
                users = users.filter(u =>
                    u.first_name?.toLowerCase().includes(search) ||
                    u.last_name?.toLowerCase().includes(search) ||
                    u.phone_number.includes(search)
                );
            }
            return users;
        }

        try {
            // Build query params - map frontend role to backend filter
            const queryParams: any = {};
            if (params?.role) {
                if (params.role === 'patient') queryParams.is_patient = true;
                if (params.role === 'doctor') queryParams.is_doctor = true;
            }
            if (params?.search) {
                queryParams.search = params.search;
            }
            
            // Use correct API path: /api/accounts/users/
            const response = await apiClient.get<User[]>('/accounts/users/', { params: queryParams });
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return mockUsers;
        }
    },

    getStats: async () => {
        if (isDemoMode()) {
            return mockAdminStats;
        }

        try {
            // Use correct API path: /api/dashboard/admin/stats/
            const response = await apiClient.get<AdminStats>('/dashboard/admin/stats/');
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return mockAdminStats;
        }
    },

    updateUserStatus: async (id: string, isActive: boolean) => {
        if (isDemoMode()) {
            return { id, is_active: isActive };
        }

        try {
            // Fixed: Remove /api prefix - base URL already includes /api/v1
            const response = await apiClient.patch(`/accounts/users/${id}/`, { is_active: isActive });
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return { id, is_active: isActive };
        }
    }
};

export const doctorDashboardService = {
    getStats: async () => {
        if (isDemoMode()) {
            return mockDoctorStats;
        }

        try {
            // Use correct API path: /api/dashboard/doctor/stats/
            const response = await apiClient.get<DoctorStats>('/dashboard/doctor/stats/');
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return mockDoctorStats;
        }
    },

    getPatients: async () => {
        if (isDemoMode()) {
            return mockPatients;
        }

        try {
            // Fixed: Remove /api prefix - base URL already includes /api/v1
            const response = await apiClient.get('/appointments/patients/');
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return mockPatients;
        }
    }
};

// System Settings Service
export const systemSettingsService = {
    getSettings: async (): Promise<SystemSettings> => {
        if (isDemoMode()) {
            return {
                chat_mode: 'rag',
                chat_mode_display: 'سیستم RAG (اطلاعات تخصصی)',
                ai_provider: 'mock',
                ai_model_name: 'gemma',
                rag_enabled: true,
                human_support_active: true,
                company_name: 'DoctorHub',
                company_description: 'سیستم هوشمند پزشکی',
                support_start_time: '08:00',
                support_end_time: '20:00'
            };
        }

        try {
            // Use correct API path: /api/core/system-settings/
            const response = await apiClient.get<SystemSettings>('/core/system-settings/');
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return {
                chat_mode: 'rag',
                chat_mode_display: 'سیستم RAG (اطلاعات تخصصی)',
                ai_provider: 'mock',
                ai_model_name: 'gemma',
                rag_enabled: true,
                human_support_active: true,
                company_name: 'DoctorHub',
                company_description: 'سیستم هوشمند پزشکی',
                support_start_time: '08:00',
                support_end_time: '20:00'
            };
        }
    },

    updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
        if (isDemoMode()) {
            console.log("Demo mode: settings updated", settings);
            return {
                chat_mode: (settings.chat_mode as any) || 'rag',
                chat_mode_display: 'سیستم RAG (اطلاعات تخصصی)',
                ai_provider: settings.ai_provider || 'mock',
                ai_model_name: settings.ai_model_name || 'gemma',
                rag_enabled: settings.rag_enabled ?? true,
                human_support_active: settings.human_support_active ?? true,
                company_name: settings.company_name || 'DoctorHub',
                company_description: settings.company_description || 'سیستم هوشمند پزشکی',
                support_start_time: settings.support_start_time || '08:00',
                support_end_time: settings.support_end_time || '20:00'
            };
        }

        try {
            // Use correct API path: /api/core/system-settings/
            const response = await apiClient.put<SystemSettings>('/core/system-settings/', settings);
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            throw error;
        }
    },

    getPublicSettings: async (): Promise<PublicSystemSettings> => {
        if (isDemoMode()) {
            return {
                chat_mode: 'rag',
                chat_mode_display: 'پاسخ با هوش مصنوعی',
                human_support_active: true,
                company_name: 'DoctorHub'
            };
        }

        try {
            // Use correct API path: /api/core/system-settings/public/
            const response = await apiClient.get<PublicSystemSettings>('/core/system-settings/public/');
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return {
                chat_mode: 'rag',
                chat_mode_display: 'سیستم RAG (اطلاعات تخصصی)',
                human_support_active: true,
                company_name: 'DoctorHub'
            };
        }
    },

    getHealth: async (): Promise<SystemHealth> => {
        if (isDemoMode()) {
            return {
                database: 'healthy',
                redis: 'healthy',
                celery: 'healthy',
                workers: ['worker@magicai.runflare.run', 'beat@magicai.runflare.run']
            };
        }

        try {
            // Use correct API path: /api/core/system-health/
            const response = await apiClient.get<SystemHealth>('/core/system-health/');
            return response.data;
        } catch (error) {
            console.warn("Health check unavailable");
            return {
                database: 'unknown',
                redis: 'unknown',
                celery: 'unknown',
                workers: []
            };
        }
    }
};
