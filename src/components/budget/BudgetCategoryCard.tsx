'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import {
	Button,
	Card,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	MoreHorizontal,
	Progress,
	type LucideIcon,
} from '@/components';

// =============================================================================
// TYPES
// =============================================================================

interface BudgetCategoryCardProps {
	/** Category name */
	name: string;
	/** Icon component */
	icon: LucideIcon;
	/** Category color (oklch format) */
	color: string;
	/** Budget amount */
	budget: number;
	/** Amount spent */
	spent: number;
	/** Currency formatter function */
	formatCurrency: (amount: number) => string;
	/** Called when view transactions is clicked */
	onViewTransactions?: () => void;
	/** Called when edit budget is clicked */
	onEditBudget?: () => void;
	/** Called when delete is clicked */
	onDelete?: () => void;
}

// =============================================================================
// BUDGET CATEGORY CARD COMPONENT
// =============================================================================

/**
 * A card displaying a budget category with progress and actions.
 */
const BudgetCategoryCard = forwardRef<HTMLDivElement, BudgetCategoryCardProps>(
	(
		{
			name,
			icon: Icon,
			color,
			budget,
			spent,
			formatCurrency,
			onViewTransactions,
			onEditBudget,
			onDelete,
		},
		ref,
	) => {
		const percentage = (spent / budget) * 100;
		const isOverBudget = spent > budget;
		const remainingBudget = budget - spent;
		const colorStyle = { '--category-color': color } as React.CSSProperties;

		return (
			<Card ref={ref} padding="md" style={colorStyle}>
				<div className="flex flex-col gap-2">
					<div className="flex flex-row justify-between items-start">
						<div className="flex flex-row gap-2 items-center">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--category-color)]/10 text-[var(--category-color)]">
								<Icon className="h-5 w-5" />
							</div>
							<div className="flex flex-col">
								<span className="font-medium">{name}</span>
								<span className="text-xs text-muted-foreground">
									{formatCurrency(spent)} / {formatCurrency(budget)}
								</span>
							</div>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={onViewTransactions}>
									Voir les transactions
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onEditBudget}>Modifier le budget</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={onDelete} className="text-destructive">
									Supprimer
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<div className="flex flex-col gap-1">
						<Progress
							value={Math.min(percentage, 100)}
							className={cn('h-2', isOverBudget && '[&>div]:bg-destructive')}
						/>
						<div className="flex flex-row justify-between">
							<span
								className={cn(
									'text-xs',
									isOverBudget ? 'font-medium text-destructive' : 'text-muted-foreground',
								)}
							>
								{isOverBudget
									? `Dépassé de ${formatCurrency(Math.abs(remainingBudget))}`
									: `Reste ${formatCurrency(remainingBudget)}`}
							</span>
							<span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
						</div>
					</div>
				</div>
			</Card>
		);
	},
);
BudgetCategoryCard.displayName = 'BudgetCategoryCard';

// =============================================================================
// EXPORTS
// =============================================================================

export { BudgetCategoryCard };
export type { BudgetCategoryCardProps };
