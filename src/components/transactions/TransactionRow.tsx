'use client'

import { Check } from 'lucide-react'
import type * as React from 'react'
import { forwardRef } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { CategoryBadge } from './CategoryBadge'
import { TransactionAmount } from './TransactionAmount'
import { TransactionIcon } from './TransactionIcon'
import type { TransactionData } from './transaction-types'
import { formatTransactionDate } from './transaction-utils'

// Re-export types and sub-components for backwards compatibility
export type { TransactionType, TransactionCategory, TransactionData } from './transaction-types'
export type { TransactionIconSize, TransactionIconProps } from './TransactionIcon'
export { TransactionIcon } from './TransactionIcon'
export type { CategoryBadgeProps } from './CategoryBadge'
export { CategoryBadge } from './CategoryBadge'
export type { TransactionAmountProps } from './TransactionAmount'
export { TransactionAmount } from './TransactionAmount'
export type { TransactionListProps } from './TransactionList'
export { TransactionList } from './TransactionList'
export type { TransactionRowSkeletonProps } from './TransactionRowSkeleton'
export { TransactionRowSkeleton } from './TransactionRowSkeleton'

export type TransactionRowVariant = 'default' | 'compact' | 'detailed'

const rowVariantClasses: Record<TransactionRowVariant, string> = {
	compact: 'p-3',
	default: 'p-4',
	detailed: 'p-5',
}

export interface TransactionRowProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	transaction: TransactionData
	variant?: TransactionRowVariant
	showCategory?: boolean
	showAccount?: boolean
	showDate?: boolean
	showIcon?: boolean
	selectable?: boolean
	selected?: boolean
	onSelectChange?: (selected: boolean) => void
	interactive?: boolean
	onTransactionClick?: () => void
}

export const TransactionRow = forwardRef<HTMLDivElement, TransactionRowProps>(
	(
		{
			className,
			transaction,
			variant = 'default',
			showCategory = true,
			showAccount = true,
			showDate = true,
			showIcon = true,
			selectable = false,
			selected = false,
			onSelectChange,
			interactive = false,
			onTransactionClick,
			...props
		},
		ref,
	) => {
		const handleClick = () => {
			if (interactive && onTransactionClick) {
				onTransactionClick()
			}
		}

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (interactive && onTransactionClick && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault()
				onTransactionClick()
			}
		}

		const handleCheckboxChange = (checked: boolean) => {
			if (onSelectChange) {
				onSelectChange(checked)
			}
		}

		return (
			<div
				ref={ref}
				data-slot="transaction-row"
				className={cn(
					'flex items-center justify-between gap-4 rounded-xl transition-colors',
					rowVariantClasses[variant],
					interactive && 'cursor-pointer hover:bg-muted/30',
					selected && 'bg-muted/50',
					className,
				)}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				role={interactive ? 'button' : undefined}
				tabIndex={interactive ? 0 : undefined}
				{...props}
			>
				{/* Left side */}
				<div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
					{selectable && (
						<Checkbox
							checked={selected}
							onCheckedChange={handleCheckboxChange}
							onClick={(e) => e.stopPropagation()}
							aria-label={`Sélectionner ${transaction.description}`}
						/>
					)}

					{showIcon && (
						<TransactionIcon type={transaction.type} size={variant === 'compact' ? 'sm' : 'md'} />
					)}

					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<p className="font-medium truncate">{transaction.description}</p>
							{transaction.isReconciled && (
								<span
									data-slot="reconciled-badge"
									className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary"
									title="Rapproché"
								>
									<Check className="h-2.5 w-2.5" />
								</span>
							)}
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							{showCategory && transaction.category && (
								<>
									<CategoryBadge category={transaction.category} size="sm" />
									{showAccount && transaction.accountName && <span>·</span>}
								</>
							)}
							{showAccount && transaction.accountName && (
								<span className="truncate">{transaction.accountName}</span>
							)}
						</div>
						{variant === 'detailed' && transaction.category && (
							<div className="mt-2">
								<CategoryBadge category={transaction.category} />
							</div>
						)}
					</div>
				</div>

				{/* Right side */}
				<div className="text-right flex-shrink-0">
					<TransactionAmount
						amount={transaction.amount}
						currency={transaction.currency}
						type={transaction.type}
						size={variant === 'compact' ? 'sm' : 'md'}
					/>
					{showDate && (
						<p className="text-xs text-muted-foreground mt-0.5">
							{formatTransactionDate(transaction.date)}
						</p>
					)}
				</div>
			</div>
		)
	},
)
TransactionRow.displayName = 'TransactionRow'
