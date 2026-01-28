'use client';

import type { LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Icon to display */
	icon?: LucideIcon;
	/** Custom icon element (alternative to icon prop) */
	iconElement?: React.ReactNode;
	/** Title text */
	title: string;
	/** Description text */
	description?: string;
	/** Action element (button, link, etc.) */
	action?: React.ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
	({ className, icon: Icon, iconElement, title, description, action, ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="empty-state"
				className={cn('flex flex-col items-center justify-center text-center py-12', className)}
				{...props}
			>
				{/* Icon */}
				{(Icon || iconElement) && (
					<div className="flex items-center justify-center h-20 w-20 rounded-full bg-muted/50 mb-4">
						{iconElement || (Icon && <Icon className="h-12 w-12 text-muted-foreground" />)}
					</div>
				)}

				{/* Text content */}
				<div>
					<h3 className="text-lg font-semibold text-foreground">{title}</h3>
					{description && (
						<p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
					)}
				</div>

				{/* Action */}
				{action && <div className="mt-4">{action}</div>}
			</div>
		);
	},
);
EmptyState.displayName = 'EmptyState';

// =============================================================================
// EXPORTS
// =============================================================================

export { EmptyState };
export type { EmptyStateProps };
