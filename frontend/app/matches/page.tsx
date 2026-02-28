"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NavBar } from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { matchService } from '@/services/matches';
import { Match } from '@/types';
import { useMatchStore } from '@/store/useMatchStore';
import Image from 'next/image';

export default function MatchesPage() {
    const { user } = useAuth(true);
    const { matches, setMatches, unreadMatches } = useMatchStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await matchService.getMatches();
                setMatches(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMatches();
    }, [setMatches]);

    return (
        <div className="min-h-screen bg-background pb-20 flex flex-col pt-8">
            <div className="max-w-md mx-auto w-full px-4 mb-6">
                <h1 className="text-4xl font-serif font-bold tracking-tight text-accent">Matches</h1>
                <p className="text-gray-500 mt-2">Pune locals who liked your profile.</p>
            </div>

            <div className="flex-1 max-w-md mx-auto w-full px-4 overflow-y-auto space-y-4">
                {isLoading ? (
                    <p className="text-center text-gray-500 mt-10">Loading matches...</p>
                ) : matches.length === 0 ? (
                    <div className="text-center mt-20 p-8 border-2 border-dashed border-border rounded-xl">
                        <p className="text-lg text-gray-600 font-serif">It's a little quiet here.</p>
                        <p className="text-sm text-gray-500 mt-2 px-4">Take your time. Keep exploring profiles and you'll find the right person to grab that Koregaon Park coffee with.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {matches.map(match => {
                            // Real app would populate peer_profile from backend
                            // We'll show placeholders since match payload might miss nested details depending on ORM joining
                            const peerName = match.peer_profile?.first_name || 'Match User';
                            const photo = match.peer_profile?.photos?.[0]?.url || 'https://via.placeholder.com/150';
                            const isUnread = unreadMatches[match.id];

                            return (
                                <Link key={match.id} href={`/chat/${match.id}`} className="block group">
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden card-shadow">
                                        <Image src={photo} alt={peerName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 pb-4">
                                            <span className="text-white font-medium block truncate flex items-center justify-between">
                                                {peerName}
                                                {isUnread && <span className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <NavBar />
        </div>
    );
}
