/**
 * Shared API types for the frontend
 */

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
	data: T | null;
	status: LoadingState;
	error: string | null;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface ApiError {
	message: string;
	code?: string;
	details?: Record<string, unknown>;
}

export function createAsyncState<T>(initialData: T | null = null): AsyncState<T> {
	return {
		data: initialData,
		status: 'idle',
		error: null,
	};
}
