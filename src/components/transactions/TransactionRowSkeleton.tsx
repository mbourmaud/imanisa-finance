'use client'

import * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { TransactionRowVariant } from './TransactionRow'

const rowVariantClasses: Record<TransactionRowVariant, string> = {
	compact: 'p-3',
	default: 'p-4',
	detailed: 'p-5',
}

export interface TransactionRowSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: TransactionRowVariant
}

export const TransactionRowSkeleton = forwardRef<HTMLDivElement, TransactionRowSkeletonProps>(
	({ className, variant = 'default', ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="transaction-row-skeleton"
				className={cn(
					'flex items-center justify-between gap-4 rounded-xl animate-pulse',
					rowVariantClasses[variant],
					className,
				)}
				{...props}
			>
				<div className="flex items-center gap-3 sm:gap-4">
					<div
						className={cn('rounded-lg bg-muted', variant === 'compact' ? 'h-8 w-8' : 'h-10 w-10')}
					/>
					<div className="space-y-2">
						<div className="h-4 w-36 bg-muted rounded" />
						<div className="h-3 w-24 bg-muted rounded" />
					</div>
				</div>
				<div className="text-right space-y-2">
					<div className="h-4 w-20 bg-muted rounded ml-auto" />
					<div className="h-3 w-16 bg-muted rounded ml-auto" />
				</div>
			</div>
		)
	},
)
TransactionRowSkeleton.displayName = 'TransactionRowSkeleton'
