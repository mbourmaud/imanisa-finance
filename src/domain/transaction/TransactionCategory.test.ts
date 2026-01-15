import { describe, it, expect } from 'vitest';
import {
	TransactionCategory,
	TransactionCategoryLabels,
	TransactionCategoryColors,
	IncomeCategories,
	ExpenseCategories
} from './TransactionCategory';

describe('TransactionCategory', () => {
	describe('enum values', () => {
		it('should have all expected categories', () => {
			expect(Object.values(TransactionCategory)).toMatchInlineSnapshot(`
				[
				  "SALARY",
				  "FREELANCE",
				  "DIVIDENDS",
				  "RENTAL_INCOME",
				  "REFUND",
				  "OTHER_INCOME",
				  "HOUSING",
				  "UTILITIES",
				  "GROCERIES",
				  "RESTAURANTS",
				  "TRANSPORT",
				  "HEALTH",
				  "INSURANCE",
				  "SUBSCRIPTIONS",
				  "SHOPPING",
				  "LEISURE",
				  "TRAVEL",
				  "EDUCATION",
				  "TAXES",
				  "FEES",
				  "SAVINGS",
				  "INVESTMENT",
				  "LOAN_PAYMENT",
				  "OTHER_EXPENSE",
				  "TRANSFER",
				]
			`);
		});

		it('should have 25 categories', () => {
			expect(Object.keys(TransactionCategory)).toHaveLength(25);
		});
	});

	describe('TransactionCategoryLabels', () => {
		it('should have label for each category', () => {
			const categories = Object.values(TransactionCategory);
			categories.forEach((category) => {
				expect(TransactionCategoryLabels[category]).toBeDefined();
				expect(typeof TransactionCategoryLabels[category]).toBe('string');
			});
		});

		it('should have French labels for income categories', () => {
			expect(TransactionCategoryLabels[TransactionCategory.SALARY]).toBe('Salaire');
			expect(TransactionCategoryLabels[TransactionCategory.FREELANCE]).toBe('Freelance');
			expect(TransactionCategoryLabels[TransactionCategory.RENTAL_INCOME]).toBe('Revenus locatifs');
		});

		it('should have French labels for expense categories', () => {
			expect(TransactionCategoryLabels[TransactionCategory.HOUSING]).toBe('Logement');
			expect(TransactionCategoryLabels[TransactionCategory.GROCERIES]).toBe('Courses');
			expect(TransactionCategoryLabels[TransactionCategory.RESTAURANTS]).toBe('Restaurants');
		});
	});

	describe('TransactionCategoryColors', () => {
		it('should have color for each category', () => {
			const categories = Object.values(TransactionCategory);
			categories.forEach((category) => {
				expect(TransactionCategoryColors[category]).toBeDefined();
				expect(TransactionCategoryColors[category]).toMatch(/^#[0-9A-Fa-f]{6}$/);
			});
		});

		it('should have green tones for income categories', () => {
			// Income categories should have greenish colors
			const salaryColor = TransactionCategoryColors[TransactionCategory.SALARY];
			expect(salaryColor).toBe('#10B981');
		});

		it('should have red tone for housing', () => {
			expect(TransactionCategoryColors[TransactionCategory.HOUSING]).toBe('#EF4444');
		});
	});

	describe('IncomeCategories', () => {
		it('should contain all income categories', () => {
			expect(IncomeCategories).toMatchInlineSnapshot(`
				[
				  "SALARY",
				  "FREELANCE",
				  "DIVIDENDS",
				  "RENTAL_INCOME",
				  "REFUND",
				  "OTHER_INCOME",
				]
			`);
		});

		it('should have 6 income categories', () => {
			expect(IncomeCategories).toHaveLength(6);
		});

		it('should not contain expense categories', () => {
			expect(IncomeCategories).not.toContain(TransactionCategory.HOUSING);
			expect(IncomeCategories).not.toContain(TransactionCategory.GROCERIES);
		});
	});

	describe('ExpenseCategories', () => {
		it('should contain all expense categories', () => {
			expect(ExpenseCategories).toMatchInlineSnapshot(`
				[
				  "HOUSING",
				  "UTILITIES",
				  "GROCERIES",
				  "RESTAURANTS",
				  "TRANSPORT",
				  "HEALTH",
				  "INSURANCE",
				  "SUBSCRIPTIONS",
				  "SHOPPING",
				  "LEISURE",
				  "TRAVEL",
				  "EDUCATION",
				  "TAXES",
				  "FEES",
				  "SAVINGS",
				  "INVESTMENT",
				  "LOAN_PAYMENT",
				  "OTHER_EXPENSE",
				]
			`);
		});

		it('should have 18 expense categories', () => {
			expect(ExpenseCategories).toHaveLength(18);
		});

		it('should not contain income categories', () => {
			expect(ExpenseCategories).not.toContain(TransactionCategory.SALARY);
			expect(ExpenseCategories).not.toContain(TransactionCategory.DIVIDENDS);
		});
	});

	describe('category completeness', () => {
		it('should have all categories covered by Income, Expense, or Transfer', () => {
			const allCategories = Object.values(TransactionCategory);
			const covered = [...IncomeCategories, ...ExpenseCategories, TransactionCategory.TRANSFER];

			allCategories.forEach((category) => {
				expect(covered).toContain(category);
			});
		});
	});
});
