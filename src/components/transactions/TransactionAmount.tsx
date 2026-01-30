'use client'

import * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { TransactionType } from './transaction-types'
import { formatCurrency } from './transaction-utils'

export interface TransactionAmountProps extends React.HTMLAttributes<HTMLDivElement> {
	amount: number
	currency?: string
	type: TransactionType
	showSign?: boolean
	size?: 'sm' | 'md' | 'lg'
}

const amountSizeClasses: Record<'sm' | 'md' | 'lg', string> = {
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-lg',
}

export const TransactionAmount = forwardRef<HTMLDivElement, TransactionAmountProps>(
	({ className, amount, currency = 'EUR', type, showSign = true, size = 'md', ...props }, ref) => {
		const isPositive = type === 'income'
		const sign = showSign ? (isPositive ? '+' : '-') : ''

		return (
			<div
				ref={ref}
				data-slot="transaction-amount"
				className={cn(
					'font-medium number-display',
					amountSizeClasses[size],
					isPositive && 'value-positive',
					type === 'expense' && amount < 0 && 'value-negative',
					className,
				)}
				{...props}
			>
				{sign}
				{formatCurrency(amount, currency)}
			</div>
		)
	},
)
TransactionAmount.displayName = 'TransactionAmount'
