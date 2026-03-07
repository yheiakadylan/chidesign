'use server';

import prisma from '@/lib/prisma';
import dayjs from 'dayjs'; // You might need dayjs for date formatting, otherwise native JS Date

export async function getBalancesData(userId: string) {
    try {
        // 1. Fetch User's current Pink Balance
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { normal_pink: true }
        });

        // 2. Fetch Activity logs that act as Transactions
        const activities = await prisma.activity.findMany({
            where: {
                userId: userId,
                type: "charged_pink"
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Map to UI format
        const transactions = activities.map(act => ({
            key: act.id,
            title: act.message || 'Unknown Transaction',
            pink: 1, // Mock value, in real app this should be parsed or stored in DB properly
            amount: '22,000.00', // Mock value 
            rate: '22,000.00', // Mock value
            package: act.message2 || 'Normal',
            transId: act.id.slice(0, 10).toUpperCase(), // Mock Transaction ID generator
            createdAt: act.createdAt.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            status: 'Charged',
            action: 'fulfilled',
            note: ''
        }));

        return {
            currentBalance: user?.normal_pink || 0,
            transactions
        };

    } catch (error) {
        console.error("Failed to fetch balance data:", error);
        return { currentBalance: 0, transactions: [] };
    }
}
