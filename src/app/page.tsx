"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { getDashboardData } from "./actions"; // might still use this just for freshness dates
import {
  Activity, Target, BrainCircuit, Users, History,
  Download, Briefcase, Network, BookOpen, AlertCircle, FileText, CheckCircle2
} from "lucide-react";

export default function DashboardPage() {
  const { activeProjectId } = useProject();
  const { t } = useLanguage();

  const [data, setData] = useState<any>(null); // from /api/profile
  const [profile, setProfile] = useState<any>(null);
  const [dashboardMeta, setDashboardMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "json">("cards");

  const fetchData = async () => {
    setLoading(true);
    // 1. Fetch deep Profile
    const res = await fetch(`/api/profile${activeProjectId ? `?projectId=${activeProjectId}` : ""}`);
    const json = await res.json();
    setData(json);
    if (json.snapshot?.profile_json) {
      try { setProfile(JSON.parse(json.snapshot.profile_json)); } catch (e) { }
    } else {
      setProfile(null);
    }

    // 2. Fetch basic dashboard meta (for Last source added)
    const meta = await getDashboardData(activeProjectId);
    setDashboardMeta(meta);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeProjectId]);

  const handleRollback = async (id: string) => {
    await fetch("/api/profile/rollback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, projectId: activeProjectId })
    });
    fetchData();
  };

  if (loading) {
    return <div className="animate-pulse space-y-6 flex flex-col items-center justify-center p-20">
      <BrainCircuit className="w-12 h-12 text-accent animate-spin-slow mb-4" />
      <p className="text-xl font-medium">{t("dashboard.title")}...</p>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header & View Toggles */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent pb-1">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">{t("dashboard.subtitle")}</p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex bg-panel border-2 border-border rounded-lg p-0.5 shadow-sm">
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "cards" ? "bg-accent text-accent-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
              onClick={() => setViewMode("cards")}
            >Visual Mode</button>
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "json" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
              onClick={() => setViewMode("json")}
            >JSON (Dev)</button>
          </div>
        </div>
      </div>

      {/* Version History & Freshness Strip */}
      <div className="bg-card border-y border-border px-6 py-4 -mx-6 md:rounded-xl md:border md:mx-0 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-6">
          {data?.snapshot && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                {data.snapshot.version_label}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {formatDistanceToNow(new Date(data.snapshot.created_at), { addSuffix: true })}
              </span>
            </div>
          )}
          <div className="text-sm text-muted-foreground flex items-center gap-2 border-l border-border pl-6">
            <span className="opacity-70">{t("dashboard.last_source")}:</span>
            <span className="font-medium text-foreground">
              {dashboardMeta?.lastSourceDate ? formatDistanceToNow(new Date(dashboardMeta.lastSourceDate), { addSuffix: true }) : "Nunca"}
            </span>
          </div>
        </div>

        {data?.snapshot && (
          <div className="group relative">
            <button className="text-sm font-medium btn-secondary flex items-center gap-2 px-3 py-1.5 rounded-lg">
              <History className="w-4 h-4" /> Historial de Versiones
            </button>
            <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 p-2 max-h-80 overflow-y-auto">
              <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Versiones Anteriores</div>
              {data.history?.map((h: any) => (
                <div key={h.id} className="flex justify-between items-center p-3 hover:bg-secondary/50 rounded-lg text-sm gap-4 transition-colors border border-transparent hover:border-border">
                  <div>
                    <span className={`font-bold ${h.is_current ? 'text-accent' : 'text-foreground'}`}>{h.version_label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(h.created_at).toLocaleString()}</p>
                  </div>
                  {!h.is_current && (
                    <button onClick={() => handleRollback(h.id)} className="text-xs bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-2 py-1 rounded transition-colors">Revertir</button>
                  )}
                  {h.is_current && <CheckCircle2 className="w-4 h-4 text-accent" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {!profile ? (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-border rounded-2xl bg-card/30">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
            <BrainCircuit className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-bold mb-2">Aún no hay contexto</h3>
          <p className="text-muted-foreground text-center max-w-md">Para generar tu Perfil Global y Panel de Control, primero necesitas añadir notas de voz, chats o documentos en la pestaña de Fuentes.</p>
        </div>
      ) : viewMode === "json" ? (
        <div className="bg-[#0a0a0a] rounded-xl p-6 border border-border mt-6 relative group shadow-inner">
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(profile, null, 2))}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm"
          ><Download className="w-4 h-4" /> Copy JSON</button>
          <pre className="text-xs text-emerald-400 font-mono overflow-auto max-h-[70vh]">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

          {/* LEFT COLUMN (WIDER) */}
          <div className="lg:col-span-8 space-y-6">

            {/* IDENTIDAD GIGANTE */}
            <div className="bg-card rounded-2xl p-8 border border-border relative overflow-hidden group shadow-md hover:shadow-lg transition-all">
              <div className="absolute -top-10 -right-10 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                <Target className="w-64 h-64" />
              </div>
              <h2 className="text-sm font-bold text-accent uppercase tracking-widest flex items-center gap-2 mb-6 relative z-10">
                <Target className="w-4 h-4" /> Identidad y Dirección
              </h2>
              <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground relative z-10">
                {profile.identity_snapshot?.summary}
              </p>

              <div className="mt-8 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Foco Actual</h3>
                  <p className="text-sm font-medium">{profile.strategic_direction?.current_focus || "No definido"}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Estrella Polar (Norte)</h3>
                  <p className="text-sm text-foreground/80">{profile.strategic_direction?.north_star || "No definido"}</p>
                </div>
              </div>
            </div>

            {/* PROYECTOS ACTIVOS */}
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-6">
                <Briefcase className="w-4 h-4 text-blue-500" /> Proyectos Activos y Emprendimientos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.projects?.map((p: any, i: number) => (
                  <div key={i} className="border border-border rounded-xl p-5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-extrabold text-lg text-foreground group-hover:text-blue-500 transition-colors">{p.name}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-1 rounded-full">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">Foco: <span className="text-foreground">{p.current_focus}</span></p>
                  </div>
                ))}
                {(!profile.projects || profile.projects.length === 0) && (
                  <p className="text-muted-foreground italic col-span-2">No hay proyectos activos detectados.</p>
                )}
              </div>
            </div>

            {/* LOGROS Y CONOCIMIENTO */}
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-6">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Habilidades, Novedades y Logros
              </h2>
              <div className="space-y-4">
                {profile.knowledge_updates?.map((k: any, i: number) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-secondary/30">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <span className="font-bold block text-foreground">{k.topic}</span>
                      <span className="text-muted-foreground block mt-1 text-sm">{k.summary}</span>
                    </div>
                  </div>
                ))}
                {(!profile.knowledge_updates || profile.knowledge_updates.length === 0) && (
                  <p className="text-muted-foreground italic">No hay novedades registradas.</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (NARROWER) */}
          <div className="lg:col-span-4 space-y-6">

            {/* ESTILO Y PERSONALIDAD */}
            <div className="bg-card rounded-2xl p-6 border border-border relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-purple-500"></div>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-purple-500" /> Estilo y Personalidad
              </h2>
              <div className="mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Tono Principal</span>
                <span className="inline-block bg-purple-500/10 text-purple-500 font-medium px-3 py-1 rounded-md text-sm border border-purple-500/20">
                  {profile.communication_style?.tone || "Profesional y Directo"}
                </span>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <div>
                  <span className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-1 mb-2">DO (Hacer)</span>
                  <ul className="text-sm space-y-2 text-foreground/80">
                    {profile.communication_style?.preferences_do?.map((p: string, i: number) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-green-500 font-bold">✓</span> <span className="leading-tight">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 mb-2">DON'T (Evitar)</span>
                  <ul className="text-sm space-y-2 text-foreground/80">
                    {profile.communication_style?.avoid?.map((p: string, i: number) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-red-500 font-bold">✗</span> <span className="leading-tight">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* PIPELINE DE LEADS */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-5">
                <Network className="w-4 h-4 text-amber-500" /> Pipeline de Contactos
              </h2>
              <ul className="space-y-3">
                {profile.leads_pipeline?.map((l: any, i: number) => (
                  <li key={i} className="text-sm flex flex-col gap-2 p-3 bg-secondary/30 rounded-lg">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold leading-tight">{l.name} <span className="font-normal text-muted-foreground">{l.company ? `• ${l.company}` : ''}</span></span>
                      <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                        {l.stage}
                      </span>
                    </div>
                  </li>
                ))}
                {(!profile.leads_pipeline || profile.leads_pipeline.length === 0) && (
                  <p className="text-muted-foreground italic text-sm">No hay prospectos o contactos clave.</p>
                )}
              </ul>
            </div>

            {/* RIESGOS E INCÓGNITAS */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-rose-500" /> Riesgos / Incógnitas
              </h2>
              <ul className="space-y-4">
                {profile.risks_unknowns?.map((r: any, i: number) => (
                  <li key={i} className="text-sm border-l-4 border-rose-500 bg-rose-500/5 p-3 rounded-r-lg">
                    <span className="font-bold block text-foreground mb-1">{r.risk}</span>
                    <span className="text-muted-foreground block text-xs">Atenuación: <span className="text-foreground/80">{r.mitigation}</span></span>
                  </li>
                ))}
                {(!profile.risks_unknowns || profile.risks_unknowns.length === 0) && (
                  <p className="text-muted-foreground italic text-sm">Todo parece estar bajo control.</p>
                )}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
