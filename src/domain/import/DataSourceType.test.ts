import { describe, it, expect } from 'vitest';
import { DataSourceType, DataSourceTypeLabels } from './DataSourceType';

describe('DataSourceType', () => {
	describe('enum values', () => {
		it('should have all expected data source types', () => {
			expect(Object.values(DataSourceType)).toMatchInlineSnapshot(`
				[
				  "CHECKING",
				  "SAVINGS",
				  "LIVRET_A",
				  "LDDS",
				  "PEL",
				  "CEL",
				  "LIVRET_JEUNE",
				  "PEA",
				  "CTO",
				  "ASSURANCE_VIE",
				]
			`);
		});

		it('should have 10 data source types', () => {
			expect(Object.keys(DataSourceType)).toHaveLength(10);
		});
	});

	describe('DataSourceTypeLabels', () => {
		it('should have label for each data source type', () => {
			const types = Object.values(DataSourceType);
			types.forEach((type) => {
				expect(DataSourceTypeLabels[type]).toBeDefined();
				expect(typeof DataSourceTypeLabels[type]).toBe('string');
			});
		});

		it('should have French labels', () => {
			expect(DataSourceTypeLabels[DataSourceType.CHECKING]).toBe('Compte courant');
			expect(DataSourceTypeLabels[DataSourceType.SAVINGS]).toBe('Épargne');
			expect(DataSourceTypeLabels[DataSourceType.LIVRET_A]).toBe('Livret A');
			expect(DataSourceTypeLabels[DataSourceType.LDDS]).toBe('LDDS');
		});

		it('should map all labels correctly', () => {
			expect(DataSourceTypeLabels).toMatchInlineSnapshot(`
				{
				  "ASSURANCE_VIE": "Assurance Vie",
				  "CEL": "CEL",
				  "CHECKING": "Compte courant",
				  "CTO": "CTO",
				  "LDDS": "LDDS",
				  "LIVRET_A": "Livret A",
				  "LIVRET_JEUNE": "Livret Jeune",
				  "PEA": "PEA",
				  "PEL": "PEL",
				  "SAVINGS": "Épargne",
				}
			`);
		});
	});
});
