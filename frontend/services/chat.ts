import apiClient from '@/utils/axios';
import { Message } from '@/types';

export const chatService = {
    getMessages: async (matchId: string, offset: number = 0, limit: number = 50) => {
        const { data } = await apiClient.get<Message[]>(`/chat/${matchId}/messages?limit=${limit}&offset=${offset}`);
        return data;
    }
};
