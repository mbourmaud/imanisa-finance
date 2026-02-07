import type { ReactNode } from 'react';
import { create } from 'zustand';

interface HeaderState {
	title: string;
	description?: string;
	actions?: ReactNode;
	setHeader: (title: string, description?: string, actions?: ReactNode) => void;
	clearHeader: () => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
	title: '',
	description: undefined,
	actions: undefined,
	setHeader: (title, description, actions) => set({ title, description, actions }),
	clearHeader: () => set({ title: '', description: undefined, actions: undefined }),
}));
