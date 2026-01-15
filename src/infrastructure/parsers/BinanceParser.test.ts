import { describe, it, expect } from 'vitest';
import { BinanceParser } from './BinanceParser';
import { createBinanceXLSX, createEmptyXLSX } from '../../tests/fixtures/xlsx';

describe('BinanceParser', () => {
	const parser = new BinanceParser();

	describe('parseTransactions', () => {
		it('should parse XLSX fixture correctly', () => {
			const xlsxContent = createBinanceXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			// Should have 3 transactions (1 has Status=Failed and is skipped)
			expect(transactions).toHaveLength(3);

			// First transaction: BTC
			expect(transactions[0]).toMatchObject({
				symbol: 'BTC',
				type: 'buy',
				quantity: 0.00235,
				pricePerUnit: 42553.19,
				totalAmount: 100,
				fee: 1.5,
				currency: 'EUR',
				status: 'successful',
				transactionId: 'TXN123456',
				paymentMethod: 'Card'
			});
			expect(transactions[0].date).toEqual(new Date(2024, 0, 15, 14, 30, 0));

			// Second transaction: ETH
			expect(transactions[1]).toMatchObject({
				symbol: 'ETH',
				type: 'buy',
				quantity: 0.23,
				pricePerUnit: 2173.91,
				totalAmount: 500,
				fee: 3,
				currency: 'EUR'
			});

			// Fourth transaction: SOL
			expect(transactions[2]).toMatchObject({
				symbol: 'SOL',
				type: 'buy',
				quantity: 180,
				pricePerUnit: 1.11,
				totalAmount: 200,
				currency: 'EUR'
			});
		});

		it('should skip failed transactions', () => {
			const xlsxContent = createBinanceXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			// TXN123458 should be skipped (Status=Failed)
			expect(transactions.find((t) => t.transactionId === 'TXN123458')).toBeUndefined();
		});

		it('should extract symbol from Receive Amount', () => {
			const xlsxContent = createBinanceXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			expect(transactions[0].symbol).toBe('BTC');
			expect(transactions[1].symbol).toBe('ETH');
			expect(transactions[2].symbol).toBe('SOL');
		});

		it('should convert symbol to uppercase', () => {
			const xlsxContent = createBinanceXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			expect(transactions.every((t) => t.symbol === t.symbol.toUpperCase())).toBe(true);
		});

		it('should extract currency from Spend Amount', () => {
			const xlsxContent = createBinanceXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			expect(transactions.every((t) => t.currency === 'EUR')).toBe(true);
		});

		it('should return empty array for empty XLSX', () => {
			const xlsxContent = createEmptyXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			expect(transactions).toHaveLength(0);
		});

		it('should set type to buy for all transactions', () => {
			const xlsxContent = createBinanceXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			expect(transactions.every((t) => t.type === 'buy')).toBe(true);
		});

		it('should parse date correctly from ISO format', () => {
			const xlsxContent = createBinanceXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			// First transaction: 2024-01-15 14:30:00
			expect(transactions[0].date).toEqual(new Date(2024, 0, 15, 14, 30, 0));
		});

		it('should include transaction ID', () => {
			const xlsxContent = createBinanceXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			expect(transactions[0].transactionId).toBe('TXN123456');
			expect(transactions[1].transactionId).toBe('TXN123457');
		});

		it('should include payment method', () => {
			const xlsxContent = createBinanceXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			expect(transactions[0].paymentMethod).toBe('Card');
			expect(transactions[1].paymentMethod).toBe('Bank Transfer');
		});

		it('should handle high precision crypto quantities', () => {
			const xlsxContent = createBinanceXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			// BTC quantity has 8 decimal places
			expect(transactions[0].quantity).toBe(0.00235);
			// ETH quantity has 8 decimal places
			expect(transactions[1].quantity).toBe(0.23);
		});
	});

	describe('parsePositions', () => {
		it('should return empty array (Binance export is transactions-only)', () => {
			const xlsxContent = createBinanceXLSX();

			const positions = parser.parsePositions(xlsxContent);

			expect(positions).toHaveLength(0);
		});
	});
});
