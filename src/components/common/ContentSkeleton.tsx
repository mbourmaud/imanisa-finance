'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type ContentSkeletonVariant = 'text' | 'title' | 'avatar' | 'badge' | 'icon' | 'card';
type ContentSkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// =============================================================================
// STYLE MAPS
// =============================================================================

const variantClasses: Record<ContentSkeletonVariant, string> = {
	text: 'rounded-md',
	title: 'rounded-md',
	avatar: 'rounded-full',
	badge: 'rounded-full',
	icon: 'rounded-xl',
	card: 'rounded-xl',
};

const sizeMap: Record<
	ContentSkeletonVariant,
	Record<ContentSkeletonSize, { height: string; width: string }>
> = {
	text: {
		xs: { height: '0.75rem', width: '4rem' },
		sm: { height: '1rem', width: '5rem' },
		md: { height: '1rem', width: '8rem' },
		lg: { height: '1.25rem', width: '10rem' },
		xl: { height: '1.5rem', width: '12rem' },
	},
	title: {
		xs: { height: '1rem', width: '6rem' },
		sm: { height: '1.25rem', width: '8rem' },
		md: { height: '1.5rem', width: '10rem' },
		lg: { height: '1.75rem', width: '12rem' },
		xl: { height: '2rem', width: '14rem' },
	},
	avatar: {
		xs: { height: '2rem', width: '2rem' },
		sm: { height: '2.5rem', width: '2.5rem' },
		md: { height: '3rem', width: '3rem' },
		lg: { height: '4rem', width: '4rem' },
		xl: { height: '5rem', width: '5rem' },
	},
	badge: {
		xs: { height: '1rem', width: '3rem' },
		sm: { height: '1.25rem', width: '4rem' },
		md: { height: '1.5rem', width: '5rem' },
		lg: { height: '1.75rem', width: '6rem' },
		xl: { height: '2rem', width: '7rem' },
	},
	icon: {
		xs: { height: '2rem', width: '2rem' },
		sm: { height: '2.5rem', width: '2.5rem' },
		md: { height: '3rem', width: '3rem' },
		lg: { height: '3.5rem', width: '3.5rem' },
		xl: { height: '4rem', width: '4rem' },
	},
	card: {
		xs: { height: '4rem', width: '100%' },
		sm: { height: '5rem', width: '100%' },
		md: { height: '6rem', width: '100%' },
		lg: { height: '8rem', width: '100%' },
		xl: { height: '10rem', width: '100%' },
	},
};

// =============================================================================
// CONTENT SKELETON COMPONENT
// =============================================================================

interface ContentSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Type of content being represented */
	variant?: ContentSkeletonVariant;
	/** Size preset */
	size?: ContentSkeletonSize;
	/** Custom width (overrides size preset) */
	width?: string;
	/** Custom height (overrides size preset) */
	height?: string;
}

/**
 * A skeleton placeholder for loading states.
 * Uses CSS animations for the pulse effect.
 */
const ContentSkeleton = forwardRef<HTMLDivElement, ContentSkeletonProps>(
	({ variant = 'text', size = 'md', width, height, className, style, ...props }, ref) => {
		const dimensions = sizeMap[variant][size];
		const dimensionStyle = {
			'--skeleton-height': height ?? dimensions.height,
			'--skeleton-width': width ?? dimensions.width,
			...style,
		} as React.CSSProperties;

		return (
			<div
				ref={ref}
				data-slot="content-skeleton"
				className={cn(
					'bg-muted animate-pulse h-[var(--skeleton-height)] w-[var(--skeleton-width)]',
					variantClasses[variant],
					className,
				)}
				style={dimensionStyle}
				{...props}
			/>
		);
	},
);
ContentSkeleton.displayName = 'ContentSkeleton';

// =============================================================================
// EXPORTS
// =============================================================================

export { ContentSkeleton };
export type { ContentSkeletonProps, ContentSkeletonVariant, ContentSkeletonSize };
