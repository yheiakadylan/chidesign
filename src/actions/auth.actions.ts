'use server';

import prisma from '@/lib/prisma';
import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';

import { cookies } from 'next/headers';

export async function loginAction(formData: FormData) {
    try {
        await signIn('credentials', Object.fromEntries(formData));
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid email or password' };
                default:
                    return { error: 'Something went wrong.' };
            }
        }
        throw error; // Re-throw to allow Next.js redirect to actually work
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('session'); // Clear legacy cookie if it exists
    await signOut({ redirectTo: '/login' });
}

export async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.email) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { roles: true, avatar: true }
        });
        return user;
    } catch (e) {
        return null;
    }
}

export async function updateUserProfileAction(userId: string, data: { full_name?: string, phone?: string, email?: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) return { error: 'Not authenticated' };

        // Verification: ensure the current user is updating THEIR OWN profile
        const self = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!self || self.id !== userId) return { error: 'Unauthorized to update this profile' };

        // If email is being changed, check if it already exists
        if (data.email && data.email !== self.email) {
            const existing = await prisma.user.findUnique({ where: { email: data.email } });
            if (existing) return { error: 'Email already in use' };
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data
        });

        return { success: true, user: updated };
    } catch (e) {
        console.error("Failed to update profile:", e);
        return { error: 'Internal server error' };
    }
}

export async function updateUserAvatarAction(userId: string, fileData: { url: string, file_name: string, file_mime?: string, key?: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) return { error: 'Not authenticated' };

        const self = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!self || self.id !== userId) return { error: 'Unauthorized' };

        // 1. Create file record
        const file = await prisma.file.create({
            data: {
                url: fileData.url,
                file_name: fileData.file_name,
                file_mime: fileData.file_mime || 'unknown',
                key: fileData.key || fileData.url,
            }
        });

        // 2. Link to user
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { avatarId: file.id },
            include: { avatar: true }
        });

        return { success: true, user: updated };
    } catch (e) {
        console.error("Failed to update avatar:", e);
        return { error: 'Failed' };
    }
}
