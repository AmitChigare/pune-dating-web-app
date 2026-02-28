import apiClient from '@/utils/axios';
import { User } from '@/types';

export const authService = {
    login: async (email: string, password: string) => {
        // FastAPI OAuth form-urlencoded
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        const { data } = await apiClient.post<{ access_token: string, refresh_token: string }>('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return data;
    },

    register: async (email: string, password: string) => {
        const { data } = await apiClient.post<User>('/auth/register', { email, password });
        return data;
    },

    googleCallback: async (accessToken: string) => {
        const { data } = await apiClient.post<{ access_token: string, refresh_token: string }>('/auth/google/callback', {
            access_token: accessToken
        });
        return data;
    }
};
