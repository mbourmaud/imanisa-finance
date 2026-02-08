/**
 * Tests for transaction-service.ts
 *
 * Uses MSW to mock the HTTP layer and verify the service
 * correctly builds query params and handles responses.
 */

import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import type { PaginatedResponse } from '@/shared/types'
import { transactionService } from '../services/transaction-service'
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

// ---- tests ----

describe('transactionService', () => {
	beforeEach(() => {
		server.resetHandlers()
	})

	describe('getAll', () => {
		it('should fetch transactions without filters', async () => {
			server.use(
				http.get('/api/transactions', () => {
					return HttpResponse.json(mockPaginatedResponse)
				}),
			)

			const result = await transactionService.getAll()

			expect(result.items).toHaveLength(1)
			expect(result.total).toBe(1)
			expect(result.items[0].description).toBe('CARREFOUR')
		})

		it('should pass accountId filter as query param', async () => {
			let capturedUrl = ''
			server.use(
				http.get('/api/transactions', ({ request }) => {
					capturedUrl = request.url
					return HttpResponse.json(mockPaginatedResponse)
				}),
			)

			await transactionService.getAll({ accountId: 'acc-1' })

			expect(capturedUrl).toContain('accountId=acc-1')
		})

		it('should pass categoryId filter as query param', async () => {
			let capturedUrl = ''
			server.use(
				http.get('/api/transactions', ({ request }) => {
					capturedUrl = request.url
					return HttpResponse.json(mockPaginatedResponse)
				}),
			)

			await transactionService.getAll({ categoryId: 'cat-groceries' })

			expect(capturedUrl).toContain('categoryId=cat-groceries')
		})

		it('should pass type filter as query param', async () => {
			let capturedUrl = ''
			server.use(
				http.get('/api/transactions', ({ request }) => {
					capturedUrl = request.url
					return HttpResponse.json(mockPaginatedResponse)
				}),
			)

			await transactionService.getAll({ type: 'INCOME' })

			expect(capturedUrl).toContain('type=INCOME')
		})

		it('should pass search filter as query param', async () => {
			let capturedUrl = ''
			server.use(
				http.get('/api/transactions', ({ request }) => {
					capturedUrl = request.url
					return HttpResponse.json(mockPaginatedResponse)
				}),
			)

			await transactionService.getAll({ search: 'CARREFOUR' })

			expect(capturedUrl).toContain('search=CARREFOUR')
		})

		it('should pass memberId filter as query param', async () => {
			let capturedUrl = ''
			server.use(
				http.get('/api/transactions', ({ request }) => {
					capturedUrl = request.url
					return HttpResponse.json(mockPaginatedResponse)
				}),
			)

			await transactionService.getAll({ memberId: 'm-1' })

			expect(capturedUrl).toContain('memberId=m-1')
		})

		it('should pass pagination params', async () => {
			let capturedUrl = ''
			server.use(
				http.get('/api/transactions', ({ request }) => {
					capturedUrl = request.url
					return HttpResponse.json(mockPaginatedResponse)
				}),
			)

			await transactionService.getAll(undefined, { page: 2, pageSize: 10 })

			expect(capturedUrl).toContain('page=2')
			expect(capturedUrl).toContain('pageSize=10')
		})

		it('should combine multiple filters and pagination', async () => {
			let capturedUrl = ''
			server.use(
				http.get('/api/transactions', ({ request }) => {
					capturedUrl = request.url
					return HttpResponse.json(mockPaginatedResponse)
				}),
			)

			await transactionService.getAll(
				{ accountId: 'acc-1', categoryId: 'cat-groceries', type: 'EXPENSE' },
				{ page: 1, pageSize: 10 },
			)

			expect(capturedUrl).toContain('accountId=acc-1')
			expect(capturedUrl).toContain('categoryId=cat-groceries')
			expect(capturedUrl).toContain('type=EXPENSE')
			expect(capturedUrl).toContain('page=1')
			expect(capturedUrl).toContain('pageSize=10')
		})

		it('should pass excludeInternal filter', async () => {
			let capturedUrl = ''
			server.use(
				http.get('/api/transactions', ({ request }) => {
					capturedUrl = request.url
					return HttpResponse.json(mockPaginatedResponse)
				}),
			)

			await transactionService.getAll({ excludeInternal: true })

			expect(capturedUrl).toContain('excludeInternal=true')
		})

		it('should throw on HTTP error', async () => {
			server.use(
				http.get('/api/transactions', () => {
					return new HttpResponse(null, { status: 500 })
				}),
			)

			await expect(transactionService.getAll()).rejects.toThrow(
				'Failed to fetch transactions',
			)
		})
	})

	describe('getById', () => {
		it('should fetch a single transaction', async () => {
			server.use(
				http.get('/api/transactions/tx-1', () => {
					return HttpResponse.json(mockTransaction)
				}),
			)

			const result = await transactionService.getById('tx-1')

			expect(result.id).toBe('tx-1')
			expect(result.description).toBe('CARREFOUR')
		})

		it('should throw on 404', async () => {
			server.use(
				http.get('/api/transactions/tx-unknown', () => {
					return new HttpResponse(null, { status: 404 })
				}),
			)

			await expect(transactionService.getById('tx-unknown')).rejects.toThrow()
		})
	})

	describe('create', () => {
		it('should create a transaction', async () => {
			let capturedBody: Record<string, unknown> = {}
			server.use(
				http.post('/api/transactions', async ({ request }) => {
					capturedBody = (await request.json()) as Record<string, unknown>
					return HttpResponse.json(mockTransaction, { status: 201 })
				}),
			)

			const result = await transactionService.create({
				accountId: 'acc-1',
				type: 'EXPENSE',
				amount: 45.5,
				description: 'CARREFOUR',
				date: new Date('2026-01-10'),
			})

			expect(result.id).toBe('tx-1')
			expect(capturedBody.accountId).toBe('acc-1')
			expect(capturedBody.type).toBe('EXPENSE')
			expect(capturedBody.amount).toBe(45.5)
			expect(capturedBody.description).toBe('CARREFOUR')
		})

		it('should throw on validation error', async () => {
			server.use(
				http.post('/api/transactions', () => {
					return HttpResponse.json(
						{ error: 'Missing required fields' },
						{ status: 400 },
					)
				}),
			)

			await expect(
				transactionService.create({
					accountId: '',
					type: 'EXPENSE',
					amount: 0,
					description: '',
					date: new Date(),
				}),
			).rejects.toThrow('Failed to create transaction')
		})
	})

	describe('update', () => {
		it('should update a transaction', async () => {
			server.use(
				http.patch('/api/transactions/tx-1', () => {
					return HttpResponse.json({ ...mockTransaction, description: 'UPDATED' })
				}),
			)

			const result = await transactionService.update('tx-1', { description: 'UPDATED' })

			expect(result.description).toBe('UPDATED')
		})

		it('should throw on error', async () => {
			server.use(
				http.patch('/api/transactions/tx-1', () => {
					return new HttpResponse(null, { status: 500 })
				}),
			)

			await expect(
				transactionService.update('tx-1', { description: 'FAIL' }),
			).rejects.toThrow()
		})
	})

	describe('delete', () => {
		it('should delete a transaction', async () => {
			server.use(
				http.delete('/api/transactions/tx-1', () => {
					return new HttpResponse(null, { status: 204 })
				}),
			)

			await expect(transactionService.delete('tx-1')).resolves.toBeUndefined()
		})

		it('should throw on error', async () => {
			server.use(
				http.delete('/api/transactions/tx-1', () => {
					return new HttpResponse(null, { status: 500 })
				}),
			)

			await expect(transactionService.delete('tx-1')).rejects.toThrow()
		})
	})

	describe('bulkCategorize', () => {
		it('should send transaction IDs and category ID', async () => {
			let capturedBody: Record<string, unknown> = {}
			server.use(
				http.post('/api/transactions/bulk-categorize', async ({ request }) => {
					capturedBody = (await request.json()) as Record<string, unknown>
					return HttpResponse.json({ success: true })
				}),
			)

			await transactionService.bulkCategorize(['tx-1', 'tx-2'], 'cat-groceries')

			expect(capturedBody.transactionIds).toEqual(['tx-1', 'tx-2'])
			expect(capturedBody.categoryId).toBe('cat-groceries')
		})

		it('should throw on error', async () => {
			server.use(
				http.post('/api/transactions/bulk-categorize', () => {
					return new HttpResponse(null, { status: 500 })
				}),
			)

			await expect(
				transactionService.bulkCategorize(['tx-1'], 'cat-groceries'),
			).rejects.toThrow()
		})
	})

	describe('getSummary', () => {
		it('should fetch summary without date filters', async () => {
			const mockSummary = {
				totalIncome: 5000,
				totalExpenses: 3000,
				netFlow: 2000,
				transactionCount: 50,
				byCategory: [],
			}
			server.use(
				http.get('/api/transactions/summary', () => {
					return HttpResponse.json(mockSummary)
				}),
			)

			const result = await transactionService.getSummary()

			expect(result.totalIncome).toBe(5000)
			expect(result.netFlow).toBe(2000)
		})

		it('should pass date filters as query params', async () => {
			let capturedUrl = ''
			server.use(
				http.get('/api/transactions/summary', ({ request }) => {
					capturedUrl = request.url
					return HttpResponse.json({
						totalIncome: 0,
						totalExpenses: 0,
						netFlow: 0,
						transactionCount: 0,
						byCategory: [],
					})
				}),
			)

			await transactionService.getSummary({
				startDate: new Date('2026-01-01'),
				endDate: new Date('2026-01-31'),
			})

			expect(capturedUrl).toContain('startDate=')
			expect(capturedUrl).toContain('endDate=')
		})
	})
})
