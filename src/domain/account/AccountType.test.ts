import { describe, it, expect } from 'vitest';
import { AccountType, AccountTypeLabels } from './AccountType';

describe('AccountType', () => {
	describe('enum values', () => {
		it('should have all expected account types', () => {
			expect(Object.values(AccountType)).toMatchInlineSnapshot(`
				[
				  "CHECKING",
				  "SAVINGS",
				  "PEA",
				  "CTO",
				  "ASSURANCE_VIE",
				  "CRYPTO",
				  "REAL_ESTATE",
				  "LOAN",
				  "CREDIT",
				]
			`);
		});

		it('should have 9 account types', () => {
			expect(Object.keys(AccountType)).toHaveLength(9);
		});
	});

	describe('AccountTypeLabels', () => {
		it('should have label for each account type', () => {
			const types = Object.values(AccountType);
			types.forEach((type) => {
				expect(AccountTypeLabels[type]).toBeDefined();
				expect(typeof AccountTypeLabels[type]).toBe('string');
			});
		});

		it('should have French labels', () => {
			expect(AccountTypeLabels[AccountType.CHECKING]).toBe('Compte courant');
			expect(AccountTypeLabels[AccountType.SAVINGS]).toBe('Livret');
			expect(AccountTypeLabels[AccountType.ASSURANCE_VIE]).toBe('Assurance vie');
		});

		it('should map all labels correctly', () => {
			expect(AccountTypeLabels).toMatchInlineSnapshot(`
				{
				  "ASSURANCE_VIE": "Assurance vie",
				  "CHECKING": "Compte courant",
				  "CREDIT": "Crédit conso",
				  "CRYPTO": "Crypto",
				  "CTO": "CTO",
				  "LOAN": "Prêt immobilier",
				  "PEA": "PEA",
				  "REAL_ESTATE": "Bien immobilier",
				  "SAVINGS": "Livret",
				}
			`);
		});
	});
});
