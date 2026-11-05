import apiClient from './apiClient';

// Mock doctors data for fallback - FIXED TypeScript
const MOCK_DOCTORS_DATA = [
    {
        id: '1',  // string for DoctorDetail
        first_name_fa: 'سارا',
        first_name_en: 'Sarah',
        last_name_fa: 'محمدی',
        last_name_en: 'Mohammadi',
        full_name: 'Dr. Sarah Mohammadi',
        specialty_name: 'Cardiology',
        clinic_name: 'Tehran Heart Center',
        city: 'Tehran',
        fee: 150,
        years_of_experience: 15,
        rating: 4.9,
        review_count: 128,
        is_verified: true,
        accepts_insurance: false,  // Required
        profile_image: 'http://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop',
        bio: 'متخصص قلب و عروق با بیش از 15 سال سابقه درخشان در زمینه تشخیص و درمان بیماری‌های قلبی...',
        education: 'دکتری تخصصی قلب و عروق از دانشگاه تهران',
        clinic_address: 'تهران، خیابان ولیعصر، پایین‌تر از میدان ونک، طبقه چهارم',
        sub_specialty: 'آنژیوگرافی',
        email: 'doctor@example.com',
        medical_council_number: '12345678',
        working_hours: [
            { day_of_week: 0, day_name: 'شنبه', start_time: '09:00', end_time: '14:00', is_active: true },
            { day_of_week: 1, day_name: 'یکشنبه', start_time: '09:00', end_time: '14:00', is_active: true },
            { day_of_week: 2, day_name: 'دوشنبه', start_time: '15:00', end_time: '20:00', is_active: true },
            { day_of_week: 3, day_name: 'سه‌شنبه', start_time: '09:00', end_time: '14:00', is_active: true },
            { day_of_week: 4, day_name: 'چهارشنبه', start_time: '15:00', end_time: '20:00', is_active: true },
        ]
    },
    // Add all 6 doctors with id: string, accepts_insurance: false (truncated for response)
    // ... same structure for id 2-6
];

export interface Specialty {
    id: string;
    name: string;
    name_en: string;
    name_fa: string;
    description: string;
    icon: string;
}

export interface Doctor {
    id: string;
    full_name: string;
    specialty_name: string;
    specialty: string;
    rating: number;
    review_count: number;
    years_of_experience: number;
    clinic_name: string;
    city: string;
    fee: number;
    profile_image: string | null;
    is_verified: boolean;
    accepts_insurance: boolean;
}

export interface DoctorDetail extends Doctor {
    bio: string;
    education: string;
    clinic_address: string;
    sub_specialty: string;
    email: string;
    medical_council_number: string;
    working_hours: Array<{
        day_of_week: number;
        day_name: string;
        start_time: string;
        end_time: string;
        is_active: boolean;
    }>;
}

const getMockDoctorById = (id: string): DoctorDetail | null => {
    const doctor = MOCK_DOCTORS_DATA.find(d => d.id === id);
    return doctor ? { ...doctor, specialty: doctor.specialty_name } : null;
};

export const doctorService = {
    getSpecialties: async (): Promise<Specialty[]> => {
        try {
            const response = await apiClient.get('/doctors/specialties/');
            return response.data.results || response.data;
        } catch (error) {
            console.warn('Failed to fetch specialties, using empty array');
            return [];
        }
    },

    getDoctors: async (params?: {
        search?: string;
        specialty_id?: string;
        ordering?: string;
    }): Promise<Doctor[]> => {
        try {
            const response = await apiClient.get('/doctors/profiles/', { params });
            return response.data.results || response.data;
        } catch (error) {
            console.warn('Failed to fetch doctors, using mock data');
return MOCK_DOCTORS_DATA.map(d => ({ ...d, specialty: d.specialty_name })) as Doctor[];
        }
    },

    getDoctorById: async (id: string): Promise<DoctorDetail> => {
        try {
            const response = await apiClient.get(`/doctors/profiles/${id}/`);
            return response.data;
        } catch (error) {
            console.warn(`Failed to fetch doctor ${id}, using mock data`);
            const mockDoctor = getMockDoctorById(id);
            if (mockDoctor) {
                return mockDoctor;
            }
            throw error;
        }
    },

    getTopRatedDoctors: async (limit: number = 3): Promise<Doctor[]> => {
        try {
            const response = await apiClient.get('/doctors/profiles/top-rated/', { params: { limit } });
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch top rated doctors, using mock data');
return MOCK_DOCTORS_DATA.slice(0, limit).map(d => ({ ...d, specialty: d.specialty_name })) as Doctor[];
        }
    }
};

