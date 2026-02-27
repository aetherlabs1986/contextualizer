import { NextResponse } from "next/server";
import { retrieveAndAnswer } from "@/lib/rag";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { question, projectId } = await req.json();

        const user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const result = await retrieveAndAnswer(question, projectId || null);

        return NextResponse.json({ answer: result.answerText, usedSources: result.usedSources });
    } catch (error) {
        console.error("Chat error", error);
        return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
    }
}
