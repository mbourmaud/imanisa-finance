/**
 * TanStack Query Client Configuration
 *
 * Centralized QueryClient configuration with sensible defaults
 * for the Imanisa Finance application.
 */

import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Data is fresh for 1 minute
				staleTime: 60 * 1000,
				// Keep unused data in cache for 5 minutes
				gcTime: 5 * 60 * 1000,
				// Retry failed requests 1 time
				retry: 1,
				// Don't refetch on window focus by default (can be overridden per query)
				refetchOnWindowFocus: false,
			},
			mutations: {
				// Retry failed mutations 0 times (mutations are usually idempotent)
				retry: 0,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
	if (typeof window === 'undefined') {
		// Server: always create a new query client
		return makeQueryClient();
	}
	// Browser: use singleton pattern
	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}
	return browserQueryClient;
}
