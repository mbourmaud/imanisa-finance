'use client'

import { EmptyState, Loader2 } from '@/components'

/**
 * Loading state displayed while account data is being fetched
 */
export function AccountLoadingState() {
	return (
		<EmptyState
			title="Chargement du compte..."
			iconElement={
				<div className="relative">
					<div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
					<Loader2 className="h-6 w-6 text-primary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
				</div>
			}
			size="md"
		/>
	)
}
