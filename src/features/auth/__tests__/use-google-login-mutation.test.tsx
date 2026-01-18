import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { useGoogleLoginMutation } from '../hooks/use-google-login-mutation'

// Hoisted mocks - these need to be defined before vi.mock calls
const { mockSignInWithOAuth, mockToastError } = vi.hoisted(() => ({
	mockSignInWithOAuth: vi.fn(),
	mockToastError: vi.fn(),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
	createClient: () => ({
		auth: {
			signInWithOAuth: mockSignInWithOAuth,
		},
	}),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
	toast: {
		error: mockToastError,
	},
}))

describe('useGoogleLoginMutation', () => {
	let queryClient: QueryClient

	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				mutations: {
					retry: false,
				},
			},
		})
		vi.clearAllMocks()
	})

	afterEach(() => {
		queryClient.clear()
	})

	it('should return mutation object with mutate function', () => {
		const { result } = renderHook(() => useGoogleLoginMutation(), { wrapper })

		expect(result.current.mutate).toBeDefined()
		expect(result.current.mutateAsync).toBeDefined()
		expect(result.current.isPending).toBe(false)
	})

	it('should call signInWithOAuth with Google provider', async () => {
		mockSignInWithOAuth.mockResolvedValue({ error: null })

		const { result } = renderHook(() => useGoogleLoginMutation(), { wrapper })

		await result.current.mutateAsync()

		expect(mockSignInWithOAuth).toHaveBeenCalledWith({
			provider: 'google',
			options: {
				redirectTo: expect.stringContaining('/auth/callback'),
			},
		})
	})

	it('should show toast error when auth fails', async () => {
		const mockError = { message: 'Auth failed' }
		mockSignInWithOAuth.mockResolvedValue({ error: mockError })

		const { result } = renderHook(() => useGoogleLoginMutation(), { wrapper })

		try {
			await result.current.mutateAsync()
		} catch {
			// Expected to throw
		}

		expect(mockToastError).toHaveBeenCalledWith('Auth failed')
	})
})
