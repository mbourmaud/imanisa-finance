import * as v from 'valibot';

export const transactionFormSchema = v.object({
	type: v.picklist(['INCOME', 'EXPENSE'], 'Le type de transaction est requis'),
	amount: v.pipe(
		v.number('Le montant doit être un nombre'),
		v.minValue(0.01, 'Le montant doit être supérieur à 0'),
	),
	description: v.pipe(
		v.string(),
		v.minLength(1, 'La description est requise'),
		v.maxLength(500, 'La description ne peut pas dépasser 500 caractères'),
	),
	date: v.pipe(v.string(), v.minLength(1, 'La date est requise')),
	categoryId: v.string(),
});

export type TransactionFormValues = v.InferOutput<typeof transactionFormSchema>;

export const createTransactionFormSchema = v.object({
	type: v.picklist(['INCOME', 'EXPENSE'], 'Le type de transaction est requis'),
	amount: v.pipe(
		v.number('Le montant doit être un nombre'),
		v.minValue(0.01, 'Le montant doit être supérieur à 0'),
	),
	description: v.pipe(
		v.string(),
		v.minLength(1, 'La description est requise'),
		v.maxLength(500, 'La description ne peut pas dépasser 500 caractères'),
	),
	date: v.pipe(v.string(), v.minLength(1, 'La date est requise')),
	categoryId: v.string(),
	accountId: v.pipe(v.string(), v.minLength(1, 'Le compte est requis')),
});

export type CreateTransactionFormValues = v.InferOutput<typeof createTransactionFormSchema>;
