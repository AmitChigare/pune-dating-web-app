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

export default function RegisterPage() {
    useAuth(false);
    const router = useRouter();
    const setAuth = useAuthStore(state => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.register(email, password);
            // Auto login after registration
            const { access_token, refresh_token } = await authService.login(email, password);
            useAuthStore.setState({ token: access_token, refreshToken: refresh_token });
            const user = await userService.getMe();
            setAuth(access_token, refresh_token, user);

            router.push('/onboarding');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed');
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
                    <p className="mt-2 text-gray-500">Kasa kay, Pune? Step into a better dating experience.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6 mt-8">
                    <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password (min 8 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />

                    {error && <p className="text-error text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating Profile...' : 'Meet Locals Now'}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    Already a local member?{' '}
                    <Link href="/login" className="text-accent underline hover:no-underline font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
