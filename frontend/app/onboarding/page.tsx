"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/users';
import { useAuthStore } from '@/store/useAuthStore';

export default function OnboardingPage() {
    useAuth(true); // Must be logged in
    const router = useRouter();
    const setProfile = useAuthStore(state => state.setProfile);

    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [isLocating, setIsLocating] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [interestedIn, setInterestedIn] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);

    const handleNext = () => setStep(prev => prev + 1);

    const handleVerifyLocation = () => {
        setLocationError('');
        setError('');

        if (typeof window === 'undefined' || !navigator.geolocation) {
            setLocationError("Location access is required but your browser doesn't support it.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                handleSubmit(latitude, longitude);
            },
            (geoError) => {
                setIsLocating(false);
                if (geoError.code === geoError.PERMISSION_DENIED) {
                    setLocationError("Please allow location access to use Pune Dating.");
                } else {
                    setLocationError("Could not get your location. Please try again.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const handleSubmit = async (latitude: number, longitude: number) => {
        try {
            setError('');
            const profile = await userService.createProfile({
                first_name: firstName,
                birth_date: birthDate,
                gender,
                interested_in: interestedIn,
                latitude,
                longitude
            });

            if (photo) {
                await userService.uploadPhoto(photo, true);
            }

            setProfile(profile);
            router.push('/discover');
        } catch (err: any) {
            setError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || 'Failed to create profile');
        } finally {
            setIsLocating(false);
        }
    };

    return (
        <div className="min-h-screen max-w-md mx-auto flex flex-col px-6 py-12 bg-background">
            <div className="flex-1 flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {step === 1 && (
                    <>
                        <h1 className="text-4xl font-serif text-accent">What's your first name?</h1>
                        <Input
                            autoFocus
                            placeholder="First Name"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                        />
                        <Button className="mt-8" onClick={handleNext} disabled={!firstName}>Next</Button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h1 className="text-4xl font-serif text-accent">When is your birthday?</h1>
                        <Input
                            type="date"
                            autoFocus
                            value={birthDate}
                            onChange={e => setBirthDate(e.target.value)}
                        />
                        <Button className="mt-8" onClick={handleNext} disabled={!birthDate}>Next</Button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h1 className="text-4xl font-serif text-accent mb-2">I identify as...</h1>
                        <p className="text-gray-500 mb-6">Let's build your Pune profile.</p>
                        <div className="space-y-4">
                            {['Man', 'Woman', 'Non-binary'].map(g => (
                                <Button
                                    key={g}
                                    variant={gender === g ? 'primary' : 'outline'}
                                    className="w-full justify-start text-lg py-6"
                                    onClick={() => setGender(g)}
                                >
                                    {g}
                                </Button>
                            ))}
                        </div>
                        <Button className="mt-8 py-6 text-lg" onClick={handleNext} disabled={!gender}>Next</Button>
                    </>
                )}

                {step === 4 && (
                    <>
                        <h1 className="text-4xl font-serif text-accent">I'm interested in...</h1>
                        <div className="space-y-4">
                            {['Men', 'Women', 'Everyone'].map(i => (
                                <Button
                                    key={i}
                                    variant={interestedIn === i ? 'primary' : 'outline'}
                                    className="w-full justify-start"
                                    onClick={() => setInterestedIn(i)}
                                >
                                    {i}
                                </Button>
                            ))}
                        </div>
                        <Button className="mt-8" onClick={handleNext} disabled={!interestedIn}>Next</Button>
                    </>
                )}

                {step === 5 && (
                    <>
                        <h1 className="text-4xl font-serif text-accent mb-2">Add a photo</h1>
                        <p className="text-gray-500">Show off your best self. Looking great!</p>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={e => setPhoto(e.target.files?.[0] || null)}
                            className="py-10 mt-4 cursor-pointer"
                        />
                        <Button className="mt-8 py-6 text-lg" onClick={handleNext} disabled={!photo}>Next</Button>
                    </>
                )}

                {step === 6 && (
                    <>
                        <h1 className="text-4xl font-serif text-accent mb-2">Locating You</h1>
                        <p className="text-gray-500 mt-2 font-medium">We are strictly a local community. To ensure you match with real people nearby, we need to verify you are currently based in Pune, Maharashtra.</p>

                        <div className="mt-8 space-y-4">
                            {locationError && <p className="text-red-600 text-sm p-4 bg-red-50 rounded-xl font-medium border border-red-100 shadow-sm">{locationError}</p>}
                            {error && <p className="text-error mt-4">{error}</p>}
                            <Button className="w-full py-6 text-lg" onClick={handleVerifyLocation} disabled={isLocating}>
                                {isLocating ? 'Verifying location...' : 'Verify I am in Pune'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
