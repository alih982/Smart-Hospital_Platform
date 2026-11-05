import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
    phone_number: string;
    user_id: number;
    role: 'admin' | 'doctor' | 'patient' | 'guest';
    exp?: number;
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    isAuthenticated: boolean;

    // Actions
    login: (access: string, refresh: string) => void;
    logout: () => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,

            login: (access, refresh) => {
                try {
                    const decoded: any = jwtDecode(access);
                    let role: User['role'] = 'guest';
                    if (decoded.is_superuser || decoded.is_staff) role = 'admin';
                    else if (decoded.is_doctor) role = 'doctor';
                    else if (decoded.is_patient) role = 'patient';

                    const user: User = {
                        phone_number: decoded.phone_number || '',
                        user_id: decoded.user_id,
                        role: role,
                        exp: decoded.exp
                    };

                    // Set cookie for middleware access
                    document.cookie = `auth_token=${access}; path=/; max-age=${3600 * 24}; SameSite=Lax`;
                    document.cookie = `user_role=${role}; path=/; max-age=${3600 * 24}; SameSite=Lax`;

                    set({
                        accessToken: access,
                        refreshToken: refresh,
                        user,
                        isAuthenticated: true
                    });
                } catch (error) {
                    console.error("Invalid token", error);
                }
            },

            logout: () => {
                // Clear cookies
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

                set({
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                    isAuthenticated: false
                });
                localStorage.removeItem('auth-storage');
            },

            hydrate: () => {
                // Optional: specific logic to validate token on load could go here
                const state = get();
                if (state.accessToken && state.user?.exp) {
                    const now = Date.now() / 1000;
                    if (state.user.exp < now) {
                        state.logout();
                    }
                }
            }
        }),
        {
            name: 'auth-storage', // unique name
        }
    )
);
