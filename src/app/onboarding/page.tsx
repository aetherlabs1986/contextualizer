"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        birthDate: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/profile/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push("/");
            } else {
                console.error("Failed to complete onboarding");
            }
        } catch (error) {
            console.error("Error submitting onboarding:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-os-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-os-surface p-10 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome to Contextualizer
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Let's set up your personal AI engine. We need a few details to create your unique profile.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First Name</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last Name</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border"
                            />
                        </div>
                        <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700">Date of Birth</label>
                            <input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                required
                                value={formData.birthDate}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border text-slate-500"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
                        >
                            {isLoading ? "Saving..." : "Create My Engine"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
