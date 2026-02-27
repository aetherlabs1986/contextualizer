"use client";

import { use, useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";

export default function SharedPackPage({ params }: { params: { token: string } }) {
    const { token } = params;
    const [data, setData] = useState<{ text: string, error?: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/packs/share/${token}`)
            .then(res => res.json())
            .then(res => setData(res))
            .catch(e => setData({ text: "", error: "Failed to load pack" }));
    }, [token]);

    const handleCopy = () => {
        if (!data?.text) return;
        navigator.clipboard.writeText(data.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!data) {
        return <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 animate-pulse">Cargando contexto global...</div>;
    }

    if (data.error) {
        return <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-red-500">{data.error}</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full bg-card border border-border rounded-xl p-8 space-y-6 shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pack de Contexto Compartido</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Contiene tanto el perfil sintetizado como toda la información cruda (audios, links, docs).</p>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="btn-primary flex items-center gap-2"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "¡Copiado!" : "Copiar todo para IA"}
                    </button>
                </div>

                <textarea
                    readOnly
                    className="w-full h-[60vh] bg-input border border-border rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-accent"
                    value={data.text}
                />

                <p className="text-center text-xs text-muted-foreground">Generado por Contextualizer v1.0 • Pégalo en tu IA favorita.</p>
            </div>
        </div>
    );
}
