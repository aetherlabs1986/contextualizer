"use client";

import { useEffect, useState, useRef } from "react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useProject } from "@/contexts/ProjectContext";

export default function ProfessionalCVPage() {
    const { userProfile } = useUserProfile();
    const { activeProjectId } = useProject();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const { auth } = await import("@/lib/firebase");
                const uid = auth.currentUser?.uid || "1";
                const res = await fetch(`/api/profile?user_id=${uid}${activeProjectId ? `&projectId=${activeProjectId}` : ""}`);
                const json = await res.json();
                if (json.snapshot?.profile_json) {
                    setProfileData(JSON.parse(json.snapshot.profile_json));
                }
            } catch (e) {
                console.error("Failed to load profile for CV", e);
            }
            setLoading(false);
        };
        fetchProfileData();
    }, [activeProjectId]);

    const displayName = userProfile.name || "Victor Torres";
    const displayTitle = userProfile.title || "CEO & Founder";
    const displayLocation = userProfile.location || "Madrid, España";

    const identity = profileData?.identity_snapshot || {};
    const strengths = identity.strengths || ["Strategy", "Leadership", "AI Implementation"];
    const tools = identity.tools || ["Next.js", "Firebase", "OpenAI", "Figma"];
    const projects = profileData?.projects || [];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans p-4 sm:p-8 lg:p-12 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1200px] mx-auto relative z-10">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
                            CV del Futuro
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Tu perfil cognitivo transformado en un CV profesional de alto impacto.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all focus:ring-2 focus:ring-blue-500/50 flex items-center gap-2 backdrop-blur-md">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Editar Perfil
                        </button>
                        <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] focus:ring-2 focus:ring-blue-500/50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">ios_share</span>
                            Compartir Link
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-20">
                        <div className="size-12 rounded-2xl bg-blue-500/20 flex items-center justify-center animate-pulse">
                            <span className="material-symbols-outlined text-2xl text-blue-400">sync</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-8 duration-1000 fade-in">

                        {/* LEFT COLUMN: IDENTITY & ABOUT */}
                        <div className="lg:col-span-4 flex flex-col gap-6">

                            {/* Profile Card */}
                            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="size-32 rounded-full overflow-hidden mb-6 border-4 border-white/10 shadow-2xl relative mx-auto lg:mx-0">
                                    {userProfile.avatarUrl ? (
                                        <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-5xl text-slate-500">person</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center lg:text-left relative z-10">
                                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">{displayName}</h2>
                                    <div className="text-blue-400 font-semibold mb-4 tracking-wide uppercase text-sm">
                                        {displayTitle}
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                        {identity.summary || userProfile.bio || "Toda la inteligencia extraída del Context Motor enfocada a resultados profesionales. No hay bio definida."}
                                    </p>
                                    <div className="flex items-center justify-center lg:justify-start gap-4 text-slate-400">
                                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/5">
                                            <span className="material-symbols-outlined text-[14px] text-blue-400">location_on</span>
                                            {displayLocation}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/5">
                                            <span className="material-symbols-outlined text-[14px] text-purple-400">language</span>
                                            English, Español
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Tag Cloud */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                                    Superpoderes
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {strengths.map((s: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Tech Stack */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">terminal</span>
                                    Stack & Tools
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {tools.map((t: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-slate-800 border border-white/5 text-slate-300 rounded-lg text-xs font-medium">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: EXP & PROJECTS */}
                        <div className="lg:col-span-8 flex flex-col gap-6">

                            {/* Work Experience */}
                            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-3 text-white">
                                        <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">work</span>
                                        </span>
                                        Logros y Experiencia
                                    </h3>
                                    <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                        Añadir Experiencia <span className="material-symbols-outlined text-[14px]">add</span>
                                    </button>
                                </div>

                                <div className="relative border-l border-white/10 ml-4 space-y-8 pl-8 pb-4">
                                    <div className="relative">
                                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[38px] top-1.5 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                            <h4 className="text-lg font-bold text-white">Founder & CEO</h4>
                                            <span className="text-slate-500 text-xs font-medium bg-white/5 px-2.5 py-1 rounded-md">2023 - Presente</span>
                                        </div>
                                        <h5 className="text-blue-400 text-sm font-semibold mb-3">Contextualizer AI</h5>
                                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                            Desarrollo de una plataforma revolucionaria de "Context AI Motor" para captar el cerebro de profesionales. Implementación de una arquitectura híbrida de vectores y grafos.
                                        </p>
                                        <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                                            <p className="text-xs text-emerald-400 font-medium flex items-start gap-2">
                                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                                Bootstrapped to $10k MRR in 3 months. Scaled team to 5 engineers.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute w-3 h-3 bg-slate-600 rounded-full -left-[38px] top-1.5" />
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                            <h4 className="text-lg font-bold text-slate-300">Lead Product Manager</h4>
                                            <span className="text-slate-500 text-xs font-medium bg-white/5 px-2.5 py-1 rounded-md">2020 - 2023</span>
                                        </div>
                                        <h5 className="text-slate-400 text-sm font-semibold mb-3">TechNova Corp</h5>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            Lideré el desarrollo de la división B2B SaaS, incrementando la retención de usuarios en un 40% a través de un rediseño completo de la experiencia.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Active Projects (Pulled from Internal Context) */}
                            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-3 text-white">
                                        <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">rocket_launch</span>
                                        </span>
                                        Proyectos en Curso
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-500 bg-white/5 px-2 py-1 rounded-md">Real-Time Sync</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {projects.slice(0, 4)?.map((p: any, i: number) => (
                                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all group">
                                            <h4 className="text-white font-bold mb-2 group-hover:text-purple-400 transition-colors">{p.name}</h4>
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                                                {p.current_focus || p.goals?.[0] || "Proyecto estratégico en curso."}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">Activo</span>
                                                </div>
                                                <button className="text-[10px] font-semibold text-slate-400 group-hover:text-white transition-colors flex items-center gap-1">
                                                    Ver detalles <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!projects || projects.length === 0) && (
                                        <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                                            No hay proyectos activos detectados en tu motor de contexto.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
