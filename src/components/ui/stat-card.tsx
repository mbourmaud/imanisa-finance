'use client';

import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';

// =============================================================================
// STAT CARD TYPES
// =============================================================================

type StatCardVariant = 'default' | 'coral' | 'teal' | 'purple' | 'gold' | 'mint';
type TrendDirection = 'up' | 'down' | 'neutral';

// =============================================================================
// VARIANT CLASSES
// =============================================================================

const cardVariantClasses: Record<StatCardVariant, string> = {
	default: '',
	coral: 'border-l-4 border-l-[oklch(0.7_0.2_25)]',
	teal: 'border-l-4 border-l-[oklch(0.7_0.15_180)]',
	purple: 'border-l-4 border-l-[oklch(0.65_0.18_290)]',
	gold: 'border-l-4 border-l-[oklch(0.8_0.15_85)]',
	mint: 'border-l-4 border-l-[oklch(0.7_0.15_160)]',
};

const iconVariantClasses: Record<StatCardVariant, string> = {
	default: 'bg-primary text-primary-foreground',
	coral: 'bg-[oklch(0.7_0.2_25)] text-white',
	teal: 'bg-[oklch(0.7_0.15_180)] text-white',
	purple: 'bg-[oklch(0.65_0.18_290)] text-white',
	gold: 'bg-[oklch(0.8_0.15_85)] text-white',
	mint: 'bg-[oklch(0.7_0.15_160)] text-white',
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
			<Card
				ref={ref}
				data-slot="stat-card"
				padding="md"
				className={cn(
					'transition-all',
					cardVariantClasses[variant],
					interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg',
					className,
				)}
				{...props}
			>
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
						<p className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight tabular-nums">
							{value}
						</p>
						{(description || trend) && (
							<div className="mt-1 flex items-center gap-2">
								{description && (
									<span className="text-xs text-muted-foreground">{description}</span>
								)}
								{trend && trend !== 'neutral' && (
									<span
										className={cn(
											'inline-flex items-center gap-0.5 text-xs font-medium',
											trend === 'up' && 'text-[oklch(0.55_0.18_145)]',
											trend === 'down' && 'text-[oklch(0.6_0.2_25)]',
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
						<div
							className={cn(
								'flex-shrink-0 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl',
								iconVariantClasses[variant],
							)}
						>
							<Icon className="h-5 w-5 sm:h-6 sm:w-6" />
						</div>
					)}
				</div>
			</Card>
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
		<Card
			data-slot="stat-card-skeleton"
			padding="md"
			className={cn(cardVariantClasses[variant], 'animate-pulse', className)}
			{...props}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1 space-y-2">
					<div className="h-4 w-24 rounded bg-muted" />
					<div className="h-8 w-32 rounded bg-muted" />
				</div>
				<div
					className={cn(
						'flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-2xl opacity-50',
						iconVariantClasses[variant],
					)}
				/>
			</div>
		</Card>
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
