'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth.actions';

export async function getClientBoards() {
    try {
        const user = await getCurrentUser();
        if (!user) return null;

        const userRoles = (user as any).roles?.map((r: any) => r.name) || [];
        const isAdmin = user.is_supper_admin || userRoles.includes('ADMIN');

        const boards = await prisma.board.findMany({
            where: isAdmin ? {} : { clientId: user.id },
            include: {
                client: {
                    select: { id: true, full_name: true, email: true }
                },
                ideas: {
                    select: { status: true }
                },
                designers: {
                    select: { id: true, full_name: true, email: true }
                }
            }
        });

        return boards.map(b => ({
            id: b.id,
            title: b.title,
            isPublic: b.isPublic,
            checkedTerms: b.checked_terms,
            createdAt: b.createdAt,
            totalTasks: b.ideas.length,
            completedTasks: b.ideas.filter(i => i.status === 'DONE').length,
            designers: b.designers,
            client: b.client
        }));
    } catch (e) {
        console.error("Failed to fetch boards", e);
        return [];
    }
}

export async function createNewBoard(data: { title: string, isPublic: boolean, defaultKpi: number }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const newBoard = await prisma.board.create({
            data: {
                title: data.title,
                isPublic: data.isPublic,
                clientId: user.id,
                checked_terms: true // Assuming accepted on creation
            }
        });

        return { success: true, board: newBoard };
    } catch (e) {
        console.error("Failed to create board:", e);
        return { error: 'Failed to create board' };
    }
}

export async function deleteBoard(id: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const userRoles = (user as any).roles?.map((r: any) => r.name) || [];
        const isAdmin = user.is_supper_admin || userRoles.includes('ADMIN');

        // Optional: check ownership if not admin
        if (!isAdmin) {
            const board = await prisma.board.findUnique({ where: { id }, select: { clientId: true } });
            if (board?.clientId !== user.id) return { error: 'Unauthorized' };
        }

        await prisma.board.delete({ where: { id } });
        return { success: true };
    } catch (e) {
        console.error("Failed to delete board:", e);
        return { error: 'Failed to delete board' };
    }
}
