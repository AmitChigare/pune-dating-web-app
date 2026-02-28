"use client";

import { useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { userService } from '@/services/users';
import Image from 'next/image';
import { Settings as SettingsIcon, LogOut, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/utils/imageUrl';

export default function ProfilePage() {
    const { user } = useAuth(true);
    const router = useRouter();
    const { profile, setProfile, logout } = useAuthStore();

    const [isEditing, setIsEditing] = useState(false);

    // Editable state
    const [firstName, setFirstName] = useState(profile?.first_name || '');
    const [lastName, setLastName] = useState(profile?.last_name || '');
    const [gender, setGender] = useState(profile?.gender || 'Men');
    const [interestedIn, setInterestedIn] = useState(profile?.interested_in || 'Women');
    const [bio, setBio] = useState(profile?.bio || '');

    const primaryPhoto = profile?.photos?.find(p => p.is_primary)?.url || profile?.photos?.[0]?.url || 'https://via.placeholder.com/150';

    const handleSave = async () => {
        try {
            const updated = await userService.updateProfile({
                first_name: firstName,
                last_name: lastName,
                gender,
                interested_in: interestedIn,
                bio
            });
            setProfile(updated);
            setIsEditing(false);
        } catch (err) {
            alert("Failed to update profile");
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !profile) return;
        try {
            const file = e.target.files[0];
            const newPhoto = await userService.uploadPhoto(file, false);
            if (profile) {
                setProfile({
                    ...profile,
                    photos: [...(profile.photos || []), newPhoto]
                });
            }
        } catch {
            alert("Upload failed. Make sure it is a valid image type.");
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        if ((profile?.photos || []).length <= 1) {
            alert("You must have at least one photo.");
            return;
        }
        try {
            await userService.deletePhoto(photoId);
            if (profile) {
                setProfile({
                    ...profile,
                    photos: profile.photos!.filter(p => typeof p !== 'string' && p.id !== photoId)
                });
            }
        } catch {
            alert("Delete failed");
        }
    };

    const handleLogout = () => {
        if (!confirm("Are you sure you want to log out?")) return;
        logout();
        router.push('/login');
    };

    if (!profile) return <div className="text-center mt-20">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-8 flex flex-col">
            <div className="max-w-md mx-auto w-full px-4 mb-6 flex justify-between items-center">
                <h1 className="text-4xl font-serif font-bold text-accent">Profile</h1>
                <Link href="/settings" className="p-2 bg-white rounded-full card-shadow hover:scale-105 transition">
                    <SettingsIcon size={20} className="text-gray-600" />
                </Link>
            </div>

            <div className="flex-1 max-w-md mx-auto w-full px-4 space-y-6">
                <div className="bg-white rounded-3xl p-6 card-shadow flex flex-col items-center relative overflow-hidden mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white card-shadow z-10 shrink-0">
                        <img src={getImageUrl(primaryPhoto)} alt="Profile" className="object-cover w-full h-full" />
                    </div>

                    {isEditing ? (
                        <div className="flex gap-2 mt-4 text-center justify-center">
                            <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className="text-center font-bold text-xl" />
                            <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className="text-center font-bold text-xl" />
                        </div>
                    ) : (
                        <h2 className="text-2xl font-bold mt-4">{profile.first_name} {profile.last_name || ''}</h2>
                    )}

                    {isEditing ? (
                        <div className="flex gap-2 mt-2 justify-center w-full max-w-xs">
                            <select value={gender} onChange={e => setGender(e.target.value)} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-gray-800">
                                <option value="Man">Man</option>
                                <option value="Woman">Woman</option>
                                <option value="Non-binary">Non-binary</option>
                            </select>
                        </div>
                    ) : (
                        <p className="text-gray-500 uppercase text-xs font-semibold tracking-wider mt-1">{profile.gender}</p>
                    )}

                    <div className="w-full mt-6 space-y-4">

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Photo Gallery</span>
                                <span className="text-xs text-gray-400">{profile.photos?.length || 0}/6</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 w-full">
                                {Array.from({ length: 6 }).map((_, i) => {
                                    const photo = profile.photos?.[i];
                                    return (
                                        <div key={i} className="aspect-[3/4] bg-gray-50 rounded-xl relative overflow-hidden card-shadow group border border-gray-100">
                                            {photo ? (
                                                <>
                                                    <img src={getImageUrl(photo.url)} className="w-full h-full object-cover" />
                                                    {(profile.photos || []).length > 1 && (
                                                        <button
                                                            onClick={() => handleDeletePhoto(photo.id)}
                                                            className="absolute bottom-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors text-gray-400 hover:text-accent">
                                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isEditing} />
                                                    <Plus className="mb-1" />
                                                </label>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">Add up to 6 photos. At least 1 is required.</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Interested In</span>
                                {isEditing || <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs text-accent font-semibold"
                                >
                                    Edit
                                </button>}
                            </div>

                            {isEditing ? (
                                <select value={interestedIn} onChange={e => setInterestedIn(e.target.value)} className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-gray-800">
                                    <option value="Women">Women</option>
                                    <option value="Men">Men</option>
                                    <option value="Everyone">Everyone</option>
                                </select>
                            ) : (
                                <p className="text-gray-700">{profile.interested_in}</p>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bio</span>
                            </div>

                            {isEditing ? (
                                <textarea
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-gray-800 h-24 resize-none"
                                />
                            ) : (
                                <p className="text-gray-700">{profile.bio || "Write something about yourself..."}</p>
                            )}
                        </div>

                        {isEditing && (
                            <Button className="w-full" onClick={handleSave}>Save Profile</Button>
                        )}
                    </div>
                </div>

                <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut size={18} className="mr-2" /> Log Out
                </Button>
            </div>

            <NavBar />
        </div>
    );
}
