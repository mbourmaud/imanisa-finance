'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// LIST HEADER COMPONENT
// =============================================================================

interface ListHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Main title */
	title: string;
	/** Optional count or subtitle */
	subtitle?: string;
	/** Optional action element */
	action?: React.ReactNode;
}

/**
 * Header for list sections with title, subtitle and optional action.
 */
const ListHeader = forwardRef<HTMLDivElement, ListHeaderProps>(
	({ title, subtitle, action, className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="list-header"
				className={cn('flex items-center justify-between p-4 border-b border-border', className)}
				{...props}
			>
				<div className="flex items-center gap-4">
					<h3 className="text-base font-semibold">{title}</h3>
					{subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
				</div>
				{action}
			</div>
		);
	},
);
ListHeader.displayName = 'ListHeader';

// =============================================================================
// EXPORTS
// =============================================================================

export { ListHeader };
export type { ListHeaderProps };
