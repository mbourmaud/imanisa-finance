'use client';

import { useCallback, useEffect } from 'react';
import { transactionSelectors, useTransactionStore } from '../stores/transaction-store';
import type { TransactionFilters } from '../types';

/**
 * Hook for managing transactions list
 */
export function useTransactions(filters?: TransactionFilters) {
	const { fetchTransactions, fetchSummary, setFilters, clearFilters, pagination, setPagination } =
		useTransactionStore();

	const transactions = useTransactionStore(transactionSelectors.getTransactions);
	const totalCount = useTransactionStore(transactionSelectors.getTotalCount);
	const isLoading = useTransactionStore(transactionSelectors.isLoading);
	const hasError = useTransactionStore(transactionSelectors.hasError);
	const error = useTransactionStore((state) => state.transactions.error);
	const summary = useTransactionStore((state) => state.summary.data);

	useEffect(() => {
		if (filters) {
			setFilters(filters);
		}
		fetchTransactions(filters);
		fetchSummary();
	}, [fetchTransactions, fetchSummary, filters, setFilters]);

	const refetch = useCallback(() => {
		fetchTransactions();
		fetchSummary();
	}, [fetchTransactions, fetchSummary]);

	const goToPage = useCallback(
		(page: number) => {
			setPagination({ page });
			fetchTransactions();
		},
		[setPagination, fetchTransactions],
	);

	return {
		transactions,
		summary,
		totalCount,
		pagination,
		isLoading,
		hasError,
		error,
		refetch,
		setFilters,
		clearFilters,
		goToPage,
	};
}

/**
 * Hook for transaction selection
 */
export function useTransactionSelection() {
	const {
		toggleSelection,
		selectAll,
		clearSelection,
		selectedIds,
		bulkCategorize,
		reconcileSelected,
	} = useTransactionStore();

	const selectedCount = useTransactionStore(transactionSelectors.getSelectedCount);
	const isAllSelected = useTransactionStore(transactionSelectors.isAllSelected);

	return {
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelection,
		selectAll,
		clearSelection,
		bulkCategorize,
		reconcileSelected,
	};
}

/**
 * Hook for transaction CRUD operations
 */
export function useTransactionActions() {
	const {
		createTransaction,
		updateTransaction,
		deleteTransaction,
		openCreateModal,
		closeCreateModal,
		openEditModal,
		closeEditModal,
		isCreateModalOpen,
		isEditModalOpen,
		selectedTransaction,
	} = useTransactionStore();

	return {
		createTransaction,
		updateTransaction,
		deleteTransaction,
		isCreateModalOpen,
		isEditModalOpen,
		selectedTransaction: selectedTransaction.data,
		openCreateModal,
		closeCreateModal,
		openEditModal,
		closeEditModal,
	};
}

/**
 * Hook for transaction summary
 */
export function useTransactionSummary(startDate?: Date, endDate?: Date) {
	const { fetchSummary, summary } = useTransactionStore();
	const netFlow = useTransactionStore(transactionSelectors.getNetFlow);

	useEffect(() => {
		fetchSummary(startDate, endDate);
	}, [fetchSummary, startDate, endDate]);

	return {
		summary: summary.data,
		netFlow,
		isLoading: summary.status === 'loading',
		error: summary.error,
	};
}
