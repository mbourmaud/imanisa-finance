'use client'

import * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { TransactionData } from './transaction-types'
import { getRelativeDate } from './transaction-utils'
import { TransactionRow, type TransactionRowVariant } from './TransactionRow'

export interface TransactionListProps extends React.HTMLAttributes<HTMLDivElement> {
	transactions: TransactionData[]
	variant?: TransactionRowVariant
	showCategory?: boolean
	showAccount?: boolean
	showDate?: boolean
	selectable?: boolean
	selectedIds?: string[]
	onSelectionChange?: (selectedIds: string[]) => void
	interactive?: boolean
	onTransactionClick?: (transaction: TransactionData) => void
	groupByDate?: boolean
}

export const TransactionList = forwardRef<HTMLDivElement, TransactionListProps>(
	(
		{
			className,
			transactions,
			variant = 'default',
			showCategory = true,
			showAccount = true,
			showDate = true,
			selectable = false,
			selectedIds = [],
			onSelectionChange,
			interactive = false,
			onTransactionClick,
			groupByDate = false,
			...props
		},
		ref,
	) => {
		const handleSelect = (transactionId: string, selected: boolean) => {
			if (!onSelectionChange) return

			if (selected) {
				onSelectionChange([...selectedIds, transactionId])
			} else {
				onSelectionChange(selectedIds.filter((id) => id !== transactionId))
			}
		}

		// Group transactions by date if requested
		const groupedTransactions = React.useMemo(() => {
			if (!groupByDate) return null

			const groups: Record<string, TransactionData[]> = {}
			for (const tx of transactions) {
				const dateKey = typeof tx.date === 'string' ? tx.date : tx.date.toISOString().split('T')[0]
				if (!groups[dateKey]) {
					groups[dateKey] = []
				}
				groups[dateKey].push(tx)
			}
			return groups
		}, [transactions, groupByDate])

		if (groupByDate && groupedTransactions) {
			return (
				<div
					ref={ref}
					data-slot="transaction-list"
					className={cn('space-y-6', className)}
					{...props}
				>
					{Object.entries(groupedTransactions).map(([dateKey, txs]) => (
						<div key={dateKey} className="space-y-1">
							<h4 className="text-sm font-medium text-muted-foreground px-4 mb-2">
								{getRelativeDate(dateKey)}
							</h4>
							{txs.map((transaction) => (
								<TransactionRow
									key={transaction.id}
									transaction={transaction}
									variant={variant}
									showCategory={showCategory}
									showAccount={showAccount}
									showDate={false}
									selectable={selectable}
									selected={selectedIds.includes(transaction.id)}
									onSelectChange={(selected: boolean) => handleSelect(transaction.id, selected)}
									interactive={interactive}
									onTransactionClick={
										onTransactionClick ? () => onTransactionClick(transaction) : undefined
									}
								/>
							))}
						</div>
					))}
				</div>
			)
		}

		return (
			<div ref={ref} data-slot="transaction-list" className={cn('space-y-1', className)} {...props}>
				{transactions.map((transaction) => (
					<TransactionRow
						key={transaction.id}
						transaction={transaction}
						variant={variant}
						showCategory={showCategory}
						showAccount={showAccount}
						showDate={showDate}
						selectable={selectable}
						selected={selectedIds.includes(transaction.id)}
						onSelectChange={(selected: boolean) => handleSelect(transaction.id, selected)}
						interactive={interactive}
						onTransactionClick={
							onTransactionClick ? () => onTransactionClick(transaction) : undefined
						}
					/>
				))}
			</div>
		)
	},
)
TransactionList.displayName = 'TransactionList'
