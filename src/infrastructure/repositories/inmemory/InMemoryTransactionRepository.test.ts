import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTransactionRepository } from './InMemoryTransactionRepository';
import { Transaction, TransactionType } from '@domain/transaction';
import { UniqueId } from '@domain/shared/UniqueId';

describe('InMemoryTransactionRepository', () => {
	let repository: InMemoryTransactionRepository;
	let accountId: UniqueId;

	beforeEach(() => {
		repository = new InMemoryTransactionRepository();
		accountId = UniqueId.create();
	});

	const createTestTransaction = (overrides?: {
		description?: string;
		accountId?: UniqueId;
		amount?: number;
		date?: Date;
	}) => {
		const transaction = Transaction.create({
			accountId: overrides?.accountId ?? accountId,
			type: TransactionType.EXPENSE,
			amount: overrides?.amount ?? 100,
			description: overrides?.description ?? 'Test Transaction',
			date: overrides?.date ?? new Date()
		});
		if (transaction.isFailure) throw new Error(`Invalid transaction: ${transaction.error}`);
		return transaction.value;
	};

	describe('save', () => {
		it('should save a new transaction', async () => {
			const transaction = createTestTransaction();

			await repository.save(transaction);

			const found = await repository.findById(transaction.id);
			expect(found).not.toBeNull();
			expect(found?.description).toBe('Test Transaction');
		});

		it('should update an existing transaction', async () => {
			const transaction = createTestTransaction();
			await repository.save(transaction);

			const updatedTransaction = Transaction.reconstitute(
				{
					accountId: transaction.accountId,
					type: transaction.type,
					amount: 200,
					currency: 'EUR',
					description: 'Updated Description',
					date: transaction.date,
					category: null,
					importedAt: transaction.importedAt
				},
				transaction.id
			).value;

			await repository.save(updatedTransaction);

			const found = await repository.findById(transaction.id);
			expect(found?.description).toBe('Updated Description');
			expect(found?.amount.amount).toBe(200);
		});
	});

	describe('saveMany', () => {
		it('should save multiple transactions', async () => {
			const transactions = [
				createTestTransaction({ description: 'Transaction 1' }),
				createTestTransaction({ description: 'Transaction 2' }),
				createTestTransaction({ description: 'Transaction 3' })
			];

			await repository.saveMany(transactions);

			const all = repository.getAll();
			expect(all).toHaveLength(3);
		});
	});

	describe('findById', () => {
		it('should return null for non-existent transaction', async () => {
			const found = await repository.findById(UniqueId.create());
			expect(found).toBeNull();
		});

		it('should find transaction by ID', async () => {
			const transaction = createTestTransaction();
			await repository.save(transaction);

			const found = await repository.findById(transaction.id);
			expect(found).not.toBeNull();
			expect(found?.id.equals(transaction.id)).toBe(true);
		});
	});

	describe('findByAccountId', () => {
		it('should return empty array for non-existent account', async () => {
			const transactions = await repository.findByAccountId(UniqueId.create());
			expect(transactions).toHaveLength(0);
		});

		it('should find all transactions for an account', async () => {
			await repository.save(createTestTransaction({ description: 'Tx 1' }));
			await repository.save(createTestTransaction({ description: 'Tx 2' }));

			const transactions = await repository.findByAccountId(accountId);
			expect(transactions).toHaveLength(2);
		});

		it('should only return transactions for specified account', async () => {
			const otherAccountId = UniqueId.create();
			await repository.save(createTestTransaction({ description: 'Account Tx', accountId }));
			await repository.save(
				createTestTransaction({ description: 'Other Tx', accountId: otherAccountId })
			);

			const transactions = await repository.findByAccountId(accountId);
			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Account Tx');
		});
	});

	describe('findByAccountIdAndDateRange', () => {
		it('should filter by date range', async () => {
			await repository.save(
				createTestTransaction({ description: 'Old Tx', date: new Date('2024-01-01') })
			);
			await repository.save(
				createTestTransaction({ description: 'In Range Tx', date: new Date('2024-06-15') })
			);
			await repository.save(
				createTestTransaction({ description: 'Future Tx', date: new Date('2024-12-31') })
			);

			const transactions = await repository.findByAccountIdAndDateRange(
				accountId,
				new Date('2024-06-01'),
				new Date('2024-06-30')
			);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('In Range Tx');
		});

		it('should include transactions on boundary dates', async () => {
			const startDate = new Date('2024-06-01');
			const endDate = new Date('2024-06-30');

			await repository.save(createTestTransaction({ description: 'Start Tx', date: startDate }));
			await repository.save(createTestTransaction({ description: 'End Tx', date: endDate }));

			const transactions = await repository.findByAccountIdAndDateRange(
				accountId,
				startDate,
				endDate
			);

			expect(transactions).toHaveLength(2);
		});

		it('should sort by date descending', async () => {
			await repository.save(
				createTestTransaction({ description: 'Early', date: new Date('2024-06-01') })
			);
			await repository.save(
				createTestTransaction({ description: 'Late', date: new Date('2024-06-15') })
			);

			const transactions = await repository.findByAccountIdAndDateRange(
				accountId,
				new Date('2024-06-01'),
				new Date('2024-06-30')
			);

			expect(transactions[0].description).toBe('Late');
			expect(transactions[1].description).toBe('Early');
		});
	});

	describe('delete', () => {
		it('should delete transaction', async () => {
			const transaction = createTestTransaction();
			await repository.save(transaction);

			await repository.delete(transaction.id);

			const found = await repository.findById(transaction.id);
			expect(found).toBeNull();
		});

		it('should not throw when deleting non-existent transaction', async () => {
			await expect(repository.delete(UniqueId.create())).resolves.toBeUndefined();
		});
	});

	describe('deleteByAccountId', () => {
		it('should delete all transactions for an account', async () => {
			await repository.save(createTestTransaction({ description: 'Tx 1' }));
			await repository.save(createTestTransaction({ description: 'Tx 2' }));

			await repository.deleteByAccountId(accountId);

			const transactions = await repository.findByAccountId(accountId);
			expect(transactions).toHaveLength(0);
		});

		it('should not affect transactions from other accounts', async () => {
			const otherAccountId = UniqueId.create();
			await repository.save(createTestTransaction({ description: 'Account Tx', accountId }));
			await repository.save(
				createTestTransaction({ description: 'Other Tx', accountId: otherAccountId })
			);

			await repository.deleteByAccountId(accountId);

			const otherTransactions = await repository.findByAccountId(otherAccountId);
			expect(otherTransactions).toHaveLength(1);
		});
	});

	describe('clear', () => {
		it('should remove all transactions', async () => {
			await repository.save(createTestTransaction({ description: 'Tx 1' }));
			await repository.save(createTestTransaction({ description: 'Tx 2' }));

			repository.clear();

			expect(repository.getAll()).toHaveLength(0);
		});
	});

	describe('getAll', () => {
		it('should return all transactions', async () => {
			await repository.save(createTestTransaction({ description: 'Tx 1' }));
			await repository.save(createTestTransaction({ description: 'Tx 2' }));

			const all = repository.getAll();
			expect(all).toHaveLength(2);
		});

		it('should return empty array when no transactions', () => {
			expect(repository.getAll()).toHaveLength(0);
		});
	});
});
