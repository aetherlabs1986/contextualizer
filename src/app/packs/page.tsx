"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { Copy, Globe, Check } from "lucide-react";

export default function PacksPage() {
    const { activeProjectId } = useProject();
    const { userProfile } = useUserProfile();
    const [profile, setProfile] = useState<any>(null);
    const [snapshot, setSnapshot] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"full" | "current" | "quick">("full");
    const [copied, setCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/profile${activeProjectId ? `?projectId=${activeProjectId}` : ""}`)
            .then(res => res.json())
            .then(data => {
                setSnapshot(data.snapshot);
                if (data.snapshot?.profile_json) {
                    try { setProfile(JSON.parse(data.snapshot.profile_json)); } catch { }
                }
            });
    }, [activeProjectId]);

    const generateText = () => {
        if (!profile) return "No context available yet to generate a pack.";

        let text = "";

        if (activeTab === "full") {
            text += `IDENTITY:\n${profile.identity_snapshot?.summary || "N/A"}\n\n`;
            text += `STRENGTHS:\n${profile.identity_snapshot?.strengths?.join(", ") || "N/A"}\n\n`;
            text += `TOOLS & SKILLS:\n${profile.identity_snapshot?.tools?.join(", ") || "N/A"}\n\n`;
            text += `PROJECTS:\n${profile.projects?.map((p: any) => `- ${p.name}: ${p.status}. Focus: ${p.current_focus}. Goals: ${p.goals?.join(", ") || "N/A"}`).join('\n') || "N/A"}\n\n`;
            text += `STRATEGY:\nNorth Star: ${profile.strategic_direction?.north_star || "N/A"}\nCurrent Focus: ${profile.strategic_direction?.current_focus || "N/A"}\nWhy Now: ${profile.strategic_direction?.why_now || "N/A"}\n\n`;
            text += `LEADS:\n${profile.leads_pipeline?.map((l: any) => `- ${l.name || l.name_or_company} (${l.stage})${l.next_action ? ` → ${l.next_action}` : ""}`).join('\n') || "N/A"}\n\n`;
            text += `DECISIONS:\n${profile.recent_decisions?.map((d: any) => `- ${d.decision}${d.rationale ? `: ${d.rationale}` : ""}`).join('\n') || "N/A"}\n\n`;
            text += `KNOWLEDGE:\n${profile.knowledge_updates?.map((k: any) => `- ${k.topic}: ${k.summary || ""}${k.implications ? ` (${k.implications})` : ""}`).join('\n') || "N/A"}\n\n`;
            text += `RISKS:\n${profile.risks_unknowns?.map((r: any) => `- ${r.risk}${r.mitigation ? ` → Mitigation: ${r.mitigation}` : ""}`).join('\n') || "N/A"}\n\n`;
            text += `COMMUNICATION PREFS:\nTone: ${profile.communication_style?.tone || "N/A"}\nDo: ${profile.communication_style?.preferences_do?.join("; ") || "N/A"}\nAvoid: ${profile.communication_style?.avoid?.join("; ") || "N/A"}`;
        } else if (activeTab === "current") {
            text += `ACTIVE PROJECTS:\n${profile.projects?.filter((p: any) => p.status === 'active').map((p: any) => `- ${p.name}: ${p.current_focus}`).join('\n') || "N/A"}\n\n`;
            text += `CURRENT FOCUS:\n${profile.strategic_direction?.current_focus || "N/A"}\n\n`;
            text += `RECENT DECISIONS:\n${profile.recent_decisions?.slice(0, 3).map((d: any) => `- ${d.decision}`).join('\n') || "None"}\n\n`;
            text += `TOP LEADS:\n${profile.leads_pipeline?.slice(0, 3).map((l: any) => `- ${l.name || l.name_or_company} (${l.stage})`).join('\n') || "None"}\n\n`;
            text += `KEY RISKS:\n${profile.risks_unknowns?.slice(0, 3).map((r: any) => `- ${r.risk}`).join('\n') || "None"}`;
        } else if (activeTab === "quick") {
            text += `Who I am: ${profile.identity_snapshot?.summary || "N/A"}\n\n`;
            text += `What I'm doing now: ${profile.strategic_direction?.current_focus || "N/A"}\n\n`;
            text += `Main project: ${profile.projects?.[0]?.name || "N/A"} — ${profile.projects?.[0]?.current_focus || "N/A"}\n\n`;
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

    const handleCopyShareLink = () => {
        const slug = userProfile.slug;
        if (!slug) {
            alert("Configura tu slug en Settings para generar un enlace público.");
            return;
        }
        const link = `${window.location.origin}/${slug}`;
        navigator.clipboard.writeText(link);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const shareUrl = userProfile.slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/${userProfile.slug}` : null;

    return (
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">Context Packs</h1>
                <p className="text-text-secondary mt-1 text-sm">Exportable snapshots to paste into any external AI chat.</p>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-4 sm:gap-6 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200 pb-0">
                {(['full', 'current', 'quick'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-main"}`}
                    >
                        {tab === 'full' ? 'Full Pack' : tab === 'current' ? 'Current State' : 'Quick Start'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="soft-card p-4 sm:p-6 relative">
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:absolute sm:right-6 sm:top-6 mb-4 sm:mb-0">
                    <button onClick={handleCopyShareLink} className="btn-secondary flex items-center justify-center gap-2 text-sm">
                        {linkCopied ? <Check className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        {linkCopied ? "¡Link copiado!" : "Copiar Link Público"}
                    </button>
                    <button onClick={handleCopy} className="btn-primary flex items-center justify-center gap-2 text-sm">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "¡Copiado!" : "Copiar Pack"}
                    </button>
                </div>

                <h2 className="text-sm font-bold uppercase text-text-secondary mb-4">Pack Preview</h2>

                {/* Public URL preview */}
                {shareUrl && (
                    <div className="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                            <Globe className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-text-main font-mono text-xs truncate">{shareUrl}</span>
                        </div>
                        <span className="text-[10px] text-text-secondary">Este es tu enlace público</span>
                    </div>
                )}

                {!userProfile.slug && (
                    <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl text-sm text-amber-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">warning</span>
                        <span>Configura tu slug en <a href="/settings" className="underline font-semibold">Settings</a> para tener un enlace público.</span>
                    </div>
                )}

                <textarea
                    readOnly
                    className="w-full min-h-[50vh] sm:min-h-[60vh] bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-text-main focus:outline-none resize-y"
                    value={generateText()}
                />
            </div>
        </div>
    );
}
