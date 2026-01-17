'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAccountStore } from '../stores/account-store';
import type { Account, AccountFilters, AccountType } from '../types';

/**
 * Hook for managing accounts list
 */
export function useAccounts(filters?: AccountFilters) {
	const accounts = useAccountStore((state) => state.accounts);
	const summary = useAccountStore((state) => state.summary);
	const currentFilters = useAccountStore((state) => state.filters);
	const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
	const fetchSummary = useAccountStore((state) => state.fetchSummary);
	const setFilters = useAccountStore((state) => state.setFilters);
	const clearFilters = useAccountStore((state) => state.clearFilters);

	// Fetch on mount and when filters change
	useEffect(() => {
		if (filters) {
			setFilters(filters);
		}
		fetchAccounts(filters);
		fetchSummary();
	}, [fetchAccounts, fetchSummary, filters, setFilters]);

	// Compute derived values with useMemo to avoid infinite loops
	const accountsList = accounts.data ?? [];

	const accountsByType = useMemo(() => {
		return accountsList.reduce(
			(acc, account) => {
				if (!acc[account.type]) {
					acc[account.type] = [];
				}
				acc[account.type].push(account);
				return acc;
			},
			{} as Record<string, Account[]>,
		);
	}, [accountsList]);

	const totalBalance = useMemo(() => {
		return accountsList.reduce((sum, acc) => sum + acc.balance * (acc.ownerShare / 100), 0);
	}, [accountsList]);

	const filteredAccounts = useMemo(() => {
		const { type, bankId, isActive, search } = currentFilters;

		return accountsList.filter((account) => {
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
	}, [accountsList, currentFilters]);

	const isLoading = accounts.status === 'loading';
	const hasError = accounts.status === 'error';

	const refetch = useCallback(() => {
		fetchAccounts(currentFilters);
		fetchSummary();
	}, [fetchAccounts, fetchSummary, currentFilters]);

	return {
		// Data
		accounts: accountsList,
		filteredAccounts,
		accountsByType,
		summary: summary.data,
		totalBalance,

		// State
		isLoading,
		hasError,
		error: accounts.error,

		// Actions
		refetch,
		setFilters,
		clearFilters,
	};
}

/**
 * Hook for account CRUD operations
 */
export function useAccountActions() {
	const {
		createAccount,
		updateAccount,
		deleteAccount,
		syncAccount,
		openCreateModal,
		closeCreateModal,
		openEditModal,
		closeEditModal,
		isCreateModalOpen,
		isEditModalOpen,
		selectedAccount,
	} = useAccountStore();

	return {
		// CRUD
		createAccount,
		updateAccount,
		deleteAccount,
		syncAccount,

		// Modal state
		isCreateModalOpen,
		isEditModalOpen,
		selectedAccount: selectedAccount.data,

		// Modal actions
		openCreateModal,
		closeCreateModal,
		openEditModal,
		closeEditModal,
	};
}

/**
 * Hook for single account
 */
export function useAccount(id: string) {
	const { fetchAccountById, selectedAccount } = useAccountStore();

	useEffect(() => {
		if (id) {
			fetchAccountById(id);
		}
	}, [id, fetchAccountById]);

	return {
		account: selectedAccount.data,
		isLoading: selectedAccount.status === 'loading',
		error: selectedAccount.error,
	};
}

/**
 * Hook for account summary stats
 */
export function useAccountSummary() {
	const summary = useAccountStore((state) => state.summary);
	const accounts = useAccountStore((state) => state.accounts);
	const fetchSummary = useAccountStore((state) => state.fetchSummary);

	useEffect(() => {
		fetchSummary();
	}, [fetchSummary]);

	const totalBalance = useMemo(() => {
		const accountsList = accounts.data ?? [];
		return accountsList.reduce((sum, acc) => sum + acc.balance * (acc.ownerShare / 100), 0);
	}, [accounts.data]);

	return {
		summary: summary.data,
		totalBalance,
		isLoading: summary.status === 'loading',
		error: summary.error,
	};
}

/**
 * Hook for accounts by type
 */
export function useAccountsByType(type: AccountType) {
	const { accounts } = useAccountStore();

	const filtered = (accounts.data ?? []).filter((account) => account.type === type);
	const total = filtered.reduce((sum, acc) => sum + acc.balance * (acc.ownerShare / 100), 0);

	return {
		accounts: filtered,
		total,
		count: filtered.length,
	};
}
