'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// PAGE HEADER COMPONENT
// =============================================================================

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Page title */
	title: string;
	/** Optional description text */
	description?: string;
	/** Action elements (buttons, etc.) */
	actions?: React.ReactNode;
}

const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
	({ className, title, description, actions, ...props }, ref) => {
		return (
			<div ref={ref} data-slot="page-header" className={cn(className)} {...props}>
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1 min-w-0">
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
						{description && <p className="text-sm text-muted-foreground">{description}</p>}
					</div>
					{actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
				</div>
			</div>
		);
	},
);
PageHeader.displayName = 'PageHeader';

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Section title */
	title: string;
	/** Optional description text */
	description?: string;
	/** Action elements (buttons, links, etc.) */
	action?: React.ReactNode;
}

function SectionHeader({ className, title, description, action, ...props }: SectionHeaderProps) {
	return (
		<div data-slot="section-header" className={cn(className)} {...props}>
			<div className="flex items-center justify-between gap-4">
				<div className="min-w-0 flex-1">
					<h2 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h2>
					{description && (
						<p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
					)}
				</div>
				{action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
			</div>
		</div>
	);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { PageHeader, SectionHeader };
export type { PageHeaderProps, SectionHeaderProps };
