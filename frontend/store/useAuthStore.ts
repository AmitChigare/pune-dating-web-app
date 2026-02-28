import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Profile } from '@/types';

interface AuthState {
    token: string | null;
    user: User | null;
    profile: Profile | null;
    isAuthenticated: boolean;
    setAuth: (token: string, user: User) => void;
    setProfile: (profile: Profile) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            profile: null,
            isAuthenticated: false,
            setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
            setProfile: (profile) => set({ profile }),
            logout: () => set({ token: null, user: null, profile: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
