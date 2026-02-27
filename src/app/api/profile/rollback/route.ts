import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { id, projectId } = await req.json();

        const user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Mark all as not current
        await prisma.profile_snapshots.updateMany({
            where: {
                user_id: user.id,
                ...(projectId ? { project_id: projectId } : { project_id: null })
            },
            data: { is_current: false }
        });

        // Mark the selected one as current
        await prisma.profile_snapshots.update({
            where: { id: id },
            data: { is_current: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
