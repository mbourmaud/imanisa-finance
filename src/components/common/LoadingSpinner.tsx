'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from '@/components'

// =============================================================================
// TYPES
// =============================================================================

type LoadingSpinnerSize = 'sm' | 'md' | 'lg'

// =============================================================================
// STYLE MAPS
// =============================================================================

const containerSizeClasses: Record<LoadingSpinnerSize, string> = {
	sm: 'h-8 w-8',
	md: 'h-12 w-12',
	lg: 'h-16 w-16',
}

const iconSizeClasses: Record<LoadingSpinnerSize, string> = {
	sm: 'h-4 w-4',
	md: 'h-6 w-6',
	lg: 'h-8 w-8',
}

// =============================================================================
// LOADING SPINNER COMPONENT
// =============================================================================

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: LoadingSpinnerSize
}

/**
 * Animated loading spinner with gradient background.
 */
const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
	({ size = 'md', className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="loading-spinner"
				className={cn('relative', className)}
				{...props}
			>
				<div
					className={cn(
						'rounded-full animate-pulse',
						containerSizeClasses[size],
					)}
					style={{
						background:
							'linear-gradient(to bottom right, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))',
					}}
				/>
				<Loader2
					className={cn(
						'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary',
						iconSizeClasses[size],
					)}
				/>
			</div>
		)
	},
)
LoadingSpinner.displayName = 'LoadingSpinner'

// =============================================================================
// EXPORTS
// =============================================================================

export { LoadingSpinner }
export type { LoadingSpinnerProps, LoadingSpinnerSize }
