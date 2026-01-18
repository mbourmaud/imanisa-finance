/**
 * TanStack Query hooks for co-ownership
 *
 * These hooks provide data fetching, caching, and mutations for co-ownership/syndic info.
 * Co-ownership has a 1:1 relationship with properties.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CoOwnership, CreateCoOwnershipInput, UpdateCoOwnershipInput } from '../types';
import { propertyKeys } from './use-properties-query';

/**
 * Query key factory for co-ownership
 * Note: Co-ownership is fetched as part of the property detail,
 * so we use property keys for invalidation
 */
export const coOwnershipKeys = {
	all: ['coOwnership'] as const,
	byProperty: (propertyId: string) => [...coOwnershipKeys.all, propertyId] as const,
};

/**
 * API service functions for co-ownership
 */
const coOwnershipService = {
	async create(propertyId: string, input: CreateCoOwnershipInput): Promise<CoOwnership> {
		const response = await fetch(`/api/properties/${propertyId}/co-ownership`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to create co-ownership');
		}
		return response.json();
	},

	async update(propertyId: string, input: UpdateCoOwnershipInput): Promise<CoOwnership> {
		const response = await fetch(`/api/properties/${propertyId}/co-ownership`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to update co-ownership');
		}
		return response.json();
	},

	async delete(propertyId: string): Promise<void> {
		const response = await fetch(`/api/properties/${propertyId}/co-ownership`, {
			method: 'DELETE',
		});
		if (!response.ok) {
			throw new Error('Failed to delete co-ownership');
		}
	},
};

/**
 * Hook to create co-ownership
 */
export function useCreateCoOwnershipMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ propertyId, input }: { propertyId: string; input: CreateCoOwnershipInput }) =>
			coOwnershipService.create(propertyId, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) });
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
		},
	});
}

/**
 * Hook to update co-ownership
 */
export function useUpdateCoOwnershipMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ propertyId, input }: { propertyId: string; input: UpdateCoOwnershipInput }) =>
			coOwnershipService.update(propertyId, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) });
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
		},
	});
}

/**
 * Hook to delete co-ownership
 */
export function useDeleteCoOwnershipMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (propertyId: string) => coOwnershipService.delete(propertyId),
		onSuccess: (_data, propertyId) => {
			queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) });
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
		},
	});
}
