import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { token: string } }) {
    try {
        const token = params.token;
        const link = await prisma.shared_links.findUnique({
            where: { token: token }
        });

        if (!link) return NextResponse.json({ error: "Enlace no encontrado o expirado" }, { status: 404 });

        const snapshot = await prisma.profile_snapshots.findUnique({
            where: { id: link.context_pack_id }
        });

        if (!snapshot) return NextResponse.json({ error: "Contexto no encontrado" }, { status: 404 });

        let profile: any;
        try { profile = JSON.parse(snapshot.profile_json); } catch { }

        // Fetch RAW sources
        const sources = await prisma.sources.findMany({
            where: {
                user_id: snapshot.user_id,
                ...(link.project_id ? { project_id: link.project_id } : {})
            },
            orderBy: { created_at: "asc" }
        });

        let text = "";

        // 1. Add Summary Profile Information
        text += `=== PERFIL Y ESTRATEGIA SINTETIZADA ===\n\n`;
        if (profile) {
            if (link.pack_type === "full" || link.pack_type === "quick" || link.pack_type === "current") {
                text += `IDENTIDAD:\n${profile.identity_snapshot?.summary || "N/A"}\n\n`;
                text += `DIRECCIÓN ESTRATÉGICA:\n${profile.strategic_direction?.north_star || profile.strategic_direction?.current_focus || "N/A"}\n\n`;
                text += `PREFERENCIAS DE COMUNICACIÓN:\nTono: ${profile.communication_style?.tone || "N/A"}\n\n`;
                text += `PROYECTOS ACTIVOS:\n${profile.projects?.map((p: any) => `- ${p.name}: ${p.status}. Foco: ${p.current_focus}`).join('\n') || "N/A"}\n\n`;
            }
        }

        // 2. Dump all raw text from sources
        text += `\n=== DATOS COMPLETOS DE CONTEXTO (SOURCES) ===\n\n`;
        if (sources.length === 0) {
            text += `No hay fuentes de datos subidas.`;
        } else {
            sources.forEach((src, idx) => {
                text += `--- FUENTE ${idx + 1}: ${src.title} [Tipo: ${src.source_type}] ---\n`;

                // Get the richest text available
                const contentText = src.transcript_text || src.extracted_text || src.raw_text || "Sin contenido disponible.";
                text += `${contentText}\n\n`;
            });
        }

        text += `\n---\nÚltima actualización: ${new Date().toLocaleString()}`;
        text += `\nInstrucción para la IA: Lee todo el contexto anterior detalladamente. Usa el Perfil Sintetizado para entender mis preferencias, y los Datos Completos para buscar información en crudo si te pregunto por un dato en particular.`;

        return NextResponse.json({ text: text.trim() });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
