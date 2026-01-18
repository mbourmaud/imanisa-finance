'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	GlassCard,
	MoreHorizontal,
	Progress,
	Row,
	Stack,
	Text,
	type LucideIcon,
} from '@/components'

// =============================================================================
// TYPES
// =============================================================================

interface BudgetCategoryCardProps {
	/** Category name */
	name: string
	/** Icon component */
	icon: LucideIcon
	/** Category color (oklch format) */
	color: string
	/** Budget amount */
	budget: number
	/** Amount spent */
	spent: number
	/** Currency formatter function */
	formatCurrency: (amount: number) => string
	/** Called when view transactions is clicked */
	onViewTransactions?: () => void
	/** Called when edit budget is clicked */
	onEditBudget?: () => void
	/** Called when delete is clicked */
	onDelete?: () => void
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
		const percentage = (spent / budget) * 100
		const isOverBudget = spent > budget
		const remainingBudget = budget - spent

		return (
			<GlassCard ref={ref} padding="md">
				<Stack gap="sm">
					<Row justify="between" align="start">
						<Row gap="sm" align="center">
							<div
								className="flex h-10 w-10 items-center justify-center rounded-xl"
								style={{
									backgroundColor: `${color}20`,
									color: color,
								}}
							>
								<Icon className="h-5 w-5" />
							</div>
							<Stack gap="none">
								<Text weight="medium">{name}</Text>
								<Text size="xs" color="muted">
									{formatCurrency(spent)} / {formatCurrency(budget)}
								</Text>
							</Stack>
						</Row>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" style={{ height: '2rem', width: '2rem' }}>
									<MoreHorizontal style={{ height: '1rem', width: '1rem' }} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={onViewTransactions}>
									Voir les transactions
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onEditBudget}>Modifier le budget</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={onDelete}
									style={{ color: 'hsl(var(--destructive))' }}
								>
									Supprimer
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</Row>
					<Stack gap="xs">
						<Progress
							value={Math.min(percentage, 100)}
							style={{
								height: '0.5rem',
								...(isOverBudget &&
									({
										'--progress-foreground': 'hsl(var(--destructive))',
									} as React.CSSProperties)),
							}}
						/>
						<Row justify="between">
							<Text
								size="xs"
								weight={isOverBudget ? 'medium' : 'normal'}
								color={isOverBudget ? 'destructive' : 'muted'}
							>
								{isOverBudget
									? `Dépassé de ${formatCurrency(Math.abs(remainingBudget))}`
									: `Reste ${formatCurrency(remainingBudget)}`}
							</Text>
							<Text size="xs" color="muted">
								{Math.round(percentage)}%
							</Text>
						</Row>
					</Stack>
				</Stack>
			</GlassCard>
		)
	},
)
BudgetCategoryCard.displayName = 'BudgetCategoryCard'

// =============================================================================
// EXPORTS
// =============================================================================

export { BudgetCategoryCard }
export type { BudgetCategoryCardProps }
