"use client";

import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { ChevronRight, Link as LinkIcon, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export function LinkImportWizard() {
    const router = useRouter();
    const { projects, activeProjectId } = useProject();

    const [step, setStep] = useState(1);
    const [url, setUrl] = useState("");
    const [summary, setSummary] = useState("");
    const [shouldFetch, setShouldFetch] = useState(false);
    const [extractedText, setExtractedText] = useState("");

    const [metadata, setMetadata] = useState({
        title: "",
        projectId: activeProjectId || "unassigned",
        importance: "normal",
        date: new Date().toISOString().split('T')[0]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = async () => {
        if (shouldFetch) {
            // Mock fetch fallback since V1 requirement is 'fetch + summarize optional'
            // Without complex scraping architecture, we'll store summary + url. real scraping takes more setup.
            setExtractedText(`URL: ${url}\nSummary: ${summary}`);
        } else {
            setExtractedText(summary);
        }

        if (!metadata.title) {
            setMetadata(prev => ({ ...prev, title: url }));
        }
        setStep(2);
    };

    const handleImport = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/sources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source_type: "link",
                    title: metadata.title || url,
                    source_url: url,
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
                {[1, 2].map((s) => (
                    <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-primary' : 'bg-secondary'}`} />
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><LinkIcon className="w-5 h-5 text-accent" /> Add a Link</h2>
                    <p className="text-sm text-muted-foreground">Provide a URL and a quick manual summary of its importance.</p>

                    <div>
                        <label className="block text-sm font-medium mb-1">URL</label>
                        <input type="url" className="input-field" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 mt-4">Manual Summary (Required if not fetching)</label>
                        <textarea
                            className="w-full h-32 bg-input border border-border rounded-lg p-4 text-sm focus:outline-none focus:border-accent"
                            placeholder="This article discusses..."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-4 opacity-50 cursor-not-allowed" title="Auto-fetch requires more robust proxy/scraping service. Currently mocked.">
                        <input type="checkbox" id="fetch-toggle" checked={shouldFetch} onChange={(e) => setShouldFetch(e.target.checked)} disabled />
                        <label htmlFor="fetch-toggle" className="text-sm text-muted-foreground">Attempt to automatically fetch page text (Beta - Disabled for V1)</label>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button onClick={handleNext} disabled={!url} className="btn-primary flex items-center gap-2">Next Step <ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {step === 2 && (
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
                        <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                        <button onClick={handleImport} disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                            {isSubmitting ? "Importing..." : "Finish Import"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
