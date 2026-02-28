"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import Link from "next/link";

export default function DashboardPage() {
  const { activeProjectId } = useProject();
  const { userProfile, updateProfile, isConfigured } = useUserProfile();

  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile${activeProjectId ? `?projectId=${activeProjectId}` : ""}`);
      const json = await res.json();
      setData(json);
      if (json.snapshot?.profile_json) {
        try { setProfile(JSON.parse(json.snapshot.profile_json)); } catch { }
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.error("Failed to load dashboard", e);
    }
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
    if (s.includes("risk") || s.includes("dormant") || s.includes("critical") || s.includes("attention"))
      return { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400", border: "border-amber-100" };
    if (s.includes("pending") || s.includes("idea"))
      return { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400", border: "border-blue-100" };
    return { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", border: "border-emerald-100" };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 md:p-20">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-2xl text-primary">sync</span>
          </div>
          <p className="font-medium text-sm text-text-secondary">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isConfigured && !profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 h-full">
        <div className="soft-card p-8 md:p-10 flex flex-col items-center text-center max-w-md border-dashed border-slate-200">
          <div className="size-16 rounded-2xl bg-primary-soft flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl text-primary">tune</span>
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">Configura tu perfil</h3>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">Empieza configurando tu nombre y datos básicos, y luego sube fuentes para generar tu perfil cognitivo.</p>
          <div className="flex gap-3">
            <Link href="/settings" className="btn-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-base">settings</span>
              Configurar
            </Link>
            <Link href="/sources/add" className="btn-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-base">add</span>
              Añadir Fuente
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-in fade-in duration-700">

      {/* LEFT COLUMN */}
      <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">

        {/* ═══ IDENTITY HERO ═══ */}
        <div className="soft-card p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-60 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative z-10">
            {/* AVATAR */}
            <div
              className="relative size-24 sm:size-32 shrink-0 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Cambiar foto"
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <div className="absolute inset-0 rounded-full bg-blue-100 animate-pulse opacity-30" />
              <div className="size-full rounded-full relative overflow-hidden border-4 border-white shadow-soft-xl">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-slate-400">person</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
              </div>
              <div className="absolute bottom-1 right-1 size-5 bg-emerald-500 border-4 border-white rounded-full" />
            </div>

            {/* BIO */}
            <div className="flex-1 text-center sm:text-left pt-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">{displayName}</h1>
                {displayTitle && (
                  <span className="px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold tracking-wide uppercase border border-blue-100 self-center sm:self-auto">
                    {displayTitle}
                  </span>
                )}
              </div>
              {displayLocation && (
                <div className="flex items-center gap-1.5 justify-center sm:justify-start mb-3">
                  <span className="material-symbols-outlined text-slate-400 text-sm">location_on</span>
                  <span className="text-sm text-text-secondary">{displayLocation}</span>
                </div>
              )}
              <p className="text-text-secondary text-sm sm:text-base mb-5 max-w-lg leading-relaxed">
                {profile?.identity_snapshot?.summary || userProfile.bio || "Añade fuentes de contexto para generar tu perfil."}
              </p>

              {/* QUICK TAGS */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                {profile?.communication_style?.tone && (
                  <div className="px-3 sm:px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-sm font-medium text-text-main hover:bg-white hover:shadow-sm transition-all cursor-default">
                    <span className="material-symbols-outlined text-purple-500 text-lg">psychology</span>
                    <span className="capitalize">{profile.communication_style.tone}</span>
                  </div>
                )}
                {profile?.projects?.length > 0 && (
                  <div className="px-3 sm:px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-sm font-medium text-text-main hover:bg-white hover:shadow-sm transition-all cursor-default">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">rocket_launch</span>
                    {profile.projects.length} proyecto{profile.projects.length !== 1 ? "s" : ""}
                  </div>
                )}
                {profile?.leads_pipeline?.length > 0 && (
                  <div className="px-3 sm:px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-sm font-medium text-text-main hover:bg-white hover:shadow-sm transition-all cursor-default">
                    <span className="material-symbols-outlined text-cyan-500 text-lg">group</span>
                    {profile.leads_pipeline.length} lead{profile.leads_pipeline.length !== 1 ? "s" : ""}
                  </div>
                )}
                <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1.5 text-xs">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 font-bold uppercase text-[10px] tracking-wide">{data?.snapshot?.version_label || "Synced"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SKILLS & STRENGTHS */}
        {(profile?.identity_snapshot?.strengths?.length > 0 || profile?.identity_snapshot?.tools?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {profile.identity_snapshot.strengths?.length > 0 && (
              <div className="soft-card p-5 sm:p-6">
                <h3 className="text-text-secondary text-[11px] uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-base">star</span>
                  Fortalezas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.identity_snapshot.strengths.map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.identity_snapshot.tools?.length > 0 && (
              <div className="soft-card p-5 sm:p-6">
                <h3 className="text-text-secondary text-[11px] uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-500 text-base">build</span>
                  Herramientas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.identity_snapshot.tools.map((t: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-100">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROJECTS */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
            <h3 className="text-text-main text-lg font-bold tracking-tight">Proyectos Activos</h3>
            <span className="text-sm text-text-secondary font-medium">{profile?.projects?.length || 0} proyectos</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {profile?.projects?.map((p: any, i: number) => {
              const c = getStatusColor(p.status);
              return (
                <div key={i} className="soft-card p-5 sm:p-6 flex flex-col cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base sm:text-lg font-bold text-text-main group-hover:text-primary transition-colors">{p.name}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded ${c.bg} ${c.text} ${c.border} border`}>{p.status}</span>
                  </div>
                  {p.current_focus && (
                    <p className="text-sm text-text-secondary mb-3 leading-relaxed">{p.current_focus}</p>
                  )}
                  {p.goals?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.goals.slice(0, 3).map((g: string, gi: number) => (
                        <span key={gi} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-text-secondary border border-slate-100 font-medium">{g}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`size-2 rounded-full ${c.dot}`} />
                      <span className="text-xs text-text-secondary font-medium capitalize">{p.status}</span>
                    </div>
                    <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-slate-400">
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!profile?.projects || profile.projects.length === 0) && (
              <div className="col-span-full soft-card p-8 text-center">
                <p className="text-text-secondary text-sm">No se han detectado proyectos aún.</p>
              </div>
            )}
          </div>
        </div>

        {/* PIPELINE + DECISIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* PIPELINE */}
          <div className="soft-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-text-secondary text-sm font-bold tracking-wide uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500 text-lg">filter_alt</span>
                Pipeline Intel
              </h3>
            </div>
            <div className="space-y-5">
              {profile?.leads_pipeline?.slice(0, 5).map((l: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-2 items-end">
                    <span className="text-text-main font-semibold">{l.name || l.name_or_company}
                      {l.company && <span className="text-slate-400 font-normal ml-1">{l.company}</span>}
                    </span>
                    <span className="text-purple-600 font-bold text-sm bg-purple-50 px-2 py-0.5 rounded">{l.stage}</span>
                  </div>
                  {l.next_action && (
                    <p className="text-[11px] text-text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[11px]">arrow_forward</span>{l.next_action}
                    </p>
                  )}
                </div>
              ))}
              {(!profile?.leads_pipeline || profile.leads_pipeline.length === 0) && (
                <p className="text-text-secondary text-xs text-center py-4">Sin leads registrados.</p>
              )}
            </div>
          </div>

          {/* DECISIONS */}
          <div className="soft-card p-5 sm:p-6 bg-slate-50/50">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-text-secondary text-sm font-bold tracking-wide uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-lg">history_edu</span>
                Decision Log
              </h3>
            </div>
            <div className="relative pl-4 border-l-2 border-slate-200 space-y-5">
              {profile?.recent_decisions?.slice(0, 5).map((d: any, i: number) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[21px] top-1 size-2.5 rounded-full bg-white border-2 ${i === 0 ? "border-blue-500" : "border-slate-300"} shadow-sm`} />
                  <h4 className="text-text-main text-sm font-semibold mb-0.5">{d.decision}</h4>
                  {d.rationale && <p className="text-slate-500 text-xs leading-relaxed">{d.rationale}</p>}
                </div>
              ))}
              {(!profile?.recent_decisions || profile.recent_decisions.length === 0) && (
                <p className="text-text-secondary text-xs text-center py-4">Sin decisiones registradas.</p>
              )}
            </div>
          </div>
        </div>

        {/* KNOWLEDGE TIMELINE */}
        <div className="soft-card p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-50/50 blur-[80px] rounded-full pointer-events-none" />
          <h3 className="text-text-secondary text-[11px] uppercase tracking-widest font-bold mb-5 flex items-center gap-2 pb-3 border-b border-slate-100 relative z-10">
            <span className="material-symbols-outlined text-cyan-500 text-base">school</span>
            Conocimiento Adquirido
          </h3>
          <div className="relative pl-5 border-l-2 border-slate-100 space-y-5 z-10">
            {profile?.knowledge_updates?.map((k: any, i: number) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[23px] top-1 size-2.5 rounded-full bg-white border-2 border-slate-300 group-hover:border-cyan-500 transition-all" />
                <h4 className="text-sm text-text-main font-semibold group-hover:text-cyan-600 transition-colors mb-0.5">{k.topic}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{k.summary}</p>
                {k.implications && <p className="text-[10px] text-slate-400 mt-1 italic">{k.implications}</p>}
              </div>
            ))}
            {(!profile?.knowledge_updates || profile.knowledge_updates.length === 0) && (
              <p className="text-text-secondary text-xs">No se ha capturado conocimiento explícito aún.</p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-4 flex flex-col gap-6">

        {/* STRATEGIC DIRECTION */}
        <div className="soft-card p-5 sm:p-6 relative overflow-hidden border-t-4 border-t-primary shadow-soft-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-text-main text-base font-bold tracking-tight">Strategic Pulse</h3>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Live</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-amber-100 rounded text-amber-600">
                  <span className="material-symbols-outlined text-sm block">stars</span>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">North Star</span>
              </div>
              <p className="text-text-main text-sm font-medium leading-relaxed">
                {profile?.strategic_direction?.north_star || "Visión a largo plazo por definir."}
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-blue-100 rounded text-blue-600">
                  <span className="material-symbols-outlined text-sm block">center_focus_strong</span>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Foco Actual</span>
              </div>
              <p className="text-text-main text-sm font-medium leading-relaxed">
                {profile?.strategic_direction?.current_focus || "Sin foco inmediato definido."}
              </p>
            </div>
            {profile?.strategic_direction?.why_now && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-indigo-100 rounded text-indigo-600">
                    <span className="material-symbols-outlined text-sm block">bolt</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Por qué ahora</span>
                </div>
                <p className="text-text-main text-sm font-medium leading-relaxed">{profile.strategic_direction.why_now}</p>
              </div>
            )}
          </div>
        </div>

        {/* RISKS */}
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 sm:p-6">
          <h3 className="text-red-800 text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            Riesgos e Incógnitas
          </h3>
          <ul className="space-y-3">
            {profile?.risks_unknowns?.map((r: any, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 size-1.5 rounded-full bg-red-400 shrink-0" />
                <div>
                  <span className="text-xs text-slate-700 font-medium leading-normal block">{r.risk}</span>
                  {r.mitigation && <span className="text-[10px] text-slate-500 leading-normal block mt-0.5">{r.mitigation}</span>}
                </div>
              </li>
            ))}
            {(!profile?.risks_unknowns || profile.risks_unknowns.length === 0) && (
              <li className="text-xs text-slate-500 py-2">Sin riesgos críticos registrados.</li>
            )}
          </ul>
        </div>

        {/* COMMUNICATION STYLE */}
        <div className="soft-card p-5 sm:p-6">
          <h3 className="text-purple-700 text-[11px] uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">edit_note</span>
            Estilo de Comunicación
          </h3>
          {profile?.communication_style?.tone && (
            <div className="mb-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tono</span>
              <p className="text-sm text-text-main font-semibold capitalize">{profile.communication_style.tone}</p>
            </div>
          )}
          <div className="space-y-2">
            {profile?.communication_style?.preferences_do?.slice(0, 4).map((p: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                <span className="text-emerald-500 shrink-0 mt-0.5 font-bold">✓</span>
                <span className="leading-relaxed">{p}</span>
              </div>
            ))}
            {profile?.communication_style?.avoid?.slice(0, 3).map((p: string, i: number) => (
              <div key={`a-${i}`} className="flex items-start gap-2 text-xs text-text-secondary">
                <span className="text-red-400 shrink-0 mt-0.5 font-bold">✗</span>
                <span className="leading-relaxed">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="soft-card p-5 sm:p-6">
          <h3 className="text-text-secondary text-[11px] uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-slate-400">link</span>
            Acciones Rápidas
          </h3>
          <div className="flex flex-col gap-1.5">
            <Link href="/sources/add" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <span className="material-symbols-outlined text-primary text-lg group-hover:scale-110 transition-transform">add_circle</span>
              <span className="text-sm text-text-main font-medium group-hover:text-primary transition-colors">Añadir nueva fuente</span>
            </Link>
            <Link href="/chat" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <span className="material-symbols-outlined text-cyan-500 text-lg group-hover:scale-110 transition-transform">chat</span>
              <span className="text-sm text-text-main font-medium group-hover:text-cyan-600 transition-colors">Consultar motor</span>
            </Link>
            <Link href="/packs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <span className="material-symbols-outlined text-purple-500 text-lg group-hover:scale-110 transition-transform">share</span>
              <span className="text-sm text-text-main font-medium group-hover:text-purple-600 transition-colors">Exportar contexto</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <span className="material-symbols-outlined text-slate-400 text-lg group-hover:scale-110 transition-transform">settings</span>
              <span className="text-sm text-text-main font-medium group-hover:text-slate-600 transition-colors">Configuración</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
