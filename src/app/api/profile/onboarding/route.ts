import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Simple slug generator helper
const generateSlug = (firstName: string, lastName: string, birthDate: string) => {
    const baseSlug = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    return `${baseSlug}-${randomSuffix}`;
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, lastName, birthDate, email, uid } = body;

        if (!firstName || !lastName || !birthDate || !email || !uid) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const dateOfBirth = new Date(birthDate);
        let slug = generateSlug(firstName, lastName, birthDate);

        // Ensure slug is unique (simple retry logic)
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
            const existing = await prisma.users.findUnique({ where: { slug } });
            if (!existing) {
                isUnique = true;
            } else {
                slug = generateSlug(firstName, lastName, birthDate);
                attempts++;
            }
        }

        // Upsert the user (create if new from Firebase, update if just missing fields)
        const user = await prisma.users.upsert({
            where: { email },
            update: {
                first_name: firstName,
                last_name: lastName,
                birth_date: dateOfBirth,
                slug,
            },
            create: {
                id: uid,
                email,
                first_name: firstName,
                last_name: lastName,
                birth_date: dateOfBirth,
                slug,
            }
        });

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("Error during onboarding POST:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
