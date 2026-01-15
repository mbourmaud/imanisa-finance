import { describe, it, expect } from 'vitest';
import { ParserKey, ParserKeyLabels } from './CSVParser';

describe('ParserKey', () => {
	describe('enum values', () => {
		it('should have all expected parser keys', () => {
			expect(Object.values(ParserKey)).toMatchInlineSnapshot(`
				[
				  "credit_mutuel",
				  "caisse_epargne",
				  "caisse_epargne_entreprise",
				  "boursorama",
				]
			`);
		});

		it('should have 4 parser keys', () => {
			expect(Object.keys(ParserKey)).toHaveLength(4);
		});
	});

	describe('ParserKeyLabels', () => {
		it('should have label for each parser key', () => {
			const keys = Object.values(ParserKey);
			keys.forEach((key) => {
				expect(ParserKeyLabels[key]).toBeDefined();
				expect(typeof ParserKeyLabels[key]).toBe('string');
			});
		});

		it('should have French labels', () => {
			expect(ParserKeyLabels[ParserKey.CREDIT_MUTUEL]).toBe('Crédit Mutuel');
			expect(ParserKeyLabels[ParserKey.CAISSE_EPARGNE]).toBe("Caisse d'Épargne (Particulier)");
			expect(ParserKeyLabels[ParserKey.CAISSE_EPARGNE_ENTREPRISE]).toBe("Caisse d'Épargne (Entreprise)");
			expect(ParserKeyLabels[ParserKey.BOURSORAMA]).toBe('Boursorama');
		});

		it('should map all labels correctly', () => {
			expect(ParserKeyLabels).toMatchInlineSnapshot(`
				{
				  "boursorama": "Boursorama",
				  "caisse_epargne": "Caisse d'Épargne (Particulier)",
				  "caisse_epargne_entreprise": "Caisse d'Épargne (Entreprise)",
				  "credit_mutuel": "Crédit Mutuel",
				}
			`);
		});
	});
});
