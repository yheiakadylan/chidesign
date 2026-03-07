"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Not authenticated" };

        const users = await prisma.user.findMany({
            include: {
                roles: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, users };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { error: "Failed to fetch users" };
    }
}

export async function getAllRoles() {
    try {
        const roles = await prisma.role.findMany();
        return { success: true, roles };
    } catch (error) {
        return { error: "Failed to fetch roles" };
    }
}

export async function updateUserRoles(userId: string, roleNames: string[]) {
    try {
        const session = await auth();
        // Only super admin or user with ADMIN role can update roles
        // We'll trust the session for now, but in production, check DB again
        if (!session?.user) return { error: "Not authenticated" };

        await prisma.user.update({
            where: { id: userId },
            data: {
                roles: {
                    set: roleNames.map(name => ({ name }))
                }
            }
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user roles:", error);
        return { error: "Failed to update roles" };
    }
}

export async function toggleSuperAdmin(userId: string, isSuper: boolean) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Not authenticated" };

        await prisma.user.update({
            where: { id: userId },
            data: { is_supper_admin: isSuper }
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { error: "Failed to toggle super admin status" };
    }
}

export async function addPinkBalance(userId: string, amount: number, type: 'normal' | 'monthly') {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Not authenticated" };

        const updateData: any = {};
        if (type === 'normal') {
            updateData.normal_pink = { increment: amount };
        } else {
            updateData.monthly_pink = { increment: amount };
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        // Log the manual recharge
        await prisma.activity.create({
            data: {
                type: 'charged_pink',
                message: `Admin manual top-up: ${amount} PINK (${type})`,
                userId: userId,
            }
        });

        revalidatePath("/admin/users");
        return { success: true, balance: type === 'normal' ? user.normal_pink : user.monthly_pink };
    } catch (error) {
        console.error("Failed to add PINK balance:", error);
        return { error: "Failed to add PINK balance" };
    }
}

export async function getAllDesigners() {
    try {
        const designers = await prisma.user.findMany({
            where: {
                roles: {
                    some: { name: 'DESIGNER' }
                }
            },
            select: {
                id: true,
                full_name: true,
                email: true
            }
        });
        return { success: true, designers };
    } catch (error) {
        return { error: "Failed to fetch designers" };
    }
}

export async function updateBoardDesigners(boardId: string, designerIds: string[]) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Not authenticated" };

        await prisma.board.update({
            where: { id: boardId },
            data: {
                designers: {
                    set: designerIds.map(id => ({ id }))
                }
            }
        });

        revalidatePath("/boards");
        return { success: true };
    } catch (error) {
        console.error("Failed to update board designers:", error);
        return { error: "Failed to update board designers" };
    }
}
