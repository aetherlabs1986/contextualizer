import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId") || null;

        const user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
        if (!user) return NextResponse.json({ snapshot: null });

        const snapshot = await prisma.profile_snapshots.findFirst({
            where: {
                user_id: user.id,
                is_current: true,
                ...(projectId ? { project_id: projectId } : { project_id: null })
            }
        });

        const history = await prisma.profile_snapshots.findMany({
            where: {
                user_id: user.id,
                ...(projectId ? { project_id: projectId } : { project_id: null })
            },
            select: { id: true, version_label: true, created_at: true, is_current: true },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ snapshot, history });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
