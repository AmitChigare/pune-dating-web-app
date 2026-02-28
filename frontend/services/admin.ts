import apiClient from '@/utils/axios';
import { Report } from '@/types';

export const adminService = {
    getReports: async (page = 1, size = 50) => {
        const { data } = await apiClient.get<any>('/admin/reports', { params: { page, size } });
        return data;
    },

    takeAction: async (targetUserId: string, actionType: string, reason?: string) => {
        const { data } = await apiClient.post('/admin/action', {
            target_user_id: targetUserId,
            action_type: actionType,
            reason
        });
        return data;
    },

    reportUser: async (reportedId: string, reason: string, details?: string) => {
        const { data } = await apiClient.post<Report>('/admin/report', {
            reported_id: reportedId,
            reason,
            details
        });
        return data;
    },

    blockUser: async (blockedId: string) => {
        const { data } = await apiClient.post('/admin/block', {
            blocked_id: blockedId
        });
        return data;
    },

    getUsers: async (page = 1, size = 50, search = "") => {
        const { data } = await apiClient.get<any>('/admin/users', { params: { page, size, search } });
        return data; // returns paginated response
    },

    getUserDetails: async (userId: string) => {
        const { data } = await apiClient.get<any>(`/admin/users/${userId}`);
        return data; // returns { user, profile }
    },

    getUserActivity: async (userId: string, page = 1, size = 50) => {
        const { data } = await apiClient.get<any>(`/admin/users/${userId}/activity`, { params: { page, size } });
        return data; // returns paginated user activities
    }
};
