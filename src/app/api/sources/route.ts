import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processSource } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        let userId = data.user_id;

        if (!userId) {
            let user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
            if (!user) user = await prisma.users.create({ data: { id: "default-user", email: "user@example.com", first_name: "Default", last_name: "User" } });
            userId = user.id;
        } else {
            // Upsert user if they don't exist in postgres to prevent FK constraint failure
            let dbUser = await prisma.users.findUnique({ where: { id: userId } });
            if (!dbUser) {
                await prisma.users.create({
                    data: {
                        id: userId,
                        email: `${userId}@placeholder.com`,
                        first_name: "New",
                        last_name: "User"
                    }
                });
            }
        }

        const source = await prisma.sources.create({
            data: {
                user_id: userId,
                project_id: data.project_id || null,
                title: data.title,
                source_type: data.source_type,
                importance: data.importance || "normal",
                raw_text: data.raw_text,
                extracted_text: data.extracted_text,
                transcript_text: data.transcript_text,
                processing_status: "queued"
            }
        });

        // Fire and forget processing pipeline
        processSource(source.id).catch(console.error);

        return NextResponse.json({ success: true, source });
    } catch (error) {
        console.error("Failed to insert source", error);
        return NextResponse.json({ error: "Failed to insert source" }, { status: 500 });
    }
}
