'use client';

import type { LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// EMPTY STATE TYPES
// =============================================================================

type EmptyStateSize = 'sm' | 'md' | 'lg';
type EmptyStateVariant = 'default' | 'card' | 'inline';

// =============================================================================
// SIZE AND VARIANT CLASSES
// =============================================================================

const containerSizeClasses: Record<EmptyStateSize, string> = {
	sm: 'py-8',
	md: 'py-12',
	lg: 'py-16',
};

const iconSizeClasses: Record<EmptyStateSize, string> = {
	sm: 'h-10 w-10',
	md: 'h-12 w-12',
	lg: 'h-16 w-16',
};

const iconContainerSizeClasses: Record<EmptyStateSize, string> = {
	sm: 'h-16 w-16',
	md: 'h-20 w-20',
	lg: 'h-24 w-24',
};

const titleSizeClasses: Record<EmptyStateSize, string> = {
	sm: 'text-base',
	md: 'text-lg',
	lg: 'text-xl',
};

const descriptionSizeClasses: Record<EmptyStateSize, string> = {
	sm: 'text-xs',
	md: 'text-sm',
	lg: 'text-base',
};

const variantClasses: Record<EmptyStateVariant, string> = {
	default: '',
	card: 'bg-card border rounded-2xl shadow-sm p-8',
	inline: 'flex flex-row items-center gap-4 text-left',
};

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
	/** Size variant */
	size?: EmptyStateSize;
	/** Visual variant */
	variant?: EmptyStateVariant;
	/** Action element (button, link, etc.) */
	action?: React.ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
	(
		{
			className,
			icon: Icon,
			iconElement,
			title,
			description,
			size = 'md',
			variant = 'default',
			action,
			...props
		},
		ref,
	) => {
		const isInline = variant === 'inline';

		return (
			<div
				ref={ref}
				data-slot="empty-state"
				className={cn(
					'flex flex-col items-center justify-center text-center',
					!isInline && containerSizeClasses[size],
					variantClasses[variant],
					className,
				)}
				{...props}
			>
				{/* Icon */}
				{(Icon || iconElement) && (
					<div
						className={cn(
							'flex items-center justify-center rounded-full bg-muted/50',
							!isInline && 'mb-4',
							iconContainerSizeClasses[size],
						)}
					>
						{iconElement ||
							(Icon && <Icon className={cn('text-muted-foreground', iconSizeClasses[size])} />)}
					</div>
				)}

				{/* Text content */}
				<div className={cn(isInline && 'flex-1')}>
					<h3 className={cn('font-semibold text-foreground', titleSizeClasses[size])}>{title}</h3>
					{description && (
						<p
							className={cn(
								'mt-1 text-muted-foreground',
								descriptionSizeClasses[size],
								!isInline && 'max-w-sm mx-auto',
							)}
						>
							{description}
						</p>
					)}
				</div>

				{/* Action */}
				{action && <div className={cn('mt-4', isInline && 'ml-auto mt-0')}>{action}</div>}
			</div>
		);
	},
);
EmptyState.displayName = 'EmptyState';

// =============================================================================
// EMPTY STATE PRESETS
// =============================================================================

interface EmptyStatePresetProps extends Omit<EmptyStateProps, 'icon' | 'title' | 'description'> {
	action?: React.ReactNode;
}

// No accounts
function EmptyStateNoAccounts({ action, ...props }: EmptyStatePresetProps) {
	return (
		<EmptyState
			iconElement={<span className="text-3xl">🏦</span>}
			title="Aucun compte"
			description="Vous n'avez pas encore ajouté de compte bancaire. Ajoutez votre premier compte pour commencer."
			action={action}
			{...props}
		/>
	);
}

// No transactions
function EmptyStateNoTransactions({ action, ...props }: EmptyStatePresetProps) {
	return (
		<EmptyState
			iconElement={<span className="text-3xl">📄</span>}
			title="Aucune transaction"
			description="Ce compte n'a pas encore de transactions. Importez vos relevés pour voir l'historique."
			action={action}
			{...props}
		/>
	);
}

// No search results
function EmptyStateNoResults({ action, ...props }: EmptyStatePresetProps) {
	return (
		<EmptyState
			iconElement={<span className="text-3xl">🔍</span>}
			title="Aucun résultat"
			description="Aucun élément ne correspond à votre recherche. Essayez de modifier vos critères."
			action={action}
			{...props}
		/>
	);
}

// Error state
function EmptyStateError({ action, ...props }: EmptyStatePresetProps) {
	return (
		<EmptyState
			iconElement={<span className="text-3xl">⚠️</span>}
			title="Une erreur est survenue"
			description="Impossible de charger les données. Veuillez réessayer."
			action={action}
			{...props}
		/>
	);
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
	EmptyState,
	EmptyStateNoAccounts,
	EmptyStateNoTransactions,
	EmptyStateNoResults,
	EmptyStateError,
};
export type { EmptyStateProps, EmptyStatePresetProps, EmptyStateSize, EmptyStateVariant };
