'use client';

/**
 * Transactions Page
 *
 * Shows transaction history with filtering and search.
 * Connected to real data via TanStack Query hooks.
 */

import {
	AlertCircle,
	ArrowDownLeft,
	ArrowUpRight,
	CreditCard,
	ExportButton,
	PageHeader,
	Skeleton,
	StatCard,
	StatCardGrid,
	StatCardSkeleton,
	TransactionFilters,
	TransactionListContainer,
	TransactionListItem,
} from '@/components';
import {
	useTransactionsQuery,
	useTransactionSummaryQuery,
} from '@/features/transactions';
import { formatDate as formatDateUtil, formatMoney } from '@/shared/utils';

function formatDate(dateStr: string | Date): string {
	const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (date.toDateString() === today.toDateString()) {
		return "Aujourd'hui";
	}
	if (date.toDateString() === yesterday.toDateString()) {
		return 'Hier';
	}
	return formatDateUtil(
		typeof dateStr === 'string' ? dateStr : dateStr.toISOString(),
		'D MMM',
	);
}

function TransactionsLoading() {
	return (
		<>
			<StatCardGrid columns={3}>
				<StatCardSkeleton />
				<StatCardSkeleton />
				<StatCardSkeleton />
			</StatCardGrid>

			<div className="flex flex-col gap-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={`skeleton-${String(i)}`} className="flex items-center justify-between p-4">
						<div className="flex items-center gap-4">
							<Skeleton className="h-10 w-10 rounded-xl" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-36" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
						<div className="text-right space-y-2">
							<Skeleton className="h-4 w-20 ml-auto" />
							<Skeleton className="h-3 w-16 ml-auto" />
						</div>
					</div>
				))}
			</div>
		</>
	);
}

function TransactionsError() {
	return (
		<div className="flex flex-col items-center justify-center p-8 text-center">
			<AlertCircle className="h-12 w-12 text-destructive mb-4" />
			<h3 className="text-lg font-semibold">Impossible de charger les transactions</h3>
			<p className="text-sm text-muted-foreground mt-2">
				Vérifiez votre connexion et réessayez.
			</p>
		</div>
	);
}

export default function TransactionsPage() {
	const { data: transactionsData, isLoading, isError } = useTransactionsQuery();
	const { data: summary } = useTransactionSummaryQuery();

	if (isError) {
		return (
			<>
				<PageHeader
					title="Transactions"
					description="Historique de toutes vos transactions"
				/>
				<TransactionsError />
			</>
		);
	}

	const transactions = transactionsData?.items ?? [];
	const income = summary?.totalIncome ?? 0;
	const expenses = summary?.totalExpenses ?? 0;

	return (
		<>
			<PageHeader
				title="Transactions"
				description="Historique de toutes vos transactions"
				actions={<ExportButton />}
			/>

			{isLoading ? (
				<TransactionsLoading />
			) : (
				<>
					<StatCardGrid columns={3}>
						<StatCard
							label="Revenus"
							value={`+${formatMoney(income)}`}
							icon={ArrowDownLeft}
							variant="teal"
						/>
						<StatCard
							label="Dépenses"
							value={`-${formatMoney(expenses)}`}
							icon={ArrowUpRight}
							variant="coral"
						/>
						<StatCard
							label="Solde net"
							value={formatMoney(income - expenses)}
							icon={CreditCard}
							variant={income - expenses >= 0 ? 'teal' : 'coral'}
						/>
					</StatCardGrid>

					<TransactionFilters />

					<TransactionListContainer
						title="Toutes les transactions"
						subtitle={`${transactions.length} opération${transactions.length > 1 ? 's' : ''}`}
					>
						{transactions.map((tx) => (
							<TransactionListItem
								key={tx.id}
								description={tx.description}
								amount={tx.amount}
								category={tx.category ?? 'Non catégorisé'}
								account={tx.accountName}
								dateLabel={formatDate(tx.date)}
							/>
						))}
					</TransactionListContainer>
				</>
			)}
		</>
	);
}
