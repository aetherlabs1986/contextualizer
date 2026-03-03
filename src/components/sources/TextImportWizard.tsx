"use client";

import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

export function TextImportWizard() {
    const router = useRouter();
    const { activeProjectId } = useProject();
    const { user } = useAuth();

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
                    user_id: user?.uid
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
        <div className="flex flex-col flex-1 min-h-[500px]">
            {/* Header info */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                        <span className="material-symbols-outlined text-primary">auto_awesome</span>
                        Añadir Conocimiento Directo
                    </h2>
                    <p className="text-sm text-slate-500">Escribe directamente lo que necesites que recuerde de forma conversacional.</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-y-auto p-4 space-y-4 mb-4 shadow-inner min-h-[300px]">
                {messages.map((m, i) => (
                    <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === "user"
                            ? "bg-primary text-white rounded-tr-sm"
                            : "bg-white border border-slate-200 text-slate-800 tracking-wide rounded-tl-sm"
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}

                {saved && (
                    <div className="flex w-full justify-center animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-full text-sm mt-4 font-medium shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
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
                    onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                    placeholder="Ej: 'El cliente XYZ prefiere reuniones por las mañanas...'"
                    className="flex-1 h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm shadow-sm disabled:opacity-50"
                    disabled={isSaving || saved}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isSaving || saved}
                    className="w-12 h-12 shrink-0 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-blue-400 transition-colors disabled:opacity-50 shadow-sm shadow-primary/20"
                >
                    <span className="material-symbols-outlined">send</span>
                </button>
            </div>

            <div className="mt-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 w-2/3 leading-relaxed">
                    <strong className="text-slate-700">Nota:</strong> Los mensajes que envíes aquí se integrarán y analizarán automáticamente como una nueva fuente de conocimiento para el perfil activo.
                </p>
                <button
                    onClick={handleSaveContext}
                    disabled={messages.length === 1 || isSaving || saved}
                    className="h-10 px-6 rounded-lg bg-slate-900 text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">sync</span>
                            Guardando...
                        </>
                    ) : "Concluir y Guardar"}
                </button>
            </div>
        </div>
    );
}
