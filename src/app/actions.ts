"use server"

import { prisma } from "@/lib/db";

const DEFAULT_USER_ID = "default-user";

async function ensureUser() {
    let user = await prisma.users.findUnique({ where: { email: "user@example.com" } });
    if (!user) {
        user = await prisma.users.create({
            data: {
                id: DEFAULT_USER_ID,
                email: "user@example.com"
            }
        });
    }
    return user.id;
}

export async function getDashboardData(projectId: string | null) {
    const userId = await ensureUser();

    const lastSource = await prisma.sources.findFirst({
        where: { user_id: userId, ...(projectId ? { project_id: projectId } : {}) },
        orderBy: { created_at: "desc" }
    });

    const lastProfile = await prisma.profile_snapshots.findFirst({
        where: { user_id: userId, is_current: true, ...(projectId ? { project_id: projectId } : { project_id: null }) }
    });

    let profileSummary = "No profile available yet. Add sources to generate a profile.";
    let identityRoles: string[] = [];
    if (lastProfile) {
        try {
            const parsed = JSON.parse(lastProfile.profile_json);
            profileSummary = parsed?.identity_snapshot?.summary || profileSummary;
            identityRoles = parsed?.identity_snapshot?.roles || [];
        } catch (e) { }
    }

    const topProjects = projectId ? [] : await prisma.projects.findMany({
        where: { user_id: userId },
        orderBy: { last_activity_at: "desc" },
        take: 5
    });

    const decisions = await prisma.insights.findMany({
        where: {
            user_id: userId,
            insight_type: "decision",
            ...(projectId ? { project_id: projectId } : {})
        },
        orderBy: { created_at: "desc" },
        take: 10
    });

    const leads = await prisma.insights.findMany({
        where: {
            user_id: userId,
            insight_type: "lead",
            ...(projectId ? { project_id: projectId } : {})
        },
        orderBy: { created_at: "desc" },
        take: 10
    });

    return {
        lastSourceDate: lastSource?.created_at || null,
        lastProfileDate: lastProfile?.created_at || null,
        profileSummary,
        identityRoles,
        topProjects,
        recentDecisions: decisions,
        leads,
    };
}

export async function getSources(projectId: string | null) {
    const userId = await ensureUser();
    return prisma.sources.findMany({
        where: {
            user_id: userId,
            ...(projectId ? { project_id: projectId } : {})
        },
        orderBy: { created_at: "desc" }
    });
}
