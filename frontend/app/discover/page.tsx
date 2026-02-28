"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NavBar } from '@/components/NavBar';
import { ProfileCard } from '@/components/ProfileCard';
import { userService } from '@/services/users';
import { matchService } from '@/services/matches';
import { Profile } from '@/types';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/Button';

export default function DiscoverPage() {
    useAuth(true);

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Location State
    const [locationError, setLocationError] = useState('');
    const [isLocating, setIsLocating] = useState(true);

    // Filters State
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(100);

    const fetchProfiles = async () => {
        setIsLoading(true);
        try {
            const data = await userService.discover({ min_age: minAge, max_age: maxAge });
            setProfiles(data);
            setCurrentIndex(0);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsLocating(false);
        }
    };

    const requestLocationAndFetch = () => {
        setIsLocating(true);
        setLocationError('');

        if (typeof window === 'undefined' || !navigator.geolocation) {
            setLocationError("Location access is required but your browser doesn't support it.");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Update user's profile with their latest location so backend can sort
                    await userService.updateProfile({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });

                    // Now fetch profiles (backend read from db user's latitude)
                    await fetchProfiles();
                } catch (updateErr) {
                    console.error("Failed to update profile location", updateErr);
                    // Still attempt to get profiles
                    await fetchProfiles();
                }
            },
            (geoError) => {
                setIsLocating(false);
                if (geoError.code === geoError.PERMISSION_DENIED) {
                    setLocationError("Please allow location access to discover local singles.");
                } else {
                    setLocationError("Could not get your location. Please check your device settings.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    useEffect(() => {
        requestLocationAndFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [minAge, maxAge]);

    const currentProfile = profiles[currentIndex];

    const handleNext = () => {
        setCurrentIndex(prev => prev + 1);
    };

    const handleLike = async () => {
        if (!currentProfile) return;
        try {
            const result = await matchService.likeUser(currentProfile.user_id, false);
            if (result.match) {
                alert("It's a Match!");
            }
            handleNext();
        } catch (err) {
            alert("Failed to like");
        }
    };

    const handleSuperLike = async () => {
        if (!currentProfile) return;
        try {
            const result = await matchService.likeUser(currentProfile.user_id, true);
            if (result.match) {
                alert("It's a Super Match!");
            }
            handleNext();
        } catch (err) {
            alert("Failed to super like");
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col pt-4">
            <div className="max-w-md mx-auto w-full px-4 flex justify-between items-center mb-4">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-accent">Discover Pune</h1>
                <button onClick={() => setShowFilters(!showFilters)} className="p-2 bg-red-50 text-accent rounded-full hover:bg-red-100 transition shadow-sm">
                    <SlidersHorizontal size={20} />
                </button>
            </div>

            {showFilters && !locationError && (
                <div className="max-w-md mx-auto w-full px-4 mb-4 p-4 bg-white rounded-xl card-shadow animate-in slide-in-from-top-2">
                    <h3 className="font-semibold mb-2">Filters</h3>
                    <div className="flex gap-4 items-center">
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-500">Min Age</label>
                            <input type="number" value={minAge} onChange={e => setMinAge(Number(e.target.value))} className="border rounded p-1 w-16" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-500">Max Age</label>
                            <input type="number" value={maxAge} onChange={e => setMaxAge(Number(e.target.value))} className="border rounded p-1 w-16" />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                {isLocating ? (
                    <div className="text-center space-y-4 animate-pulse">
                        <div className="w-16 h-16 bg-accent/20 rounded-full mx-auto flex items-center justify-center">
                            <div className="w-8 h-8 bg-accent rounded-full animate-ping"></div>
                        </div>
                        <p className="text-gray-500 font-medium">Locating highly compatible singles near you...</p>
                    </div>
                ) : locationError ? (
                    <div className="text-center space-y-6 max-w-sm mx-auto p-8 border border-red-100 bg-red-50 rounded-2xl">
                        <h2 className="text-2xl font-serif text-red-600 font-bold">Location Required</h2>
                        <p className="text-gray-700 font-medium">We keep it local. To find real singles near you, we need to know you are in Pune.</p>
                        <Button className="w-full bg-red-600 hover:bg-red-700 shadow-sm" onClick={requestLocationAndFetch}>
                            Retry Location Access
                        </Button>
                    </div>
                ) : isLoading ? (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-80 h-[500px] bg-gray-200 rounded-2xl"></div>
                    </div>
                ) : currentProfile ? (
                    <ProfileCard
                        profile={currentProfile}
                        onLike={handleLike}
                        onPass={handleNext}
                        onSuperLike={handleSuperLike}
                    />
                ) : (
                    <div className="text-center space-y-6 max-w-sm mx-auto p-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">☕</span>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-gray-800">That's everyone!</h3>
                        <p className="text-gray-500 text-lg">You've seen all the singles matching your filters right now. Take a break, grab a coffee, and check back later.</p>
                        <Button variant="outline" className="px-8 border-gray-300 text-gray-600" onClick={fetchProfiles}>Refresh</Button>
                    </div>
                )}
            </div>

            <NavBar />
        </div>
    );
}
