import * as v from 'valibot';

// Base schemas
export const MoneySchema = v.object({
	amount: v.number(),
	currency: v.optional(v.string(), 'EUR'),
});

export const DateRangeSchema = v.object({
	startDate: v.pipe(v.string(), v.isoDateTime()),
	endDate: v.pipe(v.string(), v.isoDateTime()),
});

// Entity schemas
export const AccountSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	bankId: v.pipe(v.string(), v.uuid()),
	name: v.pipe(v.string(), v.minLength(1)),
	accountNumber: v.optional(v.string()),
	type: v.picklist(['CHECKING', 'SAVINGS', 'INVESTMENT', 'LOAN']),
	balance: v.number(),
	currency: v.optional(v.string(), 'EUR'),
});

export const TransactionSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	accountId: v.pipe(v.string(), v.uuid()),
	type: v.picklist(['INCOME', 'EXPENSE']),
	amount: v.number(),
	currency: v.optional(v.string(), 'EUR'),
	description: v.string(),
	date: v.pipe(v.string(), v.isoDateTime()),
	categoryId: v.optional(v.pipe(v.string(), v.uuid())),
});

export const CategorySchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	name: v.pipe(v.string(), v.minLength(1)),
	parentId: v.nullable(v.pipe(v.string(), v.uuid())),
	icon: v.string(),
	color: v.string(),
});

// Export types
export type Account = v.InferOutput<typeof AccountSchema>;
export type Transaction = v.InferOutput<typeof TransactionSchema>;
export type Category = v.InferOutput<typeof CategorySchema>;
