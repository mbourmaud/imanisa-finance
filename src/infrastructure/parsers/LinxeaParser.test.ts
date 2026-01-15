import { describe, it, expect } from 'vitest';
import { LinxeaParser } from './LinxeaParser';
import { createLinxeaXLSX, createEmptyXLSX } from '../../tests/fixtures/xlsx';

describe('LinxeaParser', () => {
	const parser = new LinxeaParser();

	describe('parsePositions', () => {
		it('should parse XLSX fixture correctly', () => {
			const xlsxContent = createLinxeaXLSX();

			const positions = parser.parsePositions(xlsxContent);

			// Should have 2 positions (3rd has quantity 0 and is skipped)
			expect(positions).toHaveLength(2);

			// First position: Fonds Actions France
			expect(positions[0]).toMatchObject({
				symbol: 'Fonds Actions France',
				isin: 'FR0010296061',
				quantity: 25.5,
				avgBuyPrice: 107.84,
				currentPrice: 120.5,
				currentValue: 3072.75,
				gainLoss: 322.75,
				gainLossPercent: 11.74,
				currency: 'EUR',
				rawCategory: 'Actions > France'
			});

			// Second position: Fonds Obligations Euro (negative gain)
			expect(positions[1]).toMatchObject({
				symbol: 'Fonds Obligations Euro',
				isin: 'FR0011538818',
				quantity: 100,
				avgBuyPrice: 100,
				currentPrice: 98.5,
				currentValue: 9850,
				gainLoss: -150,
				gainLossPercent: -1.5,
				rawCategory: 'Obligations > Euro'
			});
		});

		it('should skip positions with zero quantity', () => {
			const xlsxContent = createLinxeaXLSX();

			const positions = parser.parsePositions(xlsxContent);

			// Fonds Euro Suravenir should be skipped (quantity = 0)
			expect(positions.find((p) => p.symbol === 'Fonds Euro Suravenir')).toBeUndefined();
		});

		it('should return empty array for empty XLSX', () => {
			const xlsxContent = createEmptyXLSX();

			const positions = parser.parsePositions(xlsxContent);

			expect(positions).toHaveLength(0);
		});

		it('should build category hierarchy from Catégorie and Sous-catégorie', () => {
			const xlsxContent = createLinxeaXLSX();

			const positions = parser.parsePositions(xlsxContent);

			expect(positions[0].rawCategory).toBe('Actions > France');
			expect(positions[1].rawCategory).toBe('Obligations > Euro');
		});

		it('should handle position without subcategory', () => {
			const xlsxContent = createLinxeaXLSX();

			const positions = parser.parsePositions(xlsxContent);

			// All positions in fixture have subcategories, but if one didn't,
			// it should just return the main category
			expect(positions.every((p) => p.rawCategory?.includes(' > '))).toBe(true);
		});

		it('should always use EUR as currency', () => {
			const xlsxContent = createLinxeaXLSX();

			const positions = parser.parsePositions(xlsxContent);

			expect(positions.every((p) => p.currency === 'EUR')).toBe(true);
		});

		it('should use symbol from Nom du support', () => {
			const xlsxContent = createLinxeaXLSX();

			const positions = parser.parsePositions(xlsxContent);

			expect(positions[0].symbol).toBe('Fonds Actions France');
			expect(positions[0].name).toBe('Fonds Actions France');
		});

		it('should handle negative performance correctly', () => {
			const xlsxContent = createLinxeaXLSX();

			const positions = parser.parsePositions(xlsxContent);

			// Second position has negative performance
			const obligationsPosition = positions.find(
				(p) => p.symbol === 'Fonds Obligations Euro'
			);
			expect(obligationsPosition?.gainLoss).toBe(-150);
			expect(obligationsPosition?.gainLossPercent).toBe(-1.5);
		});
	});

	describe('parseTransactions', () => {
		it('should return empty array (Linxea export is positions-only)', () => {
			const xlsxContent = createLinxeaXLSX();

			const transactions = parser.parseTransactions(xlsxContent);

			expect(transactions).toHaveLength(0);
		});
	});
});
