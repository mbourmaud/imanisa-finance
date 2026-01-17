/**
 * TanStack Query hooks for accounts
 *
 * These hooks provide data fetching, caching, and mutations for accounts.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../services/account-service';
import type { Account, AccountFilters, CreateAccountInput, UpdateAccountInput } from '../types';

/**
 * Query key factory for accounts
 */
export const accountKeys = {
	all: ['accounts'] as const,
	lists: () => [...accountKeys.all, 'list'] as const,
	list: (filters?: AccountFilters) => [...accountKeys.lists(), { filters }] as const,
	details: () => [...accountKeys.all, 'detail'] as const,
	detail: (id: string) => [...accountKeys.details(), id] as const,
	summary: () => [...accountKeys.all, 'summary'] as const,
};

/**
 * Hook to fetch all accounts with optional filters
 */
export function useAccountsQuery(filters?: AccountFilters, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: accountKeys.list(filters),
		queryFn: () => accountService.getAll(filters),
		enabled: options?.enabled ?? true,
	});
}

/**
 * Hook to fetch a single account by ID
 */
export function useAccountQuery(id: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: accountKeys.detail(id),
		queryFn: () => accountService.getById(id),
		enabled: (options?.enabled ?? true) && !!id,
	});
}

/**
 * Hook to fetch account summary
 */
export function useAccountSummaryQuery(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: accountKeys.summary(),
		queryFn: () => accountService.getSummary(),
		enabled: options?.enabled ?? true,
	});
}

/**
 * Hook to create an account
 */
export function useCreateAccountMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateAccountInput) => accountService.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
			queryClient.invalidateQueries({ queryKey: accountKeys.summary() });
		},
	});
}

/**
 * Hook to update an account
 */
export function useUpdateAccountMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) =>
			accountService.update(id, input),
		onSuccess: (data, variables) => {
			queryClient.setQueryData(accountKeys.detail(variables.id), data);
			queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
			queryClient.invalidateQueries({ queryKey: accountKeys.summary() });
		},
	});
}

/**
 * Hook to delete an account
 */
export function useDeleteAccountMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => accountService.delete(id),
		onSuccess: (_data, id) => {
			queryClient.removeQueries({ queryKey: accountKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
			queryClient.invalidateQueries({ queryKey: accountKeys.summary() });
		},
	});
}

/**
 * Hook to sync account balance
 */
export function useSyncAccountMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => accountService.syncBalance(id),
		onSuccess: (data, id) => {
			queryClient.setQueryData(accountKeys.detail(id), data);
			queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
			queryClient.invalidateQueries({ queryKey: accountKeys.summary() });
		},
	});
}

/**
 * Hook to add a member to an account
 */
export function useAddAccountMemberMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			accountId,
			memberId,
			ownerShare = 100,
		}: {
			accountId: string;
			memberId: string;
			ownerShare?: number;
		}) => {
			const response = await fetch(`/api/accounts/${accountId}/members`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ memberId, ownerShare }),
			});
			if (!response.ok) throw new Error('Failed to add member');
			return response.json();
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.accountId) });
			queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
		},
	});
}

/**
 * Hook to remove a member from an account
 */
export function useRemoveAccountMemberMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ accountId, memberId }: { accountId: string; memberId: string }) => {
			const response = await fetch(`/api/accounts/${accountId}/members?memberId=${memberId}`, {
				method: 'DELETE',
			});
			if (!response.ok) throw new Error('Failed to remove member');
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.accountId) });
			queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
		},
	});
}
