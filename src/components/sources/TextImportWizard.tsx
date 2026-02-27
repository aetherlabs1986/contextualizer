"use client";

import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

export function TextImportWizard() {
    const router = useRouter();
    const { activeProjectId, projects } = useProject();

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "¡Hola! Cuéntame qué nuevo contexto quieres añadir al motor. Puede ser una idea, resumen de una reunión, o cualquier información clave que deba recordar."
        }
    ]);
    const [input, setInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages: ChatMessage[] = [
            ...messages,
            { role: "user", content: input }
        ];

        setMessages(newMessages);
        setInput("");

        // Simple mock response to acknowledge context is being built
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "¡Entendido! Lo he apuntado. ¿Quieres añadir algún detalle adicional sobre esto, o lo guardamos ya como una fuente de conocimiento?" }
            ]);
        }, 1000);
    };

    const handleSaveContext = async () => {
        setIsSaving(true);

        // Extract all user messages to save them as context
        const userContext = messages
            .filter(m => m.role === "user")
            .map(m => m.content)
            .join("\n\n");

        if (!userContext) {
            setIsSaving(false);
            return;
        }

        try {
            const tempTitle = userContext.split(" ").slice(0, 5).join(" ") + "...";
            const res = await fetch("/api/sources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source_type: "document", // Saves standard text/context
                    title: `Apunte: ${tempTitle}`,
                    project_id: activeProjectId || null,
                    importance: "normal",
                    extracted_text: userContext,
                    raw_text: userContext,
                })
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => router.push("/sources"), 1500);
            } else {
                alert("Failed to save context source");
            }
        } catch (e) {
            console.error(e);
            alert("Error creating source");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px]">
            {/* Header info */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Añadir Conocimiento Directo</h2>
                    <p className="text-sm text-muted-foreground">Escribe directamente lo que necesites que recuerde de forma conversacional.</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-input/50 rounded-xl border border-border overflow-y-auto p-4 space-y-4 mb-4">
                {messages.map((m, i) => (
                    <div key={i} className={clsx("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={clsx("max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                            m.role === "user"
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-card border border-border text-foreground tracking-wide rounded-tl-sm")}>
                            {m.content}
                        </div>
                    </div>
                ))}

                {saved && (
                    <div className="flex w-full justify-center">
                        <div className="flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-full text-sm mt-4">
                            <CheckCircle2 className="w-4 h-4" />
                            ¡Contexto integrado con éxito a tu motor!
                        </div>
                    </div>
                )}
            </div>

            {/* Input & Save Area */}
            <div className="flex gap-2 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ej: 'El cliente XYZ prefiere reuniones por las mañanas...'"
                    className="flex-1 input-field"
                    disabled={isSaving || saved}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isSaving || saved}
                    className="w-10 h-10 shrink-0 bg-primary text-primary-foreground rounded-md flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>

            <div className="mt-4 flex justify-between items-center">
                <p className="text-xs text-muted-foreground w-2/3">
                    Nota: Los mensajes que envíes aquí se integrarán y analizarán automáticamente como una nueva fuente de conocimiento para el perfil activo.
                </p>
                <button
                    onClick={handleSaveContext}
                    disabled={messages.length === 1 || isSaving || saved}
                    className="btn-primary"
                >
                    {isSaving ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</span>
                    ) : "Concluir y Guardar"}
                </button>
            </div>
        </div>
    );
}
