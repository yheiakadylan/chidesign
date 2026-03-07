'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth.actions';

export async function getTaskDetails(sku: string) {
    try {
        const task = await prisma.idea.findUnique({
            where: { sku },
            include: {
                activities: {
                    include: { user: true },
                    orderBy: { createdAt: 'desc' }
                },
                designer: true,
                author: true,
                productType: true,
                attachments: true,
                cover: true
            }
        });
        return task;
    } catch (e) {
        console.error("Failed to fetch task details:", e);
        return null;
    }
}

export async function addComment(sku: string, message: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const task = await prisma.idea.findUnique({ where: { sku } });
        if (!task) return { error: 'Task not found' };

        const activity = await prisma.activity.create({
            data: {
                type: 'comment',
                message,
                ideaId: task.id,
                userId: user.id
            },
            include: { user: true }
        });

        return { success: true, activity };
    } catch (e) {
        console.error("Failed to add comment:", e);
        return { error: 'Failed' };
    }
}

export async function updateTaskFields(sku: string, data: any) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const updated = await prisma.idea.update({
            where: { sku },
            data
        });

        // Log this action
        await prisma.activity.create({
            data: {
                type: 'status_change',
                message: `Task updated`,
                ideaId: updated.id,
                userId: user.id
            }
        });

        return { success: true, task: updated };
    } catch (e) {
        console.error("Failed to update task:", e);
        return { error: 'Failed to update' };
    }
}

export async function getProductTypeOptions() {
    try {
        const types = await prisma.productType.findMany({
            select: { id: true, title: true },
            orderBy: { title: 'asc' }
        });
        return types;
    } catch (e) {
        return [];
    }
}

export async function getDesignerOptions() {
    try {
        // Fetch users who have the role DESIGNER, or just all users if roles are complex.
        // For simplicity right now, fetch all users who are not super admin (or all users)
        // Adjust filter based on actual data
        const designers = await prisma.user.findMany({
            select: { id: true, full_name: true, email: true },
            orderBy: { full_name: 'asc' }
        });
        return designers;
    } catch (e) {
        return [];
    }
}

export async function addAttachment(sku: string, fileData: { url: string, file_name: string, file_mime?: string, key?: string }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const task = await prisma.idea.findUnique({ where: { sku } });
        if (!task) return { error: 'Task not found' };

        const file = await prisma.file.create({
            data: {
                url: fileData.url,
                file_name: fileData.file_name,
                file_mime: fileData.file_mime || 'unknown',
                key: fileData.key || fileData.url,
            }
        });

        // Link file to task attachments
        await prisma.idea.update({
            where: { sku },
            data: {
                attachments: {
                    connect: { id: file.id }
                }
            }
        });

        // Log this action
        await prisma.activity.create({
            data: {
                type: 'attachment_added',
                message: `Added attachment: ${file.file_name}`,
                ideaId: task.id,
                userId: user.id
            }
        });

        return { success: true, file };
    } catch (e) {
        console.error("Failed to add attachment:", e);
        return { error: 'Failed' };
    }
}

export async function deleteTaskAttachment(sku: string, fileId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        // Unlink from idea attachments
        await prisma.idea.update({
            where: { sku },
            data: {
                attachments: {
                    disconnect: { id: fileId }
                }
            }
        });

        // Optional: delete from File table if it's not used anywhere else
        const task = await prisma.idea.findUnique({ where: { sku } });

        // Log this action
        await prisma.activity.create({
            data: {
                type: 'attachment_removed',
                message: `Removed an attachment`,
                ideaId: task?.id,
                userId: user.id
            }
        });

        return { success: true };
    } catch (e) {
        console.error("Failed to delete attachment:", e);
        return { error: 'Failed' };
    }
}

export async function renameAttachment(fileId: string, newName: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const updated = await prisma.file.update({
            where: { id: fileId },
            data: { file_name: newName }
        });

        return { success: true, file: updated };
    } catch (e) {
        console.error("Failed to rename attachment:", e);
        return { error: 'Failed to rename' };
    }
}
export async function deleteComment(activityId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const activity = await prisma.activity.findUnique({ where: { id: activityId } });
        if (!activity) return { error: 'Comment not found' };
        if (activity.userId !== user.id) return { error: 'Cannot delete another user comment' };

        await prisma.activity.delete({ where: { id: activityId } });
        return { success: true };
    } catch (e) {
        console.error("Failed to delete comment:", e);
        return { error: 'Failed' };
    }
}

export async function editComment(activityId: string, newMessage: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const activity = await prisma.activity.findUnique({ where: { id: activityId } });
        if (!activity) return { error: 'Comment not found' };
        if (activity.userId !== user.id) return { error: 'Cannot edit another user comment' };

        const updated = await prisma.activity.update({
            where: { id: activityId },
            data: { message: newMessage },
            include: { user: true }
        });
        return { success: true, activity: updated };
    } catch (e) {
        console.error("Failed to edit comment:", e);
        return { error: 'Failed' };
    }
}
