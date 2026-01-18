'use client';

/**
 * TransactionRow Component
 *
 * Feature component for displaying transactions in lists.
 * Supports income/expense styling, category badges, and interactive states.
 */

import { ArrowDownLeft, ArrowRightLeft, Check, CreditCard, type LucideIcon } from 'lucide-react';
import * as React from 'react';
import { forwardRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// Types

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface TransactionCategory {
	id: string;
	name: string;
	color?: string;
	icon?: string;
}

export interface TransactionData {
	id: string;
	description: string;
	amount: number;
	currency?: string;
	type: TransactionType;
	date: Date | string;
	category?: TransactionCategory | null;
	accountName?: string;
	isReconciled?: boolean;
	isInternal?: boolean;
}

// Helper functions

function formatCurrency(amount: number, currency = 'EUR'): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(Math.abs(amount));
}

function formatDate(date: Date | string): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (dateObj.toDateString() === today.toDateString()) {
		return "Aujourd'hui";
	}
	if (dateObj.toDateString() === yesterday.toDateString()) {
		return 'Hier';
	}
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'short',
	}).format(dateObj);
}

function getRelativeDate(date: Date | string): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(dateObj);
}

// Transaction Icon Component

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
};

export type TransactionIconSize = 'sm' | 'md' | 'lg';

const iconSizeClasses: Record<TransactionIconSize, string> = {
	sm: 'h-8 w-8',
	md: 'h-10 w-10',
	lg: 'h-12 w-12',
};

const iconInnerSizeClasses: Record<TransactionIconSize, string> = {
	sm: 'h-4 w-4',
	md: 'h-5 w-5',
	lg: 'h-6 w-6',
};

export interface TransactionIconProps extends React.HTMLAttributes<HTMLDivElement> {
	type: TransactionType;
	size?: TransactionIconSize;
	customIcon?: LucideIcon;
}

export const TransactionIcon = forwardRef<HTMLDivElement, TransactionIconProps>(
	({ className, type, size = 'md', customIcon, ...props }, ref) => {
		const config = transactionTypeConfig[type];
		const Icon = customIcon || config.icon;

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
		);
	},
);
TransactionIcon.displayName = 'TransactionIcon';

// CategoryBadge Component

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	category: TransactionCategory;
	size?: 'sm' | 'md';
}

export const CategoryBadge = forwardRef<HTMLSpanElement, CategoryBadgeProps>(
	({ className, category, size = 'sm', ...props }, ref) => {
		const colorStyle = category.color
			? { '--category-color': category.color } as React.CSSProperties
			: undefined;

		return (
			<span
				ref={ref}
				data-slot="category-badge"
				className={cn(
					'inline-flex items-center rounded-full font-medium',
					size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
					category.color
						? 'bg-[var(--category-color)]/10 text-[var(--category-color)]'
						: 'bg-muted text-muted-foreground',
					className,
				)}
				style={colorStyle}
				{...props}
			>
				{category.name}
			</span>
		);
	},
);
CategoryBadge.displayName = 'CategoryBadge';

// TransactionAmount Component

export interface TransactionAmountProps extends React.HTMLAttributes<HTMLDivElement> {
	amount: number;
	currency?: string;
	type: TransactionType;
	showSign?: boolean;
	size?: 'sm' | 'md' | 'lg';
}

const amountSizeClasses: Record<'sm' | 'md' | 'lg', string> = {
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-lg',
};

export const TransactionAmount = forwardRef<HTMLDivElement, TransactionAmountProps>(
	({ className, amount, currency = 'EUR', type, showSign = true, size = 'md', ...props }, ref) => {
		const isPositive = type === 'income';
		const sign = showSign ? (isPositive ? '+' : '-') : '';

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
		);
	},
);
TransactionAmount.displayName = 'TransactionAmount';

// TransactionRow Component

export type TransactionRowVariant = 'default' | 'compact' | 'detailed';

const rowVariantClasses: Record<TransactionRowVariant, string> = {
	compact: 'p-3',
	default: 'p-4',
	detailed: 'p-5',
};

export interface TransactionRowProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	transaction: TransactionData;
	variant?: TransactionRowVariant;
	showCategory?: boolean;
	showAccount?: boolean;
	showDate?: boolean;
	showIcon?: boolean;
	selectable?: boolean;
	selected?: boolean;
	onSelectChange?: (selected: boolean) => void;
	interactive?: boolean;
	onTransactionClick?: () => void;
}

export const TransactionRow = forwardRef<HTMLDivElement, TransactionRowProps>(
	(
		{
			className,
			transaction,
			variant = 'default',
			showCategory = true,
			showAccount = true,
			showDate = true,
			showIcon = true,
			selectable = false,
			selected = false,
			onSelectChange,
			interactive = false,
			onTransactionClick,
			...props
		},
		ref,
	) => {
		const handleClick = () => {
			if (interactive && onTransactionClick) {
				onTransactionClick();
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (interactive && onTransactionClick && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault();
				onTransactionClick();
			}
		};

		const handleCheckboxChange = (checked: boolean) => {
			if (onSelectChange) {
				onSelectChange(checked);
			}
		};

		return (
			<div
				ref={ref}
				data-slot="transaction-row"
				className={cn(
					'flex items-center justify-between gap-4 rounded-xl transition-colors',
					rowVariantClasses[variant],
					interactive && 'cursor-pointer hover:bg-muted/30',
					selected && 'bg-muted/50',
					className,
				)}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				role={interactive ? 'button' : undefined}
				tabIndex={interactive ? 0 : undefined}
				{...props}
			>
				{/* Left side */}
				<div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
					{selectable && (
						<Checkbox
							checked={selected}
							onCheckedChange={handleCheckboxChange}
							onClick={(e) => e.stopPropagation()}
							aria-label={`Sélectionner ${transaction.description}`}
						/>
					)}

					{showIcon && (
						<TransactionIcon type={transaction.type} size={variant === 'compact' ? 'sm' : 'md'} />
					)}

					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<p className="font-medium truncate">{transaction.description}</p>
							{transaction.isReconciled && (
								<span
									data-slot="reconciled-badge"
									className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary"
									title="Rapproché"
								>
									<Check className="h-2.5 w-2.5" />
								</span>
							)}
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							{showCategory && transaction.category && (
								<>
									<span>{transaction.category.name}</span>
									{showAccount && transaction.accountName && <span>·</span>}
								</>
							)}
							{showAccount && transaction.accountName && (
								<span className="truncate">{transaction.accountName}</span>
							)}
						</div>
						{variant === 'detailed' && transaction.category && (
							<div className="mt-2">
								<CategoryBadge category={transaction.category} />
							</div>
						)}
					</div>
				</div>

				{/* Right side */}
				<div className="text-right flex-shrink-0">
					<TransactionAmount
						amount={transaction.amount}
						currency={transaction.currency}
						type={transaction.type}
						size={variant === 'compact' ? 'sm' : 'md'}
					/>
					{showDate && (
						<p className="text-xs text-muted-foreground mt-0.5">{formatDate(transaction.date)}</p>
					)}
				</div>
			</div>
		);
	},
);
TransactionRow.displayName = 'TransactionRow';

// TransactionList Component

export interface TransactionListProps extends React.HTMLAttributes<HTMLDivElement> {
	transactions: TransactionData[];
	variant?: TransactionRowVariant;
	showCategory?: boolean;
	showAccount?: boolean;
	showDate?: boolean;
	selectable?: boolean;
	selectedIds?: string[];
	onSelectionChange?: (selectedIds: string[]) => void;
	interactive?: boolean;
	onTransactionClick?: (transaction: TransactionData) => void;
	groupByDate?: boolean;
}

export const TransactionList = forwardRef<HTMLDivElement, TransactionListProps>(
	(
		{
			className,
			transactions,
			variant = 'default',
			showCategory = true,
			showAccount = true,
			showDate = true,
			selectable = false,
			selectedIds = [],
			onSelectionChange,
			interactive = false,
			onTransactionClick,
			groupByDate = false,
			...props
		},
		ref,
	) => {
		const handleSelect = (transactionId: string, selected: boolean) => {
			if (!onSelectionChange) return;

			if (selected) {
				onSelectionChange([...selectedIds, transactionId]);
			} else {
				onSelectionChange(selectedIds.filter((id) => id !== transactionId));
			}
		};

		// Group transactions by date if requested
		const groupedTransactions = React.useMemo(() => {
			if (!groupByDate) return null;

			const groups: Record<string, TransactionData[]> = {};
			for (const tx of transactions) {
				const dateKey = typeof tx.date === 'string' ? tx.date : tx.date.toISOString().split('T')[0];
				if (!groups[dateKey]) {
					groups[dateKey] = [];
				}
				groups[dateKey].push(tx);
			}
			return groups;
		}, [transactions, groupByDate]);

		if (groupByDate && groupedTransactions) {
			return (
				<div
					ref={ref}
					data-slot="transaction-list"
					className={cn('space-y-6', className)}
					{...props}
				>
					{Object.entries(groupedTransactions).map(([dateKey, txs]) => (
						<div key={dateKey} className="space-y-1">
							<h4 className="text-sm font-medium text-muted-foreground px-4 mb-2">
								{getRelativeDate(dateKey)}
							</h4>
							{txs.map((transaction) => (
								<TransactionRow
									key={transaction.id}
									transaction={transaction}
									variant={variant}
									showCategory={showCategory}
									showAccount={showAccount}
									showDate={false}
									selectable={selectable}
									selected={selectedIds.includes(transaction.id)}
									onSelectChange={(selected: boolean) => handleSelect(transaction.id, selected)}
									interactive={interactive}
									onTransactionClick={
										onTransactionClick ? () => onTransactionClick(transaction) : undefined
									}
								/>
							))}
						</div>
					))}
				</div>
			);
		}

		return (
			<div ref={ref} data-slot="transaction-list" className={cn('space-y-1', className)} {...props}>
				{transactions.map((transaction) => (
					<TransactionRow
						key={transaction.id}
						transaction={transaction}
						variant={variant}
						showCategory={showCategory}
						showAccount={showAccount}
						showDate={showDate}
						selectable={selectable}
						selected={selectedIds.includes(transaction.id)}
						onSelectChange={(selected: boolean) => handleSelect(transaction.id, selected)}
						interactive={interactive}
						onTransactionClick={
							onTransactionClick ? () => onTransactionClick(transaction) : undefined
						}
					/>
				))}
			</div>
		);
	},
);
TransactionList.displayName = 'TransactionList';

// TransactionRowSkeleton Component

export interface TransactionRowSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: TransactionRowVariant;
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
		);
	},
);
TransactionRowSkeleton.displayName = 'TransactionRowSkeleton';
