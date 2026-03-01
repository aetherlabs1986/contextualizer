import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
    // In a real app we'd get the auth token from headers
    // For now we'll pass email via query params or headers
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    try {
        const user = await prisma.users.findUnique({
            where: { email },
        });

        if (!user) {
            // New user from Firebase, needs onboarding
            return NextResponse.json({ needsOnboarding: true });
        }

        // If user exists but is missing required fields
        if (!user.first_name || !user.slug) {
            return NextResponse.json({ needsOnboarding: true });
        }

        return NextResponse.json({ needsOnboarding: false, user });
    } catch (error) {
        console.error("Error checking onboarding:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
