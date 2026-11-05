import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { config } from '@/config';

// Create axios instance using centralized config
const apiClient = axios.create({
    baseURL: config.api.baseUrl,  // e.g., http://magicai.runflare.run/api
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: config.api.timeout,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (requestConfig) => {
        const state = useAuthStore.getState();
        const token = state.accessToken;

        if (token) {
            requestConfig.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Add CSRF token for non-GET requests
        if (requestConfig.method !== 'get') {
            const csrfToken = document.cookie
                .match(new RegExp(`(^| )${config.security.csrfHeaderName}=([^;]+)`));
            if (csrfToken) {
                requestConfig.headers[config.security.csrfHeaderName] = csrfToken[2];
            }
        }
        
        return requestConfig;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const state = useAuthStore.getState();
                const refreshToken = state.refreshToken;
                
                if (refreshToken) {
                    // Use correct refresh token endpoint
                    const response = await axios.post(
                        `${config.api.baseUrl}/accounts/token/refresh/`,
                        { refresh: refreshToken },
                        { withCredentials: true }
                    );
                    
                    const { access } = response.data;
                    // Update the access token directly in the store
                    useAuthStore.setState({ accessToken: access });
                    
                    // Retry original request
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        
        // Handle rate limiting
        if (error.response?.status === 429) {
            console.warn('Rate limited. Please wait before making more requests.');
        }
        
        return Promise.reject(error);
    }
);

// Helper methods for API calls
export const api = {
    get: <T>(url: string, config?: any) => 
        apiClient.get<T>(url, config),
    
    post: <T>(url: string, data?: any, config?: any) => 
        apiClient.post<T>(url, data, config),
    
    put: <T>(url: string, data?: any, config?: any) => 
        apiClient.put<T>(url, data, config),
    
    patch: <T>(url: string, data?: any, config?: any) => 
        apiClient.patch<T>(url, data, config),
    
    delete: <T>(url: string, config?: any) => 
        apiClient.delete<T>(url, config),
};

export default apiClient;

