'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from '@/components';

// =============================================================================
// TYPES
// =============================================================================

type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

// =============================================================================
// STYLE MAPS
// =============================================================================

const iconSizeClasses: Record<LoadingSpinnerSize, string> = {
	sm: 'h-4 w-4',
	md: 'h-8 w-8',
	lg: 'h-12 w-12',
};

// =============================================================================
// LOADING SPINNER COMPONENT
// =============================================================================

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: LoadingSpinnerSize;
}

/**
 * Simple animated loading spinner.
 */
const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
	({ size = 'md', className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="loading-spinner"
				className={cn('flex items-center justify-center', className)}
				{...props}
			>
				<Loader2 className={cn('animate-spin text-primary', iconSizeClasses[size])} />
			</div>
		);
	},
);
LoadingSpinner.displayName = 'LoadingSpinner';

// =============================================================================
// EXPORTS
// =============================================================================

export { LoadingSpinner };
export type { LoadingSpinnerProps, LoadingSpinnerSize };
