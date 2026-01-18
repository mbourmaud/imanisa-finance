'use client';

import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// STAT CARD TYPES
// =============================================================================

type StatCardVariant = 'default' | 'coral' | 'teal' | 'purple' | 'gold' | 'mint';
type TrendDirection = 'up' | 'down' | 'neutral';

// =============================================================================
// VARIANT CLASSES
// =============================================================================

const cardVariantClasses: Record<StatCardVariant, string> = {
	default: 'stat-card',
	coral: 'stat-card stat-card-coral',
	teal: 'stat-card stat-card-teal',
	purple: 'stat-card stat-card-purple',
	gold: 'stat-card stat-card-gold',
	mint: 'stat-card',
};

const iconVariantClasses: Record<StatCardVariant, string> = {
	default: 'stat-card-icon bg-primary',
	coral: 'stat-card-icon stat-card-icon-coral',
	teal: 'stat-card-icon stat-card-icon-teal',
	purple: 'stat-card-icon stat-card-icon-purple',
	gold: 'stat-card-icon stat-card-icon-gold',
	mint: 'stat-card-icon stat-card-icon-mint',
};

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Card color variant */
	variant?: StatCardVariant;
	/** Icon to display */
	icon?: LucideIcon;
	/** Label text */
	label: string;
	/** Main value to display */
	value: string | number;
	/** Optional description text */
	description?: string;
	/** Trend direction for indicator */
	trend?: TrendDirection;
	/** Trend value (e.g., "+12.5%") */
	trendValue?: string;
	/** Whether the card is interactive (clickable) */
	interactive?: boolean;
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
	(
		{
			className,
			variant = 'default',
			icon: Icon,
			label,
			value,
			description,
			trend,
			trendValue,
			interactive = false,
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				data-slot="stat-card"
				className={cn(cardVariantClasses[variant], interactive && 'cursor-pointer', className)}
				{...props}
			>
				<div className="stat-card-content">
					<div className="stat-card-text">
						<p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
						<p className="stat-card-value">{value}</p>
						{(description || trend) && (
							<div className="mt-1 flex items-center gap-2">
								{description && (
									<span className="text-xs text-muted-foreground">{description}</span>
								)}
								{trend && trend !== 'neutral' && (
									<span
										className={cn(
											'inline-flex items-center gap-0.5 text-xs font-medium',
											trend === 'up' && 'value-positive',
											trend === 'down' && 'value-negative',
										)}
									>
										{trend === 'up' ? (
											<TrendingUp className="h-3 w-3" />
										) : (
											<TrendingDown className="h-3 w-3" />
										)}
										{trendValue}
									</span>
								)}
							</div>
						)}
					</div>
					{Icon && (
						<div className={iconVariantClasses[variant]}>
							<Icon className="h-5 w-5 sm:h-6 sm:w-6" />
						</div>
					)}
				</div>
			</div>
		);
	},
);
StatCard.displayName = 'StatCard';

// =============================================================================
// STAT CARD GRID
// =============================================================================

interface StatCardGridProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Number of columns on large screens */
	columns?: 2 | 3 | 4;
}

function StatCardGrid({ className, columns = 4, children, ...props }: StatCardGridProps) {
	const columnClasses = {
		2: 'grid-cols-1 sm:grid-cols-2',
		3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
		4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
	};

	return (
		<div
			data-slot="stat-card-grid"
			className={cn('grid gap-4', columnClasses[columns], className)}
			{...props}
		>
			{children}
		</div>
	);
}

// =============================================================================
// STAT CARD SKELETON
// =============================================================================

interface StatCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Card color variant for the skeleton */
	variant?: StatCardVariant;
}

function StatCardSkeleton({ className, variant = 'default', ...props }: StatCardSkeletonProps) {
	return (
		<div
			data-slot="stat-card-skeleton"
			className={cn(cardVariantClasses[variant], 'animate-pulse', className)}
			{...props}
		>
			<div className="stat-card-content">
				<div className="stat-card-text space-y-2">
					<div className="h-4 w-24 rounded bg-muted" />
					<div className="h-8 w-32 rounded bg-muted" />
				</div>
				<div className={cn(iconVariantClasses[variant], 'opacity-50')} />
			</div>
		</div>
	);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { StatCard, StatCardGrid, StatCardSkeleton };
export type {
	StatCardProps,
	StatCardGridProps,
	StatCardSkeletonProps,
	StatCardVariant,
	TrendDirection,
};
