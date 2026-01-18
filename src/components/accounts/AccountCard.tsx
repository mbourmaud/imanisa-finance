'use client';

/**
 * AccountCard Component
 *
 * Feature component for displaying bank accounts with glassmorphism styling.
 * Supports different variants, bank avatars, member badges, and interactive states.
 */

import {
	Building,
	ChevronRight,
	CreditCard,
	type LucideIcon,
	PiggyBank,
	TrendingUp,
	Wallet,
} from 'lucide-react';
import Link from 'next/link';
import type * as React from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Types

export type AccountType =
	| 'CHECKING'
	| 'SAVINGS'
	| 'INVESTMENT'
	| 'LOAN'
	| 'PEA'
	| 'CTO'
	| 'ASSURANCE_VIE'
	| 'CRYPTO'
	| 'REAL_ESTATE'
	| 'CREDIT'
	// Legacy lowercase types
	| 'checking'
	| 'savings'
	| 'investment'
	| 'credit';

export interface AccountBank {
	id: string;
	name: string;
	color?: string;
	shortName?: string;
}

export interface AccountMember {
	id: string;
	name: string;
	color?: string | null;
	ownerShare: number;
}

export interface AccountData {
	id: string;
	name: string;
	type: AccountType;
	balance: number;
	currency?: string;
	bank?: AccountBank | null;
	members?: AccountMember[];
	lastSyncAt?: Date | null;
}

// Account type configuration

const accountTypeConfig: Record<string, { label: string; labelShort: string; icon: LucideIcon }> = {
	CHECKING: { label: 'Compte courant', labelShort: 'Courant', icon: Wallet },
	SAVINGS: { label: 'Livret', labelShort: 'Épargne', icon: PiggyBank },
	INVESTMENT: {
		label: 'Investissement',
		labelShort: 'Invest',
		icon: TrendingUp,
	},
	LOAN: { label: 'Prêt', labelShort: 'Prêt', icon: CreditCard },
	PEA: { label: 'PEA', labelShort: 'PEA', icon: TrendingUp },
	CTO: { label: 'CTO', labelShort: 'CTO', icon: TrendingUp },
	ASSURANCE_VIE: {
		label: 'Assurance vie',
		labelShort: 'AV',
		icon: PiggyBank,
	},
	CRYPTO: { label: 'Crypto', labelShort: 'Crypto', icon: TrendingUp },
	REAL_ESTATE: {
		label: 'Bien immobilier',
		labelShort: 'Immo',
		icon: Building,
	},
	CREDIT: { label: 'Crédit', labelShort: 'Crédit', icon: CreditCard },
	// Legacy lowercase types
	checking: { label: 'Compte courant', labelShort: 'Courant', icon: Wallet },
	savings: { label: 'Livret', labelShort: 'Épargne', icon: PiggyBank },
	investment: {
		label: 'Investissement',
		labelShort: 'Invest',
		icon: TrendingUp,
	},
	credit: { label: 'Crédit', labelShort: 'Crédit', icon: CreditCard },
};

const defaultConfig = { label: 'Compte', labelShort: 'Compte', icon: Wallet };

// Helper functions

function getAccountTypeConfig(type: AccountType) {
	return accountTypeConfig[type] || defaultConfig;
}

function formatBalance(balance: number, currency = 'EUR'): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(balance);
}

// AccountIcon Component

export type AccountIconSize = 'sm' | 'md' | 'lg';

const iconSizeClasses: Record<AccountIconSize, string> = {
	sm: 'h-8 w-8',
	md: 'h-10 w-10',
	lg: 'h-12 w-12',
};

const iconInnerSizeClasses: Record<AccountIconSize, string> = {
	sm: 'h-4 w-4',
	md: 'h-5 w-5',
	lg: 'h-6 w-6',
};

export interface AccountIconProps extends React.HTMLAttributes<HTMLDivElement> {
	account: Pick<AccountData, 'type' | 'bank'>;
	size?: AccountIconSize;
	showBankColor?: boolean;
}

export const AccountIcon = forwardRef<HTMLDivElement, AccountIconProps>(
	({ className, account, size = 'md', showBankColor = true, ...props }, ref) => {
		const config = getAccountTypeConfig(account.type);
		const Icon = config.icon;
		const bankColor = account.bank?.color;

		return (
			<div
				ref={ref}
				data-slot="account-icon"
				className={cn(
					'flex items-center justify-center rounded-xl transition-colors',
					iconSizeClasses[size],
					className,
				)}
				style={{
					backgroundColor: showBankColor && bankColor ? `${bankColor}20` : undefined,
				}}
				{...props}
			>
				<Icon
					className={cn(iconInnerSizeClasses[size])}
					style={{
						color: showBankColor && bankColor ? bankColor : undefined,
					}}
				/>
			</div>
		);
	},
);
AccountIcon.displayName = 'AccountIcon';

// AccountTypeBadge Component

export interface AccountTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	type: AccountType;
	variant?: 'default' | 'subtle';
}

export const AccountTypeBadge = forwardRef<HTMLSpanElement, AccountTypeBadgeProps>(
	({ className, type, variant = 'default', ...props }, ref) => {
		const config = getAccountTypeConfig(type);

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
		);
	},
);
AccountTypeBadge.displayName = 'AccountTypeBadge';

// MemberBadge Component (simplified, full version in UI-015)

export interface MemberBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	member: Pick<AccountMember, 'name' | 'color' | 'ownerShare'>;
	showShare?: boolean;
}

export const MemberBadge = forwardRef<HTMLDivElement, MemberBadgeProps>(
	({ className, member, showShare = true, ...props }, ref) => {
		// Get initials
		const initials = member.name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);

		return (
			<div
				ref={ref}
				data-slot="member-badge"
				className={cn('inline-flex items-center gap-1.5 text-xs', className)}
				{...props}
			>
				<div
					className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white"
					style={{
						backgroundColor: member.color || '#6366f1',
					}}
				>
					{initials}
				</div>
				{showShare && member.ownerShare < 100 && (
					<span className="text-muted-foreground">{member.ownerShare}%</span>
				)}
			</div>
		);
	},
);
MemberBadge.displayName = 'MemberBadge';

// AccountCard Component

export type AccountCardVariant = 'default' | 'compact' | 'detailed';

const cardVariantClasses: Record<AccountCardVariant, string> = {
	compact: 'p-3',
	default: 'p-4',
	detailed: 'p-5',
};

export interface AccountCardProps extends React.HTMLAttributes<HTMLDivElement> {
	account: AccountData;
	variant?: AccountCardVariant;
	interactive?: boolean;
	showBank?: boolean;
	showType?: boolean;
	showMembers?: boolean;
	href?: string;
	onAccountClick?: () => void;
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
				onAccountClick();
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (interactive && onAccountClick && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault();
				onAccountClick();
			}
		};

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
		);

		const cardClasses = cn(
			'glass-card flex items-center justify-between gap-4 transition-colors',
			cardVariantClasses[variant],
			interactive && 'cursor-pointer group hover:bg-muted/50',
			className,
		);

		// If href is provided, render as Link
		if (href) {
			return (
				<Link href={href} data-slot="account-card" className={cardClasses}>
					{cardContent}
				</Link>
			);
		}

		return (
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
		);
	},
);
AccountCard.displayName = 'AccountCard';

// AccountCardList Component

export interface AccountCardListItem {
	account: AccountData;
	href?: string;
}

export interface AccountCardListProps extends React.HTMLAttributes<HTMLDivElement> {
	accounts: AccountCardListItem[];
	variant?: AccountCardVariant;
	interactive?: boolean;
	showBank?: boolean;
	showType?: boolean;
	onAccountClick?: (account: AccountData) => void;
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
		);
	},
);
AccountCardList.displayName = 'AccountCardList';

// AccountCardSkeleton Component

export interface AccountCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: AccountCardVariant;
}

export const AccountCardSkeleton = forwardRef<HTMLDivElement, AccountCardSkeletonProps>(
	({ className, variant = 'default', ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="account-card-skeleton"
				className={cn(
					'glass-card flex items-center justify-between gap-4 animate-pulse',
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
		);
	},
);
AccountCardSkeleton.displayName = 'AccountCardSkeleton';
