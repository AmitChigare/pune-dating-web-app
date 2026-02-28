import { create } from 'zustand';
import { Match, Message } from '@/types';

interface MatchState {
    matches: Match[];
    setMatches: (matches: Match[]) => void;
    chatMessages: Record<string, Message[]>; // matchId -> Message[]
    setChatMessages: (matchId: string, messages: Message[]) => void;
    addChatMessage: (matchId: string, message: Message) => void;
    unreadMatches: Record<string, boolean>;
    markMatchUnread: (matchId: string, unread: boolean) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
    matches: [],
    setMatches: (matches) => set({ matches }),
    chatMessages: {},
    setChatMessages: (matchId, messages) =>
        set((state) => ({
            chatMessages: {
                ...state.chatMessages,
                [matchId]: messages
            }
        })),
    addChatMessage: (matchId, message) =>
        set((state) => {
            const existing = state.chatMessages[matchId] || [];
            // avoid duplicates
            if (existing.find(m => m.id === message.id)) return state;
            return {
                chatMessages: {
                    ...state.chatMessages,
                    [matchId]: [message, ...existing] // prepend for descending order
                }
            };
        }),
    unreadMatches: {},
    markMatchUnread: (matchId, unread) =>
        set((state) => ({
            unreadMatches: {
                ...state.unreadMatches,
                [matchId]: unread
            }
        })),
}));
