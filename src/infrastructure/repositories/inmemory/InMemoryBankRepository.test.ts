import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryBankRepository } from './InMemoryBankRepository';
import { Bank } from '@domain/bank/Bank';
import { BankTemplate } from '@domain/bank/BankTemplate';
import { UniqueId } from '@domain/shared/UniqueId';

describe('InMemoryBankRepository', () => {
	let repository: InMemoryBankRepository;
	let userId: UniqueId;

	beforeEach(() => {
		repository = new InMemoryBankRepository();
		userId = UniqueId.create();
	});

	const createTestBank = (overrides?: { name?: string; userId?: UniqueId }) => {
		const bank = Bank.create({
			userId: overrides?.userId ?? userId,
			name: overrides?.name ?? 'Test Bank',
			template: BankTemplate.CREDIT_MUTUEL
		});
		if (bank.isFailure) throw new Error(`Invalid bank: ${bank.error}`);
		return bank.value;
	};

	describe('save', () => {
		it('should save a new bank', async () => {
			const bank = createTestBank();

			await repository.save(bank);

			const found = await repository.findById(bank.id);
			expect(found).not.toBeNull();
			expect(found?.name).toBe('Test Bank');
		});

		it('should update an existing bank', async () => {
			const bank = createTestBank();
			await repository.save(bank);

			// Simulate update by reconstituting with same ID
			const updatedBank = Bank.reconstitute(
				{
					userId: bank.userId,
					name: 'Updated Bank Name',
					template: bank.template,
					createdAt: bank.createdAt
				},
				bank.id
			).value;

			await repository.save(updatedBank);

			const found = await repository.findById(bank.id);
			expect(found?.name).toBe('Updated Bank Name');
		});
	});

	describe('findById', () => {
		it('should return null for non-existent bank', async () => {
			const found = await repository.findById(UniqueId.create());
			expect(found).toBeNull();
		});

		it('should find bank by ID', async () => {
			const bank = createTestBank();
			await repository.save(bank);

			const found = await repository.findById(bank.id);
			expect(found).not.toBeNull();
			expect(found?.id.equals(bank.id)).toBe(true);
		});
	});

	describe('findByUserId', () => {
		it('should return empty array for non-existent user', async () => {
			const banks = await repository.findByUserId(UniqueId.create());
			expect(banks).toHaveLength(0);
		});

		it('should find all banks for a user', async () => {
			await repository.save(createTestBank({ name: 'Bank 1' }));
			await repository.save(createTestBank({ name: 'Bank 2' }));

			const banks = await repository.findByUserId(userId);
			expect(banks).toHaveLength(2);
		});

		it('should only return banks for specified user', async () => {
			const otherUserId = UniqueId.create();
			await repository.save(createTestBank({ name: 'User Bank', userId }));
			await repository.save(createTestBank({ name: 'Other Bank', userId: otherUserId }));

			const userBanks = await repository.findByUserId(userId);
			expect(userBanks).toHaveLength(1);
			expect(userBanks[0].name).toBe('User Bank');
		});

		it('should sort banks by createdAt descending', async () => {
			// Create banks with slight delay to ensure different timestamps
			const bank1 = Bank.reconstitute(
				{
					userId,
					name: 'Older Bank',
					template: BankTemplate.CREDIT_MUTUEL,
					createdAt: new Date('2024-01-01')
				},
				UniqueId.create()
			).value;

			const bank2 = Bank.reconstitute(
				{
					userId,
					name: 'Newer Bank',
					template: BankTemplate.CIC,
					createdAt: new Date('2024-06-01')
				},
				UniqueId.create()
			).value;

			await repository.save(bank1);
			await repository.save(bank2);

			const banks = await repository.findByUserId(userId);
			expect(banks[0].name).toBe('Newer Bank');
			expect(banks[1].name).toBe('Older Bank');
		});
	});

	describe('delete', () => {
		it('should delete bank', async () => {
			const bank = createTestBank();
			await repository.save(bank);

			await repository.delete(bank.id);

			const found = await repository.findById(bank.id);
			expect(found).toBeNull();
		});

		it('should not throw when deleting non-existent bank', async () => {
			await expect(repository.delete(UniqueId.create())).resolves.toBeUndefined();
		});
	});

	describe('clear', () => {
		it('should remove all banks', async () => {
			await repository.save(createTestBank({ name: 'Bank 1' }));
			await repository.save(createTestBank({ name: 'Bank 2' }));

			repository.clear();

			expect(repository.getAll()).toHaveLength(0);
		});
	});

	describe('getAll', () => {
		it('should return all banks', async () => {
			await repository.save(createTestBank({ name: 'Bank 1' }));
			await repository.save(createTestBank({ name: 'Bank 2' }));

			const all = repository.getAll();
			expect(all).toHaveLength(2);
		});

		it('should return empty array when no banks', () => {
			expect(repository.getAll()).toHaveLength(0);
		});
	});
});
