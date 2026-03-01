import { prisma } from "./db";
import { generateEmbedding, generateJSON } from "./llm";
import { getPromptTemplate, fillPrompt } from "./prompts";

function chunkText(text: string, maxTokens: number = 900, overlap: number = 150): string[] {
    const chunkSize = maxTokens * 4;
    const overlapSize = overlap * 4;
    const chunks: string[] = [];

    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + chunkSize));
        i += chunkSize - overlapSize;
    }
    return chunks;
}

export async function processSource(sourceId: string) {
    try {
        await prisma.sources.update({
            where: { id: sourceId },
            data: { processing_status: "processing" }
        });

        const source = await prisma.sources.findUnique({ where: { id: sourceId } });
        if (!source || !source.extracted_text) throw new Error("Source not found or missing text");

        // Chunking & Embeddings
        const textChunks = chunkText(source.extracted_text);

        for (let i = 0; i < textChunks.length; i++) {
            const text = textChunks[i];
            const vector = await generateEmbedding(text);

            const chunkRecord = await prisma.chunks.create({
                data: {
                    user_id: source.user_id,
                    project_id: source.project_id,
                    source_id: source.id,
                    chunk_index: i,
                    chunk_text: text,
                    token_count: Math.floor(text.length / 4)
                }
            });

            await prisma.embeddings.create({
                data: {
                    user_id: source.user_id,
                    project_id: source.project_id,
                    source_id: source.id,
                    chunk_id: chunkRecord.id,
                    embedding_vector: JSON.stringify(vector)
                }
            });
        }

        // Insight Extraction (LLM)
        const extractTemplate = await getPromptTemplate("INSIGHT_EXTRACT_V1", source.user_id);
        const filledExtractPrompt = fillPrompt(extractTemplate, {
            source_id: source.id,
            project_tag: source.project_id || "global",
            today: new Date().toISOString(),
            source_title: source.title,
            source_date: source.created_at.toISOString(),
            source_type: source.source_type,
            extracted_text: source.extracted_text
        });

        const insightsJson = await generateJSON(filledExtractPrompt, "gemini-2.5-flash");

        // Save raw insights to DB
        const mapping: Record<string, string> = {
            identity_updates: "identity",
            strategic_vectors: "strategy",
            operational_fronts: "front",
            network: "network",
            decisions: "decision",
            knowledge_insights: "knowledge",
            friction_points: "friction",
            communication_rules: "communication"
        };

        for (const [key, type] of Object.entries(mapping)) {
            if (insightsJson[key] && Array.isArray(insightsJson[key])) {
                for (const item of insightsJson[key]) {
                    const title = item.name || item.entity || item.topic || item.decision || item.value || item.description || "Generated Insight";
                    await prisma.insights.create({
                        data: {
                            user_id: source.user_id,
                            project_id: source.project_id,
                            source_id: source.id,
                            insight_type: type,
                            title: String(title).substring(0, 100),
                            details: JSON.stringify(item),
                            entities_json: JSON.stringify(item.entities || {}),
                            date_inferred: item.date_inferred ? new Date(item.date_inferred) : null,
                            confidence: item.confidence || 0.8
                        }
                    });
                }
            }
        }

        // Profile Merge
        const lastProfile = await prisma.profile_snapshots.findFirst({
            where: { user_id: source.user_id, is_current: true, project_id: source.project_id },
            orderBy: { created_at: "desc" }
        });

        const previousProfileStr = lastProfile?.profile_json || JSON.stringify({
            identity: { summary: "", operating_principles: [], core_strengths: [] },
            strategy: { north_star: "", immediate_focus: "", why_now: "" },
            fronts: [],
            network: [],
            decisions: [],
            knowledge_base: [],
            friction: [],
            communication: { tone: "", do: [], dont: [] }
        });

        const mergeTemplate = await getPromptTemplate("PROFILE_MERGE_V1", source.user_id);
        const filledMergePrompt = fillPrompt(mergeTemplate, {
            today: new Date().toISOString(),
            source_id: source.id,
            previous_profile: previousProfileStr,
            new_insights: JSON.stringify(insightsJson, null, 2)
        });

        const mergedProfileJson = await generateJSON(filledMergePrompt, "gemini-2.5-pro");

        await prisma.profile_snapshots.updateMany({
            where: { user_id: source.user_id, project_id: source.project_id },
            data: { is_current: false }
        });

        const versionNum = lastProfile ? parseInt(lastProfile.version_label.replace("v", "")) + 1 : 1;

        // Save new profile
        await prisma.profile_snapshots.create({
            data: {
                user_id: source.user_id,
                project_id: source.project_id,
                profile_json: JSON.stringify(mergedProfileJson),
                profile_markdown: "Profile Snapshot v" + versionNum + "\n\n" + JSON.stringify(mergedProfileJson, null, 2),
                version_label: "v" + versionNum,
                created_from_sources_json: JSON.stringify([...(JSON.parse(lastProfile?.created_from_sources_json || "[]")), source.id]),
                is_current: true
            }
        });

        // Mark as done
        await prisma.sources.update({
            where: { id: sourceId },
            data: { processing_status: "done" }
        });

    } catch (error) {
        console.error("Pipeline Error:", error);
        await prisma.sources.update({
            where: { id: sourceId },
            data: {
                processing_status: "failed",
                processing_error: error instanceof Error ? error.message : "Unknown error"
            }
        });
    }
}
