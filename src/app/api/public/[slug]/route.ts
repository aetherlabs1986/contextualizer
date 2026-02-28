import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    try {
        const slug = params.slug;

        // Find the default user and their current profile snapshot
        const user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Get the current global profile snapshot
        const snapshot = await prisma.profile_snapshots.findFirst({
            where: {
                user_id: user.id,
                is_current: true,
                project_id: null // Global profile
            }
        });

        if (!snapshot) return NextResponse.json({ error: "No profile found" }, { status: 404 });

        let profile: any;
        try { profile = JSON.parse(snapshot.profile_json); } catch { }

        // Fetch all sources for raw context
        const sources = await prisma.sources.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: "asc" }
        });

        let text = "";

        // 1. Synthesized profile
        text += `=== PERFIL Y ESTRATEGIA SINTETIZADA ===\n\n`;
        if (profile) {
            text += `IDENTIDAD:\n${profile.identity_snapshot?.summary || "N/A"}\n\n`;

            if (profile.identity_snapshot?.strengths?.length > 0) {
                text += `FORTALEZAS:\n${profile.identity_snapshot.strengths.join(", ")}\n\n`;
            }
            if (profile.identity_snapshot?.tools?.length > 0) {
                text += `HERRAMIENTAS:\n${profile.identity_snapshot.tools.join(", ")}\n\n`;
            }

            text += `DIRECCIÓN ESTRATÉGICA:\nNorth Star: ${profile.strategic_direction?.north_star || "N/A"}\nFoco actual: ${profile.strategic_direction?.current_focus || "N/A"}\n`;
            if (profile.strategic_direction?.why_now) {
                text += `Por qué ahora: ${profile.strategic_direction.why_now}\n`;
            }
            text += `\n`;

            text += `PROYECTOS:\n${profile.projects?.map((p: any) => `- ${p.name}: ${p.status}. Foco: ${p.current_focus}${p.goals?.length > 0 ? `. Objetivos: ${p.goals.join(", ")}` : ""}`).join('\n') || "N/A"}\n\n`;
            text += `LEADS:\n${profile.leads_pipeline?.map((l: any) => `- ${l.name || l.name_or_company} (${l.stage})${l.next_action ? ` → ${l.next_action}` : ""}`).join('\n') || "N/A"}\n\n`;
            text += `DECISIONES RECIENTES:\n${profile.recent_decisions?.map((d: any) => `- ${d.decision}${d.rationale ? `: ${d.rationale}` : ""}`).join('\n') || "N/A"}\n\n`;
            text += `CONOCIMIENTO:\n${profile.knowledge_updates?.map((k: any) => `- ${k.topic}: ${k.summary || ""}${k.implications ? ` (${k.implications})` : ""}`).join('\n') || "N/A"}\n\n`;
            text += `RIESGOS:\n${profile.risks_unknowns?.map((r: any) => `- ${r.risk}${r.mitigation ? ` → ${r.mitigation}` : ""}`).join('\n') || "N/A"}\n\n`;
            text += `COMUNICACIÓN:\nTono: ${profile.communication_style?.tone || "N/A"}\n`;
            if (profile.communication_style?.preferences_do?.length > 0) {
                text += `Hacer: ${profile.communication_style.preferences_do.join("; ")}\n`;
            }
            if (profile.communication_style?.avoid?.length > 0) {
                text += `Evitar: ${profile.communication_style.avoid.join("; ")}\n`;
            }
        }

        // 2. Raw sources
        text += `\n=== DATOS COMPLETOS DE CONTEXTO (SOURCES) ===\n\n`;
        if (sources.length === 0) {
            text += `No hay fuentes de datos subidas.`;
        } else {
            sources.forEach((src, idx) => {
                text += `--- FUENTE ${idx + 1}: ${src.title} [Tipo: ${src.source_type}] ---\n`;
                const contentText = src.transcript_text || src.extracted_text || src.raw_text || "Sin contenido disponible.";
                text += `${contentText}\n\n`;
            });
        }

        text += `\n---\nÚltima actualización: ${new Date(snapshot.created_at).toLocaleString()}`;
        text += `\nInstrucción para la IA: Lee todo el contexto anterior detalladamente. Usa el Perfil Sintetizado para entender mis preferencias, y los Datos Completos para buscar información en crudo si te pregunto por un dato en particular.`;

        return NextResponse.json({
            text: text.trim(),
            name: profile?.identity_snapshot?.summary?.split(".")[0] || "Context Pack",
            updatedAt: snapshot.created_at,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
