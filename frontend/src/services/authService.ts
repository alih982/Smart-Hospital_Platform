import apiClient from './apiClient';
import { useAuthStore } from '@/store/useAuthStore';

export interface LoginResponse {
    access: string;
    refresh: string;
}

export interface RegisterData {
    phone_number: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    [key: string]: any; // Allow dynamic role flags like is_doctor
}

export const authService = {
    login: async (data: any) => {
        const response = await apiClient.post<LoginResponse>('/accounts/token/', data);
        if (response.data.access && response.data.refresh) {
            useAuthStore.getState().login(response.data.access, response.data.refresh);
        }
        return response.data;
    },

    register: async (data: RegisterData) => {
        const response = await apiClient.post('/accounts/register/', data);
        return response.data;
    },

    logout: () => {
        useAuthStore.getState().logout();
    }
};
