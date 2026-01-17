'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AsyncState } from '@/shared/types';
import { createAsyncState } from '@/shared/types';
import { accountService } from '../services/account-service';
import type {
	Account,
	AccountFilters,
	AccountSummary,
	CreateAccountInput,
	UpdateAccountInput,
} from '../types';

/**
 * Account store state interface
 */
interface AccountState {
	// Data
	accounts: AsyncState<Account[]>;
	selectedAccount: AsyncState<Account>;
	summary: AsyncState<AccountSummary>;

	// UI State
	filters: AccountFilters;
	isCreateModalOpen: boolean;
	isEditModalOpen: boolean;

	// Actions
	fetchAccounts: (filters?: AccountFilters) => Promise<void>;
	fetchAccountById: (id: string) => Promise<void>;
	fetchSummary: () => Promise<void>;
	createAccount: (input: CreateAccountInput) => Promise<void>;
	updateAccount: (id: string, input: UpdateAccountInput) => Promise<void>;
	deleteAccount: (id: string) => Promise<void>;
	syncAccount: (id: string) => Promise<void>;

	// UI Actions
	setFilters: (filters: AccountFilters) => void;
	clearFilters: () => void;
	openCreateModal: () => void;
	closeCreateModal: () => void;
	openEditModal: (account: Account) => void;
	closeEditModal: () => void;
	reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
	accounts: createAsyncState<Account[]>([]),
	selectedAccount: createAsyncState<Account>(),
	summary: createAsyncState<AccountSummary>(),
	filters: {},
	isCreateModalOpen: false,
	isEditModalOpen: false,
};

/**
 * Account store with Zustand
 */
export const useAccountStore = create<AccountState>()(
	devtools(
		(set, get) => ({
			...initialState,

			/**
			 * Fetch all accounts
			 */
			fetchAccounts: async (filters?: AccountFilters) => {
				const appliedFilters = filters ?? get().filters;
				set({ accounts: { ...get().accounts, status: 'loading', error: null } });

				try {
					const data = await accountService.getAll(appliedFilters);
					set({ accounts: { data, status: 'success', error: null } });
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to fetch accounts';
					set({ accounts: { ...get().accounts, status: 'error', error: message } });
				}
			},

			/**
			 * Fetch single account by ID
			 */
			fetchAccountById: async (id: string) => {
				set({ selectedAccount: { ...get().selectedAccount, status: 'loading', error: null } });

				try {
					const data = await accountService.getById(id);
					set({ selectedAccount: { data, status: 'success', error: null } });
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to fetch account';
					set({ selectedAccount: { ...get().selectedAccount, status: 'error', error: message } });
				}
			},

			/**
			 * Fetch account summary
			 */
			fetchSummary: async () => {
				set({ summary: { ...get().summary, status: 'loading', error: null } });

				try {
					const data = await accountService.getSummary();
					set({ summary: { data, status: 'success', error: null } });
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to fetch summary';
					set({ summary: { ...get().summary, status: 'error', error: message } });
				}
			},

			/**
			 * Create new account
			 */
			createAccount: async (input: CreateAccountInput) => {
				try {
					await accountService.create(input);
					// Refetch accounts list after creation
					await get().fetchAccounts();
					await get().fetchSummary();
					set({ isCreateModalOpen: false });
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to create account';
					throw new Error(message);
				}
			},

			/**
			 * Update existing account
			 */
			updateAccount: async (id: string, input: UpdateAccountInput) => {
				try {
					const updated = await accountService.update(id, input);
					// Update in local state
					const currentAccounts = get().accounts.data ?? [];
					const updatedAccounts = currentAccounts.map((acc) => (acc.id === id ? updated : acc));
					set({
						accounts: { ...get().accounts, data: updatedAccounts },
						isEditModalOpen: false,
						selectedAccount: createAsyncState(),
					});
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to update account';
					throw new Error(message);
				}
			},

			/**
			 * Delete account
			 */
			deleteAccount: async (id: string) => {
				try {
					await accountService.delete(id);
					// Remove from local state
					const currentAccounts = get().accounts.data ?? [];
					const filteredAccounts = currentAccounts.filter((acc) => acc.id !== id);
					set({ accounts: { ...get().accounts, data: filteredAccounts } });
					await get().fetchSummary();
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to delete account';
					throw new Error(message);
				}
			},

			/**
			 * Sync account with bank
			 */
			syncAccount: async (id: string) => {
				try {
					const updated = await accountService.syncBalance(id);
					// Update in local state
					const currentAccounts = get().accounts.data ?? [];
					const updatedAccounts = currentAccounts.map((acc) => (acc.id === id ? updated : acc));
					set({ accounts: { ...get().accounts, data: updatedAccounts } });
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to sync account';
					throw new Error(message);
				}
			},

			/**
			 * Set filters
			 */
			setFilters: (filters: AccountFilters) => {
				set({ filters });
			},

			/**
			 * Clear filters
			 */
			clearFilters: () => {
				set({ filters: {} });
			},

			/**
			 * Open create modal
			 */
			openCreateModal: () => {
				set({ isCreateModalOpen: true });
			},

			/**
			 * Close create modal
			 */
			closeCreateModal: () => {
				set({ isCreateModalOpen: false });
			},

			/**
			 * Open edit modal with account
			 */
			openEditModal: (account: Account) => {
				set({
					selectedAccount: { data: account, status: 'success', error: null },
					isEditModalOpen: true,
				});
			},

			/**
			 * Close edit modal
			 */
			closeEditModal: () => {
				set({
					isEditModalOpen: false,
					selectedAccount: createAsyncState(),
				});
			},

			/**
			 * Reset store to initial state
			 */
			reset: () => {
				set(initialState);
			},
		}),
		{ name: 'account-store' },
	),
);

/**
 * Selectors for computed values
 */
export const accountSelectors = {
	/**
	 * Get accounts grouped by type
	 */
	getAccountsByType: (state: AccountState) => {
		const accounts = state.accounts.data ?? [];
		return accounts.reduce(
			(acc, account) => {
				if (!acc[account.type]) {
					acc[account.type] = [];
				}
				acc[account.type].push(account);
				return acc;
			},
			{} as Record<string, Account[]>,
		);
	},

	/**
	 * Get total balance
	 */
	getTotalBalance: (state: AccountState) => {
		const accounts = state.accounts.data ?? [];
		return accounts.reduce((sum, acc) => sum + acc.balance * (acc.ownerShare / 100), 0);
	},

	/**
	 * Check if loading
	 */
	isLoading: (state: AccountState) => state.accounts.status === 'loading',

	/**
	 * Check if has error
	 */
	hasError: (state: AccountState) => state.accounts.status === 'error',

	/**
	 * Get filtered accounts
	 */
	getFilteredAccounts: (state: AccountState) => {
		const accounts = state.accounts.data ?? [];
		const { type, bankId, isActive, search } = state.filters;

		return accounts.filter((account) => {
			if (type && account.type !== type) return false;
			if (bankId && account.bankId !== bankId) return false;
			if (isActive !== undefined && account.isActive !== isActive) return false;
			if (search) {
				const searchLower = search.toLowerCase();
				return (
					account.name.toLowerCase().includes(searchLower) ||
					account.bankName.toLowerCase().includes(searchLower)
				);
			}
			return true;
		});
	},
};
