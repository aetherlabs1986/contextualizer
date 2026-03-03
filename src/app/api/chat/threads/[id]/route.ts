import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get("userId");
        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        let user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.users.create({
                data: { id: userId, email: `${userId}@placeholder.com`, first_name: "New", last_name: "User" }
            });
        }

        const threadId = params.id;

        const messages = await prisma.chat_messages.findMany({
            where: { thread_id: threadId },
            orderBy: { created_at: "asc" }
        });

        // Update the updated_at timestamp so it bubbles up the thread list
        await prisma.chat_threads.update({
            where: { id: threadId },
            data: { updated_at: new Date() }
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Fetch thread messages error", error);
        return NextResponse.json({ error: "Failed to fetch thread messages" }, { status: 500 });
    }
}
