'use client';

/**
 * Transactions Page
 *
 * Shows transaction history with filtering and search via DataTable.
 * Connected to real data via TanStack Query hooks.
 * Supports URL search params for pre-filtering (accountId, startDate, endDate).
 */

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components';
import {
	CreateTransactionSheet,
	TransactionTable,
	type TransactionFilters,
} from '@/features/transactions';

export default function TransactionsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const searchParams = useSearchParams();

	const initialFilters: TransactionFilters | undefined = useMemo(() => {
		const accountId = searchParams.get('accountId') ?? undefined;
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		if (!accountId && !startDate && !endDate) return undefined;

		return {
			accountId,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
		};
	}, [searchParams]);

	return (
		<>
			<PageHeader title="Transactions" />
			<TransactionTable initialFilters={initialFilters} onAddClick={() => setCreateOpen(true)} />
			<CreateTransactionSheet open={createOpen} onOpenChange={setCreateOpen} />
		</>
	);
}
