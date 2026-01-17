// Types
export * from './types';

// Hooks (Zustand-based)
export {
	useTransactionActions,
	useTransactionSelection,
	useTransactionSummary,
	useTransactions,
} from './hooks/use-transactions';

// Hooks (TanStack Query-based)
export {
	transactionKeys,
	useTransactionsQuery,
	useTransactionQuery,
	useTransactionSummaryQuery,
	useCreateTransactionMutation,
	useUpdateTransactionMutation,
	useDeleteTransactionMutation,
	useBulkCategorizeMutation,
	useReconcileTransactionsMutation,
	usePrefetchTransactions,
	useOptimisticCreateTransaction,
} from './hooks/use-transactions-query';

// Components
export { TransactionTable } from './components/transaction-table';
export { createTransactionColumns, createCompactTransactionColumns } from './components/transaction-columns';

// Services
export { transactionService } from './services/transaction-service';

// Store
export { transactionSelectors, useTransactionStore } from './stores/transaction-store';
