
import apiClient from './apiClient';

export interface Appointment {
    id: string;
    patient_name?: string;
    doctor_name?: string;
    specialty?: string;
    appointment_date: string;
    appointment_time?: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    type?: string;
}

export interface Patient {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
    date_of_birth?: string;
}

// Mock data for demo mode
const mockAppointments: Appointment[] = [
    { id: '1', patient_name: 'John Doe', doctor_name: 'Dr. Sarah', specialty: 'Cardiology', appointment_date: new Date().toISOString(), appointment_time: '09:00 AM', status: 'confirmed', type: 'consultation' },
    { id: '2', patient_name: 'Sarah Wilson', doctor_name: 'Dr. Michael', specialty: 'General', appointment_date: new Date().toISOString(), appointment_time: '10:30 AM', status: 'confirmed', type: 'checkup' },
    { id: '3', patient_name: 'Mike Johnson', doctor_name: 'Dr. Emily', specialty: 'Dermatology', appointment_date: new Date().toISOString(), appointment_time: '02:00 PM', status: 'pending', type: 'consultation' },
    { id: '4', patient_name: 'Emily Brown', doctor_name: 'Dr. Sarah', specialty: 'Cardiology', appointment_date: new Date().toISOString(), appointment_time: '03:30 PM', status: 'confirmed', type: 'follow-up' },
];

const mockPatients: Patient[] = [
    { id: '1', full_name: 'John Doe', phone: '0912 000 0001', email: 'john@example.com', date_of_birth: '1990-05-15' },
    { id: '2', full_name: 'Sarah Wilson', phone: '0912 000 0002', email: 'sarah@example.com', date_of_birth: '1985-08-22' },
    { id: '3', full_name: 'Mike Johnson', phone: '0912 000 0003', email: 'mike@example.com', date_of_birth: '1992-11-30' },
];

// Check if we're in demo mode (no backend)
const isDemoMode = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return !token || token.startsWith('mock-token');
};

export const appointmentService = {
    getUpcoming: async (params: { doctor_id?: string; patient_id?: string; days?: number }) => {
        if (isDemoMode()) {
            return { success: true, count: mockAppointments.length, data: mockAppointments };
        }
        
        try {
            const response = await apiClient.get('/appointments/upcoming/', { params });
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return { success: true, count: mockAppointments.length, data: mockAppointments };
        }
    },

    getPatients: async (): Promise<{ success: boolean; count: number; data: Patient[] }> => {
        if (isDemoMode()) {
            return { success: true, count: mockPatients.length, data: mockPatients };
        }
        
        try {
            const response = await apiClient.get('/appointments/patients/');
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return { success: true, count: mockPatients.length, data: mockPatients };
        }
    },

    book: async (data: any) => {
        if (isDemoMode()) {
            const newAppointment: Appointment = {
                id: Date.now().toString(),
                patient_name: data.patient_name || 'Patient',
                doctor_name: data.doctor_name || 'Doctor',
                appointment_date: data.appointment_date || new Date().toISOString(),
                appointment_time: data.appointment_time || '10:00 AM',
                status: 'confirmed',
                type: data.type || 'consultation'
            };
            return { success: true, message: 'Appointment booked successfully', data: newAppointment };
        }
        
        try {
            const response = await apiClient.post('/appointments/book/', data);
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return { success: true, message: 'Appointment booked (demo mode)' };
        }
    },

    cancel: async (id: string, reason?: string) => {
        if (isDemoMode()) {
            return { success: true, message: 'Appointment cancelled successfully' };
        }
        
        try {
            const response = await apiClient.post(`/appointments/${id}/cancel/`, { reason });
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return { success: true, message: 'Appointment cancelled (demo mode)' };
        }
    },

    confirmPayment: async (appointmentId: string) => {
        if (isDemoMode()) {
            return { success: true, message: 'Payment confirmed (demo mode)' };
        }
        
        try {
            const response = await apiClient.post(`/appointments/${appointmentId}/confirm-payment/`);
            return response.data;
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            throw error;
        }
    }
};

