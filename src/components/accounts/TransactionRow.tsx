'use client';

import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { formatDate } from '@/shared/utils';

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

/**
 * Row displaying a transaction with date badge and amount
 */
export function TransactionRow({
	id,
	date,
	description,
	amount,
	type,
	transactionCategory,
	animationDelay = 0,
}: TransactionRowProps) {
	return (
		<div className="flex justify-between items-center p-3.5 px-4 rounded-xl transition-all cursor-default hover:bg-muted/30">
			<div className="flex items-center gap-4 min-w-0">
				{/* Date badge */}
				<div className="w-16 flex-shrink-0">
					<div className="inline-flex flex-col gap-0 items-center px-2 py-1.5 rounded-lg bg-muted/40 transition-colors">
						<span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
							{formatDate(date, 'MMM')}
						</span>
						<span className="text-sm font-bold -mt-0.5">{formatDate(date, 'D')}</span>
					</div>
				</div>
				<div className="flex flex-col gap-1 min-w-0">
					<span className="font-medium truncate transition-colors">{description}</span>
					{transactionCategory?.category && (
						<div className="flex gap-1 mt-0.5">
							<span className="text-xs text-muted-foreground">
								{transactionCategory.category.icon}
							</span>
							<span className="text-xs text-muted-foreground">
								{transactionCategory.category.name}
							</span>
						</div>
					)}
				</div>
			</div>
			<MoneyDisplay
				amount={type === 'INCOME' ? amount : -amount}
				format="withSign"
				className={`flex-shrink-0 ml-4 text-base font-bold ${type === 'INCOME' ? 'value-positive' : ''}`}
			/>
		</div>
	);
}
