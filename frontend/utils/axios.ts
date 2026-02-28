import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Can use environment variable in production
const API_URL = process.env.NEXT_PUBLIC_API_URL
    || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? 'https://pune-dating-api.onrender.com/api/v1'
        : 'http://localhost:8000/api/v1');

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
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthError = error.response?.status === 401;
        const isBannedError = error.response?.status === 403 ||
            (error.response?.status === 400 && error.response?.data?.detail === "Inactive user");

        if (isBannedError) {
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        if (isAuthError && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axios(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                })
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = useAuthStore.getState().refreshToken;

            if (!refreshToken) {
                isRefreshing = false;
                useAuthStore.getState().logout();
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                // IMPORTANT: use clean axios instance to avoid circulating interceptors!
                const params = new URLSearchParams();
                const { data } = await axios.post<{ access_token: string, refresh_token: string }>(
                    `${API_URL}/auth/refresh`,
                    { refresh_token: refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                useAuthStore.getState().setTokens(data.access_token, data.refresh_token);

                processQueue(null, data.access_token);

                originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;
                return axios(originalRequest); // replay original req with clean axios

            } catch (refreshError) {
                processQueue(refreshError, null);
                // Refresh token invalid or expired
                useAuthStore.getState().logout();
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
