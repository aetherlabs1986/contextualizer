import { prisma } from "./db";
import { generateEmbedding, generateJSON, generateText } from "./llm";
import { getPromptTemplate, fillPrompt } from "./prompts";

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function retrieveAndAnswer(question: string, projectId: string | null) {
    const user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
    if (!user) throw new Error("Unauthorized");

    const queryEmbedding = await generateEmbedding(question);

    const allEmbeddings = await prisma.embeddings.findMany({
        where: {
            user_id: user.id,
            ...(projectId ? { project_id: projectId } : {})
        },
        include: { chunk: true, source: true }
    });

    const scoredChunks = allEmbeddings.map((emb) => {
        const vector = JSON.parse(emb.embedding_vector) as number[];
        const score = cosineSimilarity(queryEmbedding, vector);
        return { ...emb, score };
    }).sort((a, b) => b.score - a.score).slice(0, 8); // Top 8 

    const latestProfile = await prisma.profile_snapshots.findFirst({
        where: { user_id: user.id, is_current: true, ...(projectId ? { project_id: projectId } : { project_id: null }) },
        orderBy: { created_at: "desc" }
    });

    const rerankTemplate = await getPromptTemplate("RERANK_CHUNKS_V1", user.id);
    const candidateChunksText = scoredChunks.map(c => `[ChunkID: ${c.chunk_id} | Source: ${c.source.title} | ${c.source.created_at.toISOString()}]\n${c.chunk.chunk_text}`).join("\n\n---\n\n");

    let top5Ids = scoredChunks.map(c => c.chunk_id).slice(0, 5);
    if (scoredChunks.length > 5) {
        try {
            const filledRerank = fillPrompt(rerankTemplate, {
                user_question: question,
                candidate_chunks: candidateChunksText
            });
            const rerankResult = await generateJSON(filledRerank, "gemini-2.5-flash");
            if (rerankResult.selected && Array.isArray(rerankResult.selected)) {
                const selectedIds = rerankResult.selected.map((s: any) => s.chunk_id);
                if (selectedIds.length > 0) {
                    top5Ids = selectedIds.slice(0, 5);
                }
            }
        } catch (e) {
            console.warn("Rerank failed", e);
        }
    }

    const selectedChunks = scoredChunks.filter(c => top5Ids.includes(c.chunk_id));

    const answerTemplate = await getPromptTemplate("ANSWER_WITH_CITATIONS_V1", user.id);
    const selectedChunksText = selectedChunks.map(c => `[Source: ${c.source.title} — ${c.source.created_at.toISOString().split('T')[0]} | id:${c.source.id}]\n${c.chunk.chunk_text}`).join("\n\n---\n\n");

    const filledAnswerPrompt = fillPrompt(answerTemplate, {
        user_question: question,
        profile_snapshot: latestProfile ? latestProfile.profile_markdown : "No profile data yet.",
        selected_chunks: selectedChunksText
    });

    const answerText = await generateText(filledAnswerPrompt, "gemini-2.5-pro");

    const usedSources = Array.from(new Set(selectedChunks.map(c => c.source.id)));

    return { answerText, usedSources };
}
