'use client';

import apiClient from './apiClient';

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Medicine {
    id: string;
    name: string;
    slug: string;
    category: string | Category;
    category_name?: string;
    description: string;
    specifications: string;
    image: string | null;
    price: string;
    stock: number;
    pharmacy_name: string;
    is_active: boolean;
    is_prescription_required: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CartItem {
    id: string;
    medicine: Medicine;
    quantity: number;
    prescription: string | null;
    medicine_name?: string;
    medicine_price?: string;
    medicine_image?: string;
    total_price?: number;
    requires_prescription?: boolean;
}

export interface Cart {
    id: string;
    patient: string;
    items: CartItem[];
    total_price: number;
    total_items: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface OrderItem {
    id: string;
    medicine_name: string;
    medicine_price: string;
    quantity: number;
    prescription_item?: any;
}

export interface Order {
    id: string;
    order_number: string;
    patient: string;
    prescription: string | null;
    status: string;
    status_display?: string;
    payment_status: string;
    payment_status_display?: string;
    delivery_address: string;
    delivery_phone: string;
    delivery_name: string;
    subtotal: string;
    discount: string;
    total: string;
    payment_method: string;
    payment_reference: string;
    notes: string;
    items?: OrderItem[];
    created_at: string;
    updated_at: string;
}

// Mock data for fallback
const MOCK_CATEGORIES: Category[] = [
    { id: '1', name: 'Heart Health', slug: 'heart-health', icon: '❤️', is_active: true },
    { id: '2', name: 'Pain Relief', slug: 'pain-relief', icon: '💊', is_active: true },
    { id: '3', name: 'Vitamins', slug: 'vitamins', icon: '🌿', is_active: true },
    { id: '4', name: 'Cold & Flu', slug: 'cold-flu', icon: '🤒', is_active: true },
    { id: '5', name: 'Skin Care', slug: 'skin-care', icon: '✨', is_active: true },
    { id: '6', name: 'Diabetes', slug: 'diabetes', icon: '🩸', is_active: true },
];

const MOCK_MEDICINES: Medicine[] = [
    { id: '1', name: 'Cardio Aspirin 100mg', slug: 'cardio-aspirin-100mg', category: '1', category_name: 'Heart Health', description: 'Heart medication', specifications: '', image: null, price: '15000', stock: 50, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: true },
    { id: '2', name: 'Vitamin D3 1000IU', slug: 'vitamin-d3-1000iu', category: '3', category_name: 'Vitamins', description: 'Vitamin supplement', specifications: '', image: null, price: '25000', stock: 100, pharmacy_name: 'Health Store', is_active: true, is_prescription_required: false },
    { id: '3', name: 'Ibuprofen 400mg', slug: 'ibuprofen-400mg', category: '2', category_name: 'Pain Relief', description: 'Pain reliever', specifications: '', image: null, price: '8000', stock: 75, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: false },
    { id: '4', name: 'Omega-3 Fish Oil', slug: 'omega-3-fish-oil', category: '1', category_name: 'Heart Health', description: 'Heart health supplement', specifications: '', image: null, price: '35000', stock: 30, pharmacy_name: 'Natural Health', is_active: true, is_prescription_required: false },
    { id: '5', name: 'Vitamin C 1000mg', slug: 'vitamin-c-1000mg', category: '3', category_name: 'Vitamins', description: 'Immune system support', specifications: '', image: null, price: '18000', stock: 200, pharmacy_name: 'Health Store', is_active: true, is_prescription_required: false },
    { id: '6', name: 'Cold Defense', slug: 'cold-defense', category: '4', category_name: 'Cold & Flu', description: 'Cold and flu relief', specifications: '', image: null, price: '22000', stock: 45, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: false },
    { id: '7', name: 'Moisturizing Cream', slug: 'moisturizing-cream', category: '5', category_name: 'Skin Care', description: 'Skin moisturizer', specifications: '', image: null, price: '28000', stock: 60, pharmacy_name: 'Beauty Care', is_active: true, is_prescription_required: false },
    { id: '8', name: 'Metformin 500mg', slug: 'metformin-500mg', category: '6', category_name: 'Diabetes', description: 'Diabetes medication', specifications: '', image: null, price: '12000', stock: 25, pharmacy_name: 'Central Pharmacy', is_active: true, is_prescription_required: true },
];

class PharmacyService {
    // Categories - with fallback
    async getCategories(): Promise<Category[]> {
        try {
            const response = await apiClient.get('/pharmacy/categories/');
            return response.data.results || response.data || [];
        } catch (error) {
            console.warn('Failed to fetch categories, using mock data:', error);
            return MOCK_CATEGORIES;
        }
    }

    // Medicines - with fallback
    async getMedicines(params?: {
        category?: string;
        search?: string;
        is_prescription_required?: boolean;
    }): Promise<Medicine[]> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.category) queryParams.append('category', params.category);
            if (params?.search) queryParams.append('search', params.search);
            if (params?.is_prescription_required !== undefined) {
                queryParams.append('is_prescription_required', params.is_prescription_required.toString());
            }

            const response = await apiClient.get(`/pharmacy/medicines/?${queryParams.toString()}`);
            return response.data.results || response.data || [];
        } catch (error) {
            console.warn('Failed to fetch medicines, using mock data:', error);
            let medicines = [...MOCK_MEDICINES];

            if (params?.category) {
                medicines = medicines.filter(m => String(m.category) === String(params.category));
            }
            if (params?.search) {
                medicines = medicines.filter(m =>
                    m.name.toLowerCase().includes(params.search!.toLowerCase())
                );
            }

            return medicines;
        }
    }

    async getMedicine(slug: string): Promise<Medicine | null> {
        try {
            const response = await apiClient.get(`/pharmacy/medicines/${slug}/`);
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch medicine, using mock data:', error);
            return MOCK_MEDICINES.find(m => m.slug === slug) || null;
        }
    }

    // Cart - requires authentication
    async getCart(): Promise<Cart | null> {
        try {
            const response = await apiClient.get('/pharmacy/cart/current/');
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch cart (requires login):', error);
            return null;
        }
    }

    async addToCart(medicineId: string, quantity: number = 1, prescriptionId?: string): Promise<Cart | null> {
        try {
            const data: any = {
                medicine_id: medicineId,
                quantity: quantity,
            };
            if (prescriptionId) {
                data.prescription_id = prescriptionId;
            }
            const response = await apiClient.post('/pharmacy/cart/add_item/', data);
            return response.data;
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            // Re-throw with more details for better error handling
            if (error.response) {
                // Server responded with error
                throw new Error(error.response.data?.error || error.response.data?.details || JSON.stringify(error.response.data));
            } else if (error.request) {
                // Request made but no response
                throw new Error('Server not responding. Please try again.');
            } else {
                // Something else went wrong
                throw error;
            }
        }
    }

    async bulkAddPrescription(prescriptionId: string): Promise<{
        status: string;
        cart: Cart;
        added_items: string[];
        not_found_items: string[];
    } | null> {
        try {
            const response = await apiClient.post('/pharmacy/cart/bulk_add_prescription/', {
                prescription_id: prescriptionId,
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to bulk add prescription:', error);
            throw error;
        }
    }

    async updateCartItem(itemId: string, quantity: number): Promise<Cart | null> {
        try {
            const response = await apiClient.post('/pharmacy/cart/update_item/', {
                item_id: itemId,
                quantity: quantity,
            });
            return response.data;
        } catch (error) {
            console.error('Failed to update cart:', error);
            throw error;
        }
    }

    async removeCartItem(itemId: string): Promise<Cart | null> {
        try {
            const response = await apiClient.post('/pharmacy/cart/remove_item/', {
                item_id: itemId,
            });
            return response.data;
        } catch (error) {
            console.error('Failed to remove item:', error);
            throw error;
        }
    }

    async clearCart(): Promise<boolean> {
        try {
            await apiClient.post('/pharmacy/cart/clear/');
            return true;
        } catch (error) {
            console.error('Failed to clear cart:', error);
            throw error;
        }
    }

    // Orders - requires authentication
    async createOrder(orderData: {
        delivery_address: string;
        delivery_phone: string;
        delivery_name: string;
        notes?: string;
        prescription_id?: string;
    }): Promise<Order | null> {
        try {
            const response = await apiClient.post('/pharmacy/orders/', orderData);
            return response.data;
        } catch (error) {
            console.error('Failed to create order:', error);
            throw error;
        }
    }

    async checkout(orderData: {
        delivery_address: string;
        delivery_phone: string;
        delivery_name: string;
        notes?: string;
        prescription_id?: string;
        payment_method?: string;
    }): Promise<{ success: boolean; order?: Order; message?: string } | null> {
        try {
            const response = await apiClient.post('/pharmacy/orders/checkout/', orderData);
            return response.data;
        } catch (error) {
            console.error('Failed to checkout:', error);
            throw error;
        }
    }

    async getMyOrders(): Promise<Order[]> {
        try {
            const response = await apiClient.get('/pharmacy/orders/my_orders/');
            return response.data || [];
        } catch (error) {
            console.warn('Failed to fetch orders (requires login):', error);
            return [];
        }
    }

    async cancelOrder(orderId: string): Promise<Order | null> {
        try {
            const response = await apiClient.post(`/pharmacy/orders/${orderId}/cancel/`);
            return response.data;
        } catch (error) {
            console.error('Failed to cancel order:', error);
            throw error;
        }
    }
}

export const pharmacyService = new PharmacyService();

