'use client'

import { useEntityStore } from '@/shared/stores'

/**
 * Returns the selected member ID based on the entity selector.
 * - Family view: returns undefined (no filtering)
 * - Individual view: returns the real member ID from the database
 */
export function useSelectedMemberId(): string | undefined {
	return useEntityStore((s) => s.getSelectedMemberId())
}
