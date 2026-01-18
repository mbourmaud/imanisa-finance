/**
 * TanStack Query hooks for loan insurances
 *
 * These hooks provide data fetching, caching, and mutations for loan insurances.
 * Loan insurances have a 1:N relationship with loans.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyKeys } from '../../properties/hooks/use-properties-query';
import type { CreateLoanInsuranceInput, LoanInsurance, UpdateLoanInsuranceInput } from '../types';
import { loanKeys } from './use-loans-query';

/**
 * Query key factory for loan insurances
 * Note: Loan insurances are fetched as part of the loan detail,
 * so we use loan and property keys for invalidation
 */
export const loanInsuranceKeys = {
	all: ['loanInsurances'] as const,
	byLoan: (loanId: string) => [...loanInsuranceKeys.all, loanId] as const,
	detail: (id: string) => [...loanInsuranceKeys.all, 'detail', id] as const,
};

/**
 * API service functions for loan insurances
 */
const loanInsuranceService = {
	async create(loanId: string, input: CreateLoanInsuranceInput): Promise<LoanInsurance> {
		const response = await fetch(`/api/loans/${loanId}/insurances`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to create loan insurance');
		}
		return response.json();
	},

	async update(id: string, input: UpdateLoanInsuranceInput): Promise<LoanInsurance> {
		const response = await fetch(`/api/loan-insurances/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to update loan insurance');
		}
		return response.json();
	},

	async delete(id: string): Promise<void> {
		const response = await fetch(`/api/loan-insurances/${id}`, {
			method: 'DELETE',
		});
		if (!response.ok) {
			throw new Error('Failed to delete loan insurance');
		}
	},
};

/**
 * Hook to create loan insurance
 */
export function useCreateLoanInsuranceMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			loanId,
			input,
		}: {
			loanId: string;
			propertyId: string;
			input: CreateLoanInsuranceInput;
		}) => loanInsuranceService.create(loanId, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
			queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
			queryClient.invalidateQueries({ queryKey: loanKeys.byProperty(variables.propertyId) });
			// Also invalidate property detail to update insurance totals
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) });
		},
	});
}

/**
 * Hook to update loan insurance
 */
export function useUpdateLoanInsuranceMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: string;
			loanId: string;
			propertyId: string;
			input: UpdateLoanInsuranceInput;
		}) => loanInsuranceService.update(id, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
			queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
			queryClient.invalidateQueries({ queryKey: loanKeys.byProperty(variables.propertyId) });
			// Also invalidate property detail
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) });
		},
	});
}

/**
 * Hook to delete loan insurance
 */
export function useDeleteLoanInsuranceMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string; loanId: string; propertyId: string }) =>
			loanInsuranceService.delete(id),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
			queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
			queryClient.invalidateQueries({ queryKey: loanKeys.byProperty(variables.propertyId) });
			// Also invalidate property detail
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) });
		},
	});
}
