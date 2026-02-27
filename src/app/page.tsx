"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDashboardData } from "./actions";

export default function DashboardPage() {
  const { activeProjectId } = useProject();
  const { t } = useLanguage();

  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dashboardMeta, setDashboardMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/profile${activeProjectId ? `?projectId=${activeProjectId}` : ""}`);
    const json = await res.json();
    setData(json);
    if (json.snapshot?.profile_json) {
      try { setProfile(JSON.parse(json.snapshot.profile_json)); } catch { }
    } else {
      setProfile(null);
    }

    const meta = await getDashboardData(activeProjectId);
    setDashboardMeta(meta);

    setLoading(false);
  }, [activeProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load saved avatar from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("contextualizer_avatar");
    if (saved) setAvatarUrl(saved);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      localStorage.setItem("contextualizer_avatar", result);
    };
    reader.readAsDataURL(file);
  };

  // Extract user name from profile
  const userName = profile?.identity_snapshot?.roles?.[0]
    || profile?.identity_snapshot?.summary?.split(" ").slice(0, 2).join(" ")
    || "Mi Perfil";

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("risk") || s.includes("dormant") || s.includes("critical")) return { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400", border: "border-amber-500/20", glow: "shadow-[0_0_8px_#f59e0b]" };
    if (s.includes("pending") || s.includes("idea")) return { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400", border: "border-blue-500/20", glow: "shadow-[0_0_8px_#3b82f6]" };
    return { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400", border: "border-emerald-500/20", glow: "shadow-[0_0_8px_#10b981]" };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 opacity-50">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">data_usage</span>
          <p className="font-mono text-xs tracking-widest uppercase text-slate-500">Initializing OS...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-16 h-full">
        <div className="glass-layer p-10 rounded-[24px] flex flex-col items-center text-center max-w-md border-dashed border-white/20">
          <span className="material-symbols-outlined text-6xl text-slate-600 mb-6 drop-shadow-md">deployed_code</span>
          <h3 className="text-xl font-light text-white mb-2">No Context Loaded</h3>
          <p className="text-sm text-slate-400 font-light mb-6 leading-relaxed">System requires data to synthesize the global profile. Proceed to Sources to inject knowledge nodes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* LEFT WIDE COLUMN */}
      <div className="lg:col-span-8 flex flex-col gap-8">

        {/* IDENTITY HERO */}
        <div className="glass-layer rounded-[24px] p-8 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/20 via-transparent to-transparent blur-[100px]"></div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* AVATAR — clickable to change */}
            <div
              className="relative size-32 shrink-0 group-hover:scale-[1.02] transition-transform duration-700 ease-out cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Haz clic para cambiar la foto"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 to-accent-cyan/30 blur-2xl animate-pulse"></div>
              <div className="size-full rounded-full relative overflow-hidden border-2 border-white/20 backdrop-blur-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
                ) : (
                  <>
                    <div className="orb-glow size-full absolute inset-0"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-white/80 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">person</span>
                    </div>
                  </>
                )}
              </div>
              {/* Upload hint overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
              </div>
              <div className="absolute bottom-0 right-0">
                <div className="size-3 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981] ring-2 ring-os-bg"></div>
              </div>
            </div>

            {/* BIO */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-baseline gap-3 mb-2 justify-center md:justify-start">
                <h1 className="text-3xl md:text-4xl font-light text-white tracking-[-0.03em]">{userName}</h1>
                <div className="flex items-center gap-2">
                  <span className="h-px w-6 bg-white/20 hidden md:block"></span>
                  <span className="text-[10px] font-mono text-primary-glow tracking-widest uppercase">{data.snapshot?.version_label || "V1.0"}</span>
                </div>
              </div>
              <p className="text-slate-400 font-light text-base mb-6 max-w-xl leading-relaxed">
                {profile.identity_snapshot?.summary || "No identity summary formed yet."}
              </p>

              {/* TAGS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Tone</div>
                  <div className="text-white font-normal flex items-center gap-2 text-sm capitalize">
                    <span className="material-symbols-outlined text-primary text-base">record_voice_over</span>
                    {profile.communication_style?.tone || "Standard"}
                  </div>
                </div>
                <div className="px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Focus</div>
                  <div className="text-white font-normal flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-accent-cyan text-base">center_focus_strong</span>
                    <span className="truncate">{profile.strategic_direction?.current_focus?.split(" ").slice(0, 3).join(" ") || "Defined"}</span>
                  </div>
                </div>
                <div className="px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col justify-center">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">State</div>
                  <span className="text-[10px] uppercase font-mono tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded w-fit border border-emerald-500/30">Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW (Projects & Pipeline) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PROJECTS */}
          <div className="glass-layer rounded-[20px] p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-5 border-b border-white/[0.03] pb-3">
              <h3 className="text-white text-xs font-semibold tracking-widest flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-emerald-400 text-base">rocket_launch</span>
                Active Projects
              </h3>
            </div>
            <div className="space-y-3 flex-1">
              {profile.projects?.slice(0, 5).map((p: any, i: number) => {
                const c = getStatusColor(p.status);
                return (
                  <div key={i} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex items-center justify-center size-6 shrink-0">
                        <div className={`size-2 rounded-full ${c.dot} ${c.glow}`}></div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{p.current_focus}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono uppercase ${c.bg} ${c.text} px-1.5 py-0.5 rounded ${c.border} border shrink-0 ml-2`}>{p.status}</span>
                  </div>
                );
              })}
              {(!profile.projects || profile.projects.length === 0) && (
                <p className="text-slate-500 text-sm font-light text-center py-4">No active projects detected.</p>
              )}
            </div>
          </div>

          {/* PIPELINE INTEL */}
          <div className="glass-layer rounded-[20px] p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-5 border-b border-white/[0.03] pb-3">
              <h3 className="text-white text-xs font-semibold tracking-widest flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-accent-purple text-base">filter_alt</span>
                Pipeline Intel
              </h3>
            </div>
            <div className="space-y-4">
              {profile.leads_pipeline?.slice(0, 4).map((l: any, i: number) => {
                const percent = Math.max(20, Math.min(100, 90 - (i * 15)));
                return (
                  <div key={i} className="relative group cursor-pointer hover:bg-white/[0.02] p-2 rounded-lg transition-colors">
                    <div className="flex justify-between text-xs mb-1.5 items-end">
                      <span className="text-slate-200 font-medium truncate">{l.name} <span className="text-slate-500 font-light ml-1">{l.company}</span></span>
                    </div>
                    <div className="w-full bg-white/[0.05] rounded-full h-1 relative overflow-hidden">
                      <div className="bg-accent-purple h-1 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="mt-1.5 flex">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 border border-white/10 px-1.5 py-0.5 rounded bg-white/[0.02]">{l.stage}</span>
                    </div>
                  </div>
                );
              })}
              {(!profile.leads_pipeline || profile.leads_pipeline.length === 0) && (
                <p className="text-slate-500 text-sm font-light text-center py-4">No leads recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* KNOWLEDGE MATRIX */}
        <div className="glass-layer rounded-[20px] p-5 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/5 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 z-10 relative">
            <h3 className="text-white text-xs font-semibold tracking-widest flex items-center gap-2 uppercase">
              <span className="material-symbols-outlined text-slate-400 text-base">history_edu</span>
              Recent Knowledge &amp; Learnings
            </h3>
          </div>
          <div className="relative pl-5 border-l border-white/5 space-y-6 z-10">
            {profile.knowledge_updates?.map((k: any, i: number) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[23px] top-1 size-2.5 rounded-full bg-os-bg border border-slate-600 group-hover:border-primary group-hover:shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all"></div>
                <h4 className="text-slate-200 text-sm font-medium group-hover:text-primary transition-colors mb-1">{k.topic}</h4>
                <p className="text-slate-400 text-xs font-light leading-relaxed">{k.summary}</p>
              </div>
            ))}
            {(!profile.knowledge_updates || profile.knowledge_updates.length === 0) && (
              <p className="text-slate-500 text-xs font-light">No explicit knowledge captured yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-4 flex flex-col gap-6">

        {/* STRATEGIC GAUGE CARD */}
        <div className="glass-layer rounded-[24px] p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-white text-xs font-bold tracking-widest uppercase">Strategic State</h3>
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase">Fresh</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-2 relative z-10">
            <div className="relative size-44">
              <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="gradientPage" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6"></stop>
                    <stop offset="100%" stopColor="#22d3ee"></stop>
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" fill="none" opacity="0.3" r="42" stroke="#1e293b" strokeWidth="6"></circle>
                <circle className="gauge-value" cx="50" cy="50" fill="none" r="42" strokeDasharray="0 263" strokeDashoffset="0" strokeWidth="6" stroke="url(#gradientPage)"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-light text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {profile.projects?.length ? profile.projects.length * 10 + 40 : 100}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">Focus</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            <div className="p-4 rounded-xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent hover:border-amber-400/30 hover:from-amber-400/[0.05] transition-all group cursor-default">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-amber-400 text-sm">stars</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">North Star</span>
              </div>
              <p className="text-slate-200 text-sm font-light leading-relaxed">
                {profile.strategic_direction?.north_star || "Define long term vision."}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent hover:border-primary/30 hover:from-primary/[0.05] transition-all group cursor-default">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-primary text-sm">center_focus_strong</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Focus</span>
              </div>
              <p className="text-slate-200 text-sm font-light leading-relaxed">
                {profile.strategic_direction?.current_focus || "No immediate focus set."}
              </p>
            </div>
          </div>

          {/* RISKS */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-4 relative z-10">
            <h4 className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">warning</span>
              Risks &amp; Unknowns
            </h4>
            <ul className="space-y-2.5">
              {profile.risks_unknowns?.map((r: any, i: number) => (
                <li key={i} className="flex flex-col gap-0.5">
                  <div className="flex items-start gap-2">
                    <div className="mt-1.5 size-1 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444] shrink-0"></div>
                    <span className="text-xs text-slate-300 font-medium leading-normal">{r.risk}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-light pl-3 leading-normal">{r.mitigation}</span>
                </li>
              ))}
              {(!profile.risks_unknowns || profile.risks_unknowns.length === 0) && (
                <li className="text-xs text-slate-500 font-light">No critical risks logged.</li>
              )}
            </ul>
          </div>

          {/* COMMS */}
          <div className="rounded-xl border border-accent-purple/20 bg-accent-purple/[0.02] p-4 relative z-10">
            <h4 className="text-accent-purple text-[10px] font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Comms &amp; Restrictions
            </h4>
            <div className="space-y-1.5">
              {profile.communication_style?.preferences_do?.slice(0, 3).map((p: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-emerald-500 shrink-0 mt-0.5">&#10003;</span>
                  <span className="leading-normal">{p}</span>
                </div>
              ))}
              {profile.communication_style?.avoid?.slice(0, 2).map((p: string, i: number) => (
                <div key={`a-${i}`} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-red-400 shrink-0 mt-0.5">&#10007;</span>
                  <span className="leading-normal">{p}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
