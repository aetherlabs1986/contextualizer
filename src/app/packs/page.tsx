"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Copy, Link as LinkIcon, Download, Globe, Check } from "lucide-react";

export default function PacksPage() {
    const { activeProjectId } = useProject();
    const [profile, setProfile] = useState<any>(null);
    const [snapshot, setSnapshot] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"full" | "current" | "quick">("full");
    const [copied, setCopied] = useState(false);
    const [shareLink, setShareLink] = useState("");

    useEffect(() => {
        fetch(`/api/profile${activeProjectId ? `?projectId=${activeProjectId}` : ""}`)
            .then(res => res.json())
            .then(data => {
                setSnapshot(data.snapshot);
                if (data.snapshot?.profile_json) {
                    try { setProfile(JSON.parse(data.snapshot.profile_json)); } catch (e) { }
                }
            });
    }, [activeProjectId]);

    const generateText = () => {
        if (!profile) return "No context available yet to generate a pack.";

        let text = "";

        if (activeTab === "full") {
            text += `IDENTITY:\n${profile.identity_snapshot?.summary || "N/A"}\n\n`;
            text += `PROJECTS:\n${profile.projects?.map((p: any) => `- ${p.name}: ${p.status}. Focus: ${p.current_focus}`).join('\n') || "N/A"}\n\n`;
            text += `STRATEGY:\n${profile.strategic_direction?.north_star || "N/A"}\n\n`;
            text += `LEADS:\n${profile.leads_pipeline?.map((l: any) => `- ${l.name} (${l.stage})`).join('\n') || "N/A"}\n\n`;
            text += `DECISIONS:\n${profile.recent_decisions?.map((d: any) => `- ${d.decision}`).join('\n') || "N/A"}\n\n`;
            text += `KNOWLEDGE:\n${profile.knowledge_updates?.map((k: any) => `- ${k.topic}`).join('\n') || "N/A"}\n\n`;
            text += `RISKS:\n${profile.risks_unknowns?.map((r: any) => `- ${r.risk}`).join('\n') || "N/A"}\n\n`;
            text += `COMMUNICATION PREFS:\nTone: ${profile.communication_style?.tone || "N/A"}`;
        } else if (activeTab === "current") {
            text += `ACTIVE PROJECTS:\n${profile.projects?.filter((p: any) => p.status === 'active').map((p: any) => `- ${p.name}: ${p.current_focus}`).join('\n') || "N/A"}\n\n`;
            text += `CURRENT FOCUS:\n${profile.strategic_direction?.current_focus || "N/A"}\n\n`;
            text += `RECENT DECISIONS:\n${profile.recent_decisions?.slice(0, 3).map((d: any) => `- ${d.decision}`).join('\n') || "None"}\n\n`;
            text += `TOP LEADS:\n${profile.leads_pipeline?.slice(0, 3).map((l: any) => `- ${l.name}`).join('\n') || "None"}`;
        } else if (activeTab === "quick") {
            text += `Who I am: ${profile.identity_snapshot?.summary || "N/A"}\n\n`;
            text += `What I'm doing now: ${profile.strategic_direction?.current_focus || "N/A"}\n\n`;
            text += `Constraints & Style: Tone should be ${profile.communication_style?.tone || "standard"}. ${profile.strategic_direction?.constraints?.[0] || ""}`;
        }

        text += `\n\n---`;
        if (snapshot) {
            text += `\nLast updated: ${new Date(snapshot.created_at).toLocaleString()}`;
        }
        text += `\nInstruction: Use this as permanent context for this chat. Ask clarifying questions only if absolutely necessary.`;

        return text.trim();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerateShare = async () => {
        if (!snapshot) return;
        try {
            const res = await fetch("/api/packs/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context_pack_id: snapshot.id, // Using snapshot id directly for V1
                    pack_type: activeTab,
                    project_id: activeProjectId,
                })
            });
            const data = await res.json();
            if (res.ok) {
                setShareLink(`${window.location.origin}/share/${data.token}`);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate link");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Context Packs</h1>
                <p className="text-muted-foreground mt-1">Exportable snapshots to paste into any external AI chat.</p>
            </div>

            <div className="flex bg-panel border-b border-border gap-6">
                {(['full', 'current', 'quick'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setShareLink(""); }}
                        className={`pb-3 font-medium text-sm transition-colors border-b-2 ${activeTab === tab ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        {tab === 'full' ? 'Full Pack (Long)' : tab === 'current' ? 'Current State (Medium)' : 'Quick Start (Short)'}
                    </button>
                ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 relative">
                <div className="absolute right-6 top-6 flex gap-2">
                    <button onClick={handleGenerateShare} className="btn-secondary flex items-center gap-2"><Globe className="w-4 h-4" /> Share Link</button>
                    <button onClick={handleCopy} className="btn-primary flex items-center gap-2">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy Pack"}
                    </button>
                </div>

                <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-4">Pack Preview</h2>

                {shareLink && (
                    <div className="mb-4 bg-secondary p-3 rounded-lg border border-accent text-sm flex justify-between items-center">
                        <span className="text-foreground font-mono truncate mr-4">{shareLink}</span>
                        <button onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-accent underline shrink-0">Copy Link</button>
                    </div>
                )}

                <textarea
                    readOnly
                    className="w-full h-96 bg-input border border-border rounded-lg p-4 font-mono text-xs focus:outline-none"
                    value={generateText()}
                />
            </div>
        </div>
    );
}
