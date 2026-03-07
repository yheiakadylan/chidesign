'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth.actions';

export async function getSystemUsers() {
    try {
        const users = await prisma.user.findMany({
            include: { roles: true },
            orderBy: { createdAt: 'desc' }
        });
        return users.map(u => ({
            id: u.id,
            name: u.full_name || u.email,
            email: u.email,
            roles: u.roles.map(r => r.name),
            status: u.status,
            createdAt: u.createdAt
        }));
    } catch (e) {
        console.error("Failed to fetch users", e);
        return [];
    }
}

export async function getSystemSettings() {
    try {
        const settings = await prisma.setting.findMany();
        return settings;
    } catch (e) {
        console.error("Failed to fetch settings", e);
        return [];
    }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
    try {
        const admin = await getCurrentUser();
        if (!admin) return { error: "Unauthorized" };

        await prisma.user.update({
            where: { id: userId },
            data: { status: !currentStatus }
        });
        return { success: true };
    } catch (e) {
        return { error: "Failed to update user." };
    }
}
