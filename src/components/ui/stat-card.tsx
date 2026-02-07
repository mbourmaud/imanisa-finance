'use client';

import type { LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';

// =============================================================================
// STAT CARD TYPES
// =============================================================================

type StatCardVariant = 'default' | 'coral' | 'teal' | 'purple' | 'gold' | 'mint';

// =============================================================================
// VARIANT CLASSES
// =============================================================================

const iconVariantClasses: Record<StatCardVariant, string> = {
	default: 'text-muted-foreground',
	coral: 'text-[oklch(0.6_0.2_25)]',
	teal: 'text-[oklch(0.55_0.15_180)]',
	purple: 'text-[oklch(0.55_0.18_290)]',
	gold: 'text-[oklch(0.65_0.15_85)]',
	mint: 'text-[oklch(0.55_0.15_160)]',
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
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
	({ className, variant = 'default', icon: Icon, label, value, description, ...props }, ref) => {
		return (
			<Card
				ref={ref}
				data-slot="stat-card"
				padding="md"
				className={cn('gap-3 transition-all', className)}
				{...props}
			>
				<div className="flex items-center justify-between">
					<p className="text-sm font-medium text-muted-foreground">{label}</p>
					{Icon && (
						<Icon className={cn('h-4 w-4', iconVariantClasses[variant])} />
					)}
				</div>
				<div className="flex flex-col gap-1">
					<p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
					{description && (
						<p className="text-xs text-muted-foreground">{description}</p>
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

interface StatCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function StatCardSkeleton({ className, ...props }: StatCardSkeletonProps) {
	return (
		<Card
			data-slot="stat-card-skeleton"
			padding="md"
			className={cn('gap-3 animate-pulse', className)}
			{...props}
		>
			<div className="flex items-center justify-between">
				<div className="h-4 w-20 rounded bg-muted" />
				<div className="h-4 w-4 rounded bg-muted" />
			</div>
			<div className="flex flex-col gap-1">
				<div className="h-7 w-32 rounded bg-muted" />
			</div>
		</Card>
	);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { StatCard, StatCardGrid, StatCardSkeleton };
export type { StatCardProps, StatCardGridProps, StatCardSkeletonProps, StatCardVariant };
