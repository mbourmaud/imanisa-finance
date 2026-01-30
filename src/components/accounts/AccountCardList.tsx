'use client'

import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { AccountCard, type AccountCardVariant } from './AccountCard'
import type { AccountData } from './account-types'

export interface AccountCardListItem {
	account: AccountData
	href?: string
}

export interface AccountCardListProps extends React.HTMLAttributes<HTMLDivElement> {
	accounts: AccountCardListItem[]
	variant?: AccountCardVariant
	interactive?: boolean
	showBank?: boolean
	showType?: boolean
	onAccountClick?: (account: AccountData) => void
}

export const AccountCardList = forwardRef<HTMLDivElement, AccountCardListProps>(
	(
		{
			className,
			accounts,
			variant = 'default',
			interactive = false,
			showBank = true,
			showType = false,
			onAccountClick,
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				data-slot="account-card-list"
				className={cn('space-y-2', className)}
				{...props}
			>
				{accounts.map(({ account, href }) => (
					<AccountCard
						key={account.id}
						account={account}
						variant={variant}
						interactive={interactive}
						showBank={showBank}
						showType={showType}
						href={href}
						onAccountClick={onAccountClick ? () => onAccountClick(account) : undefined}
					/>
				))}
			</div>
		)
	},
)
AccountCardList.displayName = 'AccountCardList'
