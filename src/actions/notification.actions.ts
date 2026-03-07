'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth.actions';

export async function getNotifications() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const roles = (user as any).roles?.map((r: any) => r.name) || [];
        const isAdmin = user.is_supper_admin || roles.includes('ADMIN');

        // Logic: 
        // 1. If admin, show everything.
        // 2. If client, show activities on their boards/tasks.
        // 3. If designer, show activities on tasks assigned to them.

        const notifications = await prisma.activity.findMany({
            where: isAdmin ? {} : {
                OR: [
                    { idea: { clientId: user.id } },
                    { idea: { designerId: user.id } },
                    { idea: { client: { managerId: user.id } } },
                    { userId: user.id } // their own actions
                ]
            },
            include: {
                user: { select: { full_name: true, email: true } },
                idea: { select: { sku: true, title: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return { success: true, notifications };
    } catch (e) {
        console.error("Failed to fetch notifications", e);
        return { success: false, error: 'Database error' };
    }
}

export async function markAsRead(id: string) {
    try {
        await prisma.activity.update({
            where: { id },
            data: { read: true }
        });
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function markAllAsRead() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false };

        await prisma.activity.updateMany({
            where: { idea: { clientId: user.id } }, // Simplified for now
            data: { read: true }
        });
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}
