'use client'

import { ArrowDownLeft, ArrowRightLeft, CreditCard, type LucideIcon } from 'lucide-react'
import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { TransactionType } from './transaction-types'

const transactionTypeConfig: Record<
	TransactionType,
	{ icon: LucideIcon; bgClass: string; textClass: string; label: string }
> = {
	income: {
		icon: ArrowDownLeft,
		bgClass: 'bg-[oklch(0.55_0.15_145)]/10',
		textClass: 'text-[oklch(0.55_0.15_145)]',
		label: 'Revenu',
	},
	expense: {
		icon: CreditCard,
		bgClass: 'bg-muted/50',
		textClass: 'text-muted-foreground',
		label: 'Dépense',
	},
	transfer: {
		icon: ArrowRightLeft,
		bgClass: 'bg-primary/10',
		textClass: 'text-primary',
		label: 'Virement',
	},
}

export type TransactionIconSize = 'sm' | 'md' | 'lg'

const iconSizeClasses: Record<TransactionIconSize, string> = {
	sm: 'h-8 w-8',
	md: 'h-10 w-10',
	lg: 'h-12 w-12',
}

const iconInnerSizeClasses: Record<TransactionIconSize, string> = {
	sm: 'h-4 w-4',
	md: 'h-5 w-5',
	lg: 'h-6 w-6',
}

export interface TransactionIconProps extends React.HTMLAttributes<HTMLDivElement> {
	type: TransactionType
	size?: TransactionIconSize
	customIcon?: LucideIcon
}

export const TransactionIcon = forwardRef<HTMLDivElement, TransactionIconProps>(
	({ className, type, size = 'md', customIcon, ...props }, ref) => {
		const config = transactionTypeConfig[type]
		const Icon = customIcon || config.icon

		return (
			<div
				ref={ref}
				data-slot="transaction-icon"
				className={cn(
					'flex items-center justify-center rounded-lg',
					iconSizeClasses[size],
					config.bgClass,
					className,
				)}
				{...props}
			>
				<Icon className={cn(iconInnerSizeClasses[size], config.textClass)} />
			</div>
		)
	},
)
TransactionIcon.displayName = 'TransactionIcon'
