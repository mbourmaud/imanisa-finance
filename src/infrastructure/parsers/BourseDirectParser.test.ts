import { describe, it, expect } from 'vitest';
import { BourseDirectParser } from './BourseDirectParser';
import { createBourseDirectXLSX, createEmptyXLSX } from '../../tests/fixtures/xlsx';

describe('BourseDirectParser', () => {
	const parser = new BourseDirectParser();

	describe('parsePositions', () => {
		it('should parse XLSX fixture correctly', () => {
			const xlsxContent = createBourseDirectXLSX();

			const positions = parser.parsePositions(xlsxContent);

			// Should have 2 positions (3rd has quantity 0 and is skipped)
			expect(positions).toHaveLength(2);

			// First position: LVMH
			expect(positions[0]).toMatchObject({
				symbol: 'LVMH',
				isin: 'FR0000121014',
				quantity: 10,
				avgBuyPrice: 750,
				currentPrice: 850.5,
				currentValue: 8505,
				gainLoss: 1005,
				gainLossPercent: 13.4,
				currency: 'EUR',
				mic: 'XPAR',
				rawCategory: 'Euronext Paris'
			});

			// Second position: Total Energies
			expect(positions[1]).toMatchObject({
				symbol: 'Total Energies',
				isin: 'FR0000120271',
				quantity: 50,
				avgBuyPrice: 55,
				currentPrice: 62.3,
				currentValue: 3115,
				gainLoss: 365,
				gainLossPercent: 13.27
			});
		});

		it('should skip positions with zero quantity', () => {
			const xlsxContent = createBourseDirectXLSX();

			const positions = parser.parsePositions(xlsxContent);

			// Air Liquide should be skipped (quantity = 0)
			expect(positions.find((p) => p.symbol === 'Air Liquide')).toBeUndefined();
		});

		it('should return empty array for empty XLSX', () => {
			const xlsxContent = createEmptyXLSX();

			const positions = parser.parsePositions(xlsxContent);

			expect(positions).toHaveLength(0);
		});

		it('should handle French number format in string values', () => {
			// The parser handles both numeric values from xlsx library and string values
			// This test verifies the parseNumber function handles French format correctly
			const xlsxContent = createBourseDirectXLSX();

			const positions = parser.parsePositions(xlsxContent);

			// All numeric values should be parsed correctly
			expect(positions[0].quantity).toBe(10);
			expect(positions[0].currentPrice).toBe(850.5);
		});

		it('should use EUR as default currency when not specified', () => {
			const xlsxContent = createBourseDirectXLSX();

			const positions = parser.parsePositions(xlsxContent);

			expect(positions[0].currency).toBe('EUR');
		});

		it('should store market in rawCategory', () => {
			const xlsxContent = createBourseDirectXLSX();

			const positions = parser.parsePositions(xlsxContent);

			expect(positions[0].rawCategory).toBe('Euronext Paris');
		});

		it('should include MIC code', () => {
			const xlsxContent = createBourseDirectXLSX();

			const positions = parser.parsePositions(xlsxContent);

			expect(positions[0].mic).toBe('XPAR');
		});
	});

	describe('parseTransactions', () => {
		it('should return empty array (Bourse Direct export is positions-only)', () => {
			const xlsxContent = createBourseDirectXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			expect(transactions).toHaveLength(0);
		});
	});
});
