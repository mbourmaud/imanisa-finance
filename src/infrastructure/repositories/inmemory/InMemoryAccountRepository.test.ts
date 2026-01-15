import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { Account } from '@domain/account/Account';
import { AccountType } from '@domain/account/AccountType';
import { UniqueId } from '@domain/shared/UniqueId';

describe('InMemoryAccountRepository', () => {
	let repository: InMemoryAccountRepository;
	let bankId: UniqueId;

	beforeEach(() => {
		repository = new InMemoryAccountRepository();
		bankId = UniqueId.create();
	});

	const createTestAccount = (overrides?: { name?: string; bankId?: UniqueId; balance?: number }) => {
		const account = Account.create({
			bankId: overrides?.bankId ?? bankId,
			name: overrides?.name ?? 'Test Account',
			type: AccountType.CHECKING,
			initialBalance: overrides?.balance ?? 1000
		});
		if (account.isFailure) throw new Error(`Invalid account: ${account.error}`);
		return account.value;
	};

	describe('save', () => {
		it('should save a new account', async () => {
			const account = createTestAccount();

			await repository.save(account);

			const found = await repository.findById(account.id);
			expect(found).not.toBeNull();
			expect(found?.name).toBe('Test Account');
		});

		it('should update an existing account', async () => {
			const account = createTestAccount({ balance: 1000 });
			await repository.save(account);

			// Update balance
			const updatedAccount = Account.reconstitute(
				{
					bankId: account.bankId,
					name: 'Updated Account Name',
					type: account.type,
					assetCategory: account.assetCategory,
					balance: 2000,
					currency: 'EUR',
					createdAt: account.createdAt,
					updatedAt: new Date()
				},
				account.id
			).value;

			await repository.save(updatedAccount);

			const found = await repository.findById(account.id);
			expect(found?.name).toBe('Updated Account Name');
			expect(found?.balance.amount).toBe(2000);
		});
	});

	describe('findById', () => {
		it('should return null for non-existent account', async () => {
			const found = await repository.findById(UniqueId.create());
			expect(found).toBeNull();
		});

		it('should find account by ID', async () => {
			const account = createTestAccount();
			await repository.save(account);

			const found = await repository.findById(account.id);
			expect(found).not.toBeNull();
			expect(found?.id.equals(account.id)).toBe(true);
		});
	});

	describe('findByBankId', () => {
		it('should return empty array for non-existent bank', async () => {
			const accounts = await repository.findByBankId(UniqueId.create());
			expect(accounts).toHaveLength(0);
		});

		it('should find all accounts for a bank', async () => {
			await repository.save(createTestAccount({ name: 'Account 1' }));
			await repository.save(createTestAccount({ name: 'Account 2' }));

			const accounts = await repository.findByBankId(bankId);
			expect(accounts).toHaveLength(2);
		});

		it('should only return accounts for specified bank', async () => {
			const otherBankId = UniqueId.create();
			await repository.save(createTestAccount({ name: 'Bank Account', bankId }));
			await repository.save(createTestAccount({ name: 'Other Account', bankId: otherBankId }));

			const accounts = await repository.findByBankId(bankId);
			expect(accounts).toHaveLength(1);
			expect(accounts[0].name).toBe('Bank Account');
		});
	});

	describe('delete', () => {
		it('should delete account', async () => {
			const account = createTestAccount();
			await repository.save(account);

			await repository.delete(account.id);

			const found = await repository.findById(account.id);
			expect(found).toBeNull();
		});

		it('should not throw when deleting non-existent account', async () => {
			await expect(repository.delete(UniqueId.create())).resolves.toBeUndefined();
		});
	});

	describe('deleteByBankId', () => {
		it('should delete all accounts for a bank', async () => {
			await repository.save(createTestAccount({ name: 'Account 1' }));
			await repository.save(createTestAccount({ name: 'Account 2' }));

			await repository.deleteByBankId(bankId);

			const accounts = await repository.findByBankId(bankId);
			expect(accounts).toHaveLength(0);
		});

		it('should not affect accounts from other banks', async () => {
			const otherBankId = UniqueId.create();
			await repository.save(createTestAccount({ name: 'Bank Account', bankId }));
			await repository.save(createTestAccount({ name: 'Other Account', bankId: otherBankId }));

			await repository.deleteByBankId(bankId);

			const otherAccounts = await repository.findByBankId(otherBankId);
			expect(otherAccounts).toHaveLength(1);
		});
	});

	describe('clear', () => {
		it('should remove all accounts', async () => {
			await repository.save(createTestAccount({ name: 'Account 1' }));
			await repository.save(createTestAccount({ name: 'Account 2' }));

			repository.clear();

			expect(repository.getAll()).toHaveLength(0);
		});
	});

	describe('getAll', () => {
		it('should return all accounts', async () => {
			await repository.save(createTestAccount({ name: 'Account 1' }));
			await repository.save(createTestAccount({ name: 'Account 2' }));

			const all = repository.getAll();
			expect(all).toHaveLength(2);
		});

		it('should return empty array when no accounts', () => {
			expect(repository.getAll()).toHaveLength(0);
		});
	});
});
