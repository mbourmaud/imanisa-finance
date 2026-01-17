'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AsyncState, PaginatedResponse } from '@/shared/types';
import { createAsyncState } from '@/shared/types';
import { transactionService } from '../services/transaction-service';
import type {
	CreateTransactionInput,
	Transaction,
	TransactionFilters,
	TransactionPagination,
	TransactionSummary,
	UpdateTransactionInput,
} from '../types';

/**
 * Transaction store state interface
 */
interface TransactionState {
	// Data
	transactions: AsyncState<PaginatedResponse<Transaction>>;
	selectedTransaction: AsyncState<Transaction>;
	summary: AsyncState<TransactionSummary>;

	// Pagination
	pagination: TransactionPagination;

	// UI State
	filters: TransactionFilters;
	selectedIds: string[];
	isCreateModalOpen: boolean;
	isEditModalOpen: boolean;

	// Actions
	fetchTransactions: (
		filters?: TransactionFilters,
		pagination?: TransactionPagination,
	) => Promise<void>;
	fetchTransactionById: (id: string) => Promise<void>;
	fetchSummary: (startDate?: Date, endDate?: Date) => Promise<void>;
	createTransaction: (input: CreateTransactionInput) => Promise<void>;
	updateTransaction: (id: string, input: UpdateTransactionInput) => Promise<void>;
	deleteTransaction: (id: string) => Promise<void>;
	bulkCategorize: (categoryId: string) => Promise<void>;
	reconcileSelected: () => Promise<void>;

	// UI Actions
	setFilters: (filters: TransactionFilters) => void;
	clearFilters: () => void;
	setPagination: (pagination: Partial<TransactionPagination>) => void;
	toggleSelection: (id: string) => void;
	selectAll: () => void;
	clearSelection: () => void;
	openCreateModal: () => void;
	closeCreateModal: () => void;
	openEditModal: (transaction: Transaction) => void;
	closeEditModal: () => void;
	reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
	transactions: createAsyncState<PaginatedResponse<Transaction>>(),
	selectedTransaction: createAsyncState<Transaction>(),
	summary: createAsyncState<TransactionSummary>(),
	pagination: { page: 1, pageSize: 50 },
	filters: { excludeInternal: true } as TransactionFilters,
	selectedIds: [] as string[],
	isCreateModalOpen: false,
	isEditModalOpen: false,
};

/**
 * Transaction store with Zustand
 */
export const useTransactionStore = create<TransactionState>()(
	devtools(
		(set, get) => ({
			...initialState,

			fetchTransactions: async (
				filters?: TransactionFilters,
				pagination?: TransactionPagination,
			) => {
				const appliedFilters = filters ?? get().filters;
				const appliedPagination = pagination ?? get().pagination;
				set({ transactions: { ...get().transactions, status: 'loading', error: null } });

				try {
					const data = await transactionService.getAll(appliedFilters, appliedPagination);
					set({ transactions: { data, status: 'success', error: null } });
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
					set({ transactions: { ...get().transactions, status: 'error', error: message } });
				}
			},

			fetchTransactionById: async (id: string) => {
				set({
					selectedTransaction: { ...get().selectedTransaction, status: 'loading', error: null },
				});

				try {
					const data = await transactionService.getById(id);
					set({ selectedTransaction: { data, status: 'success', error: null } });
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to fetch transaction';
					set({
						selectedTransaction: { ...get().selectedTransaction, status: 'error', error: message },
					});
				}
			},

			fetchSummary: async (startDate?: Date, endDate?: Date) => {
				set({ summary: { ...get().summary, status: 'loading', error: null } });

				try {
					const data = await transactionService.getSummary(startDate, endDate);
					set({ summary: { data, status: 'success', error: null } });
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to fetch summary';
					set({ summary: { ...get().summary, status: 'error', error: message } });
				}
			},

			createTransaction: async (input: CreateTransactionInput) => {
				try {
					await transactionService.create(input);
					await get().fetchTransactions();
					set({ isCreateModalOpen: false });
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to create transaction';
					throw new Error(message);
				}
			},

			updateTransaction: async (id: string, input: UpdateTransactionInput) => {
				try {
					await transactionService.update(id, input);
					await get().fetchTransactions();
					set({ isEditModalOpen: false, selectedTransaction: createAsyncState() });
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to update transaction';
					throw new Error(message);
				}
			},

			deleteTransaction: async (id: string) => {
				try {
					await transactionService.delete(id);
					await get().fetchTransactions();
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to delete transaction';
					throw new Error(message);
				}
			},

			bulkCategorize: async (categoryId: string) => {
				const { selectedIds } = get();
				if (selectedIds.length === 0) return;

				try {
					await transactionService.bulkCategorize(selectedIds, categoryId);
					await get().fetchTransactions();
					set({ selectedIds: [] });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : 'Failed to categorize transactions';
					throw new Error(message);
				}
			},

			reconcileSelected: async () => {
				const { selectedIds } = get();
				if (selectedIds.length === 0) return;

				try {
					await transactionService.reconcile(selectedIds);
					await get().fetchTransactions();
					set({ selectedIds: [] });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : 'Failed to reconcile transactions';
					throw new Error(message);
				}
			},

			setFilters: (filters: TransactionFilters) => {
				set({ filters, pagination: { ...get().pagination, page: 1 } });
			},

			clearFilters: () => {
				set({ filters: { excludeInternal: true }, pagination: { ...get().pagination, page: 1 } });
			},

			setPagination: (pagination: Partial<TransactionPagination>) => {
				set({ pagination: { ...get().pagination, ...pagination } });
			},

			toggleSelection: (id: string) => {
				const { selectedIds } = get();
				if (selectedIds.includes(id)) {
					set({ selectedIds: selectedIds.filter((i) => i !== id) });
				} else {
					set({ selectedIds: [...selectedIds, id] });
				}
			},

			selectAll: () => {
				const items = get().transactions.data?.items ?? [];
				set({ selectedIds: items.map((t) => t.id) });
			},

			clearSelection: () => {
				set({ selectedIds: [] });
			},

			openCreateModal: () => {
				set({ isCreateModalOpen: true });
			},

			closeCreateModal: () => {
				set({ isCreateModalOpen: false });
			},

			openEditModal: (transaction: Transaction) => {
				set({
					selectedTransaction: { data: transaction, status: 'success', error: null },
					isEditModalOpen: true,
				});
			},

			closeEditModal: () => {
				set({ isEditModalOpen: false, selectedTransaction: createAsyncState() });
			},

			reset: () => {
				set(initialState);
			},
		}),
		{ name: 'transaction-store' },
	),
);

/**
 * Selectors
 */
export const transactionSelectors = {
	getTransactions: (state: TransactionState) => state.transactions.data?.items ?? [],

	getTotalCount: (state: TransactionState) => state.transactions.data?.total ?? 0,

	isLoading: (state: TransactionState) => state.transactions.status === 'loading',

	hasError: (state: TransactionState) => state.transactions.status === 'error',

	getSelectedCount: (state: TransactionState) => state.selectedIds.length,

	isAllSelected: (state: TransactionState) => {
		const items = state.transactions.data?.items ?? [];
		return items.length > 0 && state.selectedIds.length === items.length;
	},

	getNetFlow: (state: TransactionState) => {
		const summary = state.summary.data;
		return summary ? summary.totalIncome - summary.totalExpenses : 0;
	},
};
