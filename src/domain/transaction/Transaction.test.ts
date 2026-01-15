import { describe, it, expect, beforeEach } from 'vitest';
import { Transaction } from './Transaction';
import { TransactionType } from './TransactionType';
import { TransactionCategory } from './TransactionCategory';
import { UniqueId } from '@domain/shared/UniqueId';

describe('Transaction', () => {
	let accountId: UniqueId;
	let transactionDate: Date;

	beforeEach(() => {
		accountId = UniqueId.fromString('account-123');
		transactionDate = new Date('2024-06-15');
	});

	describe('create', () => {
		it('should create a valid expense transaction', () => {
			const result = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: -50.25,
				description: 'Grocery shopping',
				date: transactionDate
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.description).toBe('Grocery shopping');
			expect(result.value.type).toBe(TransactionType.EXPENSE);
			expect(result.value.amount.amount).toBe(50.25); // Absolute value
		});

		it('should create a valid income transaction', () => {
			const result = Transaction.create({
				accountId,
				type: TransactionType.INCOME,
				amount: 2500,
				description: 'Salary payment',
				date: transactionDate
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.type).toBe(TransactionType.INCOME);
			expect(result.value.amount.amount).toBe(2500);
		});

		it('should convert amount to absolute value', () => {
			const result = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: -100,
				description: 'Test',
				date: transactionDate
			});

			expect(result.value.amount.amount).toBe(100);
		});

		it('should trim description', () => {
			const result = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 50,
				description: '  Payment received  ',
				date: transactionDate
			});

			expect(result.value.description).toBe('Payment received');
		});

		it('should create transaction with category', () => {
			const result = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 30,
				description: 'Restaurant',
				date: transactionDate,
				category: TransactionCategory.RESTAURANTS
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.category).toBe(TransactionCategory.RESTAURANTS);
		});

		it('should create transaction without category', () => {
			const result = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 30,
				description: 'Misc',
				date: transactionDate
			});

			expect(result.value.category).toBeNull();
		});

		it('should use provided id', () => {
			const customId = UniqueId.fromString('tx-custom');
			const result = Transaction.create(
				{
					accountId,
					type: TransactionType.EXPENSE,
					amount: 50,
					description: 'Test',
					date: transactionDate
				},
				customId
			);

			expect(result.value.id.toString()).toBe('tx-custom');
		});

		it('should set importedAt to current date', () => {
			const result = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 50,
				description: 'Test',
				date: transactionDate
			});

			expect(result.value.importedAt).toBeInstanceOf(Date);
		});

		it('should fail with empty description', () => {
			const result = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 50,
				description: '',
				date: transactionDate
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Transaction description is required');
		});

		it('should fail with whitespace-only description', () => {
			const result = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 50,
				description: '   ',
				date: transactionDate
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Transaction description is required');
		});

		it('should fail with invalid transaction type', () => {
			const result = Transaction.create({
				accountId,
				type: 'INVALID' as TransactionType,
				amount: 50,
				description: 'Test',
				date: transactionDate
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid transaction type');
		});
	});

	describe('reconstitute', () => {
		it('should reconstitute transaction from persistence data', () => {
			const id = UniqueId.fromString('tx-456');
			const importedAt = new Date('2024-06-20');

			const result = Transaction.reconstitute(
				{
					accountId,
					type: TransactionType.INCOME,
					amount: 3000,
					currency: 'EUR',
					description: 'Restored transaction',
					date: transactionDate,
					category: TransactionCategory.SALARY,
					importedAt
				},
				id
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('tx-456');
			expect(result.value.amount.amount).toBe(3000);
			expect(result.value.amount.currency).toBe('EUR');
			expect(result.value.category).toBe(TransactionCategory.SALARY);
			expect(result.value.importedAt).toBe(importedAt);
		});

		it('should reconstitute with different currency', () => {
			const result = Transaction.reconstitute(
				{
					accountId,
					type: TransactionType.EXPENSE,
					amount: 100,
					currency: 'USD',
					description: 'USD transaction',
					date: transactionDate,
					category: null,
					importedAt: new Date()
				},
				UniqueId.fromString('usd-tx')
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount.currency).toBe('USD');
		});

		it('should reconstitute with null category', () => {
			const result = Transaction.reconstitute(
				{
					accountId,
					type: TransactionType.EXPENSE,
					amount: 50,
					currency: 'EUR',
					description: 'No category',
					date: transactionDate,
					category: null,
					importedAt: new Date()
				},
				UniqueId.fromString('no-cat')
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.category).toBeNull();
		});
	});

	describe('getters', () => {
		it('should return accountId', () => {
			const tx = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 50,
				description: 'Test',
				date: transactionDate
			}).value;

			expect(tx.accountId.toString()).toBe('account-123');
		});

		it('should return type', () => {
			const tx = Transaction.create({
				accountId,
				type: TransactionType.TRANSFER,
				amount: 100,
				description: 'Transfer',
				date: transactionDate
			}).value;

			expect(tx.type).toBe(TransactionType.TRANSFER);
		});

		it('should return amount as Money', () => {
			const tx = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 75.50,
				description: 'Test',
				date: transactionDate
			}).value;

			expect(tx.amount.amount).toBe(75.50);
			expect(tx.amount.currency).toBe('EUR');
		});

		it('should return description', () => {
			const tx = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 50,
				description: 'My description',
				date: transactionDate
			}).value;

			expect(tx.description).toBe('My description');
		});

		it('should return date', () => {
			const tx = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 50,
				description: 'Test',
				date: transactionDate
			}).value;

			expect(tx.date).toBe(transactionDate);
		});

		it('should return category', () => {
			const tx = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 50,
				description: 'Test',
				date: transactionDate,
				category: TransactionCategory.HEALTH
			}).value;

			expect(tx.category).toBe(TransactionCategory.HEALTH);
		});

		it('should return importedAt', () => {
			const tx = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 50,
				description: 'Test',
				date: transactionDate
			}).value;

			expect(tx.importedAt).toBeInstanceOf(Date);
		});
	});

	describe('entity equality', () => {
		it('should be equal if same id', () => {
			const id = UniqueId.fromString('same-tx-id');
			const tx1 = Transaction.create(
				{
					accountId,
					type: TransactionType.EXPENSE,
					amount: 50,
					description: 'TX 1',
					date: transactionDate
				},
				id
			).value;
			const tx2 = Transaction.create(
				{
					accountId,
					type: TransactionType.INCOME,
					amount: 100,
					description: 'TX 2',
					date: new Date()
				},
				id
			).value;

			expect(tx1.equals(tx2)).toBe(true);
		});

		it('should not be equal if different ids', () => {
			const tx1 = Transaction.create(
				{
					accountId,
					type: TransactionType.EXPENSE,
					amount: 50,
					description: 'Test',
					date: transactionDate
				},
				UniqueId.fromString('id-1')
			).value;
			const tx2 = Transaction.create(
				{
					accountId,
					type: TransactionType.EXPENSE,
					amount: 50,
					description: 'Test',
					date: transactionDate
				},
				UniqueId.fromString('id-2')
			).value;

			expect(tx1.equals(tx2)).toBe(false);
		});
	});
});
