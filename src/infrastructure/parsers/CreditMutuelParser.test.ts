import { describe, it, expect } from 'vitest';
import { CreditMutuelParser } from './CreditMutuelParser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('CreditMutuelParser', () => {
	const parser = new CreditMutuelParser();

	describe('parse', () => {
		it('should parse fixture file correctly', () => {
			const csvContent = readFileSync(
				join(__dirname, '../../tests/fixtures/csv/credit_mutuel.csv'),
				'utf-8'
			);

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(6);

			// First transaction: salary (credit)
			expect(transactions[0]).toMatchObject({
				amount: 500,
				description: 'VIREMENT SALAIRE JANVIER',
				balance: 1500
			});
			expect(transactions[0].date).toEqual(new Date(2024, 0, 15));
			expect(transactions[0].valueDate).toEqual(new Date(2024, 0, 15));

			// Second transaction: debit with thousands separator
			expect(transactions[3]).toMatchObject({
				amount: -1234.56,
				description: 'LOYER JANVIER'
			});
		});

		it('should handle debit transactions as negative amounts', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;100,00;;Achat;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].amount).toBe(-100);
		});

		it('should handle credit transactions as positive amounts', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;;200,00;Virement reçu;1200,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].amount).toBe(200);
		});

		it('should parse French number format with comma and space', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;1 234,56;;Achat;10 000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].amount).toBe(-1234.56);
			expect(transactions[0].balance).toBe(10000);
		});

		it('should return empty array for content with only header', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(0);
		});

		it('should return empty array for empty content', () => {
			const transactions = parser.parse('');

			expect(transactions).toHaveLength(0);
		});

		it('should skip lines with less than 6 fields', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;100,00;;Short
16/01/2024;16/01/2024;200,00;;Full line;500,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Full line');
		});

		it('should skip lines with empty amounts (no debit nor credit)', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;;;Empty amounts;500,00
16/01/2024;16/01/2024;100,00;;Valid;400,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Valid');
		});

		it('should handle quoted fields with semicolons', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;100,00;;"Description; with semicolon";500,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Description; with semicolon');
		});

		it('should handle escaped quotes in quoted fields', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;100,00;;"Description with ""quotes""";500,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Description with "quotes"');
		});

		it('should parse different date formats in value date', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
31/12/2023;02/01/2024;100,00;;Achat;500,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].date).toEqual(new Date(2023, 11, 31));
			expect(transactions[0].valueDate).toEqual(new Date(2024, 0, 2));
		});

		it('should return undefined balance when balance field is empty', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;100,00;;Achat;`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].balance).toBeUndefined();
		});

		it('should return undefined valueDate when value date is invalid', () => {
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;;100,00;;Achat;500,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].valueDate).toBeUndefined();
		});
	});
});
