import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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
