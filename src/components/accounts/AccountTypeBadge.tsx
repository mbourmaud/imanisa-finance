'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { type AccountType, getAccountTypeConfig } from './account-types'

export interface AccountTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	type: AccountType
	variant?: 'default' | 'subtle'
}

export const AccountTypeBadge = forwardRef<HTMLSpanElement, AccountTypeBadgeProps>(
	({ className, type, variant = 'default', ...props }, ref) => {
		const config = getAccountTypeConfig(type)

		return (
			<span
				ref={ref}
				data-slot="account-type-badge"
				className={cn(
					'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
					variant === 'default' ? 'bg-muted text-muted-foreground' : 'text-muted-foreground',
					className,
				)}
				{...props}
			>
				{config.labelShort}
			</span>
		)
	},
)
AccountTypeBadge.displayName = 'AccountTypeBadge'
