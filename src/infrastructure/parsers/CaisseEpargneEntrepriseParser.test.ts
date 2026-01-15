import { describe, it, expect } from 'vitest';
import { CaisseEpargneEntrepriseParser } from './CaisseEpargneEntrepriseParser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('CaisseEpargneEntrepriseParser', () => {
	const parser = new CaisseEpargneEntrepriseParser();

	describe('parse', () => {
		it('should parse fixture file correctly', () => {
			const csvContent = readFileSync(
				join(__dirname, '../../tests/fixtures/csv/caisse_epargne_entreprise.csv'),
				'utf-8'
			);

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(5);

			// First transaction: rent income (credit)
			expect(transactions[0]).toMatchObject({
				amount: 3500,
				description: 'LOYER SCI',
				reference: 'REF-LOYER-001'
			});
			expect(transactions[0].date).toEqual(new Date(2024, 0, 15));
			// Enterprise format has no category
			expect(transactions[0].rawCategory).toBeUndefined();

			// Second transaction: debit
			expect(transactions[1]).toMatchObject({
				amount: -1250,
				description: 'CHARGES COPRO'
			});
		});

		it('should not have rawCategory (enterprise format has no category columns)', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test;REF;Info;Type;100,00;;15/01/2024;15/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].rawCategory).toBeUndefined();
		});

		it('should use Date operation as primary date, fallback to Date comptable', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test;REF;Info;Type;100,00;;20/01/2024;20/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			// Uses Date operation (20/01/2024), not Date comptable (15/01/2024)
			expect(transactions[0].date).toEqual(new Date(2024, 0, 20));
		});

		it('should fallback to Date comptable when Date operation is empty', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test;REF;Info;Type;100,00;;;15/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].date).toEqual(new Date(2024, 0, 15));
		});

		it('should handle debit as negative and credit as positive', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Debit;REF;Info;Type;500,00;;15/01/2024;15/01/2024;Oui
16/01/2024;Credit;REF;Info;Type;;1000,00;16/01/2024;16/01/2024;Non`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].amount).toBe(-500);
			expect(transactions[1].amount).toBe(1000);
		});

		it('should parse French number format with thousands separator', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test;REF;Info;Type;1 234,56;;15/01/2024;15/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].amount).toBe(-1234.56);
		});

		it('should build additionalInfo from Type operation and Informations complementaires', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test;REF;Extra info here;Prélèvement;100,00;;15/01/2024;15/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].additionalInfo).toBe('Type: Prélèvement | Extra info here');
		});

		it('should handle additionalInfo with only Type operation', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test;REF;;Prélèvement;100,00;;15/01/2024;15/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].additionalInfo).toBe('Type: Prélèvement');
		});

		it('should handle additionalInfo with only Informations complementaires', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test;REF;Some info;;100,00;;15/01/2024;15/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].additionalInfo).toBe('Some info');
		});

		it('should return undefined additionalInfo when both fields are empty', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test;REF;;;100,00;;15/01/2024;15/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].additionalInfo).toBeUndefined();
		});

		it('should store reference when present', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test;REF-SCI-001;Info;Type;100,00;;15/01/2024;15/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].reference).toBe('REF-SCI-001');
		});

		it('should return undefined reference when empty', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test;;Info;Type;100,00;;15/01/2024;15/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].reference).toBeUndefined();
		});

		it('should return empty array for content with only header', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(0);
		});

		it('should skip lines with less than 10 fields', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Short;REF;Info;Type;100,00;;15/01/2024
16/01/2024;Complete;REF;Info;Type;200,00;;16/01/2024;16/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Complete');
		});

		it('should skip lines with empty amounts', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Empty;REF;Info;Type;;;15/01/2024;15/01/2024;Oui
16/01/2024;Valid;REF;Info;Type;100,00;;16/01/2024;16/01/2024;Non`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Valid');
		});

		it('should normalize multiple spaces in description', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Description  with   multiple    spaces;REF;Info;Type;100,00;;15/01/2024;15/01/2024;Oui`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].description).toBe('Description with multiple spaces');
		});

		it('should handle Pointage Oui/Non format (ignored in parsing)', () => {
			const csvContent = `Date comptable;Libelle simplifie;Reference;Informations complementaires;Type operation;Debit;Credit;Date operation;Date de valeur;Pointage
15/01/2024;Test Oui;REF;Info;Type;100,00;;15/01/2024;15/01/2024;Oui
16/01/2024;Test Non;REF;Info;Type;200,00;;16/01/2024;16/01/2024;Non`;

			const transactions = parser.parse(csvContent);

			// Both should be parsed regardless of Pointage value
			expect(transactions).toHaveLength(2);
		});
	});
});
