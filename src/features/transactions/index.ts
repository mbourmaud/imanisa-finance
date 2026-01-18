// Components
export {
	createCompactTransactionColumns,
	createTransactionColumns,
} from './components/transaction-columns';
export { TransactionTable } from './components/transaction-table';

// TanStack Query Hooks (for data fetching)
export {
	transactionKeys,
	useBulkCategorizeMutation,
	useCreateTransactionMutation,
	useDeleteTransactionMutation,
	useOptimisticCreateTransaction,
	usePrefetchTransactions,
	useReconcileTransactionsMutation,
	useTransactionQuery,
	useTransactionSummaryQuery,
	useTransactionsQuery,
	useUpdateTransactionMutation,
} from './hooks/use-transactions-query';

// Services
export { transactionService } from './services/transaction-service';

// Types
export * from './types';
