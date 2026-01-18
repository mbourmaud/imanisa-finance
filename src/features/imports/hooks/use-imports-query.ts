/**
 * TanStack Query hooks for imports
 *
 * These hooks provide data fetching, caching, and mutations for raw imports.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountKeys } from '@/features/accounts/hooks/use-accounts-query';
import { transactionKeys } from '@/features/transactions/hooks/use-transactions-query';

interface RawImport {
	id: string;
	bankKey: string;
	filename: string;
	fileSize: number;
	mimeType: string;
	status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
	errorMessage: string | null;
	recordsCount: number | null;
	skippedCount: number | null;
	processedAt: string | null;
	createdAt: string;
	accountId: string | null;
}

interface ImportFilters {
	accountId?: string;
	status?: RawImport['status'];
}

interface UploadResult {
	id: string;
	filename: string;
	status: RawImport['status'];
}

interface ProcessResult {
	success: boolean;
	recordsCount: number;
	skippedCount: number;
	warnings?: string[];
}

/**
 * Query key factory for imports
 */
export const importKeys = {
	all: ['imports'] as const,
	lists: () => [...importKeys.all, 'list'] as const,
	list: (filters?: ImportFilters) => [...importKeys.lists(), { filters }] as const,
	detail: (id: string) => [...importKeys.all, 'detail', id] as const,
};

/**
 * API service functions
 */
const importService = {
	async getAll(filters?: ImportFilters): Promise<{ items: RawImport[] }> {
		const params = new URLSearchParams();
		if (filters?.accountId) params.set('accountId', filters.accountId);
		if (filters?.status) params.set('status', filters.status);

		const url = params.toString() ? `/api/imports?${params}` : '/api/imports';
		const response = await fetch(url);
		if (!response.ok) throw new Error('Failed to fetch imports');
		return response.json();
	},

	async upload(file: File, bankKey: string, accountId: string): Promise<UploadResult> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('bankKey', bankKey);
		formData.append('accountId', accountId);

		const response = await fetch('/api/imports/upload', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || 'Upload failed');
		}

		return response.json();
	},

	async process(importId: string, accountId: string): Promise<ProcessResult> {
		const response = await fetch(`/api/imports/${importId}/process`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ accountId }),
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || 'Processing failed');
		}

		return response.json();
	},

	async reprocess(importId: string, accountId: string): Promise<ProcessResult> {
		const response = await fetch(`/api/imports/${importId}/reprocess`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ accountId }),
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || 'Reprocessing failed');
		}

		return response.json();
	},

	async delete(importId: string): Promise<void> {
		const response = await fetch(`/api/imports/${importId}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || 'Delete failed');
		}
	},
};

/**
 * Hook to fetch imports for an account
 */
export function useImportsQuery(filters?: ImportFilters, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: importKeys.list(filters),
		queryFn: () => importService.getAll(filters),
		enabled: options?.enabled ?? true,
		select: (data) => data.items,
	});
}

/**
 * Hook to upload and process a file
 */
export function useUploadImportMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			file,
			bankKey,
			accountId,
		}: {
			file: File;
			bankKey: string;
			accountId: string;
		}) => {
			// Upload the file
			const uploadResult = await importService.upload(file, bankKey, accountId);

			// Auto-process it
			const processResult = await importService.process(uploadResult.id, accountId);

			return {
				import: uploadResult,
				process: processResult,
			};
		},
		onSuccess: (_data, variables) => {
			// Invalidate imports list
			queryClient.invalidateQueries({
				queryKey: importKeys.list({ accountId: variables.accountId }),
			});
			// Invalidate account (balance may have changed)
			queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.accountId) });
			// Invalidate transactions
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
		},
	});
}

/**
 * Hook to process a pending import
 */
export function useProcessImportMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ importId, accountId }: { importId: string; accountId: string }) =>
			importService.process(importId, accountId),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: importKeys.list({ accountId: variables.accountId }),
			});
			queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.accountId) });
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
		},
	});
}

/**
 * Hook to reprocess an import
 */
export function useReprocessImportMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ importId, accountId }: { importId: string; accountId: string }) =>
			importService.reprocess(importId, accountId),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: importKeys.list({ accountId: variables.accountId }),
			});
			queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.accountId) });
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
		},
	});
}

/**
 * Hook to delete an import
 */
export function useDeleteImportMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ importId }: { importId: string; accountId?: string }) =>
			importService.delete(importId),
		onSuccess: (_data, variables) => {
			if (variables.accountId) {
				queryClient.invalidateQueries({
					queryKey: importKeys.list({ accountId: variables.accountId }),
				});
			} else {
				queryClient.invalidateQueries({ queryKey: importKeys.lists() });
			}
		},
	});
}

export type { RawImport, ImportFilters, UploadResult, ProcessResult };
