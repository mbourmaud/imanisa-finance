/**
 * TanStack Query hooks for user profile
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Profile {
	id: string;
	email: string;
	name: string | null;
	createdAt: string;
	updatedAt: string;
}

interface UpdateProfileInput {
	name?: string;
	email?: string;
}

/**
 * Query key factory for profile
 */
export const profileKeys = {
	all: ['profile'] as const,
	detail: () => [...profileKeys.all, 'detail'] as const,
};

/**
 * API service functions
 */
const profileService = {
	async get(): Promise<Profile> {
		const response = await fetch('/api/profile');
		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || 'Failed to fetch profile');
		}
		return response.json();
	},

	async update(input: UpdateProfileInput): Promise<Profile> {
		const response = await fetch('/api/profile', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || 'Failed to update profile');
		}

		return response.json();
	},
};

/**
 * Hook to fetch user profile
 */
export function useProfileQuery(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: profileKeys.detail(),
		queryFn: () => profileService.get(),
		enabled: options?.enabled ?? true,
	});
}

/**
 * Hook to update user profile
 */
export function useUpdateProfileMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateProfileInput) => profileService.update(input),
		onSuccess: (data) => {
			// Update cache with new profile data
			queryClient.setQueryData(profileKeys.detail(), data);
		},
	});
}

export type { Profile, UpdateProfileInput };
