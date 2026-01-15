import { describe, it, expect, beforeEach } from 'vitest';
import { InvestmentTransaction } from './InvestmentTransaction';
import { UniqueId } from '@domain/shared/UniqueId';

describe('InvestmentTransaction', () => {
	let sourceId: UniqueId;
	let transactionDate: Date;

	beforeEach(() => {
		sourceId = UniqueId.fromString('source-123');
		transactionDate = new Date('2024-06-15');
	});

	describe('create', () => {
		it('should create a valid buy transaction', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'buy',
				quantity: 0.5,
				pricePerUnit: 30000,
				totalAmount: 15000,
				fee: 10
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.symbol).toBe('BTC');
			expect(result.value.type).toBe('buy');
			expect(result.value.quantity).toBe(0.5);
		});

		it('should create a valid sell transaction', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'ETH',
				type: 'sell',
				quantity: 2,
				pricePerUnit: 2500,
				totalAmount: 5000,
				fee: 5
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.type).toBe('sell');
		});

		it('should normalize symbol to uppercase', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'btc',
				type: 'buy',
				quantity: 1,
				pricePerUnit: 30000,
				totalAmount: 30000,
				fee: 0
			});

			expect(result.value.symbol).toBe('BTC');
		});

		it('should trim and uppercase symbol', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: '  eth  ',
				type: 'buy',
				quantity: 1,
				pricePerUnit: 2000,
				totalAmount: 2000,
				fee: 0
			});

			expect(result.value.symbol).toBe('ETH');
		});

		it('should use provided id', () => {
			const customId = UniqueId.fromString('tx-custom');
			const result = InvestmentTransaction.create(
				{
					sourceId,
					date: transactionDate,
					symbol: 'BTC',
					type: 'buy',
					quantity: 1,
					pricePerUnit: 30000,
					totalAmount: 30000,
					fee: 0
				},
				customId
			);

			expect(result.value.id.toString()).toBe('tx-custom');
		});

		it('should set createdAt date', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'buy',
				quantity: 1,
				pricePerUnit: 30000,
				totalAmount: 30000,
				fee: 0
			});

			expect(result.value.createdAt).toBeInstanceOf(Date);
		});

		it('should fail with empty symbol', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: '',
				type: 'buy',
				quantity: 1,
				pricePerUnit: 30000,
				totalAmount: 30000,
				fee: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Transaction symbol is required');
		});

		it('should fail with whitespace-only symbol', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: '   ',
				type: 'buy',
				quantity: 1,
				pricePerUnit: 30000,
				totalAmount: 30000,
				fee: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Transaction symbol is required');
		});

		it('should fail with zero quantity', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'buy',
				quantity: 0,
				pricePerUnit: 30000,
				totalAmount: 0,
				fee: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Quantity must be positive');
		});

		it('should fail with negative quantity', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'buy',
				quantity: -1,
				pricePerUnit: 30000,
				totalAmount: 30000,
				fee: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Quantity must be positive');
		});

		it('should fail with negative pricePerUnit', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'buy',
				quantity: 1,
				pricePerUnit: -30000,
				totalAmount: 30000,
				fee: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Price per unit cannot be negative');
		});

		it('should allow zero pricePerUnit', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BONUS',
				type: 'buy',
				quantity: 100,
				pricePerUnit: 0,
				totalAmount: 0,
				fee: 0
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.pricePerUnit).toBe(0);
		});

		it('should fail with negative totalAmount', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'buy',
				quantity: 1,
				pricePerUnit: 30000,
				totalAmount: -30000,
				fee: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Total amount cannot be negative');
		});

		it('should fail with negative fee', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'buy',
				quantity: 1,
				pricePerUnit: 30000,
				totalAmount: 30000,
				fee: -10
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Fee cannot be negative');
		});

		it('should allow zero fee', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'buy',
				quantity: 1,
				pricePerUnit: 30000,
				totalAmount: 30000,
				fee: 0
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.fee).toBe(0);
		});

		it('should fail with invalid type', () => {
			const result = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'invalid' as 'buy' | 'sell',
				quantity: 1,
				pricePerUnit: 30000,
				totalAmount: 30000,
				fee: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Transaction type must be buy or sell');
		});
	});

	describe('netAmount getter', () => {
		it('should calculate net amount for buy (total + fee)', () => {
			const tx = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'buy',
				quantity: 1,
				pricePerUnit: 30000,
				totalAmount: 30000,
				fee: 10
			}).value;

			expect(tx.netAmount).toBe(30010);
		});

		it('should calculate net amount for sell (total - fee)', () => {
			const tx = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'sell',
				quantity: 1,
				pricePerUnit: 35000,
				totalAmount: 35000,
				fee: 10
			}).value;

			expect(tx.netAmount).toBe(34990);
		});

		it('should handle zero fee for buy', () => {
			const tx = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'buy',
				quantity: 1,
				pricePerUnit: 30000,
				totalAmount: 30000,
				fee: 0
			}).value;

			expect(tx.netAmount).toBe(30000);
		});

		it('should handle zero fee for sell', () => {
			const tx = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'BTC',
				type: 'sell',
				quantity: 1,
				pricePerUnit: 35000,
				totalAmount: 35000,
				fee: 0
			}).value;

			expect(tx.netAmount).toBe(35000);
		});
	});

	describe('reconstitute', () => {
		it('should reconstitute transaction from persistence data', () => {
			const id = UniqueId.fromString('tx-456');
			const createdAt = new Date('2024-01-01');

			const result = InvestmentTransaction.reconstitute(
				{
					sourceId,
					date: transactionDate,
					symbol: 'RESTORED',
					type: 'sell',
					quantity: 5,
					pricePerUnit: 200,
					totalAmount: 1000,
					fee: 5,
					createdAt
				},
				id
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('tx-456');
			expect(result.value.symbol).toBe('RESTORED');
			expect(result.value.type).toBe('sell');
			expect(result.value.createdAt).toBe(createdAt);
		});
	});

	describe('getters', () => {
		it('should return all properties', () => {
			const tx = InvestmentTransaction.create({
				sourceId,
				date: transactionDate,
				symbol: 'FULL',
				type: 'buy',
				quantity: 10,
				pricePerUnit: 100,
				totalAmount: 1000,
				fee: 5
			}).value;

			expect(tx.sourceId.toString()).toBe('source-123');
			expect(tx.date).toBe(transactionDate);
			expect(tx.symbol).toBe('FULL');
			expect(tx.type).toBe('buy');
			expect(tx.quantity).toBe(10);
			expect(tx.pricePerUnit).toBe(100);
			expect(tx.totalAmount).toBe(1000);
			expect(tx.fee).toBe(5);
			expect(tx.createdAt).toBeInstanceOf(Date);
		});
	});

	describe('entity equality', () => {
		it('should be equal if same id', () => {
			const id = UniqueId.fromString('same-id');
			const tx1 = InvestmentTransaction.create(
				{
					sourceId,
					date: transactionDate,
					symbol: 'BTC',
					type: 'buy',
					quantity: 1,
					pricePerUnit: 30000,
					totalAmount: 30000,
					fee: 0
				},
				id
			).value;
			const tx2 = InvestmentTransaction.create(
				{
					sourceId,
					date: new Date(),
					symbol: 'ETH',
					type: 'sell',
					quantity: 2,
					pricePerUnit: 2500,
					totalAmount: 5000,
					fee: 10
				},
				id
			).value;

			expect(tx1.equals(tx2)).toBe(true);
		});

		it('should not be equal if different ids', () => {
			const tx1 = InvestmentTransaction.create(
				{
					sourceId,
					date: transactionDate,
					symbol: 'BTC',
					type: 'buy',
					quantity: 1,
					pricePerUnit: 30000,
					totalAmount: 30000,
					fee: 0
				},
				UniqueId.fromString('id-1')
			).value;
			const tx2 = InvestmentTransaction.create(
				{
					sourceId,
					date: transactionDate,
					symbol: 'BTC',
					type: 'buy',
					quantity: 1,
					pricePerUnit: 30000,
					totalAmount: 30000,
					fee: 0
				},
				UniqueId.fromString('id-2')
			).value;

			expect(tx1.equals(tx2)).toBe(false);
		});
	});
});
