"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getClientTeam() {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Not authenticated" };

        // The manager is the current user
        const team = await prisma.user.findMany({
            where: { managerId: session.user.id },
            select: {
                id: true,
                full_name: true,
                email: true,
                createdAt: true,
                roles: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, team };
    } catch (error) {
        console.error("Failed to fetch client team:", error);
        return { error: "Failed to fetch team" };
    }
}

export async function inviteTeamMember(email: string, fullName?: string) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Not authenticated" };

        const manager = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { roles: true }
        });

        if (!manager?.roles.some(r => r.name === 'CLIENT_MANAGER')) {
            return { error: "Only Client Managers can invite team members" };
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            if (user.managerId === manager.id) {
                return { error: "User is already in your team" };
            }
            if (user.managerId) {
                return { error: "User belongs to another team" };
            }

            // If user exists but has no manager, we can "claim" them? 
            // Better to just update their managerId
            await prisma.user.update({
                where: { email },
                data: {
                    managerId: manager.id,
                    roles: {
                        connect: { name: 'CLIENT_USER' }
                    }
                }
            });
        } else {
            // Create new placeholder user
            await prisma.user.create({
                data: {
                    email,
                    full_name: fullName || email.split('@')[0],
                    managerId: manager.id,
                    roles: {
                        connect: { name: 'CLIENT_USER' }
                    }
                }
            });
        }

        revalidatePath("/client/team");
        return { success: true };
    } catch (error) {
        console.error("Failed to invite member:", error);
        return { error: "Failed to invite" };
    }
}

export async function removeTeamMember(userId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Not authenticated" };

        await prisma.user.update({
            where: { id: userId, managerId: session.user.id },
            data: { managerId: null }
        });

        revalidatePath("/client/team");
        return { success: true };
    } catch (error) {
        return { error: "Failed to remove member" };
    }
}
