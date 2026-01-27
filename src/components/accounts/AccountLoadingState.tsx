'use client';

import { EmptyState, Loader2 } from '@/components';

/**
 * Loading state displayed while account data is being fetched
 */
export function AccountLoadingState() {
	return (
		<EmptyState
			title="Chargement du compte..."
			iconElement={<Loader2 className="h-12 w-12 text-primary animate-spin" />}
		/>
	);
}
