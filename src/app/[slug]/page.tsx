"use client";

import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";

export default function PublicPackPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const [data, setData] = useState<{ text: string; name?: string; updatedAt?: string; error?: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/public/${slug}`)
            .then(res => res.json())
            .then(res => setData(res))
            .catch(() => setData({ text: "", error: "Failed to load context pack" }));
    }, [slug]);

    const handleCopy = () => {
        if (!data?.text) return;
        navigator.clipboard.writeText(data.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!data) {
        return (
            <div className="min-h-screen bg-[#0a0b0d] text-white flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="size-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <div className="size-6 rounded-full bg-blue-500/40 animate-ping" />
                    </div>
                    <p className="text-sm text-slate-400 font-mono tracking-wide">Cargando contexto...</p>
                </div>
            </div>
        );
    }

    if (data.error) {
        return (
            <div className="min-h-screen bg-[#0a0b0d] text-white flex items-center justify-center p-6">
                <div className="max-w-md text-center space-y-4">
                    <div className="size-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h1 className="text-xl font-medium text-slate-200">Pack no encontrado</h1>
                    <p className="text-sm text-slate-500">El enlace puede haber expirado o no existir.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0b0d] text-white flex flex-col items-center justify-center p-4 sm:p-6">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,transparent_70%)] blur-[80px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.04)_0%,transparent_70%)] blur-[80px]" />
            </div>

            <div className="max-w-4xl w-full relative z-10 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                            <span className="text-lg">🧠</span>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                                Context Pack — <span className="text-blue-400">/{slug}</span>
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {data.updatedAt
                                    ? `Actualizado: ${new Date(data.updatedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
                                    : "Pack de contexto personal"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 w-full sm:w-auto justify-center"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "¡Copiado!" : "Copiar todo para IA"}
                    </button>
                </div>

                {/* Content Card */}
                <div className="bg-[#13151a]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
                    <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">context // full pack</span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono">{data.text.length.toLocaleString()} chars</span>
                    </div>
                    <textarea
                        readOnly
                        className="w-full min-h-[60vh] sm:min-h-[70vh] bg-transparent p-5 font-mono text-xs text-slate-300 focus:outline-none resize-y leading-relaxed"
                        value={data.text}
                    />
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] text-slate-600 font-mono tracking-wider">
                    CONTEXTUALIZER v2.4 • Copia y pega en tu IA favorita
                </p>
            </div>
        </div>
    );
}
