"use client";

import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Check, ChevronRight, File, Upload, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DocumentImportWizard() {
    const router = useRouter();
    const { projects, activeProjectId } = useProject();

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
                    <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-primary' : 'bg-secondary'}`} />
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><File className="w-5 h-5 text-accent" /> Upload Document</h2>
                    <p className="text-sm text-muted-foreground">Upload a PDF, DOCX, TXT, or MD file.</p>

                    <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-accent transition-colors">
                        <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" accept=".pdf,.docx,.txt,.md" />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <div>
                                <span className="btn-secondary">Select File</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Max size 20MB. PDF, DOCX, TXT, MD.</p>
                        </label>
                        {isExtracting && <p className="mt-4 text-sm text-accent animate-pulse">Extracting text...</p>}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Settings2 className="w-5 h-5 text-accent" /> Validate Text</h2>
                    <p className="text-sm text-muted-foreground">Verify the extracted text. Edit to fix any extraction errors or remove irrelevant sections.</p>

                    <textarea
                        className="w-full h-80 bg-input border border-border rounded-lg p-4 text-sm focus:outline-none focus:border-accent"
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                    />

                    <div className="flex justify-between mt-6">
                        <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                        <button onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">Next Step <ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-lg">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Upload className="w-5 h-5 text-accent" /> Source Metadata</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input type="text" className="input-field" value={metadata.title} onChange={(e) => setMetadata({ ...metadata, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Project Tag</label>
                            <select className="input-field" value={metadata.projectId} onChange={(e) => setMetadata({ ...metadata, projectId: e.target.value })}>
                                <option value="unassigned">Unassigned (Global)</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input type="date" className="input-field" value={metadata.date} onChange={(e) => setMetadata({ ...metadata, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Importance</label>
                                <select className="input-field" value={metadata.importance} onChange={(e) => setMetadata({ ...metadata, importance: e.target.value })}>
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                        <button onClick={handleImport} disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                            {isSubmitting ? "Importing..." : "Finish Import"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
