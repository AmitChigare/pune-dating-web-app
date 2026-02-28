"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MarketingHeaderProps {
    redirectIfAuth?: boolean;
}

export function MarketingHeader({ redirectIfAuth = false }: MarketingHeaderProps) {
    const { token } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
            router.push('/auth/callback' + window.location.hash);
            return;
        }

        if (redirectIfAuth && token) {
            router.push('/discover');
        }
    }, [token, redirectIfAuth, router]);

    return (
        <header className="fixed w-full top-0 bg-white/90 backdrop-blur-md z-[60] border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-serif text-accent font-bold tracking-tight">Pune Dating</Link>
                <div className="flex gap-4 items-center">
                    {token ? (
                        <>
                            <Link href="/discover" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-accent transition">App</Link>
                            <Link href="/blog" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-accent transition hidden sm:inline-block">Blog</Link>
                            <Link href="/about" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-accent transition hidden sm:inline-block">About</Link>
                            <Link href="/profile" className="px-4 py-2 text-sm font-medium bg-red-50 text-accent rounded-full hover:bg-red-100 transition shadow-sm">My Profile</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/blog" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-accent transition hidden sm:inline-block">Blog</Link>
                            <Link href="/about" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-accent transition hidden sm:inline-block">About</Link>
                            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-accent transition">Log In</Link>
                            <Link href="/register" className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-full hover:bg-red-600 transition shadow-sm">Join Now</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
