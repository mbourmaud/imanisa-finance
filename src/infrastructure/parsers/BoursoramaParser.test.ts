import { describe, it, expect } from 'vitest';
import { BoursoramaParser } from './BoursoramaParser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('BoursoramaParser', () => {
	const parser = new BoursoramaParser();

	describe('parse', () => {
		it('should parse fixture file correctly', () => {
			const csvContent = readFileSync(
				join(__dirname, '../../tests/fixtures/csv/boursorama.csv'),
				'utf-8'
			);

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(5);

			// First transaction: salary (positive)
			expect(transactions[0]).toMatchObject({
				amount: 2500,
				description: 'SALAIRE JANVIER',
				rawCategory: 'Revenus > Salaires',
				balance: 5000,
				additionalInfo: 'Virement mensuel'
			});
			expect(transactions[0].date).toEqual(new Date(2024, 0, 15));

			// Second transaction: expense (negative)
			expect(transactions[1]).toMatchObject({
				amount: -89.5,
				description: 'CARREFOUR',
				rawCategory: 'Alimentation > Courses'
			});
		});

		it('should extract short label from "Court | Long" format', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Short label | Long description with details;Cat;Parent;true;-50,00;;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].description).toBe('Short label');
		});

		it('should use full label when no pipe separator', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Simple label;Cat;Parent;true;-50,00;;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].description).toBe('Simple label');
		});

		it('should build category hierarchy from parent and category', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Test;Child;Parent;true;-50,00;;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].rawCategory).toBe('Parent > Child');
		});

		it('should handle category without parent', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Test;OnlyCategory;;true;-50,00;;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].rawCategory).toBe('OnlyCategory');
		});

		it('should handle parent without category', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Test;;OnlyParent;true;-50,00;;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].rawCategory).toBe('OnlyParent');
		});

		it('should handle empty category and parent', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Test;;;true;-50,00;;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].rawCategory).toBeUndefined();
		});

		it('should parse ISO date format YYYY-MM-DD', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-12-31;2025-01-02;Test;Cat;Parent;true;-50,00;;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].date).toEqual(new Date(2024, 11, 31));
			expect(transactions[0].valueDate).toEqual(new Date(2025, 0, 2));
		});

		it('should handle signed amounts (negative for debits)', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Debit;Cat;Parent;true;-100,50;;123;Main;1000,00
2024-01-16;2024-01-16;Credit;Cat;Parent;true;200,00;;123;Main;1200,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].amount).toBe(-100.5);
			expect(transactions[1].amount).toBe(200);
		});

		it('should remove UTF-8 BOM if present', () => {
			const csvContent = `\uFEFFdateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Test;Cat;Parent;true;-50,00;;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Test');
		});

		it('should store comment in additionalInfo', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Test;Cat;Parent;true;-50,00;This is a comment;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].additionalInfo).toBe('This is a comment');
		});

		it('should return undefined additionalInfo when comment is empty', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Test;Cat;Parent;true;-50,00;;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions[0].additionalInfo).toBeUndefined();
		});

		it('should return empty array for content with only header', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(0);
		});

		it('should return empty array for empty content', () => {
			const transactions = parser.parse('');

			expect(transactions).toHaveLength(0);
		});

		it('should skip lines with less than 11 fields', () => {
			const csvContent = `dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
2024-01-15;2024-01-15;Short;Cat;Parent;true;-50,00;comment;123
2024-01-16;2024-01-16;Complete;Cat;Parent;true;-60,00;comment;123;Main;1000,00`;

			const transactions = parser.parse(csvContent);

			expect(transactions).toHaveLength(1);
			expect(transactions[0].description).toBe('Complete');
		});
	});
});
