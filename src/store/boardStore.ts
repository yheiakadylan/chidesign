import { create } from 'zustand';

export type UserRole = 'SUPER_ADMIN' | 'CLIENT_MANAGER' | 'CLIENT_USER' | 'DESIGN_MANAGER' | 'DESIGNER';

export interface KanbanState {
    ideas: any[];
    role: UserRole;
    loading: boolean;
    setIdeas: (ideas: any[]) => void;
    setRole: (role: UserRole) => void;
    moveIdea: (sku: string, toStatus: string) => void;
    removeIdea: (sku: string) => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
    ideas: [],
    // For demo/testing, defaulting to SUPER_ADMIN. We will make this switchable via a UI picker later.
    role: 'SUPER_ADMIN',
    loading: false,
    setIdeas: (ideas) => set({ ideas }),
    setRole: (role) => set({ role }),
    moveIdea: (sku, toStatus) => set((state) => ({
        ideas: state.ideas.map((idea) =>
            idea.id === sku ? { ...idea, status: toStatus } : idea
        )
    })),
    removeIdea: (sku) => set((state) => ({
        ideas: state.ideas.filter((idea) => idea.id !== sku)
    })),
}));

export const ROLES_PERMISSIONS: Record<UserRole, {
    canDragAnywhere: boolean;
    canViewPink: boolean;
    allowedTransitions?: Record<string, string[]>;
}> = {
    SUPER_ADMIN: {
        canDragAnywhere: true,
        canViewPink: true,
    },
    CLIENT_MANAGER: {
        canDragAnywhere: false,
        allowedTransitions: {
            'DRAFT': ['NEW'],
            'NEW': ['DRAFT']
        },
        canViewPink: true,
    },
    CLIENT_USER: {
        canDragAnywhere: false,
        allowedTransitions: {
            'IN_REVIEW': ['DONE', 'NEED_FIX']
        },
        canViewPink: true,
    },
    DESIGN_MANAGER: {
        canDragAnywhere: false,
        allowedTransitions: {
            'CHECK': ['IN_REVIEW', 'NEED_FIX']
        },
        canViewPink: true,
    },
    DESIGNER: {
        canDragAnywhere: false,
        allowedTransitions: {
            'NEW': ['DOING'],
            'DOING': ['CHECK'],
            'NEED_FIX': ['DOING']
        },
        canViewPink: false,
    }
};

export const canMoveTask = (role: UserRole, fromStatus: string, toStatus: string): boolean => {
    const permissions = ROLES_PERMISSIONS[role];
    if (permissions.canDragAnywhere) return true;

    const allowed = permissions.allowedTransitions?.[fromStatus];
    if (!allowed) return false;

    return allowed.includes(toStatus);
};
