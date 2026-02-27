"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { getDashboardData } from "./actions";

export default function DashboardPage() {
  const { activeProjectId } = useProject();
  const { t } = useLanguage();

  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dashboardMeta, setDashboardMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/profile${activeProjectId ? `?projectId=${activeProjectId}` : ""}`);
    const json = await res.json();
    setData(json);
    if (json.snapshot?.profile_json) {
      try { setProfile(JSON.parse(json.snapshot.profile_json)); } catch (e) { }
    } else {
      setProfile(null);
    }

    const meta = await getDashboardData(activeProjectId);
    setDashboardMeta(meta);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeProjectId]);

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

          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
            {/* ORB AVATAR */}
            <div className="relative size-36 shrink-0 group-hover:scale-[1.02] transition-transform duration-700 ease-out">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 to-accent-cyan/30 blur-2xl animate-pulse"></div>
              <div className="orb-glow size-full rounded-full relative overflow-hidden border border-white/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop')] bg-cover opacity-60 mix-blend-overlay animate-[spin_120s_linear_infinite]"></div>
                <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen" viewBox="0 0 100 100">
                  <path className="animate-pulse" d="M10,50 Q30,20 50,50 T90,50" fill="none" stroke="white" strokeDasharray="2 4" strokeWidth="0.5"></path>
                  <path d="M20,80 Q50,20 80,80" fill="none" opacity="0.8" stroke="#22d3ee" strokeWidth="0.3"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] font-light">fingerprint</span>
                </div>
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[20%] bg-gradient-to-b from-white/40 to-transparent rounded-full blur-[2px]"></div>
              </div>
              <div className="absolute bottom-1 right-1">
                <div className="size-3 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981] ring-2 ring-os-bg"></div>
              </div>
            </div>

            {/* BIO */}
            <div className="flex-1 text-center md:text-left pt-2">
              <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-3 justify-center md:justify-start">
                <h1 className="text-4xl font-light text-white tracking-[-0.03em]">Global Identity</h1>
                <div className="flex items-center gap-2">
                  <span className="h-px w-8 bg-white/20 hidden md:block"></span>
                  <span className="text-xs font-mono text-primary-glow tracking-widest uppercase">{data.snapshot?.version_label || "V1.0"}</span>
                </div>
              </div>
              <p className="text-slate-400 font-light text-lg mb-8 max-w-xl leading-relaxed">
                {profile.identity_snapshot?.summary || "No identity summary formed yet."}
              </p>

              {/* TAGS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="px-4 py-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group/stat">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 group-hover/stat:text-primary transition-colors">Tone</div>
                  <div className="text-white font-normal flex items-center gap-2 text-sm capitalize">
                    <span className="material-symbols-outlined text-primary text-lg font-light">record_voice_over</span>
                    {profile.communication_style?.tone || "Standard"}
                  </div>
                </div>
                <div className="px-4 py-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group/stat">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 group-hover/stat:text-accent-cyan transition-colors">Superpower</div>
                  <div className="text-white font-normal flex items-center gap-2 text-sm capitalize">
                    <span className="material-symbols-outlined text-accent-cyan text-lg font-light">strategy</span>
                    Synthesis
                  </div>
                </div>
                <div className="px-4 py-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group/stat flex flex-col justify-center">
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
          <div className="glass-layer rounded-[20px] p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 border-b border-white/[0.03] pb-4">
              <h3 className="text-white text-sm font-medium tracking-wide flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-emerald-400 text-lg">rocket_launch</span>
                Active Projects
              </h3>
              <button className="text-slate-600 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">more_horiz</span></button>
            </div>
            <div className="space-y-4 flex-1">
              {profile.projects?.slice(0, 4).map((p: any, i: number) => {
                const isWarning = p.status?.toLowerCase().includes("risk") || p.status?.toLowerCase().includes("dormant");
                const isNeutral = p.status?.toLowerCase().includes("pending");
                const colorClass = isWarning ? "amber" : isNeutral ? "blue" : "emerald";

                return (
                  <div key={i} className="group flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center size-8">
                        <div className={`absolute inset-0 bg-${colorClass}-500/10 rounded-full blur-sm group-hover:bg-${colorClass}-500/20 transition-all`}></div>
                        <div className={`size-2 rounded-full bg-${colorClass}-400 shadow-[0_0_8px_var(--tw-colors-${colorClass}-400)]`}></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[150px]">{p.current_focus}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono uppercase bg-${colorClass}-500/10 text-${colorClass}-400 px-1.5 py-0.5 rounded border border-${colorClass}-500/20`}>{p.status}</span>
                  </div>
                );
              })}
              {(!profile.projects || profile.projects.length === 0) && (
                <p className="text-slate-500 text-sm font-light text-center py-4">No active projects detected.</p>
              )}
            </div>
          </div>

          {/* PIPELINE INTEL */}
          <div className="glass-layer rounded-[20px] p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 border-b border-white/[0.03] pb-4">
              <h3 className="text-white text-sm font-medium tracking-wide flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-accent-purple text-lg">filter_alt</span>
                Pipeline Intel
              </h3>
            </div>
            <div className="space-y-6">
              {profile.leads_pipeline?.slice(0, 4).map((l: any, i: number) => {
                // Randomize bar width just for cool UI effect based on index
                const percent = Math.max(20, Math.min(100, 90 - (i * 15)));
                const color = percent > 60 ? "accent-purple" : "primary";

                return (
                  <div key={i} className="relative group cursor-pointer hover:bg-white/[0.02] p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex justify-between text-xs mb-2 items-end">
                      <span className="text-slate-200 font-medium">{l.name} <span className="text-slate-500 font-light ml-1">{l.company}</span></span>
                    </div>
                    <div className="w-full bg-white/[0.05] rounded-full h-1 relative overflow-hidden">
                      <div className={`bg-${color} h-1 rounded-full shadow-[0_0_10px_var(--tw-colors-${color})]`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="mt-2 flex">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 border border-white/10 px-1.5 py-0.5 rounded bg-white/[0.02] group-hover:text-slate-300 transition-colors">{l.stage}</span>
                    </div>
                  </div>
                )
              })}
              {(!profile.leads_pipeline || profile.leads_pipeline.length === 0) && (
                <p className="text-slate-500 text-sm font-light text-center py-4">No leads recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* KNOWLEDGE MATRIX */}
        <div className="glass-layer rounded-[20px] p-6 flex flex-col col-span-1 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/5 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-8 z-10 relative">
            <h3 className="text-white text-sm font-medium tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-lg">history_edu</span>
              RECENT KNOWLEDGE & LEARNINGS
            </h3>
          </div>
          <div className="relative pl-6 border-l border-white/5 space-y-8 z-10">
            {profile.knowledge_updates?.map((k: any, i: number) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[29px] top-1 size-3 rounded-full bg-os-bg border border-slate-600 group-hover:border-primary group-hover:shadow-[0_0_10px_rgba(59,130,246,0.4)] group-hover:scale-125 transition-all"></div>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                  <h4 className="text-slate-200 text-sm font-medium group-hover:text-primary transition-colors">{k.topic}</h4>
                </div>
                <p className="text-slate-400 text-xs font-light leading-relaxed">{k.summary}</p>
              </div>
            ))}
            {(!profile.knowledge_updates || profile.knowledge_updates.length === 0) && (
              <p className="text-slate-500 text-xs font-light">No explicit knowledge captured yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT WIDE COLUMN */}
      <div className="lg:col-span-4 flex flex-col gap-6">

        {/* STRATEGIC GAUGE CARD */}
        <div className="glass-layer rounded-[24px] p-6 h-full flex flex-col gap-8 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-white text-sm font-bold tracking-widest uppercase opacity-90">Strategic State</h3>
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase">Fresh</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-2 relative z-10">
            <div className="relative size-48">
              <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="gradientPage" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6"></stop>
                    <stop offset="100%" stopColor="#22d3ee"></stop>
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" fill="none" opacity="0.3" r="42" stroke="#1e293b" strokeWidth="6"></circle>
                <circle className="gauge-value" cx="50" cy="50" fill="none" r="42" strokeDasharray="0 263" strokeDashoffset="0" strokeWidth="6" stroke="url(#gradientPage)"></circle>
                <g className="opacity-20">
                  <line stroke="white" strokeWidth="1" transform="rotate(0 50 50)" x1="50" x2="50" y1="5" y2="10"></line>
                  <line stroke="white" strokeWidth="1" transform="rotate(90 50 50)" x1="50" x2="50" y1="5" y2="10"></line>
                  <line stroke="white" strokeWidth="1" transform="rotate(180 50 50)" x1="50" x2="50" y1="5" y2="10"></line>
                  <line stroke="white" strokeWidth="1" transform="rotate(270 50 50)" x1="50" x2="50" y1="5" y2="10"></line>
                </g>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-light text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {profile.projects?.length ? profile.projects.length * 10 + 40 : 100}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">Focus</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-5 rounded-xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent hover:border-amber-400/30 hover:from-amber-400/[0.05] transition-all group cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">stars</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-amber-200 transition-colors">North Star</span>
              </div>
              <p className="text-slate-200 text-sm font-light leading-relaxed">
                {profile.strategic_direction?.north_star || "Define long term vision."}
              </p>
            </div>
            <div className="p-5 rounded-xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent hover:border-primary/30 hover:from-primary/[0.05] transition-all group cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-sm drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">center_focus_strong</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-200 transition-colors">Current Focus</span>
              </div>
              <p className="text-slate-200 text-sm font-light leading-relaxed">
                {profile.strategic_direction?.current_focus || "No immediate focus set."}
              </p>
            </div>
          </div>

          {/* RISKS AND SHIFTS INSIDE THE TRAY */}
          <div className="grid grid-cols-1 gap-4 mt-2 relative z-10">
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-4 hover:bg-red-500/[0.04] transition-colors">
              <h4 className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-3 flex items-center gap-2 opacity-80">
                <span className="material-symbols-outlined text-sm">warning</span>
                Risks & Unknowns
              </h4>
              <ul className="space-y-3">
                {profile.risks_unknowns?.map((r: any, i: number) => (
                  <li key={i} className="flex flex-col gap-1">
                    <div className="flex items-start gap-3">
                      <div className="mt-1.5 size-1 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444] shrink-0"></div>
                      <span className="text-xs text-slate-300 font-medium leading-normal">{r.risk}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-light pl-4 leading-normal mt-0.5">{r.mitigation}</span>
                  </li>
                ))}
                {(!profile.risks_unknowns || profile.risks_unknowns.length === 0) && (
                  <li className="text-xs text-slate-500 font-light">No critical risks logged.</li>
                )}
              </ul>
            </div>

            {/* COMMS PREFERENCES (Custom add mapping HTML to data) */}
            <div className="rounded-xl border border-accent-purple/20 bg-accent-purple/[0.02] p-4 hover:bg-accent-purple/[0.04] transition-colors">
              <h4 className="text-accent-purple text-[10px] font-bold tracking-widest uppercase mb-3 flex items-center gap-2 opacity-80">
                <span className="material-symbols-outlined text-sm">edit_note</span>
                Comms & Restrictions
              </h4>
              <div className="space-y-2">
                {profile.communication_style?.preferences_do?.slice(0, 3).map((p: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400 border-b border-white/5 pb-1">
                    <span className="text-emerald-500">✓</span> {p}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
