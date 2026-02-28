import apiClient from '@/utils/axios';
import { User, Profile, Photo } from '@/types';

export const userService = {
    getMe: async () => {
        const { data } = await apiClient.get<User>('/users/me');
        return data;
    },

    getProfile: async () => {
        const { data } = await apiClient.get<Profile>('/users/me/profile');
        return data;
    },

    createProfile: async (profile: Partial<Profile>) => {
        const { data } = await apiClient.post<Profile>('/users/me/profile', profile);
        return data;
    },

    updateProfile: async (profile: Partial<Profile>) => {
        const { data } = await apiClient.put<Profile>('/users/me/profile', profile);
        return data;
    },

    updateAccount: async (account: { email?: string }) => {
        const { data } = await apiClient.put<User>('/users/me/account', account);
        return data;
    },

    deactivateAccount: async () => {
        const { data } = await apiClient.delete<User>('/users/me/deactivate');
        return data;
    },

    uploadPhoto: async (file: File, isPrimary: boolean = false) => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await apiClient.post<Photo>(`/photos/?is_primary=${isPrimary}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    },

    deletePhoto: async (photoId: string) => {
        const { data } = await apiClient.delete(`/photos/${photoId}`);
        return data;
    },

    discover: async (params?: { latitude?: number, longitude?: number, min_age?: number, max_age?: number }) => {
        const { data } = await apiClient.get<Profile[]>('/users/discover', { params });
        return data;
    }
};
