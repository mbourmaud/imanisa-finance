/**
 * TanStack Query hooks for members
 *
 * These hooks provide data fetching, caching, and mutations for household members.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Member {
	id: string;
	name: string;
	color: string | null;
	avatarUrl: string | null;
	createdAt: string;
}

export interface CreateMemberInput {
	name: string;
	color?: string;
	avatarUrl?: string;
}

export interface UpdateMemberInput {
	name?: string;
	color?: string;
	avatarUrl?: string;
}

/**
 * Query key factory for members
 */
export const memberKeys = {
	all: ['members'] as const,
	list: () => [...memberKeys.all, 'list'] as const,
	detail: (id: string) => [...memberKeys.all, 'detail', id] as const,
};

/**
 * API service functions
 */
const memberService = {
	async getAll(): Promise<{ members: Member[] }> {
		const response = await fetch('/api/members');
		if (!response.ok) throw new Error('Failed to fetch members');
		return response.json();
	},

	async create(input: CreateMemberInput): Promise<Member> {
		const response = await fetch('/api/members', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});
		if (!response.ok) throw new Error('Failed to create member');
		return response.json();
	},

	async update(id: string, input: UpdateMemberInput): Promise<Member> {
		const response = await fetch(`/api/members/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});
		if (!response.ok) throw new Error('Failed to update member');
		return response.json();
	},

	async delete(id: string): Promise<void> {
		const response = await fetch(`/api/members/${id}`, {
			method: 'DELETE',
		});
		if (!response.ok) throw new Error('Failed to delete member');
	},
};

/**
 * Hook to fetch all members
 */
export function useMembersQuery(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: memberKeys.list(),
		queryFn: () => memberService.getAll(),
		enabled: options?.enabled ?? true,
		select: (data) => data.members,
	});
}

/**
 * Hook to create a member
 */
export function useCreateMemberMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateMemberInput) => memberService.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: memberKeys.list() });
		},
	});
}

/**
 * Hook to update a member
 */
export function useUpdateMemberMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateMemberInput }) =>
			memberService.update(id, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: memberKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: memberKeys.list() });
		},
	});
}

/**
 * Hook to delete a member
 */
export function useDeleteMemberMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => memberService.delete(id),
		onSuccess: (_data, id) => {
			queryClient.removeQueries({ queryKey: memberKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: memberKeys.list() });
		},
	});
}
