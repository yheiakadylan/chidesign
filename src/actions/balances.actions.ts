'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth.actions';

export async function getBalanceHistory() {
    try {
        const user = await getCurrentUser();
        if (!user) return null;

        const history = await prisma.activity.findMany({
            where: {
                userId: user.id,
                type: 'charged_pink' // Assuming 'charged_pink' is used for packages. We can expand this later for deductions.
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: { normal_pink: true, monthly_pink: true }
        });

        return {
            history,
            balances: {
                normal: userData?.normal_pink || 0,
                monthly: userData?.monthly_pink || 0
            }
        };
    } catch (error) {
        console.error("Failed to fetch balance history:", error);
        return null;
    }
}
