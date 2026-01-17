'use client';

/**
 * Client-side providers for the application
 *
 * Wraps the application with necessary providers:
 * - QueryClientProvider for TanStack Query
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/query-client';

interface ProvidersProps {
	children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
