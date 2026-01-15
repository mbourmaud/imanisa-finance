import { describe, it, expect } from 'vitest';
import { CaisseEpargneParser } from './CaisseEpargneParser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('CaisseEpargneParser', () => {
	const parser = new CaisseEpargneParser();

	describe('parse', () => {
		it('should parse fixture file correctly', () => {
			const csvContent = readFileSync(
				join(__dirname, '../../tests/fixtures/csv/caisse_epargne.csv'),
				'utf-8'
			);

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(5);

			// First transaction: salary (credit)
			expect(transactions[0]).toMatchObject({
				amount: 1800,
				description: 'VIR SEPA SALAIRE JANVIER EMPLOYEUR',
				rawCategory: 'Revenus > Salaires',
				reference: 'REF123456'
			});
			expect(transactions[0].date).toEqual(new Date(2024, 0, 15));

			// Second transaction: debit
			expect(transactions[1]).toMatchObject({
				amount: -125.5,
				description: 'CB LECLERC HYPERMARCHE',
				rawCategory: 'Alimentation > Courses'
			});
		});

		it('should prefer Libelle operation over Libelle simplifie', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Simple;Operation detaillée;REF;Info;Type;Cat;SubCat;100,00;;15/01/2024;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].description).toBe('Operation detaillée');
		});

		it('should fallback to Libelle simplifie when Libelle operation is empty', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Simple;;REF;Info;Type;Cat;SubCat;100,00;;15/01/2024;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].description).toBe('Simple');
		});

		it('should build category hierarchy from Categorie and Sous categorie', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Test;Test;REF;Info;Type;ParentCat;ChildCat;100,00;;15/01/2024;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].rawCategory).toBe('ParentCat > ChildCat');
		});

		it('should handle category without subcategory', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Test;Test;REF;Info;Type;OnlyCategory;;100,00;;15/01/2024;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].rawCategory).toBe('OnlyCategory');
		});

		it('should handle empty category fields', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Test;Test;REF;Info;Type;;;100,00;;15/01/2024;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].rawCategory).toBeUndefined();
		});

		it('should use Date operation as primary date, fallback to Date de comptabilisation', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Test;Test;REF;Info;Type;Cat;Sub;100,00;;20/01/2024;20/01/2024;1`;

			const transactions = parser.parse(csvContent);

			// Uses Date operation (20/01/2024), not Date de comptabilisation (15/01/2024)
			expect(transactions[0].date).toEqual(new Date(2024, 0, 20));
		});

		it('should fallback to Date de comptabilisation when Date operation is empty', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Test;Test;REF;Info;Type;Cat;Sub;100,00;;;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].date).toEqual(new Date(2024, 0, 15));
		});

		it('should handle debit as negative and credit as positive', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Debit;Debit;REF;Info;Type;Cat;Sub;500,00;;15/01/2024;15/01/2024;1
16/01/2024;Credit;Credit;REF;Info;Type;Cat;Sub;;1000,00;16/01/2024;16/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].amount).toBe(-500);
			expect(transactions[1].amount).toBe(1000);
		});

		it('should build additionalInfo from Type operation and Informations complementaires', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Test;Test;REF;Extra info here;Paiement carte;Cat;Sub;100,00;;15/01/2024;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].additionalInfo).toBe('Type: Paiement carte | Extra info here');
		});

		it('should handle additionalInfo with only Type operation', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Test;Test;REF;;Paiement carte;Cat;Sub;100,00;;15/01/2024;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].additionalInfo).toBe('Type: Paiement carte');
		});

		it('should store reference when present', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Test;Test;REF123456;Info;Type;Cat;Sub;100,00;;15/01/2024;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].reference).toBe('REF123456');
		});

		it('should return undefined reference when empty', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Test;Test;;Info;Type;Cat;Sub;100,00;;15/01/2024;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].reference).toBeUndefined();
		});

		it('should return empty array for content with only header', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(0);
		});

		it('should skip lines with less than 13 fields', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Short;Short;REF;Info;Type;Cat;Sub;100,00;;15/01/2024
16/01/2024;Complete;Complete;REF;Info;Type;Cat;Sub;200,00;;16/01/2024;16/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Complete');
		});

		it('should skip lines with empty amounts', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Empty;Empty;REF;Info;Type;Cat;Sub;;;15/01/2024;15/01/2024;1
16/01/2024;Valid;Valid;REF;Info;Type;Cat;Sub;100,00;;16/01/2024;16/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Valid');
		});

		it('should normalize multiple spaces in description', () => {
			const csvContent = `Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
15/01/2024;Simple;Description  with   multiple    spaces;REF;Info;Type;Cat;Sub;100,00;;15/01/2024;15/01/2024;1`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].description).toBe('Description with multiple spaces');
		});
	});
});
