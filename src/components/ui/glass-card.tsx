'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// GLASS CARD TYPES
// =============================================================================

type GlassCardVariant = 'default' | 'elevated' | 'flat' | 'interactive';
type GlassCardPadding = 'sm' | 'md' | 'lg';
type AccentColor = 'coral' | 'teal' | 'purple' | 'gold' | 'mint' | 'primary';

// =============================================================================
// VARIANT CLASSES
// =============================================================================

const variantClasses: Record<GlassCardVariant, string> = {
	default: 'glass-card',
	elevated: cn(
		'glass-card',
		'shadow-[0_8px_32px_oklch(0.3_0.02_260/0.12),0_2px_8px_oklch(0.3_0.02_260/0.08)]',
		'dark:shadow-[0_8px_32px_oklch(0_0_0/0.35),0_2px_8px_oklch(0_0_0/0.25)]',
	),
	flat: cn('rounded-2xl border border-border/40', 'bg-card/50 backdrop-blur-sm'),
	interactive: cn(
		'glass-card',
		'transition-all duration-200 cursor-pointer',
		'hover:-translate-y-0.5 hover:shadow-[0_8px_32px_oklch(0.3_0.02_260/0.15),0_4px_12px_oklch(0.3_0.02_260/0.1)]',
		'dark:hover:shadow-[0_8px_32px_oklch(0_0_0/0.4),0_4px_12px_oklch(0_0_0/0.3)]',
		'active:translate-y-0 active:shadow-none',
	),
};

const paddingClasses: Record<GlassCardPadding, string> = {
	sm: 'p-4',
	md: 'p-6',
	lg: 'p-8',
};

const accentColorClasses: Record<AccentColor, string> = {
	coral: 'before:bg-gradient-to-r before:from-[oklch(0.65_0.18_25)] before:to-[oklch(0.7_0.2_15)]',
	teal: 'before:bg-gradient-to-r before:from-[oklch(0.65_0.15_180)] before:to-[oklch(0.7_0.15_165)]',
	purple:
		'before:bg-gradient-to-r before:from-[oklch(0.6_0.18_290)] before:to-[oklch(0.65_0.2_280)]',
	gold: 'before:bg-gradient-to-r before:from-[oklch(0.75_0.15_85)] before:to-[oklch(0.8_0.18_60)]',
	mint: 'before:bg-gradient-to-r before:from-[oklch(0.65_0.15_160)] before:to-[oklch(0.7_0.18_145)]',
	primary: 'before:bg-gradient-to-r before:from-primary before:to-primary/80',
};

// =============================================================================
// GLASS CARD COMPONENT
// =============================================================================

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Visual style variant */
	variant?: GlassCardVariant;
	/** Internal padding */
	padding?: GlassCardPadding;
	/** Optional accent color bar at the top */
	accent?: AccentColor;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
	({ className, variant = 'default', padding = 'md', accent, children, ...props }, ref) => {
		const hasAccent = !!accent;

		return (
			<div
				ref={ref}
				data-slot="glass-card"
				className={cn(
					variantClasses[variant],
					paddingClasses[padding],
					// Accent bar styles
					hasAccent && [
						'relative',
						'before:absolute before:top-0 before:left-0 before:right-0 before:h-1',
						'before:rounded-t-2xl',
						accentColorClasses[accent],
					],
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
GlassCard.displayName = 'GlassCard';

// =============================================================================
// GLASS CARD HEADER
// =============================================================================

interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Title text */
	title?: string;
	/** Description text */
	description?: string;
	/** Action element (button, menu, etc.) */
	action?: React.ReactNode;
}

function GlassCardHeader({
	className,
	title,
	description,
	action,
	children,
	...props
}: GlassCardHeaderProps) {
	// If children are provided, render them directly
	if (children) {
		return (
			<div
				data-slot="glass-card-header"
				className={cn('flex items-start justify-between gap-4 pb-4', className)}
				{...props}
			>
				{children}
			</div>
		);
	}

	// Otherwise, render structured header
	return (
		<div
			data-slot="glass-card-header"
			className={cn('flex items-start justify-between gap-4 pb-4', className)}
			{...props}
		>
			<div className="space-y-1 min-w-0">
				{title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
				{description && <p className="text-sm text-muted-foreground">{description}</p>}
			</div>
			{action && <div className="flex-shrink-0">{action}</div>}
		</div>
	);
}

// =============================================================================
// GLASS CARD CONTENT
// =============================================================================

function GlassCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div data-slot="glass-card-content" className={cn('', className)} {...props} />;
}

// =============================================================================
// GLASS CARD FOOTER
// =============================================================================

function GlassCardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			data-slot="glass-card-footer"
			className={cn('flex items-center gap-2 pt-4', className)}
			{...props}
		/>
	);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { GlassCard, GlassCardHeader, GlassCardContent, GlassCardFooter };
export type {
	GlassCardProps,
	GlassCardHeaderProps,
	GlassCardVariant,
	GlassCardPadding,
	AccentColor,
};
