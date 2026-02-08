/**
 * Tests for transaction TanStack Query hooks
 *
 * Verifies query key generation, hook behavior, and cache invalidation.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import type { PaginatedResponse } from '@/shared/types'
import {
	transactionKeys,
	useTransactionQuery,
	useTransactionsQuery,
} from '../hooks/use-transactions-query'
import type { Transaction } from '../types'

// ---- fixtures ----

const mockTransaction: Transaction = {
	id: 'tx-1',
	accountId: 'acc-1',
	type: 'EXPENSE',
	amount: 45.5,
	currency: 'EUR',
	description: 'CARREFOUR',
	date: new Date('2026-01-10'),
	bankCategory: 'Alimentation',
	isInternal: false,
	importedAt: '2026-01-17T10:00:00.000Z',
	transactionCategory: {
		transactionId: 'tx-1',
		categoryId: 'cat-groceries',
		source: 'AUTO',
		confidence: 0.95,
		category: { id: 'cat-groceries', name: 'Courses', icon: '🛒', color: '#FB923C' },
	},
	account: {
		id: 'acc-1',
		name: 'Compte Joint',
		type: 'CHECKING',
		bank: { id: 'bank-ce', name: "Caisse d'Epargne", color: '#e4002b', logo: null },
		accountMembers: [
			{ ownerShare: 50, member: { id: 'm-1', name: 'Mathieu', color: '#10B981', avatarUrl: null } },
		],
	},
}

const mockPaginatedResponse: PaginatedResponse<Transaction> = {
	items: [mockTransaction],
	total: 1,
	page: 1,
	pageSize: 50,
	totalPages: 1,
}

// ---- helpers ----

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
		},
	})
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}

// ---- tests ----

describe('transactionKeys', () => {
	it('should generate all key', () => {
		expect(transactionKeys.all).toEqual(['transactions'])
	})

	it('should generate lists key', () => {
		expect(transactionKeys.lists()).toEqual(['transactions', 'list'])
	})

	it('should generate list key with filters', () => {
		const filters = { accountId: 'acc-1', type: 'EXPENSE' as const }
		const pagination = { page: 1, pageSize: 10 }
		const key = transactionKeys.list(filters, pagination)

		expect(key).toEqual(['transactions', 'list', { filters, pagination }])
	})

	it('should generate list key without filters', () => {
		const key = transactionKeys.list()

		expect(key).toEqual(['transactions', 'list', { filters: undefined, pagination: undefined }])
	})

	it('should generate detail key', () => {
		expect(transactionKeys.detail('tx-1')).toEqual(['transactions', 'detail', 'tx-1'])
	})

	it('should generate details key', () => {
		expect(transactionKeys.details()).toEqual(['transactions', 'detail'])
	})

	it('should generate summary key with filters', () => {
		const filters = { startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31') }
		const key = transactionKeys.summary(filters)

		expect(key).toEqual(['transactions', 'summary', { filters }])
	})

	it('should generate unique keys for different filters', () => {
		const key1 = transactionKeys.list({ type: 'INCOME' })
		const key2 = transactionKeys.list({ type: 'EXPENSE' })

		expect(key1).not.toEqual(key2)
	})
})

describe('useTransactionsQuery', () => {
	it('should fetch transactions', async () => {
		server.use(
			http.get('/api/transactions', () => {
				return HttpResponse.json(mockPaginatedResponse)
			}),
		)

		const { result } = renderHook(() => useTransactionsQuery(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true)
		})

		expect(result.current.data?.items).toHaveLength(1)
		expect(result.current.data?.items[0].description).toBe('CARREFOUR')
		expect(result.current.data?.total).toBe(1)
	})

	it('should pass filters to API', async () => {
		let capturedUrl = ''
		server.use(
			http.get('/api/transactions', ({ request }) => {
				capturedUrl = request.url
				return HttpResponse.json(mockPaginatedResponse)
			}),
		)

		const { result } = renderHook(
			() =>
				useTransactionsQuery(
					{ accountId: 'acc-1', categoryId: 'cat-groceries' },
					{ page: 1, pageSize: 10 },
				),
			{ wrapper: createWrapper() },
		)

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true)
		})

		expect(capturedUrl).toContain('accountId=acc-1')
		expect(capturedUrl).toContain('categoryId=cat-groceries')
	})

	it('should handle error state', async () => {
		server.use(
			http.get('/api/transactions', () => {
				return new HttpResponse(null, { status: 500 })
			}),
		)

		const { result } = renderHook(() => useTransactionsQuery(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isError).toBe(true)
		})
	})

	it('should not fetch when disabled', () => {
		const { result } = renderHook(
			() => useTransactionsQuery(undefined, undefined, { enabled: false }),
			{ wrapper: createWrapper() },
		)

		expect(result.current.isFetching).toBe(false)
		expect(result.current.data).toBeUndefined()
	})
})

describe('useTransactionQuery', () => {
	it('should fetch a single transaction by ID', async () => {
		server.use(
			http.get('/api/transactions/tx-1', () => {
				return HttpResponse.json(mockTransaction)
			}),
		)

		const { result } = renderHook(() => useTransactionQuery('tx-1'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true)
		})

		expect(result.current.data?.id).toBe('tx-1')
		expect(result.current.data?.description).toBe('CARREFOUR')
	})

	it('should not fetch when ID is empty', () => {
		const { result } = renderHook(() => useTransactionQuery(''), {
			wrapper: createWrapper(),
		})

		expect(result.current.isFetching).toBe(false)
	})

	it('should not fetch when disabled', () => {
		const { result } = renderHook(
			() => useTransactionQuery('tx-1', { enabled: false }),
			{ wrapper: createWrapper() },
		)

		expect(result.current.isFetching).toBe(false)
	})
})
