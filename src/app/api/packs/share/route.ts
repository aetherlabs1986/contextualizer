import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const token = uuidv4().replace(/-/g, ""); // 32 chars

        // In V1, we simulate context_pack entry by using snapshot ID to build it on the fly, 
        // or just creating a shareable Link directly relying on snapshot ID
        await prisma.shared_links.create({
            data: {
                token,
                context_pack_id: data.context_pack_id, // snapshot id really
                pack_type: data.pack_type,
                project_id: data.project_id || null,
            }
        });

        return NextResponse.json({ success: true, token });
    } catch (error) {
        console.error("Share error", error);
        return NextResponse.json({ error: "Failed to generate link" }, { status: 500 });
    }
}
