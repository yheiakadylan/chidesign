'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth.actions';

export async function getPinkTransactionLogs() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const roles = (user as any).roles?.map((r: any) => r.name) || [];
        const isAdmin = user.is_supper_admin || roles.includes('ADMIN');

        const logs = await prisma.activity.findMany({
            where: {
                type: { in: ['charged_pink', 'topup_pink', 'refund_pink'] },
                ...(isAdmin ? {} : {
                    OR: [
                        { idea: { clientId: user.id } },
                        { userId: user.id }
                    ]
                })
            } as any,
            include: {
                user: { select: { full_name: true, email: true } },
                idea: { select: { sku: true, title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, logs };
    } catch (e) {
        console.error("Failed to fetch finance logs", e);
        return { success: false, error: 'Database error' };
    }
}
export async function getBoardReports(page: number = 1, limit: number = 10, searchTitle?: string, startDate?: string, endDate?: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const roles = (user as any).roles?.map((r: any) => r.name) || [];
        const isAdmin = user.is_supper_admin || roles.includes('ADMIN');

        const dateFilter = (startDate && endDate) ? {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        } : {};

        // Lọc boards mà người dùng có quyền xem
        const boards = await prisma.board.findMany({
            where: {
                ...(isAdmin ? {} : {
                    OR: [
                        { clientId: user.id },
                        { boardManagers: { some: { id: user.id } } },
                        { designers: { some: { id: user.id } } },
                        { members: { some: { id: user.id } } }
                    ]
                }),
                ...(searchTitle ? { title: { contains: searchTitle } } : {})
            },
            include: {
                client: { select: { id: true, first_name: true, last_name: true, full_name: true, email: true, avatar: { select: { id: true, url: true, key: true } } } },
                designers: { select: { id: true, first_name: true, last_name: true, full_name: true, avatar: { select: { id: true, url: true, key: true } } } },
                boardManagers: { select: { id: true } },
                ideas: {
                    where: dateFilter,
                    select: { id: true, pink: true, qty: true }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        const count = await prisma.board.count({
            where: {
                ...(isAdmin ? {} : {
                    OR: [
                        { clientId: user.id },
                        { boardManagers: { some: { id: user.id } } },
                        { designers: { some: { id: user.id } } },
                        { members: { some: { id: user.id } } }
                    ]
                }),
                ...(searchTitle ? { title: { contains: searchTitle } } : {})
            }
        });

        const hits = boards.map(board => {
            const total_pink = board.ideas.reduce((acc, idea) => acc + (idea.pink * idea.qty), 0);
            const total_card = board.ideas.length;
            // Giả định giá trị VND dựa trên pink, ví dụ 22,000 VND/PINK
            const total_amount = total_pink * 22000;

            return {
                board: {
                    id: board.id,
                    title: board.title,
                    boardManagerIDs: board.boardManagers.map(m => m.id),
                    designers: board.designers.map(d => ({
                        id: d.id,
                        first_name: d.first_name,
                        last_name: d.last_name,
                        full_name: d.full_name,
                        avatar: d.avatar,
                    })),
                    client: {
                        id: board.client?.id,
                        first_name: board.client?.first_name,
                        last_name: board.client?.last_name,
                        full_name: board.client?.full_name,
                        email: board.client?.email,
                        avatar: board.client?.avatar,
                    }
                },
                board_id: board.id,
                total_pink: total_pink,
                total_card: total_card,
                total_amount: total_amount
            };
        });

        return { success: true, count, hits };
    } catch (e) {
        console.error("Failed to fetch board reports", e);
        return { success: false, error: 'Database error' };
    }
}
