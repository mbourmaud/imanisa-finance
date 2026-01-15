import { describe, it, expect } from 'vitest';
import { AssetCategory, AssetCategoryLabels, AssetCategoryColors } from './AssetCategory';

describe('AssetCategory', () => {
	describe('enum values', () => {
		it('should have all expected asset categories', () => {
			expect(Object.values(AssetCategory)).toMatchInlineSnapshot(`
				[
				  "LIQUIDITY",
				  "FINANCIAL",
				  "REAL_ESTATE",
				  "DEBT",
				]
			`);
		});

		it('should have 4 asset categories', () => {
			expect(Object.keys(AssetCategory)).toHaveLength(4);
		});
	});

	describe('AssetCategoryLabels', () => {
		it('should have label for each asset category', () => {
			const categories = Object.values(AssetCategory);
			categories.forEach((category) => {
				expect(AssetCategoryLabels[category]).toBeDefined();
				expect(typeof AssetCategoryLabels[category]).toBe('string');
			});
		});

		it('should have French labels', () => {
			expect(AssetCategoryLabels[AssetCategory.LIQUIDITY]).toBe('Liquidités');
			expect(AssetCategoryLabels[AssetCategory.FINANCIAL]).toBe('Placements financiers');
			expect(AssetCategoryLabels[AssetCategory.REAL_ESTATE]).toBe('Immobilier');
			expect(AssetCategoryLabels[AssetCategory.DEBT]).toBe('Dettes');
		});
	});

	describe('AssetCategoryColors', () => {
		it('should have color for each asset category', () => {
			const categories = Object.values(AssetCategory);
			categories.forEach((category) => {
				expect(AssetCategoryColors[category]).toBeDefined();
				expect(AssetCategoryColors[category]).toMatch(/^#[0-9A-Fa-f]{6}$/);
			});
		});

		it('should have correct hex colors', () => {
			expect(AssetCategoryColors).toMatchInlineSnapshot(`
				{
				  "DEBT": "#EF4444",
				  "FINANCIAL": "#10B981",
				  "LIQUIDITY": "#3B82F6",
				  "REAL_ESTATE": "#F59E0B",
				}
			`);
		});
	});
});
