"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Link as LinkIcon, MessageSquare, Mic } from "lucide-react";

import { ChatImportWizard } from "@/components/sources/ChatImportWizard";
import { DocumentImportWizard } from "@/components/sources/DocumentImportWizard";
import { LinkImportWizard } from "@/components/sources/LinkImportWizard";
import { AudioImportWizard } from "@/components/sources/AudioImportWizard";
import { TextImportWizard } from "@/components/sources/TextImportWizard";

export default function AddSourcePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"chat" | "document" | "link" | "audio" | "text">("chat");

    const tabs = [
        { id: "chat", label: "Pegar Chat (ChatGPT/Claude...)", icon: MessageSquare },
        { id: "text", label: "Chat de Conocimiento", icon: FileText },
        { id: "document", label: "Subir Documento", icon: FileText },
        { id: "link", label: "Enlace Web", icon: LinkIcon },
        { id: "audio", label: "Nota de Voz / Audio", icon: Mic },
    ] as const;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <button onClick={() => router.push("/sources")} className="text-sm text-muted-foreground hover:text-foreground mb-4">
                    &larr; Volver a Fuentes
                </button>
                <h1 className="text-3xl font-bold tracking-tight">Añadir Fuente de Contexto</h1>
                <p className="text-muted-foreground mt-1">Añade conocimiento al perfil subiendo, pegando o grabando nueva información.</p>
            </div>

            <div className="flex gap-2 border-b border-border">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 min-h-[400px]">
                {activeTab === "chat" && <ChatImportWizard />}
                {activeTab === "text" && <TextImportWizard />}
                {activeTab === "document" && <DocumentImportWizard />}
                {activeTab === "link" && <LinkImportWizard />}
                {activeTab === "audio" && <AudioImportWizard />}
            </div>
        </div>
    );
}
