"use client";

import { useProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown, Folder, Languages } from "lucide-react";

export function TopBar() {
    const { activeProjectId, setActiveProjectId, projects } = useProject();
    const { lang, setLang, t } = useLanguage();

    return (
        <div className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <div className="relative group z-50">
                    <button className="flex items-center gap-2 text-sm font-medium bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-md transition-colors border border-border">
                        <Folder className="w-4 h-4 text-muted-foreground" />
                        <span>
                            {activeProjectId === null
                                ? t("topbar.all_projects")
                                : projects.find((p) => p.id === activeProjectId)?.name || "..."}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>

                    <div className="absolute top-full left-0 mt-1 w-56 bg-panel border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <div className="p-1">
                            <button
                                onClick={() => setActiveProjectId(null)}
                                className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-secondary transition-colors"
                            >
                                {t("topbar.all_projects")}
                            </button>
                            {projects.length > 0 && <div className="h-px bg-border my-1 mx-2" />}
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => setActiveProjectId(project.id)}
                                    className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-secondary transition-colors"
                                >
                                    {project.name}
                                </button>
                            ))}
                            <div className="h-px bg-border my-1 mx-2" />
                            <button
                                className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-secondary text-muted-foreground transition-colors"
                                onClick={() => {
                                    alert("Create project coming soon!");
                                }}
                            >
                                {t("topbar.create_project")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 z-50">
                <div className="flex bg-panel border border-border rounded-md overflow-hidden">
                    <button
                        className={`text-xs px-2 py-1 font-semibold ${lang === 'en' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/40'}`}
                        onClick={() => setLang("en")}
                    >
                        EN
                    </button>
                    <button
                        className={`text-xs px-2 py-1 font-semibold border-l border-border ${lang === 'es' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/40'}`}
                        onClick={() => setLang("es")}
                    >
                        ES
                    </button>
                </div>

                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs border border-border">
                    U
                </div>
            </div>
        </div>
    );
}
