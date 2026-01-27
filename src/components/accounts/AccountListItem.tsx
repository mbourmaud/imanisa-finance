'use client';

import Link from 'next/link';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Building, ChevronRight } from '@/components';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';

// =============================================================================
// TYPES
// =============================================================================

interface AccountListItemProps {
	/** Account ID */
	id: string;
	/** Account name */
	name: string;
	/** Bank name */
	bankName?: string;
	/** Bank color for theming */
	bankColor?: string;
	/** Account balance */
	balance: number;
	/** Currency code */
	currency?: string;
}

// =============================================================================
// ACCOUNT LIST ITEM COMPONENT
// =============================================================================

/**
 * List item displaying an account with its bank info and balance.
 * Links to the account detail page.
 */
const AccountListItem = forwardRef<HTMLAnchorElement, AccountListItemProps>(
	({ id, name, bankName = 'Banque', bankColor, balance, currency = 'EUR' }, ref) => {
		const colorStyle = bankColor
			? ({ '--bank-color': bankColor } as React.CSSProperties)
			: undefined;

		return (
			<Link
				ref={ref}
				href={`/dashboard/accounts/${id}`}
				data-slot="account-list-item"
				className={cn(
					'flex items-center justify-between',
					'rounded-xl p-4',
					'border border-border/20 bg-background/50',
					'transition-all duration-200',
					'hover:border-border/40 hover:bg-background/80',
				)}
				style={colorStyle}
			>
				<div className="flex items-center gap-4">
					<div
						className={cn(
							'flex items-center justify-center h-10 w-10 rounded-lg',
							bankColor ? 'bg-[var(--bank-color)]/10' : 'bg-muted',
						)}
					>
						<Building
							className={cn(
								'h-5 w-5',
								bankColor ? 'text-[var(--bank-color)]' : 'text-muted-foreground',
							)}
						/>
					</div>
					<div className="flex flex-col">
						<span className="font-medium">{name}</span>
						<span className="text-xs text-muted-foreground">{bankName}</span>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<MoneyDisplay
						amount={balance}
						currency={currency as 'EUR' | 'USD' | 'GBP' | 'CHF'}
						format="compact"
						className="text-base font-semibold"
					/>
					<ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
				</div>
			</Link>
		);
	},
);
AccountListItem.displayName = 'AccountListItem';

// =============================================================================
// EXPORTS
// =============================================================================

export { AccountListItem };
export type { AccountListItemProps };
