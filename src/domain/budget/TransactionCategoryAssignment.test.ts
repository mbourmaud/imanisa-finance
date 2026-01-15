import { describe, it, expect } from 'vitest';
import {
	CategorySource,
	CategorySourceLabels,
	createTransactionCategoryAssignment,
	canOverwrite
} from './TransactionCategoryAssignment';
import { UniqueId } from '@domain/shared/UniqueId';

describe('CategorySource', () => {
	describe('enum values', () => {
		it('should have all expected sources', () => {
			expect(Object.values(CategorySource)).toMatchInlineSnapshot(`
				[
				  "bank",
				  "auto",
				  "manual",
				]
			`);
		});

		it('should have 3 sources', () => {
			expect(Object.keys(CategorySource)).toHaveLength(3);
		});
	});

	describe('CategorySourceLabels', () => {
		it('should have label for each source', () => {
			const sources = Object.values(CategorySource);
			sources.forEach((source) => {
				expect(CategorySourceLabels[source]).toBeDefined();
				expect(typeof CategorySourceLabels[source]).toBe('string');
			});
		});

		it('should have French labels', () => {
			expect(CategorySourceLabels[CategorySource.BANK]).toBe('Banque');
			expect(CategorySourceLabels[CategorySource.AUTO]).toBe('Automatique');
			expect(CategorySourceLabels[CategorySource.MANUAL]).toBe('Manuel');
		});
	});
});

describe('createTransactionCategoryAssignment', () => {
	const transactionId = UniqueId.fromString('tx-123');
	const categoryId = UniqueId.fromString('cat-456');

	it('should create assignment with default confidence for BANK', () => {
		const assignment = createTransactionCategoryAssignment({
			transactionId,
			categoryId,
			source: CategorySource.BANK
		});

		expect(assignment.transactionId.toString()).toBe('tx-123');
		expect(assignment.categoryId.toString()).toBe('cat-456');
		expect(assignment.source).toBe(CategorySource.BANK);
		expect(assignment.confidence).toBe(1.0);
		expect(assignment.assignedAt).toBeInstanceOf(Date);
	});

	it('should create assignment with default confidence for MANUAL', () => {
		const assignment = createTransactionCategoryAssignment({
			transactionId,
			categoryId,
			source: CategorySource.MANUAL
		});

		expect(assignment.confidence).toBe(1.0);
	});

	it('should create assignment with default confidence for AUTO', () => {
		const assignment = createTransactionCategoryAssignment({
			transactionId,
			categoryId,
			source: CategorySource.AUTO
		});

		expect(assignment.confidence).toBe(0.8);
	});

	it('should use custom confidence when provided', () => {
		const assignment = createTransactionCategoryAssignment({
			transactionId,
			categoryId,
			source: CategorySource.AUTO,
			confidence: 0.5
		});

		expect(assignment.confidence).toBe(0.5);
	});

	it('should set assignedAt to current date', () => {
		const before = new Date();
		const assignment = createTransactionCategoryAssignment({
			transactionId,
			categoryId,
			source: CategorySource.MANUAL
		});
		const after = new Date();

		expect(assignment.assignedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
		expect(assignment.assignedAt.getTime()).toBeLessThanOrEqual(after.getTime());
	});
});

describe('canOverwrite', () => {
	const transactionId = UniqueId.fromString('tx-123');
	const categoryId = UniqueId.fromString('cat-456');

	const createAssignment = (source: CategorySource) =>
		createTransactionCategoryAssignment({
			transactionId,
			categoryId,
			source
		});

	describe('MANUAL assignments', () => {
		it('should not be overwritten by BANK', () => {
			const existing = createAssignment(CategorySource.MANUAL);
			expect(canOverwrite(existing, CategorySource.BANK)).toBe(false);
		});

		it('should not be overwritten by AUTO', () => {
			const existing = createAssignment(CategorySource.MANUAL);
			expect(canOverwrite(existing, CategorySource.AUTO)).toBe(false);
		});

		it('should not be overwritten by MANUAL', () => {
			const existing = createAssignment(CategorySource.MANUAL);
			expect(canOverwrite(existing, CategorySource.MANUAL)).toBe(false);
		});
	});

	describe('BANK assignments', () => {
		it('should not be overwritten by BANK', () => {
			const existing = createAssignment(CategorySource.BANK);
			expect(canOverwrite(existing, CategorySource.BANK)).toBe(false);
		});

		it('should not be overwritten by AUTO', () => {
			const existing = createAssignment(CategorySource.BANK);
			expect(canOverwrite(existing, CategorySource.AUTO)).toBe(false);
		});

		it('should be overwritten by MANUAL', () => {
			const existing = createAssignment(CategorySource.BANK);
			expect(canOverwrite(existing, CategorySource.MANUAL)).toBe(true);
		});
	});

	describe('AUTO assignments', () => {
		it('should be overwritten by BANK', () => {
			const existing = createAssignment(CategorySource.AUTO);
			expect(canOverwrite(existing, CategorySource.BANK)).toBe(true);
		});

		it('should not be overwritten by AUTO', () => {
			const existing = createAssignment(CategorySource.AUTO);
			expect(canOverwrite(existing, CategorySource.AUTO)).toBe(false);
		});

		it('should be overwritten by MANUAL', () => {
			const existing = createAssignment(CategorySource.AUTO);
			expect(canOverwrite(existing, CategorySource.MANUAL)).toBe(true);
		});
	});
});
