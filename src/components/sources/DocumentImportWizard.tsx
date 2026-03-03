"use client";

import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, File, Upload, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DocumentImportWizard() {
    const router = useRouter();
    const { projects, activeProjectId } = useProject();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);

    const [metadata, setMetadata] = useState({
        title: "",
        projectId: activeProjectId || "unassigned",
        importance: "normal",
        date: new Date().toISOString().split('T')[0]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setMetadata(prev => ({ ...prev, title: selected.name }));

        setIsExtracting(true);
        const formData = new FormData();
        formData.append("file", selected);

        try {
            const res = await fetch("/api/extract", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setExtractedText(data.extractedText || "");
            } else {
                alert("Extraction failed. Please paste manually.");
            }
        } catch {
            alert("Extraction failed. Please paste manually.");
        } finally {
            setIsExtracting(false);
            setStep(2);
        }
    };

    const handleImport = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/sources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source_type: "document",
                    title: metadata.title || file?.name || "Untitled Document",
                    project_id: metadata.projectId === "unassigned" ? null : metadata.projectId,
                    importance: metadata.importance,
                    extracted_text: extractedText,
                    user_id: user?.uid
                })
            });

            if (res.ok) router.push("/sources");
            else alert("Failed to create source");
        } catch (e) {
            console.error(e);
            alert("Error creating source");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-primary' : 'bg-slate-200'}`} />
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900"><File className="w-5 h-5 text-primary" /> Subir Documento</h2>
                    <p className="text-sm text-slate-500">Sube un archivo PDF, DOCX, TXT, o MD.</p>

                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
                        <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" accept=".pdf,.docx,.txt,.md" />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                            <Upload className="w-8 h-8 text-slate-500" />
                            <div>
                                <span className="h-10 px-6 rounded-lg bg-slate-50 text-slate-900 text-sm font-bold border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors flex items-center">Seleccionar Archivo</span>
                            </div>
                            <p className="text-xs text-slate-500">Max size 20MB. PDF, DOCX, TXT, MD.</p>
                        </label>
                        {isExtracting && <p className="mt-4 text-sm text-primary animate-pulse">Extrayendo texto...</p>}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900"><Settings2 className="w-5 h-5 text-primary" /> Validar Texto</h2>
                    <p className="text-sm text-slate-500">Verifica el texto extraído. Puedes editarlo para corregir errores o quitar partes irrelevantes.</p>

                    <textarea
                        className="w-full h-80 bg-white border border-slate-200 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900"
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                    />

                    <div className="flex justify-between mt-6">
                        <button onClick={() => setStep(1)} className="h-10 px-6 rounded-lg bg-transparent border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Atrás</button>
                        <button onClick={() => setStep(3)} className="h-10 px-6 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-400 transition-colors flex items-center gap-2">Siguiente Paso <ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-lg">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900"><Upload className="w-5 h-5 text-primary" /> Metadatos de la Fuente</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Título</label>
                            <input type="text" className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50" value={metadata.title} onChange={(e) => setMetadata({ ...metadata, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Etiqueta de Proyecto</label>
                            <select className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50" value={metadata.projectId} onChange={(e) => setMetadata({ ...metadata, projectId: e.target.value })}>
                                <option value="unassigned">Sin asignar (Global)</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Fecha</label>
                                <input type="date" className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50" value={metadata.date} onChange={(e) => setMetadata({ ...metadata, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Importancia</label>
                                <select className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50" value={metadata.importance} onChange={(e) => setMetadata({ ...metadata, importance: e.target.value })}>
                                    <option value="low">Baja</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">Alta</option>
                                    <option value="critical">Crítica</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        <button onClick={() => setStep(2)} className="h-10 px-6 rounded-lg bg-transparent border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Atrás</button>
                        <button onClick={handleImport} disabled={isSubmitting} className="h-10 px-6 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-400 transition-colors flex items-center gap-2">
                            {isSubmitting ? "Importando..." : "Finalizar Importación"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
