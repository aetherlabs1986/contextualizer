"use client";

import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Check, ChevronRight, FileType2, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export function ChatImportWizard() {
    const router = useRouter();
    const { projects, activeProjectId } = useProject();

    const [step, setStep] = useState(1);
    const [rawText, setRawText] = useState("");
    const [parsedMessages, setParsedMessages] = useState<{ role: string; content: string; keep: boolean }[]>([]);

    const [metadata, setMetadata] = useState({
        title: "",
        projectId: activeProjectId || "unassigned",
        importance: "normal",
        date: new Date().toISOString().split('T')[0]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleParse = () => {
        // Basic heuristics for Speaker: Message
        const lines = rawText.split('\n');
        const messages: any[] = [];
        let currentRole = "User";
        let currentContent: string[] = [];

        for (const line of lines) {
            if (line.match(/^(You|User|Human)\s*[:\n]/i)) {
                if (currentContent.length) messages.push({ role: currentRole, content: currentContent.join('\n').trim(), keep: true });
                currentRole = "User";
                currentContent = [line.replace(/^(You|User|Human)\s*[:\n]/i, '').trim()];
            } else if (line.match(/^(Assistant|ChatGPT|Claude|Copilot|AI)\s*[:\n]/i)) {
                if (currentContent.length) messages.push({ role: currentRole, content: currentContent.join('\n').trim(), keep: true });
                currentRole = "Assistant";
                currentContent = [line.replace(/^(Assistant|ChatGPT|Claude|Copilot|AI)\s*[:\n]/i, '').trim()];
            } else {
                currentContent.push(line);
            }
        }
        if (currentContent.length) messages.push({ role: currentRole, content: currentContent.join('\n').trim(), keep: true });

        // Fallback if parsing didn't find clear speakers
        if (messages.length <= 1) {
            messages.length = 0;
            messages.push({ role: "Note", content: rawText, keep: true });
        }

        setParsedMessages(messages);

        // Auto-suggest title
        const firstUserMsg = messages.find((m) => m.role === "User")?.content || messages[0]?.content || "";
        setMetadata({ ...metadata, title: firstUserMsg.slice(0, 40) + (firstUserMsg.length > 40 ? "..." : "") });

        setStep(2);
    };

    const handleImport = async () => {
        setIsSubmitting(true);

        const extractedText = parsedMessages
            .filter((m) => m.keep)
            .map((m) => `${m.role}: ${m.content}`)
            .join('\n\n---\n\n');

        try {
            const res = await fetch("/api/sources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source_type: "chat",
                    title: metadata.title || "Untitled Chat",
                    project_id: metadata.projectId === "unassigned" ? null : metadata.projectId,
                    importance: metadata.importance,
                    raw_text: rawText,
                    extracted_text: extractedText,
                })
            });

            if (res.ok) {
                router.push("/sources");
            } else {
                alert("Failed to create source");
            }
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
                    <h2 className="text-xl font-semibold flex items-center gap-2"><FileType2 className="w-5 h-5 text-accent" /> Paste Chat Transcript</h2>
                    <p className="text-sm text-muted-foreground">Copy and paste your conversation with ChatGPT, Claude, or Copilot.</p>
                    <textarea
                        className="w-full h-64 bg-input border border-border rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-accent"
                        placeholder="User: How do I implement Next.js forms?&#10;&#10;Assistant: Here is a code example..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                    />
                    <div className="flex justify-end relative">
                        <button
                            disabled={rawText.trim().length === 0}
                            onClick={handleParse}
                            className="btn-primary flex items-center gap-2"
                        >
                            Detect Format <Search className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Check className="w-5 h-5 text-accent" /> Parse Preview</h2>
                    <p className="text-sm text-muted-foreground">Verify the detected messages. Uncheck messages you don't want to include.</p>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {parsedMessages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 p-3 rounded-lg border ${msg.keep ? 'border-border bg-secondary/20' : 'border-border/50 bg-background opacity-50'}`}>
                                <input
                                    type="checkbox"
                                    checked={msg.keep}
                                    onChange={(e) => {
                                        const newArr = [...parsedMessages];
                                        newArr[i].keep = e.target.checked;
                                        setParsedMessages(newArr);
                                    }}
                                    className="mt-1"
                                />
                                <div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${msg.role === 'User' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {msg.role}
                                    </span>
                                    <p className="text-sm mt-2 whitespace-pre-wrap line-clamp-4 hover:line-clamp-none transition-all">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

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
