"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { authService } from '@/services/auth';
import { userService } from '@/services/users';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthCallback() {
    const router = useRouter();
    const setAuth = useAuthStore(state => state.setAuth);
    const [status, setStatus] = useState("Authenticating with Google...");

    useEffect(() => {
        const processOAuthCallback = async () => {
            try {
                // Supabase extracts the fragment (#access_token=...) from the URL 
                // and sets the session securely in local storage automatically.
                const { data, error } = await supabase.auth.getSession();

                if (error || !data.session) {
                    console.error("No session found in callback", error);
                    setStatus("Authentication failed. Redirecting...");
                    setTimeout(() => router.push('/login'), 2000);
                    return;
                }

                setStatus("Connecting to Pune Dating...");
                const supaAccessToken = data.session.access_token;

                // Send the Supabase JWT securely to our backend to map to a real User
                const { access_token, refresh_token } = await authService.googleCallback(supaAccessToken);

                // Keep the tokens in zustand to do the immediate `getMe()` lookup
                useAuthStore.setState({ token: access_token, refreshToken: refresh_token });

                const user = await userService.getMe();
                setAuth(access_token, refresh_token, user);

                // See if user needs onboarding
                try {
                    const profile = await userService.getProfile();
                    useAuthStore.getState().setProfile(profile);
                    setStatus("Success! Taking you to the app...");
                    router.push('/discover');
                } catch (profileErr) {
                    // 404 No profile found => New user needs location + bio
                    setStatus("Almost there! Ready for your profile...");
                    router.push('/onboarding');
                }
            } catch (err: any) {
                console.error('Error during Google OAuth backend handoff', err);
                const serverMsg = err.response?.data?.detail || err.message || "Unknown server error";
                setStatus(`Handoff failed: ${serverMsg}. Please try again.`);
                setTimeout(() => router.push('/login'), 5000);
            }
        };

        processOAuthCallback();
    }, [router, setAuth]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-lg font-medium text-gray-700">{status}</p>
            </div>
        </div>
    );
}
