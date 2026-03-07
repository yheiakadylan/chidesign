'use server';

import prisma from '@/lib/prisma';

export async function getPackages() {
    try {
        const packages = await prisma.package.findMany({
            select: {
                id: true,
                title: true,
                qty: true,
                amount: true,
                status: true,
                type: true,
                position: true,
                isFeatured: true
            },
            orderBy: { position: 'asc' }
        });
        return packages;
    } catch (error) {
        console.error("Failed to fetch packages:", error);
        return [];
    }
}
