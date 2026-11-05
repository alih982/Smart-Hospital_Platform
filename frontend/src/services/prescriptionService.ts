
import apiClient from './apiClient';

export interface PrescriptionMedication {
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
}

export interface Prescription {
    id: string;
    doctor_name?: string;
    diagnosis_text: string;
    medications: PrescriptionMedication[];
    digital_signature: string;
    created_at: string;
    is_dispensed: boolean;
    status?: string;
    is_paid?: boolean;
    notes?: string;
    pharmacy_name?: string;
    patient_id?: string;
    doctor?: any;
}

// Mock data for demo mode
const mockPrescriptions: Prescription[] = [
    {
        id: '1',
        doctor_name: 'دکتر سارا محمدی',
        diagnosis_text: 'سرماخوردگی - عفونت دستگاه تنفسی',
        medications: [
            { name: 'آسپرین ۵۰۰mg', dosage: '۱ قرص', frequency: 'هر ۶ ساعت در صورت نیاز', duration: '۵ روز' },
            { name: 'ویتامین C ۱۰۰۰mg', dosage: '۱ قرص', frequency: 'روزی یکبار', duration: '۱۰ روز' }
        ],
        digital_signature: 'signed_by_dr_sarah',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_dispensed: true
    },
    {
        id: '2',
        doctor_name: 'دکتر علیرضا احمدی',
        diagnosis_text: 'آلرژی فصلی',
        medications: [
            { name: 'سیتریزین ۱۰mg', dosage: '۱ قرص', frequency: 'روزی یکبار شب‌ها', duration: '۱۴ روز' }
        ],
        digital_signature: 'signed_by_dr_michael',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_dispensed: false
    },
    {
        id: '3',
        doctor_name: 'دکتر مریم کریمی',
        diagnosis_text: 'پیگیری فشار خون بالا',
        medications: [
            { name: 'لیزینوپریل ۱۰mg', dosage: '۱ قرص', frequency: 'روزی یکبار صبح‌ها', duration: '۳۰ روز' },
            { name: 'هیدروکلروتیازید ۲۵mg', dosage: '۱ قرص', frequency: 'روزی یکبار صبح‌ها', duration: '۳۰ روز' }
        ],
        digital_signature: 'signed_by_dr_emily',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_dispensed: true
    }
];

// Check if we're in demo mode (no backend)
const isDemoMode = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return !token || token.startsWith('mock-token');
};

export const prescriptionService = {
    getMyPrescriptions: async () => {
        if (isDemoMode()) {
            return mockPrescriptions;
        }
        
        try {
            const response = await apiClient.get<Prescription[]>('/prescriptions/');
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return mockPrescriptions;
        }
    },

    getById: async (id: string) => {
        if (isDemoMode()) {
            const prescription = mockPrescriptions.find(p => p.id === id);
            return prescription || mockPrescriptions[0];
        }
        
        try {
            const response = await apiClient.get<Prescription>(`/prescriptions/${id}/`);
            return response.data;
        } catch (error) {
            console.warn("API unavailable, using mock data");
            return mockPrescriptions.find(p => p.id === id) || mockPrescriptions[0];
        }
    },

    // Get medicines from prescription that need to be purchased from pharmacy
    getPrescriptionMedicines: async (prescriptionId?: string): Promise<{ name: string; dosage: string; frequency: string; prescriptionId?: string }[]> => {
        // If prescription ID provided, get that specific prescription
        if (prescriptionId) {
            const prescription = await prescriptionService.getById(prescriptionId);
            if (prescription) {
                return prescription.medications.map(med => ({
                    name: med.name,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    prescriptionId: prescription.id
                }));
            }
        }
        
        // Otherwise get all prescriptions and extract medicines
        const prescriptions = await prescriptionService.getMyPrescriptions();
        const allMedicines: { name: string; dosage: string; frequency: string; prescriptionId?: string }[] = [];
        
        for (const prescription of prescriptions) {
            // Only include medicines from non-dispensed prescriptions
            if (!prescription.is_dispensed) {
                for (const med of prescription.medications) {
                    allMedicines.push({
                        name: med.name,
                        dosage: med.dosage,
                        frequency: med.frequency,
                        prescriptionId: prescription.id
                    });
                }
            }
        }
        
        return allMedicines;
    },

    // Check if prescription has undispensed medicines
    hasUndispensedMedicines: async (): Promise<boolean> => {
        const prescriptions = await prescriptionService.getMyPrescriptions();
        return prescriptions.some(p => !p.is_dispensed);
    }
};

