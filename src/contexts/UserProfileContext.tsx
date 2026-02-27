"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserProfile {
    name: string;
    title: string;
    location: string;
    age: string;
    email: string;
    bio: string;
    linkedin: string;
    twitter: string;
    website: string;
    avatarUrl: string;
}

const DEFAULT_PROFILE: UserProfile = {
    name: "",
    title: "",
    location: "",
    age: "",
    email: "",
    bio: "",
    linkedin: "",
    twitter: "",
    website: "",
    avatarUrl: "",
};

const STORAGE_KEY = "contextualizer_user_profile";

interface UserProfileContextType {
    userProfile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
    isConfigured: boolean;
}

const UserProfileContext = createContext<UserProfileContextType>({
    userProfile: DEFAULT_PROFILE,
    updateProfile: () => { },
    isConfigured: false,
});

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
    const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setUserProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
            }
            // Migrate old avatar
            const oldAvatar = localStorage.getItem("contextualizer_avatar");
            if (oldAvatar && !JSON.parse(saved || "{}").avatarUrl) {
                setUserProfile(prev => ({ ...prev, avatarUrl: oldAvatar }));
            }
        } catch { }
        setLoaded(true);
    }, []);

    const updateProfile = useCallback((updates: Partial<UserProfile>) => {
        setUserProfile(prev => {
            const next = { ...prev, ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isConfigured = !!(userProfile.name);

    if (!loaded) return null;

    return (
        <UserProfileContext.Provider value={{ userProfile, updateProfile, isConfigured }}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile() {
    return useContext(UserProfileContext);
}
