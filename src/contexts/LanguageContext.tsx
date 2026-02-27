"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "es";

type Translations = {
    [key in Language]: Record<string, string>;
};

const translations: Translations = {
    en: {
        "nav.dashboard": "My Profile",
        "nav.sources": "Sources",
        "nav.packs": "Context Packs",
        "nav.chat": "Memory Chat",
        "nav.settings": "Settings",
        "sidebar.subtitle": "Personal Context Engine",
        "sidebar.status": "Status: Online",

        "topbar.all_projects": "All Projects (Global)",
        "topbar.create_project": "+ Create new project",

        "dashboard.title": "Global Profile & Dashboard",
        "dashboard.subtitle": "Your complete strategic overview, personality, active projects and context updates.",
        "dashboard.profile_updated": "Profile updated",
        "dashboard.last_source": "Last source ingested",
        "dashboard.identity": "Identity Snapshot & Personality",
        "dashboard.active_projects": "Active Projects",
        "dashboard.no_projects": "No active projects.",
        "dashboard.recent_decisions": "Recent Learnings & Achievements",
        "dashboard.no_decisions": "No recent updates.",
        "dashboard.leads": "Leads Pipeline",
        "dashboard.no_leads": "No leads detected.",

        // Add more as needed
    },
    es: {
        "nav.dashboard": "Mi Perfil",
        "nav.sources": "Fuentes",
        "nav.packs": "Packs de Contexto",
        "nav.chat": "Chat de Memoria",
        "nav.settings": "Configuración",
        "sidebar.subtitle": "Motor de Contexto Personal",
        "sidebar.status": "Estado: En línea",

        "topbar.all_projects": "Todos los Proyectos (Global)",
        "topbar.create_project": "+ Crear nuevo proyecto",

        "dashboard.title": "Perfil Global y Panel",
        "dashboard.subtitle": "Tu visión estratégica completa, personalidad, proyectos activos y contexto reciente.",
        "dashboard.profile_updated": "Contexto actualizado",
        "dashboard.last_source": "Última fuente",
        "dashboard.identity": "Identidad y Personalidad",
        "dashboard.active_projects": "Proyectos Activos",
        "dashboard.no_projects": "No hay proyectos activos.",
        "dashboard.recent_decisions": "Logros y Aprendizajes Recientes",
        "dashboard.no_decisions": "No hay actualizaciones recientes.",
        "dashboard.leads": "Pipeline de Leads",
        "dashboard.no_leads": "No se detectaron leads.",
    }
};

type LanguageContextType = {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>("en");

    useEffect(() => {
        const saved = localStorage.getItem("contextualizer_lang");
        if (saved === "es" || saved === "en") {
            setLang(saved);
        }
    }, []);

    const handleSetLang = (newLang: Language) => {
        setLang(newLang);
        localStorage.setItem("contextualizer_lang", newLang);
    };

    const t = (key: string): string => {
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
