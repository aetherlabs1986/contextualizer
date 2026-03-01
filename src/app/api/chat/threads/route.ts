import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const threads = await prisma.chat_threads.findMany({
            where: { user_id: user.id },
            orderBy: { updated_at: "desc" }
        });

        return NextResponse.json({ threads });
    } catch (error) {
        console.error("Fetch threads error", error);
        return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
    }
}
