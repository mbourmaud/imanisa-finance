'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// GLASS COMPONENT
// =============================================================================
// Glassmorphism container with variants for different use cases

type GlassVariant = 'card' | 'panel' | 'subtle' | 'surface';
type GlassPadding = 'none' | 'sm' | 'md' | 'lg';
type GlassRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Visual style variant */
	variant?: GlassVariant;
	/** Internal padding */
	padding?: GlassPadding;
	/** Border radius */
	radius?: GlassRadius;
	/** Interactive hover effect */
	interactive?: boolean;
}

const variantClasses: Record<GlassVariant, string> = {
	card: 'glass-card',
	panel: 'glass-card border-border/40',
	subtle: 'glass-surface',
	surface: 'glass-surface border-0',
};

const paddingClasses: Record<GlassPadding, string> = {
	none: '',
	sm: 'p-4',
	md: 'p-6',
	lg: 'p-8',
};

const radiusClasses: Record<GlassRadius, string> = {
	none: 'rounded-none',
	sm: 'rounded-sm',
	md: 'rounded-md',
	lg: 'rounded-lg',
	xl: 'rounded-xl',
	'2xl': 'rounded-2xl',
};

const Glass = forwardRef<HTMLDivElement, GlassProps>(
	(
		{
			className,
			variant = 'card',
			padding = 'md',
			radius = '2xl',
			interactive = false,
			...props
		},
		ref
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					variantClasses[variant],
					paddingClasses[padding],
					radiusClasses[radius],
					interactive && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer',
					className
				)}
				{...props}
			/>
		);
	}
);
Glass.displayName = 'Glass';

export { Glass };
export type { GlassProps, GlassVariant, GlassPadding, GlassRadius };
