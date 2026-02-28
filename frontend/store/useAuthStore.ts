import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Profile } from '@/types';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
    profile: Profile | null;
    isAuthenticated: boolean;
    setAuth: (token: string, refreshToken: string, user: User) => void;
    setTokens: (token: string, refreshToken: string) => void;
    setProfile: (profile: Profile) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            refreshToken: null,
            user: null,
            profile: null,
            isAuthenticated: false,
            setAuth: (token, refreshToken, user) => set({ token, refreshToken, user, isAuthenticated: true }),
            setTokens: (token, refreshToken) => set({ token, refreshToken }),
            setProfile: (profile) => set({ profile }),
            logout: () => set({ token: null, refreshToken: null, user: null, profile: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
