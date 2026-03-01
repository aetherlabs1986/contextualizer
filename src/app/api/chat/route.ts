import { NextResponse } from "next/server";
import { retrieveAndAnswer } from "@/lib/rag";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { question, projectId, threadId: reqThreadId } = await req.json();

        const user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let threadId = reqThreadId;

        if (!threadId) {
            // New thread
            const thread = await prisma.chat_threads.create({
                data: {
                    user_id: user.id,
                    project_id: projectId || null,
                    title: question.substring(0, 40) + "..."
                }
            });
            threadId = thread.id;
        }

        // Save User question
        await prisma.chat_messages.create({
            data: {
                thread_id: threadId,
                role: "user",
                content: question,
                used_sources_json: "[]"
            }
        });

        // Get past messages to build history
        const pastMessages = await prisma.chat_messages.findMany({
            where: { thread_id: threadId },
            orderBy: { created_at: "asc" },
            take: 20 // last 20 messages as history
        });

        const chatHistory = pastMessages.map(m => ({ role: m.role, content: m.content }));

        const result = await retrieveAndAnswer(question, projectId || null, chatHistory);

        // Save Assistant response
        const assistantMsg = await prisma.chat_messages.create({
            data: {
                thread_id: threadId,
                role: "assistant",
                content: result.answerText,
                used_sources_json: JSON.stringify(result.usedSources || [])
            }
        });

        return NextResponse.json({
            threadId,
            messageId: assistantMsg.id,
            answer: result.answerText,
            usedSources: result.usedSources
        });
    } catch (error) {
        console.error("Chat error", error);
        return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
    }
}
