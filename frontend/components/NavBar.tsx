"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Heart, Settings, ShieldAlert, BookOpen, Info } from 'lucide-react';
import { cn } from './Button';
import { useAuthStore } from '@/store/useAuthStore';

export function NavBar() {
    const pathname = usePathname();
    const role = useAuthStore(state => state.user?.role);

    const navItems = [
        { href: '/discover', icon: Heart, label: 'Discover' },
        { href: '/matches', icon: User, label: 'Matches' },
        { href: '/blog', icon: BookOpen, label: 'Blog' },
        { href: '/about', icon: Info, label: 'About' },
        { href: '/profile', icon: Settings, label: 'Profile' }
    ];

    if (role === 'admin') {
        navItems.push({ href: '/admin', icon: ShieldAlert, label: 'Admin' });
    }

    return (
        <nav className="fixed bottom-0 w-full bg-white border-t border-border p-2 z-50 md:relative md:border-t-0 md:border-b md:top-0 md:p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
            <div className="max-w-md mx-auto flex justify-between items-center px-2 md:px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href} className="group flex flex-col items-center gap-1">
                            <Icon
                                className={cn(
                                    "w-6 h-6 md:w-8 md:h-8 transition-colors group-hover:text-accent",
                                    isActive ? "text-accent" : "text-gray-400"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={cn("text-[10px] md:hidden font-medium transition-colors", isActive ? "text-accent" : "text-gray-400")}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
