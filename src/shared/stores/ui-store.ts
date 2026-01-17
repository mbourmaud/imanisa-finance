'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Toast notification type
 */
export interface Toast {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message?: string;
	duration?: number;
}

/**
 * UI Store state interface
 */
interface UIState {
	// Notifications
	toasts: Toast[];

	// Global loading
	isGlobalLoading: boolean;
	loadingMessage: string | null;

	// Sidebar (persisted)
	sidebarCollapsed: boolean;

	// Command palette
	isCommandPaletteOpen: boolean;

	// Actions
	addToast: (toast: Omit<Toast, 'id'>) => void;
	removeToast: (id: string) => void;
	clearToasts: () => void;

	setGlobalLoading: (loading: boolean, message?: string) => void;

	toggleSidebar: () => void;
	setSidebarCollapsed: (collapsed: boolean) => void;

	openCommandPalette: () => void;
	closeCommandPalette: () => void;
	toggleCommandPalette: () => void;
}

/**
 * Generate unique ID for toasts
 */
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Global UI store
 */
export const useUIStore = create<UIState>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				toasts: [],
				isGlobalLoading: false,
				loadingMessage: null,
				sidebarCollapsed: false,
				isCommandPaletteOpen: false,

				// Toast actions
				addToast: (toast) => {
					const id = generateId();
					const newToast: Toast = { ...toast, id };

					set({ toasts: [...get().toasts, newToast] });

					// Auto-remove after duration
					const duration = toast.duration ?? 5000;
					if (duration > 0) {
						setTimeout(() => {
							get().removeToast(id);
						}, duration);
					}
				},

				removeToast: (id) => {
					set({ toasts: get().toasts.filter((t) => t.id !== id) });
				},

				clearToasts: () => {
					set({ toasts: [] });
				},

				// Loading actions
				setGlobalLoading: (loading, message) => {
					set({ isGlobalLoading: loading, loadingMessage: message ?? null });
				},

				// Sidebar actions
				toggleSidebar: () => {
					set({ sidebarCollapsed: !get().sidebarCollapsed });
				},

				setSidebarCollapsed: (collapsed) => {
					set({ sidebarCollapsed: collapsed });
				},

				// Command palette actions
				openCommandPalette: () => {
					set({ isCommandPaletteOpen: true });
				},

				closeCommandPalette: () => {
					set({ isCommandPaletteOpen: false });
				},

				toggleCommandPalette: () => {
					set({ isCommandPaletteOpen: !get().isCommandPaletteOpen });
				},
			}),
			{
				name: 'ui-store',
				partialize: (state) => ({
					sidebarCollapsed: state.sidebarCollapsed,
				}),
			},
		),
		{ name: 'ui-store' },
	),
);

/**
 * Toast helper functions
 */
export const toast = {
	success: (title: string, message?: string) => {
		useUIStore.getState().addToast({ type: 'success', title, message });
	},

	error: (title: string, message?: string) => {
		useUIStore.getState().addToast({ type: 'error', title, message, duration: 8000 });
	},

	warning: (title: string, message?: string) => {
		useUIStore.getState().addToast({ type: 'warning', title, message });
	},

	info: (title: string, message?: string) => {
		useUIStore.getState().addToast({ type: 'info', title, message });
	},
};
