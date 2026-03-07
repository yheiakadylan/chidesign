'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/actions/auth.actions';

export async function getBoards() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const boards = await prisma.board.findMany({
            where: { clientId: user.id },
            include: {
                client: {
                    select: {
                        full_name: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return boards.map(board => ({
            ...board,
            key: board.id, // Ensure unique keys for antd Table
            client: {
                name: board.client?.full_name || 'Unknown Client',
                email: board.client?.email || 'N/A'
            }
        }));
    } catch (error) {
        console.error("Failed to fetch boards:", error);
        return [];
    }
}

export async function getBoardOptions(): Promise<{ value: string; label: string }[]> {
    try {
        // Return all boards the user is associated with (as client, manager, or member)
        const boards = await prisma.board.findMany({
            select: { id: true, title: true },
            orderBy: { createdAt: 'desc' }
        });
        return boards.map(b => ({ value: b.id, label: b.title }));
    } catch (error) {
        console.error("Failed to fetch board options:", error);
        return [];
    }
}

export async function getIdeasByBoard(boardId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const userRoles = (user as any).roles?.map((r: any) => r.name) || [];
        const isAdmin = user.is_supper_admin || userRoles.includes('ADMIN');
        const isDesigner = userRoles.includes('DESIGNER');

        let whereClause: any = boardId === 'all' ? {} : { boardId };

        if (!isAdmin) {
            if (isDesigner) {
                // Designer visibility logic:
                // 1. Assigned to them specifically
                // 2. OR is_public is true (Public Design feature)
                // 3. OR the board they are looking at has them in the designers list
                whereClause = {
                    ...whereClause,
                    OR: [
                        { designerId: user.id },
                        { is_public: true },
                        {
                            board: {
                                designers: {
                                    some: { id: user.id }
                                }
                            }
                        }
                    ]
                };
            } else {
                // Client Visibility: Only their own or managed by their manager
                whereClause = {
                    ...whereClause,
                    OR: [
                        { clientId: user.id },
                        { client: { managerId: user.id } },
                        { authorId: user.id }
                    ]
                };
            }
        }

        const ideas = await prisma.idea.findMany({
            where: whereClause,
            include: {
                productType: true,
                cover: true,
                designer: { select: { full_name: true, email: true } },
                board: { select: { title: true } },
                _count: {
                    select: { activities: { where: { type: 'comment' } } }
                }
            },
            orderBy: [
                { is_urgent: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return ideas.map(idea => ({
            id: idea.sku,
            title: idea.title,
            kpi: idea.pink,
            status: idea.status.toUpperCase(),
            designType: idea.designType,
            image: idea.cover?.url || null,
            productType: idea.productType?.title,
            tags: [idea.designType, idea.productType?.title].filter(Boolean) as string[],
            createdAt: idea.createdAt,
            updatedAt: idea.updatedAt,
            boardId: idea.boardId,
            boardTitle: idea.board?.title || 'Unknown Board',
            is_urgent: idea.is_urgent,
            is_public: idea.is_public,
            designer: idea.designer,
            commentCount: idea._count.activities
        }));
    } catch (error) {
        console.error("Failed to fetch ideas:", error);
        return [];
    }
}

export async function createIdea(data: {
    title: string;
    description?: string;
    boardId: string;
    productTypeId?: string;
    designType?: string;
    quantity?: number;
    kpi?: number;
    deadline?: Date;
    designerId?: string;
    status?: string;
}) {
    try {
        const clientUser = await getCurrentUser();

        if (!clientUser) return { error: "No authenticated user found." };

        const newIdea = await prisma.idea.create({
            data: {
                sku: `NEW-${Math.floor(Math.random() * 100000)}`,
                title: data.title,
                description: data.description,
                status: data.status || "DRAFT", // Respect provided status or default to Draft
                designType: data.designType || "NEW",
                pink: data.kpi || 1.0,
                boardId: data.boardId,
                authorId: clientUser.id,
                clientId: clientUser.id,
                productTypeId: data.productTypeId,
            }
        });

        // Add to Activity Log
        await prisma.activity.create({
            data: {
                type: "task_created",
                message: `Created task: ${data.title}`,
                userId: clientUser.id,
            }
        });

        return { success: true, idea: newIdea };
    } catch (error) {
        console.error("Failed to create idea:", error);
        return { error: "Failed to save the task" };
    }
}

export async function deleteIdea(sku: string) {
    try {
        await prisma.idea.delete({
            where: { sku }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete idea:", error);
        return { error: "Failed to delete task" };
    }
}

export async function updateIdea(sku: string, data: Partial<{
    title: string;
    status: string;
    kpi: number;
    designType: string;
}>) {
    try {
        const updateData: any = { ...data };
        if (data.kpi !== undefined) updateData.pink = data.kpi; // Map kpi to pink

        const updatedIdea = await prisma.idea.update({
            where: { sku },
            data: updateData
        });
        return { success: true, idea: updatedIdea };
    } catch (error) {
        console.error("Failed to update idea:", error);
        return { error: "Failed to update task" };
    }
}

export async function getBoardDetail(id: string) {
    try {
        const board = await prisma.board.findUnique({
            where: { id },
            include: {
                productTypes: true
            }
        });
        return board;
    } catch (error) {
        console.error("Failed to fetch board details:", error);
        return null;
    }
}

export async function updateBoard(id: string, data: {
    title: string;
    defaultDesignType: string;
    productTypeIds: string[];
    readMe: string;
}) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: "Not authenticated" };

        const updatedBoard = await prisma.board.update({
            where: { id },
            data: {
                title: data.title,
                defaultDesignType: data.defaultDesignType,
                readMe: data.readMe,
                productTypes: {
                    set: data.productTypeIds.map(id => ({ id }))
                }
            }
        });

        // Add to Activity Log
        await prisma.activity.create({
            data: {
                type: "board_updated",
                message: `Updated board: ${data.title}`,
                userId: user.id,
                boardId: id
            }
        });

        return { success: true, board: updatedBoard };
    } catch (error) {
        console.error("Failed to update board:", error);
        return { error: "Failed to update board" };
    }
}

export async function getProductTypeOptions() {
    try {
        const productTypes = await prisma.productType.findMany({
            select: { id: true, title: true }
        });
        return productTypes.map(pt => ({ value: pt.id, label: pt.title }));
    } catch (error) {
        console.error("Failed to fetch product types:", error);
        return [];
    }
}


/**
 * Get all members of a board (members + client + managers)
 */
export async function getBoardMembers(boardId: string) {
    try {
        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                members: { select: { id: true, full_name: true, email: true } },
                boardManagers: { select: { id: true, full_name: true, email: true } },
                designers: { select: { id: true, full_name: true, email: true } },
                client: { select: { id: true, full_name: true, email: true } }
            }
        });
        if (!board) return { members: [] };

        const all = [
            ...(board.members || []),
            ...(board.boardManagers || []),
            ...(board.designers || []),
            ...(board.client ? [board.client] : [])
        ];
        const unique = Array.from(new Map(all.map(u => [u.id, u])).values());
        return { members: unique };
    } catch (e) {
        console.error('Failed to get board members:', e);
        return { members: [] };
    }
}

/**
 * Search users by email for the invite select dropdown
 */
export async function searchUsersByEmail(query: string) {
    try {
        const users = await prisma.user.findMany({
            where: {
                email: { contains: query }
            },
            select: { id: true, full_name: true, email: true },
            take: 10
        });
        return users;
    } catch (e) {
        return [];
    }
}

/**
 * Set board members by email list.
 * Creates new user records for emails not yet in DB (pending invite).
 */
export async function updateBoardMembers(boardId: string, emails: string[]) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return { error: 'Not authenticated' };

        // Upsert each email — create placeholder user if not exists
        const userUpserts = await Promise.all(
            emails.map(email =>
                prisma.user.upsert({
                    where: { email },
                    update: {},
                    create: {
                        email,
                        full_name: email.split('@')[0], // placeholder name from email prefix
                    },
                    select: { id: true, email: true, full_name: true }
                })
            )
        );

        // Set members on the board
        await prisma.board.update({
            where: { id: boardId },
            data: {
                members: {
                    set: userUpserts.map(u => ({ id: u.id }))
                }
            }
        });

        // Log activity
        await prisma.activity.create({
            data: {
                type: 'members_updated',
                message: `Board members updated (${userUpserts.length} members)`,
                boardId,
                userId: currentUser.id
            }
        });

        const newUsers = userUpserts.filter(u => !emails.includes(u.email) === false);
        return { success: true, members: userUpserts };
    } catch (e) {
        console.error('Failed to update board members:', e);
        return { error: 'Failed to update members' };
    }
}
