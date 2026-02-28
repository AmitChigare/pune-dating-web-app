"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth';
import { userService } from '@/services/users';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
    useAuth(false);
    const router = useRouter();
    const setAuth = useAuthStore(state => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const requestAndUpdateLocation = () => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await userService.updateProfile({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                } catch (locationErr) {
                    console.error('Failed to update location on login', locationErr);
                }
            },
            (geoError) => {
                console.warn('Could not get location on login', geoError);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { access_token, refresh_token } = await authService.login(email, password);
            // Temporarily set token in stateless store to fetch me
            useAuthStore.setState({ token: access_token, refreshToken: refresh_token });
            const user = await userService.getMe();
            setAuth(access_token, refresh_token, user);

            try {
                const profile = await userService.getProfile();
                useAuthStore.getState().setProfile(profile);
                router.push('/discover');
            } catch (profileErr) {
                // Determine if onboarding is needed (no profile)
                router.push('/onboarding');
            }

            // After routing, attempt to refresh the user's location in the background
            requestAndUpdateLocation();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
            useAuthStore.setState({ token: null });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-serif font-bold text-accent">Pune Dating.</h1>
                    <p className="mt-2 text-gray-500">Welcome back. Ready for a cutting chai?</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 mt-8">
                    <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    {error && <p className="text-error text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    New to the city?{' '}
                    <Link href="/register" className="text-accent font-medium underline hover:no-underline">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
