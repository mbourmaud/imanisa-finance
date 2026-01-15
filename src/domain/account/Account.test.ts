import { describe, it, expect, beforeEach } from 'vitest';
import { Account } from './Account';
import { AccountType } from './AccountType';
import { AssetCategory } from './AssetCategory';
import { Money } from './Money';
import { UniqueId } from '@domain/shared/UniqueId';

describe('Account', () => {
	let bankId: UniqueId;

	beforeEach(() => {
		bankId = UniqueId.fromString('bank-123');
	});

	describe('create', () => {
		it('should create a valid account with minimal props', () => {
			const result = Account.create({
				bankId,
				name: 'Compte courant',
				type: AccountType.CHECKING
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.name).toBe('Compte courant');
			expect(result.value.type).toBe(AccountType.CHECKING);
			expect(result.value.balance.amount).toBe(0);
		});

		it('should create account with initial balance', () => {
			const result = Account.create({
				bankId,
				name: 'Livret A',
				type: AccountType.SAVINGS,
				initialBalance: 5000
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.balance.amount).toBe(5000);
		});

		it('should create account with custom asset category', () => {
			const result = Account.create({
				bankId,
				name: 'PEA',
				type: AccountType.PEA,
				assetCategory: AssetCategory.FINANCIAL
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.assetCategory).toBe(AssetCategory.FINANCIAL);
		});

		it('should trim account name', () => {
			const result = Account.create({
				bankId,
				name: '  Mon compte  ',
				type: AccountType.CHECKING
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.name).toBe('Mon compte');
		});

		it('should use provided id', () => {
			const customId = UniqueId.fromString('custom-account-id');
			const result = Account.create(
				{
					bankId,
					name: 'Test',
					type: AccountType.CHECKING
				},
				customId
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('custom-account-id');
		});

		it('should set createdAt and updatedAt dates', () => {
			const result = Account.create({
				bankId,
				name: 'Test',
				type: AccountType.CHECKING
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.createdAt).toBeInstanceOf(Date);
			expect(result.value.updatedAt).toBeInstanceOf(Date);
		});

		it('should fail with empty name', () => {
			const result = Account.create({
				bankId,
				name: '',
				type: AccountType.CHECKING
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Account name is required');
		});

		it('should fail with whitespace-only name', () => {
			const result = Account.create({
				bankId,
				name: '   ',
				type: AccountType.CHECKING
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Account name is required');
		});

		it('should fail with invalid account type', () => {
			const result = Account.create({
				bankId,
				name: 'Test',
				type: 'INVALID' as AccountType
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid account type');
		});
	});

	describe('getDefaultAssetCategory', () => {
		it('should return LIQUIDITY for CHECKING', () => {
			expect(Account.getDefaultAssetCategory(AccountType.CHECKING)).toBe(AssetCategory.LIQUIDITY);
		});

		it('should return LIQUIDITY for SAVINGS', () => {
			expect(Account.getDefaultAssetCategory(AccountType.SAVINGS)).toBe(AssetCategory.LIQUIDITY);
		});

		it('should return FINANCIAL for PEA', () => {
			expect(Account.getDefaultAssetCategory(AccountType.PEA)).toBe(AssetCategory.FINANCIAL);
		});

		it('should return FINANCIAL for CTO', () => {
			expect(Account.getDefaultAssetCategory(AccountType.CTO)).toBe(AssetCategory.FINANCIAL);
		});

		it('should return FINANCIAL for ASSURANCE_VIE', () => {
			expect(Account.getDefaultAssetCategory(AccountType.ASSURANCE_VIE)).toBe(AssetCategory.FINANCIAL);
		});

		it('should return FINANCIAL for CRYPTO', () => {
			expect(Account.getDefaultAssetCategory(AccountType.CRYPTO)).toBe(AssetCategory.FINANCIAL);
		});

		it('should return REAL_ESTATE for REAL_ESTATE', () => {
			expect(Account.getDefaultAssetCategory(AccountType.REAL_ESTATE)).toBe(AssetCategory.REAL_ESTATE);
		});

		it('should return DEBT for LOAN', () => {
			expect(Account.getDefaultAssetCategory(AccountType.LOAN)).toBe(AssetCategory.DEBT);
		});

		it('should return DEBT for CREDIT', () => {
			expect(Account.getDefaultAssetCategory(AccountType.CREDIT)).toBe(AssetCategory.DEBT);
		});
	});

	describe('isDebt getter', () => {
		it('should return true for debt accounts', () => {
			const result = Account.create({
				bankId,
				name: 'Prêt',
				type: AccountType.LOAN
			});

			expect(result.value.isDebt).toBe(true);
		});

		it('should return false for non-debt accounts', () => {
			const result = Account.create({
				bankId,
				name: 'Compte',
				type: AccountType.CHECKING
			});

			expect(result.value.isDebt).toBe(false);
		});
	});

	describe('updateBalance', () => {
		it('should update balance and updatedAt', () => {
			const account = Account.create({
				bankId,
				name: 'Test',
				type: AccountType.CHECKING,
				initialBalance: 100
			}).value;

			const originalUpdatedAt = account.updatedAt;
			const newBalance = Money.create(500).value;

			// Small delay to ensure time difference
			account.updateBalance(newBalance);

			expect(account.balance.amount).toBe(500);
			expect(account.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
		});
	});

	describe('reconstitute', () => {
		it('should reconstitute account from persistence data', () => {
			const id = UniqueId.fromString('account-123');
			const createdAt = new Date('2024-01-01');
			const updatedAt = new Date('2024-06-01');

			const result = Account.reconstitute(
				{
					bankId,
					name: 'Restored Account',
					type: AccountType.SAVINGS,
					assetCategory: AssetCategory.LIQUIDITY,
					balance: 1500.50,
					currency: 'EUR',
					createdAt,
					updatedAt
				},
				id
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('account-123');
			expect(result.value.name).toBe('Restored Account');
			expect(result.value.type).toBe(AccountType.SAVINGS);
			expect(result.value.balance.amount).toBe(1500.50);
			expect(result.value.createdAt).toBe(createdAt);
			expect(result.value.updatedAt).toBe(updatedAt);
		});

		it('should reconstitute account with different currency', () => {
			const result = Account.reconstitute(
				{
					bankId,
					name: 'USD Account',
					type: AccountType.CHECKING,
					assetCategory: AssetCategory.LIQUIDITY,
					balance: 1000,
					currency: 'USD',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				UniqueId.fromString('usd-account')
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.balance.currency).toBe('USD');
		});
	});

	describe('getters', () => {
		it('should return bankId', () => {
			const account = Account.create({
				bankId,
				name: 'Test',
				type: AccountType.CHECKING
			}).value;

			expect(account.bankId.toString()).toBe('bank-123');
		});

		it('should return all properties', () => {
			const result = Account.create({
				bankId,
				name: 'Full Test',
				type: AccountType.PEA,
				assetCategory: AssetCategory.FINANCIAL,
				initialBalance: 10000
			});

			const account = result.value;
			expect(account.name).toBe('Full Test');
			expect(account.type).toBe(AccountType.PEA);
			expect(account.assetCategory).toBe(AssetCategory.FINANCIAL);
			expect(account.balance.amount).toBe(10000);
		});
	});
});
