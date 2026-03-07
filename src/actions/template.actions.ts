'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth.actions';

export async function getFulfillmentTemplates(boardId: string) {
    if (!boardId || boardId === "all") return [];
    try {
        const board = await prisma.board.findUnique({
            where: { id: boardId },
            select: { fulfillmentTemplates: true }
        });
        if (!board || !board.fulfillmentTemplates) return [];
        return JSON.parse(board.fulfillmentTemplates);
    } catch (e) {
        console.error("Failed to get templates", e);
        return [];
    }
}

export async function saveFulfillmentTemplates(boardId: string, templates: any[]) {
    if (!boardId || boardId === "all") return { error: "Invalid board ID" };
    try {
        const user = await getCurrentUser();
        if (!user) return { error: "Not authenticated" };

        await prisma.board.update({
            where: { id: boardId },
            data: {
                fulfillmentTemplates: JSON.stringify(templates)
            }
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to save templates", e);
        return { error: "Failed to save templates" };
    }
}
