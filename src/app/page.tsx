"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { getDashboardData } from "./actions";
import Link from "next/link";

export default function DashboardPage() {
  const { activeProjectId } = useProject();
  const { userProfile, updateProfile, isConfigured } = useUserProfile();

  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dashboardMeta, setDashboardMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { updateProfile({ avatarUrl: reader.result as string }); };
    reader.readAsDataURL(file);
  };

  const displayName = userProfile.name || "Mi Perfil";
  const displayTitle = userProfile.title || "";
  const displayLocation = userProfile.location || "";

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("risk") || s.includes("dormant") || s.includes("critical")) return { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400", border: "border-amber-500/20", glow: "shadow-[0_0_8px_#f59e0b]" };
    if (s.includes("pending") || s.includes("idea")) return { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400", border: "border-blue-500/20", glow: "shadow-[0_0_8px_#3b82f6]" };
    return { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400", border: "border-emerald-500/20", glow: "shadow-[0_0_8px_#10b981]" };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 md:p-20 opacity-50">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">data_usage</span>
          <p className="font-mono text-xs tracking-widest uppercase text-slate-500">Initializing OS...</p>
        </div>
      </div>
    );
  }

  // Prompt to configure if no name set
  if (!isConfigured && !profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 h-full">
        <div className="glass-layer p-8 md:p-10 rounded-[24px] flex flex-col items-center text-center max-w-md border-dashed border-white/20">
          <span className="material-symbols-outlined text-6xl text-primary mb-6 drop-shadow-md">tune</span>
          <h3 className="text-xl font-light text-white mb-2">Configura tu perfil</h3>
          <p className="text-sm text-slate-400 font-light mb-6 leading-relaxed">Empieza configurando tu nombre y datos básicos, y luego sube fuentes para generar tu perfil cognitivo.</p>
          <div className="flex gap-3">
            <Link href="/settings" className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition flex items-center gap-2">
              <span className="material-symbols-outlined text-base">settings</span>
              Configurar
            </Link>
            <Link href="/sources/add" className="px-5 py-2.5 rounded-lg text-sm font-medium border border-white/10 text-slate-300 hover:bg-white/5 transition flex items-center gap-2">
              <span className="material-symbols-outlined text-base">add</span>
              Añadir Fuente
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700">

      {/* ═══ IDENTITY HERO ═══ */}
      <div className="glass-layer rounded-2xl md:rounded-[24px] p-5 md:p-8 relative overflow-hidden group">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/20 via-transparent to-transparent blur-[100px]"></div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-8 relative z-10">
          {/* AVATAR */}
          <div
            className="relative size-24 md:size-32 shrink-0 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            title="Cambiar foto"
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 to-accent-cyan/30 blur-2xl animate-pulse"></div>
            <div className="size-full rounded-full relative overflow-hidden border-2 border-white/20">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="size-full object-cover" />
              ) : (
                <div className="size-full bg-white/[0.03] flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl md:text-4xl text-white/60">person</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
            </div>
            <div className="absolute bottom-0 right-0">
              <div className="size-3 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981] ring-2 ring-[#0a0b0d]"></div>
            </div>
          </div>

          {/* BIO */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
              <h1 className="text-2xl md:text-4xl font-light text-white tracking-[-0.03em]">{displayName}</h1>
              {displayTitle && <span className="text-xs md:text-sm text-slate-400 font-light">{displayTitle}</span>}
            </div>
            {displayLocation && (
              <div className="flex items-center gap-1.5 justify-center sm:justify-start mb-3">
                <span className="material-symbols-outlined text-slate-500 text-sm">location_on</span>
                <span className="text-xs text-slate-500">{displayLocation}</span>
              </div>
            )}
            <p className="text-slate-400 font-light text-sm md:text-base mb-5 max-w-xl leading-relaxed">
              {profile?.identity_snapshot?.summary || userProfile.bio || "Añade fuentes de contexto para generar tu perfil."}
            </p>

            {/* QUICK STATS */}
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center sm:justify-start">
              {profile?.communication_style?.tone && (
                <div className="px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] flex items-center gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-primary text-sm">record_voice_over</span>
                  <span className="text-slate-300 capitalize">{profile.communication_style.tone}</span>
                </div>
              )}
              {profile?.projects?.length > 0 && (
                <div className="px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] flex items-center gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">rocket_launch</span>
                  <span className="text-slate-300">{profile.projects.length} proyecto{profile.projects.length !== 1 ? "s" : ""}</span>
                </div>
              )}
              {profile?.leads_pipeline?.length > 0 && (
                <div className="px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] flex items-center gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-accent-purple text-sm">group</span>
                  <span className="text-slate-300">{profile.leads_pipeline.length} lead{profile.leads_pipeline.length !== 1 ? "s" : ""}</span>
                </div>
              )}
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-xs">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span>
                <span className="text-emerald-400 font-mono uppercase text-[10px]">{data?.snapshot?.version_label || "Synced"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">

          {/* SKILLS & STRENGTHS */}
          {(profile?.identity_snapshot?.strengths?.length > 0 || profile?.identity_snapshot?.tools?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {profile.identity_snapshot.strengths?.length > 0 && (
                <div className="glass-layer rounded-2xl p-5">
                  <h3 className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-base">star</span>
                    Fortalezas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.identity_snapshot.strengths.map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/15">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.identity_snapshot.tools?.length > 0 && (
                <div className="glass-layer rounded-2xl p-5">
                  <h3 className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-cyan text-base">build</span>
                    Herramientas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.identity_snapshot.tools.map((t: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-accent-cyan/10 text-cyan-300 border border-cyan-500/15">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROJECTS */}
          <div className="glass-layer rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.03] pb-3">
              <h3 className="text-[11px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-base">rocket_launch</span>
                Proyectos Activos
              </h3>
              <span className="text-[10px] text-slate-600 font-mono">{profile?.projects?.length || 0}</span>
            </div>
            <div className="space-y-2">
              {profile?.projects?.map((p: any, i: number) => {
                const c = getStatusColor(p.status);
                return (
                  <div key={i} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer">
                    <div className={`size-2 rounded-full ${c.dot} ${c.glow} mt-2 shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">{p.name}</p>
                        <span className={`text-[9px] font-mono uppercase ${c.bg} ${c.text} px-1.5 py-0.5 rounded ${c.border} border shrink-0`}>{p.status}</span>
                      </div>
                      {p.current_focus && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{p.current_focus}</p>}
                      {p.goals?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.goals.slice(0, 3).map((g: string, gi: number) => (
                            <span key={gi} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-400 border border-white/5">{g}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!profile?.projects || profile.projects.length === 0) && (
                <p className="text-slate-500 text-sm font-light text-center py-6">No se han detectado proyectos aún.</p>
              )}
            </div>
          </div>

          {/* PIPELINE + DECISIONS row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* PIPELINE */}
            <div className="glass-layer rounded-2xl p-5">
              <h3 className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-4 flex items-center gap-2 pb-3 border-b border-white/[0.03]">
                <span className="material-symbols-outlined text-accent-purple text-base">filter_alt</span>
                Pipeline de Leads
              </h3>
              <div className="space-y-3">
                {profile?.leads_pipeline?.slice(0, 5).map((l: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className="flex justify-between text-xs mb-1 items-center">
                      <span className="text-slate-200 font-medium truncate">{l.name || l.name_or_company}</span>
                      <span className="text-[9px] uppercase tracking-wider text-accent-purple bg-accent-purple/10 px-1.5 py-0.5 rounded border border-accent-purple/20 shrink-0 ml-2">{l.stage}</span>
                    </div>
                    {l.company && <p className="text-[10px] text-slate-500">{l.company}</p>}
                    {l.next_action && <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">arrow_forward</span>{l.next_action}</p>}
                  </div>
                ))}
                {(!profile?.leads_pipeline || profile.leads_pipeline.length === 0) && (
                  <p className="text-slate-500 text-xs font-light text-center py-4">Sin leads registrados.</p>
                )}
              </div>
            </div>

            {/* RECENT DECISIONS */}
            <div className="glass-layer rounded-2xl p-5">
              <h3 className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-4 flex items-center gap-2 pb-3 border-b border-white/[0.03]">
                <span className="material-symbols-outlined text-primary text-base">gavel</span>
                Decisiones Recientes
              </h3>
              <div className="space-y-3">
                {profile?.recent_decisions?.slice(0, 5).map((d: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <p className="text-xs text-slate-200 font-medium mb-0.5">{d.decision}</p>
                    {d.rationale && <p className="text-[10px] text-slate-500 leading-relaxed">{d.rationale}</p>}
                  </div>
                ))}
                {(!profile?.recent_decisions || profile.recent_decisions.length === 0) && (
                  <p className="text-slate-500 text-xs font-light text-center py-4">Sin decisiones registradas.</p>
                )}
              </div>
            </div>
          </div>

          {/* KNOWLEDGE TIMELINE */}
          <div className="glass-layer rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-cyan/5 blur-[80px] rounded-full pointer-events-none"></div>
            <h3 className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-5 flex items-center gap-2 pb-3 border-b border-white/[0.03] relative z-10">
              <span className="material-symbols-outlined text-accent-cyan text-base">school</span>
              Conocimiento Adquirido
            </h3>
            <div className="relative pl-5 border-l border-white/5 space-y-5 z-10">
              {profile?.knowledge_updates?.map((k: any, i: number) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-[23px] top-1 size-2.5 rounded-full bg-[#0a0b0d] border border-slate-600 group-hover:border-accent-cyan group-hover:shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all"></div>
                  <h4 className="text-sm text-slate-200 font-medium group-hover:text-accent-cyan transition-colors mb-0.5">{k.topic}</h4>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">{k.summary}</p>
                  {k.implications && <p className="text-[10px] text-slate-500 mt-1 italic">{k.implications}</p>}
                </div>
              ))}
              {(!profile?.knowledge_updates || profile.knowledge_updates.length === 0) && (
                <p className="text-slate-500 text-xs font-light">No se ha capturado conocimiento explícito aún.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* STRATEGIC DIRECTION */}
          <div className="glass-layer rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
            <h3 className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-4 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-primary text-base">explore</span>
              Dirección Estratégica
            </h3>

            <div className="flex flex-col gap-3 relative z-10">
              <div className="p-3.5 rounded-xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent hover:border-amber-400/30 transition-all">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-amber-400 text-sm">stars</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">North Star</span>
                </div>
                <p className="text-slate-200 text-xs font-light leading-relaxed">
                  {profile?.strategic_direction?.north_star || "Visión a largo plazo por definir."}
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent hover:border-primary/30 transition-all">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-primary text-sm">center_focus_strong</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Foco Actual</span>
                </div>
                <p className="text-slate-200 text-xs font-light leading-relaxed">
                  {profile?.strategic_direction?.current_focus || "Sin foco inmediato definido."}
                </p>
              </div>
              {profile?.strategic_direction?.why_now && (
                <div className="p-3.5 rounded-xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-accent-cyan text-sm">bolt</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Por qué ahora</span>
                  </div>
                  <p className="text-slate-200 text-xs font-light leading-relaxed">{profile.strategic_direction.why_now}</p>
                </div>
              )}
            </div>
          </div>

          {/* RISKS CARD */}
          <div className="glass-layer rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 blur-[60px] rounded-full pointer-events-none"></div>
            <h3 className="text-[11px] text-red-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-sm">warning</span>
              Riesgos e Incógnitas
            </h3>
            <ul className="space-y-2.5 relative z-10">
              {profile?.risks_unknowns?.map((r: any, i: number) => (
                <li key={i} className="p-2.5 rounded-lg border border-red-500/10 bg-red-500/[0.02]">
                  <div className="flex items-start gap-2">
                    <div className="mt-1.5 size-1 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444] shrink-0"></div>
                    <div>
                      <span className="text-xs text-slate-300 font-medium leading-normal block">{r.risk}</span>
                      {r.mitigation && <span className="text-[10px] text-slate-500 font-light leading-normal block mt-0.5">{r.mitigation}</span>}
                    </div>
                  </div>
                </li>
              ))}
              {(!profile?.risks_unknowns || profile.risks_unknowns.length === 0) && (
                <li className="text-xs text-slate-500 font-light py-2">Sin riesgos críticos registrados.</li>
              )}
            </ul>
          </div>

          {/* COMMUNICATION STYLE */}
          <div className="glass-layer rounded-2xl p-5">
            <h3 className="text-[11px] text-accent-purple uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Estilo de Comunicación
            </h3>
            {profile?.communication_style?.tone && (
              <div className="mb-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Tono</span>
                <p className="text-sm text-slate-200 capitalize">{profile.communication_style.tone}</p>
              </div>
            )}
            <div className="space-y-1.5">
              {profile?.communication_style?.preferences_do?.slice(0, 4).map((p: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-emerald-500 shrink-0 mt-0.5">&#10003;</span>
                  <span className="leading-relaxed">{p}</span>
                </div>
              ))}
              {profile?.communication_style?.avoid?.slice(0, 3).map((p: string, i: number) => (
                <div key={`a-${i}`} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-red-400 shrink-0 mt-0.5">&#10007;</span>
                  <span className="leading-relaxed">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="glass-layer rounded-2xl p-5">
            <h3 className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-slate-400">link</span>
              Acciones Rápidas
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/sources/add" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
                <span className="material-symbols-outlined text-primary text-base group-hover:scale-110 transition-transform">add_circle</span>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Añadir nueva fuente</span>
              </Link>
              <Link href="/chat" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
                <span className="material-symbols-outlined text-accent-cyan text-base group-hover:scale-110 transition-transform">chat</span>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Consultar motor</span>
              </Link>
              <Link href="/packs" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
                <span className="material-symbols-outlined text-accent-purple text-base group-hover:scale-110 transition-transform">share</span>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Exportar contexto</span>
              </Link>
              <Link href="/settings" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
                <span className="material-symbols-outlined text-slate-400 text-base group-hover:scale-110 transition-transform">settings</span>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Configuración</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
