'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { AccountIcon } from './AccountIcon'
import { AccountTypeBadge } from './AccountTypeBadge'
import { MemberBadge } from './MemberBadge'
import type { AccountData } from './account-types'
import { formatBalance } from './account-types'

// Re-export types and sub-components for backwards compatibility
export type {
	AccountType,
	AccountBank,
	AccountMember,
	AccountData,
} from './account-types'
export type { AccountIconSize, AccountIconProps } from './AccountIcon'
export { AccountIcon } from './AccountIcon'
export type { AccountTypeBadgeProps } from './AccountTypeBadge'
export { AccountTypeBadge } from './AccountTypeBadge'
export type { MemberBadgeProps } from './MemberBadge'
export { MemberBadge } from './MemberBadge'
export type { AccountCardListItem, AccountCardListProps } from './AccountCardList'
export { AccountCardList } from './AccountCardList'
export type { AccountCardSkeletonProps } from './AccountCardSkeleton'
export { AccountCardSkeleton } from './AccountCardSkeleton'

export type AccountCardVariant = 'default' | 'compact' | 'detailed'

const cardVariantClasses: Record<AccountCardVariant, string> = {
	compact: 'p-3',
	default: 'p-4',
	detailed: 'p-5',
}

export interface AccountCardProps extends React.HTMLAttributes<HTMLDivElement> {
	account: AccountData
	variant?: AccountCardVariant
	interactive?: boolean
	showBank?: boolean
	showType?: boolean
	showMembers?: boolean
	href?: string
	onAccountClick?: () => void
}

export const AccountCard = forwardRef<HTMLDivElement, AccountCardProps>(
	(
		{
			className,
			account,
			variant = 'default',
			interactive = false,
			showBank = true,
			showType = false,
			showMembers = false,
			href,
			onAccountClick,
			...props
		},
		ref,
	) => {
		const handleClick = () => {
			if (interactive && onAccountClick) {
				onAccountClick()
			}
		}

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (interactive && onAccountClick && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault()
				onAccountClick()
			}
		}

		const cardContent = (
			<>
				<div className="flex items-center gap-3 sm:gap-4">
					<AccountIcon
						account={account}
						size={variant === 'compact' ? 'sm' : 'md'}
						className={!account.bank?.color ? 'bg-muted/50 text-muted-foreground' : undefined}
					/>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<p className="font-medium truncate">{account.name}</p>
							{showType && <AccountTypeBadge type={account.type} variant="subtle" />}
						</div>
						{showBank && account.bank && (
							<p className="text-xs text-muted-foreground truncate">{account.bank.name}</p>
						)}
						{variant === 'detailed' && showMembers && account.members && (
							<div className="flex flex-wrap gap-2 mt-2">
								{account.members.map((member) => (
									<MemberBadge key={member.id} member={member} />
								))}
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2 sm:gap-4">
					<p
						className={cn(
							'font-medium number-display whitespace-nowrap',
							account.balance < 0 && 'value-negative',
						)}
					>
						{formatBalance(account.balance, account.currency)}
					</p>
					{interactive && (
						<ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
					)}
				</div>
			</>
		)

		const cardClasses = cn(
			'bg-card border rounded-2xl flex items-center justify-between gap-4 transition-colors',
			cardVariantClasses[variant],
			interactive && 'cursor-pointer group hover:bg-muted/50',
			className,
		)

		if (href) {
			return (
				<Link href={href} data-slot="account-card" className={cardClasses}>
					{cardContent}
				</Link>
			)
		}

		return (
			// biome-ignore lint/a11y/noStaticElementInteractions: Card with conditional interactivity
			<div
				ref={ref}
				data-slot="account-card"
				className={cardClasses}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				role={interactive ? 'button' : undefined}
				tabIndex={interactive ? 0 : undefined}
				{...props}
			>
				{cardContent}
			</div>
		)
	},
)
AccountCard.displayName = 'AccountCard'
