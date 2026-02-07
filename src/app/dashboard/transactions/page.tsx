'use client';

/**
 * Transactions Page
 *
 * Shows transaction history with filtering and search via DataTable.
 * Connected to real data via TanStack Query hooks.
 */

import { TransactionTable } from '@/features/transactions';
import { usePageHeader } from '@/shared/hooks';

export default function TransactionsPage() {
	usePageHeader('Transactions');

	return <TransactionTable />;
}
