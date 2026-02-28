import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

// We implement useAuth hook for routing protection seamlessly on frontend
export function useAuth(requireAuth = true, adminOnly = false) {
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Client-side guard
        if (requireAuth && !isAuthenticated) {
            if (pathname !== '/login' && pathname !== '/register') {
                router.push('/login');
            }
        } else if (!requireAuth && isAuthenticated) {
            if (pathname === '/login' || pathname === '/register') {
                router.push('/discover');
            }
        }

        if (adminOnly && user?.role !== 'admin') {
            router.push('/discover');
        }

        // Auto-fetch profile if authenticated but profile is missing
        const { profile, setProfile } = useAuthStore.getState();
        if (isAuthenticated && !profile) {
            import('@/services/users').then(({ userService }) => {
                userService.getProfile()
                    .then(prof => setProfile(prof))
                    .catch(() => {
                        if (pathname !== '/onboarding') {
                            router.push('/onboarding');
                        }
                    });
            });
        }

    }, [isAuthenticated, user, requireAuth, adminOnly, router, pathname]);

    return { isAuthenticated, user };
}
