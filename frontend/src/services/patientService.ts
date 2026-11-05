import apiClient from './apiClient';

export interface PatientProfile {
    id: string;
    first_name: string;
    last_name: string;
    medical_history: any[]; // Define more specific types as needed
    // ... other fields
}

export interface Appointment {
    id: string;
    doctor_name: string;
    date: string;
    time: string;
    status: string;
}

export interface MedicalHistoryEntry {
    id: string;
    condition: string;
    diagnosis_date: string;
    notes: string;
}

export const patientService = {
    // Get patient profile
    getProfile: async (id: string) => {
        const response = await apiClient.get<PatientProfile>(`/patients/${id}/`);
        return response.data;
    },

    // Get appointments
    getAppointments: async (id: string) => {
        const response = await apiClient.get<Appointment[]>(`/patients/${id}/appointments/`);
        return response.data;
    },

    // Add medical history
    addMedicalHistory: async (id: string, data: Omit<MedicalHistoryEntry, 'id'>) => {
        const response = await apiClient.post<MedicalHistoryEntry>(`/patients/${id}/add-history/`, data);
        return response.data;
    }
};
