"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoginPage() {
    const { user, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            // Check if user has completed onboarding by hitting the profile API
            fetch("/api/profile/check-onboarding")
                .then(res => res.json())
                .then(data => {
                    if (data.needsOnboarding) {
                        router.push("/onboarding");
                    } else {
                        router.push("/");
                    }
                })
                .catch(() => router.push("/")); // Fallback to home
        }
    }, [user, router]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-os-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-os-surface p-10 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                        Contextualizer
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to access your personal context engine.
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="group relative flex w-full justify-center py-3 px-4 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            {/* Google Logo SVG */}
                            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </span>
                        {isLoading ? "Signing in..." : "Sign in with Google"}
                    </button>
                </div>
            </div>
        </div>
    );
}
