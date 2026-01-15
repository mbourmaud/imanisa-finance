import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CalculateCryptoPositionsUseCase } from './CalculateCryptoPositionsUseCase';
import { InvestmentTransaction } from '@domain/investment';
import { UniqueId } from '@domain/shared/UniqueId';

// Helper to create test investment transaction
const createTestTransaction = (overrides: {
	symbol: string;
	type: 'buy' | 'sell';
	quantity: number;
	pricePerUnit: number;
	totalAmount: number;
	fee?: number;
	date?: Date;
	sourceId?: UniqueId;
}) => {
	const tx = InvestmentTransaction.create({
		sourceId: overrides.sourceId ?? UniqueId.create(),
		date: overrides.date ?? new Date('2024-01-15'),
		symbol: overrides.symbol,
		type: overrides.type,
		quantity: overrides.quantity,
		pricePerUnit: overrides.pricePerUnit,
		totalAmount: overrides.totalAmount,
		fee: overrides.fee ?? 0
	});
	if (tx.isFailure) throw new Error(tx.error);
	return tx.value;
};

describe('CalculateCryptoPositionsUseCase', () => {
	let useCase: CalculateCryptoPositionsUseCase;
	let originalFetch: typeof global.fetch;

	beforeEach(() => {
		useCase = new CalculateCryptoPositionsUseCase();
		originalFetch = global.fetch;
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	describe('calculatePositions', () => {
		it('should return empty positions for empty transaction list', async () => {
			global.fetch = vi.fn();

			const result = await useCase.calculatePositions([]);

			expect(result).toMatchInlineSnapshot(`
				{
				  "errors": [],
				  "positions": [],
				}
			`);
		});

		it('should aggregate buy transactions by symbol', async () => {
			// Mock CoinGecko API response
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						bitcoin: { eur: 45000 }
					})
			});

			const sourceId = UniqueId.create();
			const transactions = [
				createTestTransaction({
					sourceId,
					symbol: 'BTC',
					type: 'buy',
					quantity: 0.1,
					pricePerUnit: 40000,
					totalAmount: 4000,
					date: new Date('2024-01-01')
				}),
				createTestTransaction({
					sourceId,
					symbol: 'BTC',
					type: 'buy',
					quantity: 0.05,
					pricePerUnit: 42000,
					totalAmount: 2100,
					date: new Date('2024-01-15')
				})
			];

			const result = await useCase.calculatePositions(transactions);

			expect(result.positions).toHaveLength(1);
			expect(result.positions[0].symbol).toBe('BTC');
			expect(result.positions[0].quantity).toBe(0.15);
			// PRU = (4000 + 2100) / 0.15 = 40666.67
			expect(result.positions[0].avgBuyPrice).toBeCloseTo(40666.67, 0);
			expect(result.positions[0].currentPrice).toBe(45000);
			expect(result.positions[0].currentValue).toBe(6750); // 0.15 * 45000
		});

		it('should calculate PRU (weighted average buy price)', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						ethereum: { eur: 3000 }
					})
			});

			const sourceId = UniqueId.create();
			const transactions = [
				createTestTransaction({
					sourceId,
					symbol: 'ETH',
					type: 'buy',
					quantity: 1,
					pricePerUnit: 2000,
					totalAmount: 2000
				}),
				createTestTransaction({
					sourceId,
					symbol: 'ETH',
					type: 'buy',
					quantity: 1,
					pricePerUnit: 2500,
					totalAmount: 2500
				})
			];

			const result = await useCase.calculatePositions(transactions);

			// PRU = (2000 + 2500) / 2 = 2250
			expect(result.positions[0].avgBuyPrice).toBe(2250);
		});

		it('should calculate gain/loss correctly', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						bitcoin: { eur: 50000 }
					})
			});

			const sourceId = UniqueId.create();
			const transactions = [
				createTestTransaction({
					sourceId,
					symbol: 'BTC',
					type: 'buy',
					quantity: 0.1,
					pricePerUnit: 40000,
					totalAmount: 4000
				})
			];

			const result = await useCase.calculatePositions(transactions);

			// Current value = 0.1 * 50000 = 5000
			// Invested = 0.1 * 40000 = 4000
			// Gain/Loss = 5000 - 4000 = 1000
			// Gain/Loss % = 1000 / 4000 * 100 = 25%
			expect(result.positions[0].currentValue).toBe(5000);
			expect(result.positions[0].gainLoss).toBe(1000);
			expect(result.positions[0].gainLossPercent).toBe(25);
		});

		it('should handle sell transactions by reducing quantity', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						bitcoin: { eur: 45000 }
					})
			});

			const sourceId = UniqueId.create();
			const transactions = [
				createTestTransaction({
					sourceId,
					symbol: 'BTC',
					type: 'buy',
					quantity: 0.1,
					pricePerUnit: 40000,
					totalAmount: 4000,
					date: new Date('2024-01-01')
				}),
				createTestTransaction({
					sourceId,
					symbol: 'BTC',
					type: 'sell',
					quantity: 0.05,
					pricePerUnit: 42000,
					totalAmount: 2100,
					date: new Date('2024-01-15')
				})
			];

			const result = await useCase.calculatePositions(transactions);

			// After selling 0.05, remaining quantity = 0.05
			expect(result.positions[0].quantity).toBe(0.05);
			// Current value = 0.05 * 45000 = 2250
			expect(result.positions[0].currentValue).toBe(2250);
		});

		it('should filter out positions with zero quantity', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({})
			});

			const sourceId = UniqueId.create();
			const transactions = [
				createTestTransaction({
					sourceId,
					symbol: 'BTC',
					type: 'buy',
					quantity: 0.1,
					pricePerUnit: 40000,
					totalAmount: 4000,
					date: new Date('2024-01-01')
				}),
				createTestTransaction({
					sourceId,
					symbol: 'BTC',
					type: 'sell',
					quantity: 0.1,
					pricePerUnit: 42000,
					totalAmount: 4200,
					date: new Date('2024-01-15')
				})
			];

			const result = await useCase.calculatePositions(transactions);

			// Position should be filtered out (zero quantity)
			expect(result.positions).toHaveLength(0);
		});

		it('should handle multiple crypto symbols', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						bitcoin: { eur: 45000 },
						ethereum: { eur: 3000 }
					})
			});

			const sourceId = UniqueId.create();
			const transactions = [
				createTestTransaction({
					sourceId,
					symbol: 'BTC',
					type: 'buy',
					quantity: 0.1,
					pricePerUnit: 40000,
					totalAmount: 4000
				}),
				createTestTransaction({
					sourceId,
					symbol: 'ETH',
					type: 'buy',
					quantity: 2,
					pricePerUnit: 2500,
					totalAmount: 5000
				})
			];

			const result = await useCase.calculatePositions(transactions);

			expect(result.positions).toHaveLength(2);
			const btcPosition = result.positions.find((p) => p.symbol === 'BTC');
			const ethPosition = result.positions.find((p) => p.symbol === 'ETH');

			expect(btcPosition?.currentPrice).toBe(45000);
			expect(ethPosition?.currentPrice).toBe(3000);
		});

		it('should handle API errors gracefully', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error'
			});

			const transactions = [
				createTestTransaction({
					symbol: 'BTC',
					type: 'buy',
					quantity: 0.1,
					pricePerUnit: 40000,
					totalAmount: 4000
				})
			];

			const result = await useCase.calculatePositions(transactions);

			// Should still return position with 0 price
			expect(result.positions).toHaveLength(1);
			expect(result.positions[0].currentPrice).toBe(0);
			expect(result.errors.some((e) => e.includes('Failed to fetch'))).toBe(true);
		});

		it('should warn when price not found for symbol', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({}) // No prices returned
			});

			const transactions = [
				createTestTransaction({
					symbol: 'BTC',
					type: 'buy',
					quantity: 0.1,
					pricePerUnit: 40000,
					totalAmount: 4000
				})
			];

			const result = await useCase.calculatePositions(transactions);

			expect(result.positions[0].currentPrice).toBe(0);
			expect(result.errors.some((e) => e.includes('No price found for BTC'))).toBe(true);
		});
	});

	describe('execute', () => {
		it('should return InvestmentPosition domain entities', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						bitcoin: { eur: 45000 }
					})
			});

			const sourceId = UniqueId.create();
			const transactions = [
				createTestTransaction({
					sourceId,
					symbol: 'BTC',
					type: 'buy',
					quantity: 0.1,
					pricePerUnit: 40000,
					totalAmount: 4000
				})
			];

			const positions = await useCase.execute(transactions, sourceId);

			expect(positions).toHaveLength(1);
			expect(positions[0]).toBeInstanceOf(Object); // InvestmentPosition domain entity
			expect(positions[0].sourceId.equals(sourceId)).toBe(true);
			expect(positions[0].symbol).toBe('BTC');
		});
	});

	describe('fetchCurrentPrices', () => {
		it('should map symbols to CoinGecko IDs correctly', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						bitcoin: { eur: 45000 },
						ethereum: { eur: 3000 },
						solana: { eur: 100 }
					})
			});

			const prices = await useCase.fetchCurrentPrices(['BTC', 'ETH', 'SOL']);

			expect(prices.get('BTC')).toBe(45000);
			expect(prices.get('ETH')).toBe(3000);
			expect(prices.get('SOL')).toBe(100);
		});

		it('should handle unknown symbols gracefully', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({})
			});

			const prices = await useCase.fetchCurrentPrices(['UNKNOWN_SYMBOL']);

			expect(prices.size).toBe(0);
		});

		it('should return empty map for empty symbol list', async () => {
			global.fetch = vi.fn();

			const prices = await useCase.fetchCurrentPrices([]);

			expect(prices.size).toBe(0);
			expect(global.fetch).not.toHaveBeenCalled();
		});
	});
});
