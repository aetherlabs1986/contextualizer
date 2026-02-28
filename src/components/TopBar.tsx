"use client";

import { useProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export function TopBar() {
    const { activeProjectId, setActiveProjectId, projects } = useProject();
    const { lang, setLang, t } = useLanguage();

    return (
        <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-40 border-b border-slate-100">
            <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className="size-9 sm:size-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-white text-xl sm:text-2xl">grid_view</span>
                    </div>
                    <div className="flex-col hidden sm:flex">
                        <h2 className="text-text-main text-base font-bold tracking-tight">CONTEXTUALIZER</h2>
                        <span className="text-xs text-text-secondary font-medium">Workspace</span>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                {/* Project Selector */}
                <div className="hidden md:flex items-center gap-3 relative group cursor-pointer">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hover:border-slate-200 transition-colors">
                        <span className="material-symbols-outlined text-sm text-primary">science</span>
                        <span className="text-xs text-text-main font-medium">
                            {activeProjectId === null
                                ? t("topbar.all_projects")
                                : projects.find((p) => p.id === activeProjectId)?.name || "..."}
                        </span>
                        <span className="material-symbols-outlined text-xs text-slate-400">expand_more</span>
                    </div>

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-soft-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <div className="p-2 space-y-1">
                            <button
                                onClick={() => setActiveProjectId(null)}
                                className="w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-text-main"
                            >
                                <span className="material-symbols-outlined text-sm text-slate-400">language</span>
                                {t("topbar.all_projects")}
                            </button>
                            {projects.length > 0 && <div className="h-px bg-slate-100 my-1 mx-2" />}
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => setActiveProjectId(project.id)}
                                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-text-main"
                                >
                                    <span className="material-symbols-outlined text-sm text-emerald-500">rocket_launch</span>
                                    {project.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-4 border-l border-slate-100">
                    {/* Language Switch */}
                    <div className="flex items-center bg-slate-50 rounded-full p-0.5 border border-slate-100">
                        <button
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-colors ${lang === 'en' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setLang("en")}
                        >
                            EN
                        </button>
                        <button
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-colors ${lang === 'es' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setLang("es")}
                        >
                            ES
                        </button>
                    </div>

                    <button className="relative p-1.5 rounded-full hover:bg-slate-50 transition-colors hidden sm:flex">
                        <span className="material-symbols-outlined text-slate-500 text-xl">notifications_none</span>
                        <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="relative cursor-pointer">
                        <div className="size-8 sm:size-9 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500 text-lg">person</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
