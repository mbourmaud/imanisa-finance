'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { AccountCardVariant } from './AccountCard'

const cardVariantClasses: Record<AccountCardVariant, string> = {
	compact: 'p-3',
	default: 'p-4',
	detailed: 'p-5',
}

export interface AccountCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: AccountCardVariant
}

export const AccountCardSkeleton = forwardRef<HTMLDivElement, AccountCardSkeletonProps>(
	({ className, variant = 'default', ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="account-card-skeleton"
				className={cn(
					'bg-card border rounded-2xl flex items-center justify-between gap-4 animate-pulse',
					cardVariantClasses[variant],
					className,
				)}
				{...props}
			>
				<div className="flex items-center gap-3 sm:gap-4">
					<div
						className={cn('rounded-xl bg-muted', variant === 'compact' ? 'h-8 w-8' : 'h-10 w-10')}
					/>
					<div className="space-y-2">
						<div className="h-4 w-32 bg-muted rounded" />
						<div className="h-3 w-24 bg-muted rounded" />
					</div>
				</div>
				<div className="h-4 w-20 bg-muted rounded" />
			</div>
		)
	},
)
AccountCardSkeleton.displayName = 'AccountCardSkeleton'
