/**
 * TanStack Query hooks for properties
 *
 * These hooks provide data fetching, caching, and mutations for properties.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../services/property-service';
import type { CreatePropertyInput, PropertyFilters, UpdatePropertyInput } from '../types';

/**
 * Query key factory for properties
 */
export const propertyKeys = {
	all: ['properties'] as const,
	lists: () => [...propertyKeys.all, 'list'] as const,
	list: (filters?: PropertyFilters) => [...propertyKeys.lists(), { filters }] as const,
	details: () => [...propertyKeys.all, 'detail'] as const,
	detail: (id: string) => [...propertyKeys.details(), id] as const,
};

/**
 * Hook to fetch all properties with optional filters
 */
export function usePropertiesQuery(filters?: PropertyFilters, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: propertyKeys.list(filters),
		queryFn: () => propertyService.getAll(filters),
		enabled: options?.enabled ?? true,
	});
}

/**
 * Hook to fetch a single property by ID
 */
export function usePropertyQuery(id: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: propertyKeys.detail(id),
		queryFn: () => propertyService.getById(id),
		enabled: (options?.enabled ?? true) && !!id,
	});
}

/**
 * Hook to create a property
 */
export function useCreatePropertyMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreatePropertyInput) => propertyService.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
		},
	});
}

/**
 * Hook to update a property
 */
export function useUpdatePropertyMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdatePropertyInput }) =>
			propertyService.update(id, input),
		onSuccess: (data, variables) => {
			queryClient.setQueryData(propertyKeys.detail(variables.id), data);
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
		},
	});
}

/**
 * Hook to delete a property
 */
export function useDeletePropertyMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => propertyService.delete(id),
		onSuccess: (_data, id) => {
			queryClient.removeQueries({ queryKey: propertyKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
		},
	});
}
