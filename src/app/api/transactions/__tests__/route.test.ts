/**
 * Integration tests for GET/POST /api/transactions
 *
 * Tests the API route handlers with mocked repositories.
 */

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the repository
vi.mock('@/server/repositories', () => ({
	transactionRepository: {
		getAll: vi.fn(),
		create: vi.fn(),
		bulkCategorize: vi.fn(),
	},
}))

import { transactionRepository } from '@/server/repositories'
import { GET, POST } from '../route'

// ---- helpers ----

function makeRequest(url: string, init?: globalThis.RequestInit) {
	return new NextRequest(new URL(url, 'http://localhost:3000'), init as ConstructorParameters<typeof NextRequest>[1])
}

const mockTransaction = {
	id: 'tx-1',
	accountId: 'acc-1',
	type: 'EXPENSE' as const,
	amount: 45.5,
	currency: 'EUR',
	description: 'CARREFOUR',
	date: new Date('2026-01-10'),
	bankCategory: 'Alimentation',
	isInternal: false,
	importedAt: new Date('2026-01-17'),
	account: {
		id: 'acc-1',
		name: 'Compte Joint',
		type: 'CHECKING',
		bank: { id: 'bank-ce', name: "Caisse d'Epargne", color: '#e4002b', logo: null },
		accountMembers: [
			{ ownerShare: 50, member: { id: 'm-1', name: 'Mathieu', color: '#10B981', avatarUrl: null } },
			{ ownerShare: 50, member: { id: 'm-2', name: 'Ninon', color: '#F59E0B', avatarUrl: null } },
		],
	},
	transactionCategory: {
		categoryId: 'cat-groceries',
		category: { id: 'cat-groceries', name: 'Courses', icon: '🛒', color: '#FB923C' },
	},
}

const mockPaginatedResult = {
	items: [mockTransaction],
	total: 1,
	page: 1,
	pageSize: 50,
	totalPages: 1,
}

// ---- tests ----

describe('GET /api/transactions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return paginated transactions with default params', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		const response = await GET(makeRequest('http://localhost:3000/api/transactions'))
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data.items).toHaveLength(1)
		expect(data.total).toBe(1)
		expect(data.page).toBe(1)
		expect(data.pageSize).toBe(50)
		expect(transactionRepository.getAll).toHaveBeenCalledWith({}, { page: 1, pageSize: 50 })
	})

	it('should pass page and pageSize params', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue({
			...mockPaginatedResult,
			page: 2,
			pageSize: 10,
		})

		await GET(makeRequest('http://localhost:3000/api/transactions?page=2&pageSize=10'))

		expect(transactionRepository.getAll).toHaveBeenCalledWith({}, { page: 2, pageSize: 10 })
	})

	it('should pass accountId filter', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		await GET(makeRequest('http://localhost:3000/api/transactions?accountId=acc-1'))

		expect(transactionRepository.getAll).toHaveBeenCalledWith(
			expect.objectContaining({ accountId: 'acc-1' }),
			expect.anything(),
		)
	})

	it('should pass memberId filter', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		await GET(makeRequest('http://localhost:3000/api/transactions?memberId=m-1'))

		expect(transactionRepository.getAll).toHaveBeenCalledWith(
			expect.objectContaining({ memberId: 'm-1' }),
			expect.anything(),
		)
	})

	it('should pass type filter', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		await GET(makeRequest('http://localhost:3000/api/transactions?type=INCOME'))

		expect(transactionRepository.getAll).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'INCOME' }),
			expect.anything(),
		)
	})

	it('should pass categoryId filter', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		await GET(makeRequest('http://localhost:3000/api/transactions?categoryId=cat-groceries'))

		expect(transactionRepository.getAll).toHaveBeenCalledWith(
			expect.objectContaining({ categoryId: 'cat-groceries' }),
			expect.anything(),
		)
	})

	it('should pass search filter', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		await GET(makeRequest('http://localhost:3000/api/transactions?search=CARREFOUR'))

		expect(transactionRepository.getAll).toHaveBeenCalledWith(
			expect.objectContaining({ search: 'CARREFOUR' }),
			expect.anything(),
		)
	})

	it('should pass date range filters', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		await GET(
			makeRequest(
				'http://localhost:3000/api/transactions?startDate=2026-01-01&endDate=2026-01-31',
			),
		)

		const callArgs = vi.mocked(transactionRepository.getAll).mock.calls[0][0]
		expect(callArgs?.startDate).toBeInstanceOf(Date)
		expect(callArgs?.endDate).toBeInstanceOf(Date)
	})

	it('should pass amount range filters', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		await GET(
			makeRequest('http://localhost:3000/api/transactions?minAmount=10&maxAmount=100'),
		)

		expect(transactionRepository.getAll).toHaveBeenCalledWith(
			expect.objectContaining({ minAmount: 10, maxAmount: 100 }),
			expect.anything(),
		)
	})

	it('should pass excludeInternal filter', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		await GET(makeRequest('http://localhost:3000/api/transactions?excludeInternal=true'))

		expect(transactionRepository.getAll).toHaveBeenCalledWith(
			expect.objectContaining({ excludeInternal: true }),
			expect.anything(),
		)
	})

	it('should combine multiple filters', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		await GET(
			makeRequest(
				'http://localhost:3000/api/transactions?accountId=acc-1&categoryId=cat-groceries&type=EXPENSE&search=CARREFOUR&page=1&pageSize=10',
			),
		)

		expect(transactionRepository.getAll).toHaveBeenCalledWith(
			{
				accountId: 'acc-1',
				categoryId: 'cat-groceries',
				type: 'EXPENSE',
				search: 'CARREFOUR',
			},
			{ page: 1, pageSize: 10 },
		)
	})

	it('should return 500 on repository error', async () => {
		vi.mocked(transactionRepository.getAll).mockRejectedValue(new Error('DB error'))

		const response = await GET(makeRequest('http://localhost:3000/api/transactions'))
		const data = await response.json()

		expect(response.status).toBe(500)
		expect(data.error).toBe('Failed to fetch transactions')
	})

	it('should ignore unknown query params', async () => {
		vi.mocked(transactionRepository.getAll).mockResolvedValue(mockPaginatedResult)

		await GET(makeRequest('http://localhost:3000/api/transactions?foo=bar&baz=123'))

		expect(transactionRepository.getAll).toHaveBeenCalledWith({}, { page: 1, pageSize: 50 })
	})
})

describe('POST /api/transactions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	const validBody = {
		accountId: 'acc-1',
		type: 'EXPENSE',
		amount: 45.5,
		description: 'CARREFOUR',
		date: '2026-01-10',
	}

	it('should create a transaction with valid data', async () => {
		vi.mocked(transactionRepository.create).mockResolvedValue({
			...mockTransaction,
			transactionCategory: undefined,
			account: undefined,
		} as never)

		const response = await POST(
			makeRequest('http://localhost:3000/api/transactions', {
				method: 'POST',
				body: JSON.stringify(validBody),
			}),
		)

		expect(response.status).toBe(201)
		expect(transactionRepository.create).toHaveBeenCalledWith({
			accountId: 'acc-1',
			type: 'EXPENSE',
			amount: 45.5,
			description: 'CARREFOUR',
			date: expect.any(Date),
		})
	})

	it('should categorize transaction when categoryId is provided', async () => {
		const createdTx = { ...mockTransaction, id: 'tx-new' }
		vi.mocked(transactionRepository.create).mockResolvedValue(createdTx as never)
		vi.mocked(transactionRepository.bulkCategorize).mockResolvedValue(1)

		await POST(
			makeRequest('http://localhost:3000/api/transactions', {
				method: 'POST',
				body: JSON.stringify({ ...validBody, categoryId: 'cat-groceries' }),
			}),
		)

		expect(transactionRepository.bulkCategorize).toHaveBeenCalledWith(
			['tx-new'],
			'cat-groceries',
		)
	})

	it('should not categorize when categoryId is missing', async () => {
		vi.mocked(transactionRepository.create).mockResolvedValue(mockTransaction as never)

		await POST(
			makeRequest('http://localhost:3000/api/transactions', {
				method: 'POST',
				body: JSON.stringify(validBody),
			}),
		)

		expect(transactionRepository.bulkCategorize).not.toHaveBeenCalled()
	})

	it('should return 400 when accountId is missing', async () => {
		const { accountId, ...bodyWithoutAccount } = validBody

		const response = await POST(
			makeRequest('http://localhost:3000/api/transactions', {
				method: 'POST',
				body: JSON.stringify(bodyWithoutAccount),
			}),
		)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data.error).toContain('Missing required fields')
	})

	it('should return 400 when description is missing', async () => {
		const { description, ...bodyWithoutDesc } = validBody

		const response = await POST(
			makeRequest('http://localhost:3000/api/transactions', {
				method: 'POST',
				body: JSON.stringify(bodyWithoutDesc),
			}),
		)

		expect(response.status).toBe(400)
	})

	it('should return 400 when type is missing', async () => {
		const { type, ...bodyWithoutType } = validBody

		const response = await POST(
			makeRequest('http://localhost:3000/api/transactions', {
				method: 'POST',
				body: JSON.stringify(bodyWithoutType),
			}),
		)

		expect(response.status).toBe(400)
	})

	it('should return 400 when date is missing', async () => {
		const { date, ...bodyWithoutDate } = validBody

		const response = await POST(
			makeRequest('http://localhost:3000/api/transactions', {
				method: 'POST',
				body: JSON.stringify(bodyWithoutDate),
			}),
		)

		expect(response.status).toBe(400)
	})

	it('should return 500 on repository error', async () => {
		vi.mocked(transactionRepository.create).mockRejectedValue(new Error('DB error'))

		const response = await POST(
			makeRequest('http://localhost:3000/api/transactions', {
				method: 'POST',
				body: JSON.stringify(validBody),
			}),
		)
		const data = await response.json()

		expect(response.status).toBe(500)
		expect(data.error).toBe('Failed to create transaction')
	})
})
