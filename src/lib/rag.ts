import { prisma } from "./db";
import { generateEmbedding, generateJSON } from "./llm";
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

export async function processChatMutation(userId: string, projectId: string | null, mutationDetails: string) {
    try {
        const lastProfile = await prisma.profile_snapshots.findFirst({
            where: { user_id: userId, is_current: true, project_id: projectId },
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

        // We wrap the mutation details in an artificial insight to feed the merge engine
        const artificialInsights = {
            communication_rules: [
                {
                    rule_type: "tone",
                    value: mutationDetails
                }
            ],
            identity_updates: [
                { type: "principle", value: mutationDetails, evidence: "User command during chat" }
            ]
        };

        const mergeTemplate = await getPromptTemplate("PROFILE_MERGE_V1", userId);
        const filledMergePrompt = fillPrompt(mergeTemplate, {
            today: new Date().toISOString(),
            source_id: "chat-training-command",
            previous_profile: previousProfileStr,
            new_insights: JSON.stringify(artificialInsights, null, 2)
        });

        const mergedProfileJson = await generateJSON(filledMergePrompt, "gemini-2.5-pro");

        await prisma.profile_snapshots.updateMany({
            where: { user_id: userId, project_id: projectId },
            data: { is_current: false }
        });

        const versionNum = lastProfile ? parseInt(lastProfile.version_label.replace("v", "")) + 1 : 1;

        await prisma.profile_snapshots.create({
            data: {
                user_id: userId,
                project_id: projectId,
                profile_json: JSON.stringify(mergedProfileJson),
                profile_markdown: "Profile Snapshot v" + versionNum + "\n\n" + JSON.stringify(mergedProfileJson, null, 2),
                version_label: "v" + versionNum,
                created_from_sources_json: JSON.stringify([...(JSON.parse(lastProfile?.created_from_sources_json || "[]")), "chat-training-command"]),
                is_current: true
            }
        });
        console.log("Profile mutated successfully from Chat.");
    } catch (e) {
        console.error("Failed to mutate profile from Chat:", e);
    }
}

export async function retrieveAndAnswer(question: string, projectId: string | null, chatHistory: { role: string, content: string }[] = []) {
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

    const answerTemplate = await getPromptTemplate("CHAT_ORACLE_V1", user.id);
    const selectedChunksText = selectedChunks.map(c => `[Source: ${c.source.title} — ${c.source.created_at.toISOString().split('T')[0]} | id:${c.source.id}]\n${c.chunk.chunk_text}`).join("\n\n---\n\n");

    // Format history
    const historyText = chatHistory.map(h => `${h.role === 'user' ? 'USER' : 'CONTEXTUALIZER'}: ${h.content}`).join("\n");

    const filledAnswerPrompt = fillPrompt(answerTemplate, {
        user_question: question,
        profile_snapshot: latestProfile ? latestProfile.profile_json : "{}",
        selected_chunks: selectedChunksText,
        chat_history: historyText || "No previous messages."
    });

    const llmOutput = await generateJSON(filledAnswerPrompt, "gemini-2.5-pro");

    const answerText = llmOutput.answer || "No pude generar una respuesta.";
    const usedSources = Array.from(new Set(selectedChunks.map(c => c.source.id)));

    // Handle Self-learning/Mutation
    if (llmOutput.profile_mutation_required && llmOutput.profile_mutation_details) {
        // Run mutation in background without blocking response
        processChatMutation(user.id, projectId, String(llmOutput.profile_mutation_details));
    }

    return { answerText, usedSources };
}
