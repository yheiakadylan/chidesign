'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth.actions';

export async function getBoardReports() {
    try {
        const user = await getCurrentUser();
        if (!user) return null;

        const ideas = await prisma.idea.findMany({
            where: { clientId: user.id },
            select: { status: true, pink: true }
        });

        const totalTasks = ideas.length;
        const totalPink = ideas.reduce((acc, curr) => acc + (curr.pink || 0), 0);

        const statusCounts = ideas.reduce((acc: Record<string, number>, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});

        return {
            totalTasks,
            totalPink,
            statusCounts
        };

    } catch (e) {
        console.error("Failed to fetch reports", e);
        return null;
    }
}
