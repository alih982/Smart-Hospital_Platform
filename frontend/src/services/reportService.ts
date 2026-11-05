
import axios from 'axios';
import apiClient from './apiClient';

// Fixed: Remove /api prefix - base URL already includes /api/v1
const API_URL = '/reports/medical-reports/';

export interface MedicalReport {
    id: number;
    title: string;
    report_type: 'HEALTH_SUMMARY' | 'CARDIAC_ANALYSIS' | 'LAB_RESULTS';
    file: string;
    created_at: string;
    is_signed: boolean;
    patient: number;
    doctor: number | null;
}

// Mock data for demo mode
const mockReports: MedicalReport[] = [
    {
        id: 1,
        title: 'Annual Health Checkup Summary',
        report_type: 'HEALTH_SUMMARY',
        file: '#',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_signed: true,
        patient: 1,
        doctor: 1
    },
    {
        id: 2,
        title: 'Cardiac Analysis Report',
        report_type: 'CARDIAC_ANALYSIS',
        file: '#',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        is_signed: true,
        patient: 1,
        doctor: 2
    },
    {
        id: 3,
        title: 'Laboratory Results - Blood Work',
        report_type: 'LAB_RESULTS',
        file: '#',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_signed: true,
        patient: 1,
        doctor: 1
    }
];

// Check if we're in demo mode (no backend)
const isDemoMode = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return !token || token.startsWith('mock-token');
};

export const reportService = {
    async getMyReports(): Promise<MedicalReport[]> {
        if (isDemoMode()) {
            return mockReports;
        }
        
        try {
            const response = await apiClient.get<MedicalReport[]>(API_URL);
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return mockReports;
        }
    },

    async downloadReport(url: string) {
        if (url === '#') {
            // Demo mode - show alert
            alert('Download feature is available in production mode');
            return;
        }
        window.open(url, '_blank');
    }
};

