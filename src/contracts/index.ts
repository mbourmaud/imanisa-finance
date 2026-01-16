import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { AccountSchema, CategorySchema, TransactionSchema } from '@/schemas';

const c = initContract();

export const contract = c.router({
	accounts: {
		getAll: {
			method: 'GET',
			path: '/api/accounts',
			responses: { 200: z.array(AccountSchema) },
			summary: 'Get all accounts',
		},
		getById: {
			method: 'GET',
			path: '/api/accounts/:id',
			pathParams: z.object({ id: z.string().uuid() }),
			responses: { 200: AccountSchema, 404: z.object({ error: z.string() }) },
			summary: 'Get account by ID',
		},
	},
	transactions: {
		getAll: {
			method: 'GET',
			path: '/api/transactions',
			query: z.object({
				accountId: z.string().uuid().optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				categoryId: z.string().uuid().optional(),
				page: z.coerce.number().default(1),
				limit: z.coerce.number().default(50),
			}),
			responses: { 200: z.object({ data: z.array(TransactionSchema), total: z.number() }) },
			summary: 'Get transactions with filters',
		},
		updateCategory: {
			method: 'PATCH',
			path: '/api/transactions/:id/category',
			pathParams: z.object({ id: z.string().uuid() }),
			body: z.object({ categoryId: z.string().uuid() }),
			responses: { 200: TransactionSchema, 404: z.object({ error: z.string() }) },
			summary: 'Update transaction category',
		},
	},
	categories: {
		getAll: {
			method: 'GET',
			path: '/api/categories',
			responses: { 200: z.array(CategorySchema) },
			summary: 'Get all categories with hierarchy',
		},
	},
	budget: {
		getSummary: {
			method: 'GET',
			path: '/api/budget/summary',
			query: z.object({
				period: z.enum(['month', 'quarter', 'year']).default('month'),
			}),
			responses: {
				200: z.object({
					totalIncome: z.number(),
					totalExpenses: z.number(),
					net: z.number(),
					byCategory: z.array(
						z.object({
							categoryId: z.string(),
							categoryName: z.string(),
							amount: z.number(),
							percentage: z.number(),
						}),
					),
				}),
			},
			summary: 'Get budget summary',
		},
	},
});

export type AppContract = typeof contract;
