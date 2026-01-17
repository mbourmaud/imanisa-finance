/**
 * TanStack Query hooks for loans
 *
 * These hooks provide data fetching, caching, and mutations for loans.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loanService } from '../services/loan-service'
import { propertyKeys } from '../../properties/hooks/use-properties-query'
import type {
	LoanFilters,
	CreateLoanInput,
	UpdateLoanInput,
} from '../types'

/**
 * Query key factory for loans
 */
export const loanKeys = {
	all: ['loans'] as const,
	lists: () => [...loanKeys.all, 'list'] as const,
	list: (filters?: LoanFilters) => [...loanKeys.lists(), { filters }] as const,
	byProperty: (propertyId: string) => [...loanKeys.lists(), { propertyId }] as const,
	details: () => [...loanKeys.all, 'detail'] as const,
	detail: (id: string) => [...loanKeys.details(), id] as const,
}

/**
 * Hook to fetch all loans with optional filters
 */
export function useLoansQuery(filters?: LoanFilters, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: loanKeys.list(filters),
		queryFn: () => loanService.getAll(filters),
		enabled: options?.enabled ?? true,
	})
}

/**
 * Hook to fetch loans for a specific property
 */
export function useLoansByPropertyQuery(propertyId: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: loanKeys.byProperty(propertyId),
		queryFn: () => loanService.getByProperty(propertyId),
		enabled: (options?.enabled ?? true) && !!propertyId,
	})
}

/**
 * Hook to fetch a single loan by ID
 */
export function useLoanQuery(id: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: loanKeys.detail(id),
		queryFn: () => loanService.getById(id),
		enabled: (options?.enabled ?? true) && !!id,
	})
}

/**
 * Hook to create a loan
 */
export function useCreateLoanMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ propertyId, input }: { propertyId: string; input: CreateLoanInput }) =>
			loanService.create(propertyId, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
			queryClient.invalidateQueries({ queryKey: loanKeys.byProperty(variables.propertyId) })
			// Also invalidate property detail to update loan counts and totals
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) })
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
		},
	})
}

/**
 * Hook to update a loan
 */
export function useUpdateLoanMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, propertyId, input }: { id: string; propertyId: string; input: UpdateLoanInput }) =>
			loanService.update(id, input),
		onSuccess: (data, variables) => {
			queryClient.setQueryData(loanKeys.detail(variables.id), data)
			queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
			queryClient.invalidateQueries({ queryKey: loanKeys.byProperty(variables.propertyId) })
			// Also invalidate property detail
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) })
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
		},
	})
}

/**
 * Hook to delete a loan
 */
export function useDeleteLoanMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id }: { id: string; propertyId: string }) =>
			loanService.delete(id),
		onSuccess: (_data, variables) => {
			queryClient.removeQueries({ queryKey: loanKeys.detail(variables.id) })
			queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
			queryClient.invalidateQueries({ queryKey: loanKeys.byProperty(variables.propertyId) })
			// Also invalidate property detail
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) })
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
		},
	})
}
