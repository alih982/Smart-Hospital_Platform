import apiClient from './apiClient';

export interface LandingPageHeader {
    title: string;
    subtitle: string;
    search_placeholder: string;
    active_doctors_count: string;
    user_rating: string;
}

export interface MedicalService {
    id: number;
    title_en: string;
    title_fa: string;
    slug: string;
    description_en: string;
    description_fa: string;
    content_en: string;
    content_fa: string;
    icon_name: string;
    color_class: string;
    featured_image: string | null;
    order: number;
}

export interface PatientReview {
    id: number;
    patient_name: string;
    patient_role: string;
    review_text: string;
    rating: string;
    image_url: string;
}

export interface AboutSection {
    tag: string;
    title: string;
    paragraph_1: string;
    paragraph_2: string;
    feature_1: string;
    feature_2: string;
    feature_3: string;
}

export interface NavMenuItem {
    id: number;
    label_en: string;
    label_fa: string;
    url: string;
    icon_name: string | null;
    is_mega_menu: boolean;
    children: NavMenuItem[];
    order: number;
}

export interface LandingData {
    header: LandingPageHeader;
    services: MedicalService[];
    reviews: PatientReview[];
    about: AboutSection;
    menu: NavMenuItem[];
}

export const cmsService = {
    getLandingData: async (): Promise<LandingData> => {
        const response = await apiClient.get('/cms/content/landing-data/');
        return response.data;
    },

    getMenu: async (): Promise<NavMenuItem[]> => {
        const response = await apiClient.get('/cms/menu/');
        return response.data;
    },

    getServices: async (): Promise<MedicalService[]> => {
        const response = await apiClient.get('/cms/services/');
        return response.data;
    },

    getServiceBySlug: async (slug: string): Promise<MedicalService> => {
        const response = await apiClient.get(`/cms/services/${slug}/`);
        return response.data;
    },

    getReviews: async (): Promise<PatientReview[]> => {
        const response = await apiClient.get('/cms/reviews/');
        return response.data;
    },
};
