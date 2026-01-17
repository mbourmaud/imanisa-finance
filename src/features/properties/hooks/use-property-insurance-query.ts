/**
 * TanStack Query hooks for property insurance
 *
 * These hooks provide data fetching, caching, and mutations for property insurance (PNO/MRH).
 * Property insurance has a 1:1 relationship with properties.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyKeys } from './use-properties-query'
import type {
	PropertyInsurance,
	CreatePropertyInsuranceInput,
	UpdatePropertyInsuranceInput,
} from '../types'

/**
 * Query key factory for property insurance
 * Note: Property insurance is fetched as part of the property detail,
 * so we use property keys for invalidation
 */
export const propertyInsuranceKeys = {
	all: ['propertyInsurance'] as const,
	byProperty: (propertyId: string) => [...propertyInsuranceKeys.all, propertyId] as const,
}

/**
 * API service functions for property insurance
 */
const propertyInsuranceService = {
	async create(propertyId: string, input: CreatePropertyInsuranceInput): Promise<PropertyInsurance> {
		const response = await fetch(`/api/properties/${propertyId}/insurance`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to create property insurance')
		}
		return response.json()
	},

	async update(propertyId: string, input: UpdatePropertyInsuranceInput): Promise<PropertyInsurance> {
		const response = await fetch(`/api/properties/${propertyId}/insurance`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to update property insurance')
		}
		return response.json()
	},

	async delete(propertyId: string): Promise<void> {
		const response = await fetch(`/api/properties/${propertyId}/insurance`, {
			method: 'DELETE',
		})
		if (!response.ok) {
			throw new Error('Failed to delete property insurance')
		}
	},
}

/**
 * Hook to create property insurance
 */
export function useCreatePropertyInsuranceMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ propertyId, input }: { propertyId: string; input: CreatePropertyInsuranceInput }) =>
			propertyInsuranceService.create(propertyId, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) })
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
		},
	})
}

/**
 * Hook to update property insurance
 */
export function useUpdatePropertyInsuranceMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ propertyId, input }: { propertyId: string; input: UpdatePropertyInsuranceInput }) =>
			propertyInsuranceService.update(propertyId, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) })
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
		},
	})
}

/**
 * Hook to delete property insurance
 */
export function useDeletePropertyInsuranceMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (propertyId: string) => propertyInsuranceService.delete(propertyId),
		onSuccess: (_data, propertyId) => {
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) })
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
		},
	})
}
