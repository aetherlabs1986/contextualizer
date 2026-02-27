"use client";

import { useProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export function TopBar() {
    const { activeProjectId, setActiveProjectId, projects } = useProject();
    const { lang, setLang, t } = useLanguage();

    return (
        <header className="h-16 border-b border-white/[0.03] bg-os-bg/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50 w-full">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 group cursor-pointer lg:-ml-4">
                    <div className="size-8 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 blur-md rounded-full group-hover:bg-primary/40 transition-all duration-500"></div>
                        <span className="material-symbols-outlined text-3xl text-white relative z-10 group-hover:scale-105 transition-transform">deployed_code</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-white text-sm font-semibold tracking-[0.2em] uppercase opacity-90 hidden sm:block">Contextualizer</h2>
                        <span className="text-[10px] text-primary tracking-wider uppercase font-medium opacity-80 hidden sm:block">Cognitive OS v2.4</span>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-8">
                <div className="hidden md:flex items-center gap-4 group relative cursor-pointer">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] hover:border-primary/30 transition-colors">
                        <span className="material-symbols-outlined text-sm text-primary group-hover:animate-pulse">science</span>
                        <span className="text-xs text-slate-300 font-medium tracking-wide">
                            {activeProjectId === null
                                ? t("topbar.all_projects")
                                : projects.find((p) => p.id === activeProjectId)?.name || "..."}
                        </span>
                        <span className="material-symbols-outlined text-xs text-slate-500">expand_more</span>
                    </div>

                    {/* Project Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-56 bg-panel border border-glass-border rounded-xl shadow-glass-depth opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <div className="p-2 space-y-1">
                            <button
                                onClick={() => setActiveProjectId(null)}
                                className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm opacity-50">language</span>
                                {t("topbar.all_projects")}
                            </button>
                            {projects.length > 0 && <div className="h-px bg-white/5 my-1 mx-2" />}
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => setActiveProjectId(project.id)}
                                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm opacity-50 text-emerald-400">rocket_launch</span>
                                    {project.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-tight">
                        <span>SYNCED</span>
                        <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                    </div>
                </div>

                <div className="flex items-center gap-5 pl-5 border-l border-white/[0.05]">
                    {/* Language Switch */}
                    <div className="flex items-center bg-white/[0.03] rounded-full p-0.5 border border-white/[0.05]">
                        <button
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-colors ${lang === 'en' ? 'bg-primary/20 text-primary glow' : 'text-slate-500 hover:text-slate-300'}`}
                            onClick={() => setLang("en")}
                        >
                            EN
                        </button>
                        <button
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-colors ${lang === 'es' ? 'bg-primary/20 text-primary glow' : 'text-slate-500 hover:text-slate-300'}`}
                            onClick={() => setLang("es")}
                        >
                            ES
                        </button>
                    </div>

                    <button className="text-slate-400 hover:text-white transition-colors relative hidden sm:block">
                        <span className="material-symbols-outlined font-light text-[22px]">notifications</span>
                        <span className="absolute top-0 right-0 size-1.5 bg-accent-cyan rounded-full shadow-[0_0_6px_#22d3ee]"></span>
                    </button>

                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent-purple rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative size-8 rounded-full overflow-hidden border border-white/10 ring-1 ring-white/5 bg-os-bg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white/80">person</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
