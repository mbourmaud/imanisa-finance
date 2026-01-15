import { describe, it, expect } from 'vitest';
import { BankTemplate, BankTemplateLabels } from './BankTemplate';

describe('BankTemplate', () => {
	describe('enum values', () => {
		it('should have all expected bank templates', () => {
			expect(Object.values(BankTemplate)).toMatchInlineSnapshot(`
				[
				  "CAISSE_EPARGNE",
				  "CIC",
				  "CREDIT_MUTUEL",
				  "REVOLUT",
				  "BOURSE_DIRECT",
				  "LINXEA",
				  "BINANCE",
				  "OTHER",
				]
			`);
		});

		it('should have 8 bank templates', () => {
			expect(Object.keys(BankTemplate)).toHaveLength(8);
		});
	});

	describe('BankTemplateLabels', () => {
		it('should have label for each bank template', () => {
			const templates = Object.values(BankTemplate);
			templates.forEach((template) => {
				expect(BankTemplateLabels[template]).toBeDefined();
				expect(typeof BankTemplateLabels[template]).toBe('string');
			});
		});

		it('should have correct labels', () => {
			expect(BankTemplateLabels[BankTemplate.CAISSE_EPARGNE]).toBe("Caisse d'Épargne");
			expect(BankTemplateLabels[BankTemplate.CREDIT_MUTUEL]).toBe('Crédit Mutuel');
			expect(BankTemplateLabels[BankTemplate.BINANCE]).toBe('Binance');
			expect(BankTemplateLabels[BankTemplate.OTHER]).toBe('Autre');
		});

		it('should map all labels correctly', () => {
			expect(BankTemplateLabels).toMatchInlineSnapshot(`
				{
				  "BINANCE": "Binance",
				  "BOURSE_DIRECT": "Bourse Direct",
				  "CAISSE_EPARGNE": "Caisse d'Épargne",
				  "CIC": "CIC",
				  "CREDIT_MUTUEL": "Crédit Mutuel",
				  "LINXEA": "Linxea",
				  "OTHER": "Autre",
				  "REVOLUT": "Revolut",
				}
			`);
		});
	});
});
