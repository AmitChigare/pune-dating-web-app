"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function MarketingCTA() {
    const { token } = useAuthStore();
    if (token) {
        return (
            <Link href="/discover" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-accent text-white text-lg font-semibold rounded-full hover:bg-red-600 transition shadow-lg shadow-red-200">
                Go to App <ArrowRight size={20} />
            </Link>
        );
    }
    return (
        <Link href="/register" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-accent text-white text-lg font-semibold rounded-full hover:bg-red-600 transition shadow-lg shadow-red-200">
            Join Pune Singles Now <ArrowRight size={20} />
        </Link>
    );
}
