import { describe, it, expect, beforeEach } from 'vitest';
import { Bank } from './Bank';
import { BankTemplate } from './BankTemplate';
import { UniqueId } from '@domain/shared/UniqueId';

describe('Bank', () => {
	let userId: UniqueId;

	beforeEach(() => {
		userId = UniqueId.fromString('user-123');
	});

	describe('create', () => {
		it('should create a valid bank', () => {
			const result = Bank.create({
				userId,
				name: 'Ma Banque',
				template: BankTemplate.CAISSE_EPARGNE
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.name).toBe('Ma Banque');
			expect(result.value.template).toBe(BankTemplate.CAISSE_EPARGNE);
		});

		it('should trim bank name', () => {
			const result = Bank.create({
				userId,
				name: '  Crédit Mutuel  ',
				template: BankTemplate.CREDIT_MUTUEL
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.name).toBe('Crédit Mutuel');
		});

		it('should use provided id', () => {
			const customId = UniqueId.fromString('custom-bank-id');
			const result = Bank.create(
				{
					userId,
					name: 'Test Bank',
					template: BankTemplate.OTHER
				},
				customId
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('custom-bank-id');
		});

		it('should set createdAt date', () => {
			const result = Bank.create({
				userId,
				name: 'Test',
				template: BankTemplate.OTHER
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.createdAt).toBeInstanceOf(Date);
		});

		it('should fail with empty name', () => {
			const result = Bank.create({
				userId,
				name: '',
				template: BankTemplate.CAISSE_EPARGNE
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Bank name is required');
		});

		it('should fail with whitespace-only name', () => {
			const result = Bank.create({
				userId,
				name: '   ',
				template: BankTemplate.CAISSE_EPARGNE
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Bank name is required');
		});

		it('should fail with invalid template', () => {
			const result = Bank.create({
				userId,
				name: 'Test',
				template: 'INVALID_TEMPLATE' as BankTemplate
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid bank template');
		});
	});

	describe('reconstitute', () => {
		it('should reconstitute bank from persistence data', () => {
			const id = UniqueId.fromString('bank-456');
			const createdAt = new Date('2024-01-15');

			const result = Bank.reconstitute(
				{
					userId,
					name: 'Restored Bank',
					template: BankTemplate.REVOLUT,
					createdAt
				},
				id
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('bank-456');
			expect(result.value.name).toBe('Restored Bank');
			expect(result.value.template).toBe(BankTemplate.REVOLUT);
			expect(result.value.createdAt).toBe(createdAt);
		});

		it('should preserve exact dates from persistence', () => {
			const exactDate = new Date('2023-06-15T10:30:00.000Z');
			const result = Bank.reconstitute(
				{
					userId,
					name: 'Test',
					template: BankTemplate.CIC,
					createdAt: exactDate
				},
				UniqueId.fromString('test-id')
			);

			expect(result.value.createdAt.toISOString()).toBe('2023-06-15T10:30:00.000Z');
		});
	});

	describe('getters', () => {
		it('should return userId', () => {
			const bank = Bank.create({
				userId,
				name: 'Test',
				template: BankTemplate.OTHER
			}).value;

			expect(bank.userId.toString()).toBe('user-123');
		});

		it('should return name', () => {
			const bank = Bank.create({
				userId,
				name: 'My Bank Name',
				template: BankTemplate.OTHER
			}).value;

			expect(bank.name).toBe('My Bank Name');
		});

		it('should return template', () => {
			const bank = Bank.create({
				userId,
				name: 'Test',
				template: BankTemplate.LINXEA
			}).value;

			expect(bank.template).toBe(BankTemplate.LINXEA);
		});

		it('should return createdAt', () => {
			const bank = Bank.create({
				userId,
				name: 'Test',
				template: BankTemplate.BINANCE
			}).value;

			expect(bank.createdAt).toBeInstanceOf(Date);
		});
	});

	describe('entity equality', () => {
		it('should be equal if same id', () => {
			const id = UniqueId.fromString('same-id');
			const bank1 = Bank.create(
				{ userId, name: 'Bank 1', template: BankTemplate.OTHER },
				id
			).value;
			const bank2 = Bank.create(
				{ userId, name: 'Bank 2', template: BankTemplate.CIC },
				id
			).value;

			expect(bank1.equals(bank2)).toBe(true);
		});

		it('should not be equal if different ids', () => {
			const bank1 = Bank.create(
				{ userId, name: 'Bank', template: BankTemplate.OTHER },
				UniqueId.fromString('id-1')
			).value;
			const bank2 = Bank.create(
				{ userId, name: 'Bank', template: BankTemplate.OTHER },
				UniqueId.fromString('id-2')
			).value;

			expect(bank1.equals(bank2)).toBe(false);
		});
	});
});
