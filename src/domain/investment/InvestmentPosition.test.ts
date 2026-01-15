import { describe, it, expect, beforeEach } from 'vitest';
import { InvestmentPosition } from './InvestmentPosition';
import { UniqueId } from '@domain/shared/UniqueId';

describe('InvestmentPosition', () => {
	let sourceId: UniqueId;

	beforeEach(() => {
		sourceId = UniqueId.fromString('source-123');
	});

	describe('create', () => {
		it('should create a valid investment position', () => {
			const result = InvestmentPosition.create({
				sourceId,
				symbol: 'MSCI WORLD',
				isin: 'LU1681043599',
				quantity: 10.5,
				avgBuyPrice: 450.00,
				currentPrice: 500.00,
				currentValue: 5250.00,
				gainLoss: 525.00,
				gainLossPercent: 11.11
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.symbol).toBe('MSCI WORLD');
			expect(result.value.isin).toBe('LU1681043599');
			expect(result.value.quantity).toBe(10.5);
		});

		it('should create position without ISIN', () => {
			const result = InvestmentPosition.create({
				sourceId,
				symbol: 'BTC',
				quantity: 0.5,
				avgBuyPrice: 30000,
				currentPrice: 35000,
				currentValue: 17500,
				gainLoss: 2500,
				gainLossPercent: 16.67
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.isin).toBeNull();
		});

		it('should trim symbol', () => {
			const result = InvestmentPosition.create({
				sourceId,
				symbol: '  ETH  ',
				quantity: 1,
				avgBuyPrice: 2000,
				currentPrice: 2500,
				currentValue: 2500,
				gainLoss: 500,
				gainLossPercent: 25
			});

			expect(result.value.symbol).toBe('ETH');
		});

		it('should use provided id', () => {
			const customId = UniqueId.fromString('pos-custom');
			const result = InvestmentPosition.create(
				{
					sourceId,
					symbol: 'TEST',
					quantity: 1,
					avgBuyPrice: 100,
					currentPrice: 100,
					currentValue: 100,
					gainLoss: 0,
					gainLossPercent: 0
				},
				customId
			);

			expect(result.value.id.toString()).toBe('pos-custom');
		});

		it('should set lastUpdated and createdAt', () => {
			const result = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 1,
				avgBuyPrice: 100,
				currentPrice: 100,
				currentValue: 100,
				gainLoss: 0,
				gainLossPercent: 0
			});

			expect(result.value.lastUpdated).toBeInstanceOf(Date);
			expect(result.value.createdAt).toBeInstanceOf(Date);
		});

		it('should fail with empty symbol', () => {
			const result = InvestmentPosition.create({
				sourceId,
				symbol: '',
				quantity: 1,
				avgBuyPrice: 100,
				currentPrice: 100,
				currentValue: 100,
				gainLoss: 0,
				gainLossPercent: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Position symbol is required');
		});

		it('should fail with whitespace-only symbol', () => {
			const result = InvestmentPosition.create({
				sourceId,
				symbol: '   ',
				quantity: 1,
				avgBuyPrice: 100,
				currentPrice: 100,
				currentValue: 100,
				gainLoss: 0,
				gainLossPercent: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Position symbol is required');
		});

		it('should fail with negative quantity', () => {
			const result = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: -1,
				avgBuyPrice: 100,
				currentPrice: 100,
				currentValue: 100,
				gainLoss: 0,
				gainLossPercent: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Quantity cannot be negative');
		});

		it('should allow zero quantity', () => {
			const result = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 0,
				avgBuyPrice: 100,
				currentPrice: 100,
				currentValue: 0,
				gainLoss: 0,
				gainLossPercent: 0
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.quantity).toBe(0);
		});

		it('should fail with negative avgBuyPrice', () => {
			const result = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 1,
				avgBuyPrice: -100,
				currentPrice: 100,
				currentValue: 100,
				gainLoss: 0,
				gainLossPercent: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Average buy price cannot be negative');
		});

		it('should fail with negative currentPrice', () => {
			const result = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 1,
				avgBuyPrice: 100,
				currentPrice: -100,
				currentValue: 100,
				gainLoss: 0,
				gainLossPercent: 0
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Current price cannot be negative');
		});
	});

	describe('investedAmount getter', () => {
		it('should calculate invested amount', () => {
			const position = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 10,
				avgBuyPrice: 50,
				currentPrice: 55,
				currentValue: 550,
				gainLoss: 50,
				gainLossPercent: 10
			}).value;

			expect(position.investedAmount).toBe(500);
		});

		it('should return zero for zero quantity', () => {
			const position = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 0,
				avgBuyPrice: 100,
				currentPrice: 100,
				currentValue: 0,
				gainLoss: 0,
				gainLossPercent: 0
			}).value;

			expect(position.investedAmount).toBe(0);
		});
	});

	describe('updatePrice', () => {
		it('should update price and recalculate values', () => {
			const position = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 10,
				avgBuyPrice: 100,
				currentPrice: 100,
				currentValue: 1000,
				gainLoss: 0,
				gainLossPercent: 0
			}).value;

			position.updatePrice(120);

			expect(position.currentPrice).toBe(120);
			expect(position.currentValue).toBe(1200);
			expect(position.gainLoss).toBe(200);
			expect(position.gainLossPercent).toBe(20);
		});

		it('should update lastUpdated', () => {
			const position = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 10,
				avgBuyPrice: 100,
				currentPrice: 100,
				currentValue: 1000,
				gainLoss: 0,
				gainLossPercent: 0
			}).value;

			const originalLastUpdated = position.lastUpdated;
			position.updatePrice(110);

			expect(position.lastUpdated.getTime()).toBeGreaterThanOrEqual(originalLastUpdated.getTime());
		});

		it('should handle zero invested amount', () => {
			const position = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 0,
				avgBuyPrice: 0,
				currentPrice: 100,
				currentValue: 0,
				gainLoss: 0,
				gainLossPercent: 0
			}).value;

			position.updatePrice(200);

			expect(position.gainLossPercent).toBe(0);
		});
	});

	describe('updateFromParsed', () => {
		it('should update all values from parsed data', () => {
			const position = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 10,
				avgBuyPrice: 100,
				currentPrice: 100,
				currentValue: 1000,
				gainLoss: 0,
				gainLossPercent: 0
			}).value;

			position.updateFromParsed({
				quantity: 15,
				avgBuyPrice: 95,
				currentPrice: 110,
				currentValue: 1650,
				gainLoss: 225,
				gainLossPercent: 15.79
			});

			expect(position.quantity).toBe(15);
			expect(position.avgBuyPrice).toBe(95);
			expect(position.currentPrice).toBe(110);
			expect(position.currentValue).toBe(1650);
			expect(position.gainLoss).toBe(225);
			expect(position.gainLossPercent).toBe(15.79);
		});

		it('should update lastUpdated', () => {
			const position = InvestmentPosition.create({
				sourceId,
				symbol: 'TEST',
				quantity: 10,
				avgBuyPrice: 100,
				currentPrice: 100,
				currentValue: 1000,
				gainLoss: 0,
				gainLossPercent: 0
			}).value;

			const originalLastUpdated = position.lastUpdated;
			position.updateFromParsed({
				quantity: 15,
				avgBuyPrice: 95,
				currentPrice: 110,
				currentValue: 1650,
				gainLoss: 225,
				gainLossPercent: 15.79
			});

			expect(position.lastUpdated.getTime()).toBeGreaterThanOrEqual(originalLastUpdated.getTime());
		});
	});

	describe('reconstitute', () => {
		it('should reconstitute position from persistence data', () => {
			const id = UniqueId.fromString('pos-456');
			const lastUpdated = new Date('2024-06-01');
			const createdAt = new Date('2024-01-01');

			const result = InvestmentPosition.reconstitute(
				{
					sourceId,
					symbol: 'RESTORED',
					isin: 'FR0000000001',
					quantity: 5,
					avgBuyPrice: 200,
					currentPrice: 220,
					currentValue: 1100,
					gainLoss: 100,
					gainLossPercent: 10,
					lastUpdated,
					createdAt
				},
				id
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('pos-456');
			expect(result.value.symbol).toBe('RESTORED');
			expect(result.value.lastUpdated).toBe(lastUpdated);
			expect(result.value.createdAt).toBe(createdAt);
		});
	});

	describe('getters', () => {
		it('should return all properties', () => {
			const position = InvestmentPosition.create({
				sourceId,
				symbol: 'FULL',
				isin: 'LU0000000001',
				quantity: 100,
				avgBuyPrice: 50,
				currentPrice: 55,
				currentValue: 5500,
				gainLoss: 500,
				gainLossPercent: 10
			}).value;

			expect(position.sourceId.toString()).toBe('source-123');
			expect(position.symbol).toBe('FULL');
			expect(position.isin).toBe('LU0000000001');
			expect(position.quantity).toBe(100);
			expect(position.avgBuyPrice).toBe(50);
			expect(position.currentPrice).toBe(55);
			expect(position.currentValue).toBe(5500);
			expect(position.gainLoss).toBe(500);
			expect(position.gainLossPercent).toBe(10);
		});
	});
});
