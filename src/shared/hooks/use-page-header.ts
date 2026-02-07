'use client';

import type { ReactNode } from 'react';
import { useEffect, useLayoutEffect } from 'react';
import { useHeaderStore } from '@/shared/stores';

/**
 * Set the dashboard header title, description and actions for the current page.
 * Automatically clears on unmount.
 */
export function usePageHeader(title: string, description?: string, actions?: ReactNode) {
	const setHeader = useHeaderStore((s) => s.setHeader);
	const clearHeader = useHeaderStore((s) => s.clearHeader);

	// Sync header content before paint on every render
	useLayoutEffect(() => {
		setHeader(title, description, actions);
	});

	// Clear header on unmount
	useEffect(() => {
		return () => clearHeader();
	}, [clearHeader]);
}
