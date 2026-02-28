import apiClient from '@/utils/axios';
import { Match } from '@/types';

export const matchService = {
    getMatches: async () => {
        const { data } = await apiClient.get<Match[]>('/matches/');
        return data;
    },

    likeUser: async (toUserId: string, isSuperlike: boolean = false) => {
        const { data } = await apiClient.post<{ status: string, match: boolean, match_id: string | null }>('/matches/like', {
            to_user_id: toUserId,
            is_superlike: isSuperlike
        });
        return data;
    }
};
