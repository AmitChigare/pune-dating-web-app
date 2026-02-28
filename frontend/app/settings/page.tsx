"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert, Check, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { userService } from '@/services/users';

export default function SettingsPage() {
    const { user } = useAuth(true);
    const router = useRouter();
    const { profile, setProfile, logout } = useAuthStore();

    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) setEmail(user.email);
        if (profile) setPhone(profile.phone_number || '');
    }, [user, profile]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (email !== user?.email) {
                await userService.updateAccount({ email });
            }
            if (phone !== profile?.phone_number) {
                const updatedProfile = await userService.updateProfile({ phone_number: phone });
                setProfile(updatedProfile);
            }
            setIsEditing(false);
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to update account details.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivate = async () => {
        if (!confirm("Are you sure you want to deactivate your account? You will be logged out. To reactivate, simply log in again with the same credentials.")) return;
        try {
            await userService.deactivateAccount();
            logout();
            router.push('/login');
        } catch (err: any) {
            alert("Failed to deactivate account.");
        }
    };

    return (
        <div className="min-h-screen bg-white max-w-md mx-auto relative flex flex-col">
            <div className="flex items-center p-4 border-b border-border">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={24} className="text-accent" />
                </button>
                <h1 className="ml-2 font-semibold text-lg">Settings</h1>
            </div>

            <div className="p-6 space-y-8 flex-1">
                <section>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Settings</h3>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                                <button onClick={handleSave} disabled={isSaving} className="text-accent font-bold flex items-center gap-1">
                                    {isSaving ? '...' : <><Check size={16} /> Save</>}
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-accent">Edit</button>
                        )}
                    </div>

                    <ul className="space-y-4">
                        <li className="flex justify-between items-center text-gray-700">
                            <span>Phone Number</span>
                            {isEditing ? (
                                <Input value={phone} onChange={e => setPhone(e.target.value)} className="w-1/2 h-8 text-right" placeholder="+91" autoComplete="tel" />
                            ) : (
                                <span className={phone ? "text-gray-800" : "text-gray-400"}>{phone || "Not set"}</span>
                            )}
                        </li>
                        <li className="flex justify-between items-center text-gray-700">
                            <span>Email</span>
                            {isEditing ? (
                                <Input value={email} onChange={e => setEmail(e.target.value)} className="w-1/2 h-8 text-right bg-white" type="email" />
                            ) : (
                                <span className="text-gray-800">{email}</span>
                            )}
                        </li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Discovery</h3>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center text-gray-700">Location <span className="text-gray-400 text-sm">Pune, India</span></li>
                        <li className="flex justify-between items-center text-gray-700">Maximum Distance <span className="text-accent font-medium">10km</span></li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Safety & Privacy</h3>
                    <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50 py-6" onClick={handleDeactivate}>
                        <ShieldAlert size={18} className="mr-2" /> Deactivate Account
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-3">Deactivating hides your profile. You can reactivate by logging in.</p>
                </section>
            </div>
        </div>
    );
}
