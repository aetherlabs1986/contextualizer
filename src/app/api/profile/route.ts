import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId") || null;
        let userId = searchParams.get("user_id") || "1";

        // Attempt to find user by user_id
        let user: any = await prisma.users.findUnique({ where: { id: userId } });

        // fallback to original dummy logic for backwards compatibility if user doesn't exist
        if (!user && userId === "1") {
            user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
        }

        // If we really can't find anything, return null profile
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
