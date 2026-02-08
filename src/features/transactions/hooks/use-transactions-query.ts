/**
 * TanStack Query hooks for transactions
 *
 * These hooks provide data fetching, caching, and mutations for transactions
 * using TanStack Query. They can be used alongside or as a replacement for
 * the Zustand store depending on the use case.
 */

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginatedResponse } from '@/shared/types';
import { transactionService } from '../services/transaction-service';
import type {
	CreateTransactionInput,
	RecurringPattern,
	Transaction,
	TransactionFilters,
	TransactionPagination,
	UpdateTransactionInput,
} from '../types';

/**
 * Query key factory for transactions
 * Ensures consistent keys across the application
 */
export const transactionKeys = {
	all: ['transactions'] as const,
	lists: () => [...transactionKeys.all, 'list'] as const,
	list: (filters?: TransactionFilters, pagination?: TransactionPagination) =>
		[...transactionKeys.lists(), { filters, pagination }] as const,
	details: () => [...transactionKeys.all, 'detail'] as const,
	detail: (id: string) => [...transactionKeys.details(), id] as const,
	summary: (filters?: TransactionFilters) =>
		[...transactionKeys.all, 'summary', { filters }] as const,
	recurring: () => [...transactionKeys.all, 'recurring'] as const,
};

/**
 * Hook to fetch paginated transactions with filters
 */
export function useTransactionsQuery(
	filters?: TransactionFilters,
	pagination?: TransactionPagination,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: transactionKeys.list(filters, pagination),
		queryFn: () => transactionService.getAll(filters, pagination),
		enabled: options?.enabled ?? true,
	});
}

/**
 * Hook to fetch transactions with infinite scroll
 */
export function useInfiniteTransactionsQuery(filters?: TransactionFilters, pageSize = 50) {
	return useInfiniteQuery({
		queryKey: [...transactionKeys.lists(), 'infinite', { filters, pageSize }],
		queryFn: ({ pageParam }) => transactionService.getAll(filters, { page: pageParam, pageSize }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
	});
}

/**
 * Hook to fetch a single transaction by ID
 */
export function useTransactionQuery(id: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: transactionKeys.detail(id),
		queryFn: () => transactionService.getById(id),
		enabled: (options?.enabled ?? true) && !!id,
	});
}

/**
 * Hook to fetch transaction summary
 */
export function useTransactionSummaryQuery(
	filters?: TransactionFilters,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: transactionKeys.summary(filters),
		queryFn: () => transactionService.getSummary(filters),
		enabled: options?.enabled ?? true,
	});
}

/**
 * Hook to fetch recurring patterns
 */
export function useRecurringPatternsQuery(options?: { enabled?: boolean }) {
	return useQuery<RecurringPattern[]>({
		queryKey: transactionKeys.recurring(),
		queryFn: async () => {
			const response = await fetch('/api/recurring-patterns')
			if (!response.ok) {
				throw new Error('Failed to fetch recurring patterns')
			}
			return response.json()
		},
		staleTime: 5 * 60 * 1000,
		enabled: options?.enabled ?? true,
	})
}

/**
 * Hook to create a transaction
 */
export function useCreateTransactionMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateTransactionInput) => transactionService.create(input),
		onSuccess: () => {
			// Invalidate all transaction lists to refetch
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
			// Invalidate summary
			queryClient.invalidateQueries({ queryKey: [...transactionKeys.all, 'summary'] });
		},
	});
}

/**
 * Hook to update a transaction
 */
export function useUpdateTransactionMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateTransactionInput }) =>
			transactionService.update(id, input),
		onSuccess: (data, variables) => {
			// Update the specific transaction in cache
			queryClient.setQueryData(transactionKeys.detail(variables.id), data);
			// Invalidate lists
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
			// Invalidate summary
			queryClient.invalidateQueries({ queryKey: [...transactionKeys.all, 'summary'] });
		},
	});
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransactionMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => transactionService.delete(id),
		onSuccess: (_data, id) => {
			// Remove from cache
			queryClient.removeQueries({ queryKey: transactionKeys.detail(id) });
			// Invalidate lists
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
			// Invalidate summary
			queryClient.invalidateQueries({ queryKey: [...transactionKeys.all, 'summary'] });
		},
	});
}

/**
 * Hook to bulk delete transactions
 */
export function useBulkDeleteMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (transactionIds: string[]) => transactionService.bulkDelete(transactionIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
			queryClient.invalidateQueries({ queryKey: [...transactionKeys.all, 'summary'] });
		},
	});
}

/**
 * Hook to bulk categorize transactions
 */
export function useBulkCategorizeMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			transactionIds,
			categoryId,
		}: {
			transactionIds: string[];
			categoryId: string;
		}) => transactionService.bulkCategorize(transactionIds, categoryId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
			queryClient.invalidateQueries({ queryKey: [...transactionKeys.all, 'summary'] });
		},
	});
}

/**
 * Hook to reconcile transactions
 */
export function useReconcileTransactionsMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (transactionIds: string[]) => transactionService.reconcile(transactionIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
		},
	});
}

/**
 * Hook to prefetch transactions (useful for hover/preloading)
 */
export function usePrefetchTransactions() {
	const queryClient = useQueryClient();

	return (filters?: TransactionFilters, pagination?: TransactionPagination) => {
		queryClient.prefetchQuery({
			queryKey: transactionKeys.list(filters, pagination),
			queryFn: () => transactionService.getAll(filters, pagination),
		});
	};
}

/**
 * Hook for optimistic updates on transaction creation
 */
export function useOptimisticCreateTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateTransactionInput) => transactionService.create(input),
		onMutate: async (newTransaction) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });

			// Snapshot previous value
			const previousTransactions = queryClient.getQueriesData<PaginatedResponse<Transaction>>({
				queryKey: transactionKeys.lists(),
			});

			// Optimistically add to first matching query
			queryClient.setQueriesData<PaginatedResponse<Transaction>>(
				{ queryKey: transactionKeys.lists() },
				(old) => {
					if (!old) return old;
					const optimisticTransaction: Transaction = {
						id: `temp-${Date.now()}`,
						accountId: newTransaction.accountId,
						type: newTransaction.type,
						amount: newTransaction.amount,
						currency: 'EUR',
						description: newTransaction.description,
						date: newTransaction.date,
						bankCategory: null,
						isInternal: false,
						importedAt: null,
						transactionCategory: null,
						account: {
							id: newTransaction.accountId,
							name: '',
							type: 'CHECKING',
							bank: { id: '', name: '', color: '#888', logo: null },
							accountMembers: [],
						},
					};
					return {
						...old,
						items: [optimisticTransaction, ...old.items],
						total: old.total + 1,
					};
				},
			);

			return { previousTransactions };
		},
		onError: (_err, _newTransaction, context) => {
			// Rollback on error
			if (context?.previousTransactions) {
				for (const [queryKey, data] of context.previousTransactions) {
					queryClient.setQueryData(queryKey, data);
				}
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
			queryClient.invalidateQueries({ queryKey: [...transactionKeys.all, 'summary'] });
		},
	});
}
