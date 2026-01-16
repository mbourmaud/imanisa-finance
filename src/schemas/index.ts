import { z } from 'zod';

// Base schemas
export const MoneySchema = z.object({
	amount: z.number(),
	currency: z.string().default('EUR'),
});

export const DateRangeSchema = z.object({
	startDate: z.string().datetime(),
	endDate: z.string().datetime(),
});

// Entity schemas
export const AccountSchema = z.object({
	id: z.string().uuid(),
	bankId: z.string().uuid(),
	name: z.string().min(1),
	accountNumber: z.string().optional(),
	type: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'LOAN']),
	balance: z.number(),
	currency: z.string().default('EUR'),
});

export const TransactionSchema = z.object({
	id: z.string().uuid(),
	accountId: z.string().uuid(),
	type: z.enum(['INCOME', 'EXPENSE']),
	amount: z.number(),
	currency: z.string().default('EUR'),
	description: z.string(),
	date: z.string().datetime(),
	categoryId: z.string().uuid().optional(),
});

export const CategorySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	parentId: z.string().uuid().nullable(),
	icon: z.string(),
	color: z.string(),
});

// Export types
export type Account = z.infer<typeof AccountSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Category = z.infer<typeof CategorySchema>;
