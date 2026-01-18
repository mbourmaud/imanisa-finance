'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ArrowDownLeft, CreditCard, Row, Stack, Text, type LucideIcon } from '@/components'
import { MoneyDifference } from '@/components/common/MoneyDisplay'

// =============================================================================
// TYPES
// =============================================================================

interface TransactionListItemProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Transaction description */
	description: string
	/** Amount (positive for income, negative for expense) */
	amount: number
	/** Category name */
	category: string
	/** Account name */
	account: string
	/** Formatted date string */
	dateLabel: string
	/** Custom icon (optional) */
	icon?: LucideIcon
}

// =============================================================================
// TRANSACTION LIST ITEM COMPONENT
// =============================================================================

/**
 * A single transaction row with icon, description, category, amount and date.
 */
const TransactionListItem = forwardRef<HTMLDivElement, TransactionListItemProps>(
	(
		{
			description,
			amount,
			category,
			account,
			dateLabel,
			icon,
			className,
			...props
		},
		ref,
	) => {
		const isIncome = amount > 0
		const Icon = icon || (isIncome ? ArrowDownLeft : CreditCard)

		return (
			<div
				ref={ref}
				data-slot="transaction-list-item"
				className={cn(
					'flex items-center justify-between p-4 rounded-xl transition-colors',
					'hover:bg-muted/30',
					className,
				)}
				{...props}
			>
				<Row gap="md" align="center">
					<div
						className={cn(
							'flex h-10 w-10 items-center justify-center rounded-xl',
							isIncome ? 'bg-emerald-500/10' : 'bg-muted/30',
						)}
					>
						<Icon
							className={cn(
								'h-5 w-5',
								isIncome ? 'text-emerald-500' : 'text-muted-foreground',
							)}
						/>
					</div>
					<Stack gap="none">
						<Text weight="medium">{description}</Text>
						<Text size="xs" color="muted">
							{category} · {account}
						</Text>
					</Stack>
				</Row>
				<Stack gap="none" align="end">
					<MoneyDifference amount={amount} size="md" />
					<Text size="xs" color="muted">
						{dateLabel}
					</Text>
				</Stack>
			</div>
		)
	},
)
TransactionListItem.displayName = 'TransactionListItem'

// =============================================================================
// EXPORTS
// =============================================================================

export { TransactionListItem }
export type { TransactionListItemProps }
