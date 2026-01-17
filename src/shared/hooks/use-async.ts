'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from '../stores/ui-store';

interface UseAsyncOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
	successMessage?: string;
	errorMessage?: string;
}

interface UseAsyncReturn<T extends (...args: Parameters<T>) => Promise<unknown>> {
	execute: (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | undefined>;
	isLoading: boolean;
	error: Error | null;
	reset: () => void;
}

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsync<T extends (...args: Parameters<T>) => Promise<unknown>>(
	asyncFn: T,
	options: UseAsyncOptions = {},
): UseAsyncReturn<T> {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const execute = useCallback(
		async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
			setIsLoading(true);
			setError(null);

			try {
				const result = (await asyncFn(...args)) as Awaited<ReturnType<T>>;

				if (options.successMessage) {
					toast.success(options.successMessage);
				}

				options.onSuccess?.();
				return result;
			} catch (err) {
				const error = err instanceof Error ? err : new Error('An error occurred');
				setError(error);

				if (options.errorMessage) {
					toast.error(options.errorMessage, error.message);
				}

				options.onError?.(error);
				return undefined;
			} finally {
				setIsLoading(false);
			}
		},
		[asyncFn, options],
	);

	const reset = useCallback(() => {
		setError(null);
		setIsLoading(false);
	}, []);

	return { execute, isLoading, error, reset };
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}

/**
 * Hook for optimistic updates
 */
export function useOptimistic<T>(
	initialValue: T,
	reducer: (currentState: T, optimisticValue: T) => T,
): [T, (optimisticValue: T) => void, () => void] {
	const [state, setState] = useState(initialValue);
	const [optimisticState, setOptimisticState] = useState<T | null>(null);

	const addOptimistic = useCallback(
		(optimisticValue: T) => {
			setOptimisticState(reducer(state, optimisticValue));
		},
		[state, reducer],
	);

	const commitOptimistic = useCallback(() => {
		if (optimisticState !== null) {
			setState(optimisticState);
			setOptimisticState(null);
		}
	}, [optimisticState]);

	return [optimisticState ?? state, addOptimistic, commitOptimistic];
}
