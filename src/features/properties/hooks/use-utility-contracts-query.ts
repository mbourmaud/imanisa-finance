/**
 * TanStack Query hooks for utility contracts
 *
 * These hooks provide data fetching, caching, and mutations for utility contracts.
 * Utility contracts have a 1:N relationship with properties.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyKeys } from './use-properties-query'
import type {
	UtilityContract,
	CreateUtilityContractInput,
	UpdateUtilityContractInput,
} from '../types'

/**
 * Query key factory for utility contracts
 * Note: Utility contracts are fetched as part of the property detail,
 * so we use property keys for invalidation
 */
export const utilityContractKeys = {
	all: ['utilityContracts'] as const,
	byProperty: (propertyId: string) => [...utilityContractKeys.all, propertyId] as const,
	detail: (id: string) => [...utilityContractKeys.all, 'detail', id] as const,
}

/**
 * API service functions for utility contracts
 */
const utilityContractService = {
	async create(propertyId: string, input: CreateUtilityContractInput): Promise<UtilityContract> {
		const response = await fetch(`/api/properties/${propertyId}/utility-contracts`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to create utility contract')
		}
		return response.json()
	},

	async update(id: string, input: UpdateUtilityContractInput): Promise<UtilityContract> {
		const response = await fetch(`/api/utility-contracts/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to update utility contract')
		}
		return response.json()
	},

	async delete(id: string): Promise<void> {
		const response = await fetch(`/api/utility-contracts/${id}`, {
			method: 'DELETE',
		})
		if (!response.ok) {
			throw new Error('Failed to delete utility contract')
		}
	},
}

/**
 * Hook to create utility contract
 */
export function useCreateUtilityContractMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ propertyId, input }: { propertyId: string; input: CreateUtilityContractInput }) =>
			utilityContractService.create(propertyId, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) })
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
		},
	})
}

/**
 * Hook to update utility contract
 */
export function useUpdateUtilityContractMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, input }: { id: string; propertyId: string; input: UpdateUtilityContractInput }) =>
			utilityContractService.update(id, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) })
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
		},
	})
}

/**
 * Hook to delete utility contract
 */
export function useDeleteUtilityContractMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id }: { id: string; propertyId: string }) =>
			utilityContractService.delete(id),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) })
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
		},
	})
}
