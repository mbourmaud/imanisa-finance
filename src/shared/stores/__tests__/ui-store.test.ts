import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUIStore, toast } from '../ui-store';

describe('useUIStore', () => {
	beforeEach(() => {
		// Reset store state between tests
		useUIStore.setState({
			toasts: [],
			isGlobalLoading: false,
			loadingMessage: null,
			sidebarCollapsed: false,
			isCommandPaletteOpen: false,
		});
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('initial state', () => {
		it('should have empty toasts array', () => {
			expect(useUIStore.getState().toasts).toEqual([]);
		});

		it('should not be globally loading', () => {
			expect(useUIStore.getState().isGlobalLoading).toBe(false);
		});

		it('should have sidebar expanded by default', () => {
			expect(useUIStore.getState().sidebarCollapsed).toBe(false);
		});

		it('should have command palette closed', () => {
			expect(useUIStore.getState().isCommandPaletteOpen).toBe(false);
		});
	});

	describe('sidebar actions', () => {
		it('should toggle sidebar collapsed state', () => {
			const { toggleSidebar } = useUIStore.getState();

			act(() => {
				toggleSidebar();
			});
			expect(useUIStore.getState().sidebarCollapsed).toBe(true);

			act(() => {
				toggleSidebar();
			});
			expect(useUIStore.getState().sidebarCollapsed).toBe(false);
		});

		it('should set sidebar collapsed state directly', () => {
			const { setSidebarCollapsed } = useUIStore.getState();

			act(() => {
				setSidebarCollapsed(true);
			});
			expect(useUIStore.getState().sidebarCollapsed).toBe(true);

			act(() => {
				setSidebarCollapsed(false);
			});
			expect(useUIStore.getState().sidebarCollapsed).toBe(false);
		});
	});

	describe('command palette actions', () => {
		it('should open command palette', () => {
			const { openCommandPalette } = useUIStore.getState();

			act(() => {
				openCommandPalette();
			});
			expect(useUIStore.getState().isCommandPaletteOpen).toBe(true);
		});

		it('should close command palette', () => {
			useUIStore.setState({ isCommandPaletteOpen: true });
			const { closeCommandPalette } = useUIStore.getState();

			act(() => {
				closeCommandPalette();
			});
			expect(useUIStore.getState().isCommandPaletteOpen).toBe(false);
		});

		it('should toggle command palette', () => {
			const { toggleCommandPalette } = useUIStore.getState();

			act(() => {
				toggleCommandPalette();
			});
			expect(useUIStore.getState().isCommandPaletteOpen).toBe(true);

			act(() => {
				toggleCommandPalette();
			});
			expect(useUIStore.getState().isCommandPaletteOpen).toBe(false);
		});
	});

	describe('global loading actions', () => {
		it('should set global loading state', () => {
			const { setGlobalLoading } = useUIStore.getState();

			act(() => {
				setGlobalLoading(true, 'Loading...');
			});
			expect(useUIStore.getState().isGlobalLoading).toBe(true);
			expect(useUIStore.getState().loadingMessage).toBe('Loading...');
		});

		it('should clear loading message when loading ends', () => {
			useUIStore.setState({ isGlobalLoading: true, loadingMessage: 'Loading...' });
			const { setGlobalLoading } = useUIStore.getState();

			act(() => {
				setGlobalLoading(false);
			});
			expect(useUIStore.getState().isGlobalLoading).toBe(false);
			expect(useUIStore.getState().loadingMessage).toBeNull();
		});
	});

	describe('toast actions', () => {
		it('should add a toast', () => {
			const { addToast } = useUIStore.getState();

			act(() => {
				addToast({ type: 'success', title: 'Test toast' });
			});

			const toasts = useUIStore.getState().toasts;
			expect(toasts).toHaveLength(1);
			expect(toasts[0].type).toBe('success');
			expect(toasts[0].title).toBe('Test toast');
		});

		it('should remove a toast', () => {
			const { addToast, removeToast } = useUIStore.getState();

			act(() => {
				addToast({ type: 'success', title: 'Test toast' });
			});

			const toastId = useUIStore.getState().toasts[0].id;

			act(() => {
				removeToast(toastId);
			});

			expect(useUIStore.getState().toasts).toHaveLength(0);
		});

		it('should clear all toasts', () => {
			const { addToast, clearToasts } = useUIStore.getState();

			act(() => {
				addToast({ type: 'success', title: 'Toast 1' });
				addToast({ type: 'error', title: 'Toast 2' });
			});

			expect(useUIStore.getState().toasts).toHaveLength(2);

			act(() => {
				clearToasts();
			});

			expect(useUIStore.getState().toasts).toHaveLength(0);
		});

		it('should auto-remove toast after duration', () => {
			const { addToast } = useUIStore.getState();

			act(() => {
				addToast({ type: 'success', title: 'Auto-remove toast', duration: 1000 });
			});

			expect(useUIStore.getState().toasts).toHaveLength(1);

			act(() => {
				vi.advanceTimersByTime(1000);
			});

			expect(useUIStore.getState().toasts).toHaveLength(0);
		});
	});
});

describe('toast helper', () => {
	beforeEach(() => {
		useUIStore.setState({ toasts: [] });
	});

	it('should add success toast', () => {
		act(() => {
			toast.success('Success title', 'Success message');
		});

		const toasts = useUIStore.getState().toasts;
		expect(toasts).toHaveLength(1);
		expect(toasts[0].type).toBe('success');
		expect(toasts[0].title).toBe('Success title');
		expect(toasts[0].message).toBe('Success message');
	});

	it('should add error toast', () => {
		act(() => {
			toast.error('Error title');
		});

		const toasts = useUIStore.getState().toasts;
		expect(toasts).toHaveLength(1);
		expect(toasts[0].type).toBe('error');
	});

	it('should add warning toast', () => {
		act(() => {
			toast.warning('Warning title');
		});

		const toasts = useUIStore.getState().toasts;
		expect(toasts).toHaveLength(1);
		expect(toasts[0].type).toBe('warning');
	});

	it('should add info toast', () => {
		act(() => {
			toast.info('Info title');
		});

		const toasts = useUIStore.getState().toasts;
		expect(toasts).toHaveLength(1);
		expect(toasts[0].type).toBe('info');
	});
});
