import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Can use environment variable in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept requests to add token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Global response handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthError =
            error.response?.status === 401 ||
            error.response?.status === 403 ||
            (error.response?.status === 400 && error.response?.data?.detail === "Inactive user");

        if (isAuthError) {
            // Token expiration or banned user, trigger logout immediately
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
