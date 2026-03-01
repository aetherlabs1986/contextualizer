import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPromptTemplate, fillPrompt } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    try {
        const slug = params.slug;

        const user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const snapshot = await prisma.profile_snapshots.findFirst({
            where: {
                user_id: user.id,
                is_current: true,
                project_id: null
            }
        });

        if (!snapshot) return NextResponse.json({ error: "No profile found" }, { status: 404 });

        const sources = await prisma.sources.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: "asc" }
        });

        // Format RAW sources into an XML-like structure
        let rawSourcesText = "";
        sources.forEach((src) => {
            rawSourcesText += `<source id="${src.id}" type="${src.source_type}" timestamp="${src.created_at.toISOString()}">\n`;
            rawSourcesText += `<title>${src.title}</title>\n`;
            rawSourcesText += `<content>\n${src.transcript_text || src.extracted_text || src.raw_text || "No content."}\n</content>\n`;
            rawSourcesText += `</source>\n\n`;
        });

        // Generate the Super Prompt
        const template = await getPromptTemplate("PUBLIC_SYSTEM_PROMPT", user.id);
        const finalPrompt = fillPrompt(template, {
            profile_json: snapshot.profile_json,
            raw_sources: rawSourcesText
        });

        return NextResponse.json({
            text: finalPrompt.trim(),
            name: "Context Pack (Super Prompt)",
            updatedAt: snapshot.created_at,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
