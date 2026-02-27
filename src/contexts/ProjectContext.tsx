"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Project = {
    id: string;
    name: string;
};

type ProjectContextType = {
    activeProjectId: string | null; // null means "All Projects" / Global
    setActiveProjectId: (id: string | null) => void;
    projects: Project[];
    refreshProjects: () => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            if (res.ok) {
                const data = await res.json();
                setProjects(data.projects || []);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <ProjectContext.Provider
            value={{
                activeProjectId,
                setActiveProjectId,
                projects,
                refreshProjects: fetchProjects,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
}
