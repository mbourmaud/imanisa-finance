'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { type AccountData, getAccountTypeConfig } from './account-types'

export type AccountIconSize = 'sm' | 'md' | 'lg'

const iconSizeClasses: Record<AccountIconSize, string> = {
	sm: 'h-8 w-8',
	md: 'h-10 w-10',
	lg: 'h-12 w-12',
}

const iconInnerSizeClasses: Record<AccountIconSize, string> = {
	sm: 'h-4 w-4',
	md: 'h-5 w-5',
	lg: 'h-6 w-6',
}

export interface AccountIconProps extends React.HTMLAttributes<HTMLDivElement> {
	account: Pick<AccountData, 'type' | 'bank'>
	size?: AccountIconSize
	showBankColor?: boolean
}

export const AccountIcon = forwardRef<HTMLDivElement, AccountIconProps>(
	({ className, account, size = 'md', showBankColor = true, ...props }, ref) => {
		const config = getAccountTypeConfig(account.type)
		const Icon = config.icon
		const bankColor = account.bank?.color

		const colorStyle =
			showBankColor && bankColor
				? ({ '--account-color': bankColor } as React.CSSProperties)
				: undefined

		return (
			<div
				ref={ref}
				data-slot="account-icon"
				className={cn(
					'flex items-center justify-center rounded-xl transition-colors',
					iconSizeClasses[size],
					showBankColor && bankColor ? 'bg-[var(--account-color)]/10' : 'bg-muted/50',
					className,
				)}
				style={colorStyle}
				{...props}
			>
				<Icon
					className={cn(
						iconInnerSizeClasses[size],
						showBankColor && bankColor ? 'text-[var(--account-color)]' : 'text-muted-foreground',
					)}
				/>
			</div>
		)
	},
)
AccountIcon.displayName = 'AccountIcon'
