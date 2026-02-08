'use client';

import { CategoryBadge } from '@/components/transactions/CategoryBadge';
import { formatMoneyCompact } from '@/shared/utils';

interface TransactionCategory {
	categoryId: string;
	category: {
		id: string;
		name: string;
		icon: string;
		color: string;
	};
}

interface TransactionRowProps {
	id: string;
	date: string;
	description: string;
	amount: number;
	type: string;
	transactionCategory?: TransactionCategory | null;
	animationDelay?: number;
}

function formatRelativeDate(date: string): string {
	const d = new Date(date);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (d.toDateString() === today.toDateString()) {
		return "Aujourd'hui";
	}
	if (d.toDateString() === yesterday.toDateString()) {
		return 'Hier';
	}
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'short',
	}).format(d);
}

/**
 * Row displaying a transaction with date and amount.
 * Style aligned with the main transactions table.
 */
export function TransactionRow({
	date,
	description,
	amount,
	type,
	transactionCategory,
}: TransactionRowProps) {
	const isIncome = type === 'INCOME';
	const displayAmount = isIncome ? amount : -amount;

	return (
		<div className="flex items-center gap-4 p-3 px-4 border-b border-border/40 last:border-b-0 transition-colors hover:bg-muted/50">
			<span className="text-sm text-muted-foreground whitespace-nowrap w-20 shrink-0">
				{formatRelativeDate(date)}
			</span>
			<div className="flex flex-col min-w-0 gap-0.5 flex-1">
				<span className="text-sm font-medium truncate">{description}</span>
				{transactionCategory?.category ? (
					<CategoryBadge category={transactionCategory.category} size="sm" />
				) : (
					<span className="text-xs text-muted-foreground">Non catégorisé</span>
				)}
			</div>
			<span
				className={`text-sm font-medium tabular-nums whitespace-nowrap shrink-0 ${isIncome ? 'text-emerald-600' : ''}`}
			>
				{isIncome ? '+' : ''}
				{formatMoneyCompact(displayAmount)}
			</span>
		</div>
	);
}
