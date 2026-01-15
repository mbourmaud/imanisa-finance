import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryRule } from './CategoryRule';
import { UniqueId } from '@domain/shared/UniqueId';

describe('CategoryRule', () => {
	let categoryId: UniqueId;

	beforeEach(() => {
		categoryId = UniqueId.fromString('cat-123');
	});

	describe('create', () => {
		it('should create a valid category rule', () => {
			const result = CategoryRule.create({
				categoryId,
				pattern: 'carrefour|leclerc'
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.categoryId.toString()).toBe('cat-123');
			expect(result.value.pattern).toBe('carrefour|leclerc');
			expect(result.value.isActive).toBe(true);
		});

		it('should create rule with priority', () => {
			const result = CategoryRule.create({
				categoryId,
				pattern: 'test',
				priority: 100
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.priority).toBe(100);
		});

		it('should create rule with default priority 0', () => {
			const result = CategoryRule.create({
				categoryId,
				pattern: 'test'
			});

			expect(result.value.priority).toBe(0);
		});

		it('should create rule with source filter', () => {
			const result = CategoryRule.create({
				categoryId,
				pattern: 'test',
				source: 'caisse_epargne'
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.source).toBe('caisse_epargne');
		});

		it('should create rule without source filter', () => {
			const result = CategoryRule.create({
				categoryId,
				pattern: 'test'
			});

			expect(result.value.source).toBeNull();
		});

		it('should trim pattern', () => {
			const result = CategoryRule.create({
				categoryId,
				pattern: '  trimmed pattern  '
			});

			expect(result.value.pattern).toBe('trimmed pattern');
		});

		it('should use provided id', () => {
			const customId = UniqueId.fromString('rule-custom');
			const result = CategoryRule.create(
				{
					categoryId,
					pattern: 'test'
				},
				customId
			);

			expect(result.value.id.toString()).toBe('rule-custom');
		});

		it('should set createdAt date', () => {
			const result = CategoryRule.create({
				categoryId,
				pattern: 'test'
			});

			expect(result.value.createdAt).toBeInstanceOf(Date);
		});

		it('should fail with empty pattern', () => {
			const result = CategoryRule.create({
				categoryId,
				pattern: ''
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('CategoryRule pattern is required');
		});

		it('should fail with whitespace-only pattern', () => {
			const result = CategoryRule.create({
				categoryId,
				pattern: '   '
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('CategoryRule pattern is required');
		});

		it('should fail with invalid regex pattern', () => {
			const result = CategoryRule.create({
				categoryId,
				pattern: '[invalid('
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid regex pattern');
		});
	});

	describe('matches', () => {
		it('should match simple pattern', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'carrefour'
			}).value;

			expect(rule.matches('Paiement CB CARREFOUR')).toBe(true);
			expect(rule.matches('Paiement CB LECLERC')).toBe(false);
		});

		it('should match case-insensitive', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'CARREFOUR'
			}).value;

			expect(rule.matches('paiement cb carrefour')).toBe(true);
		});

		it('should match OR pattern', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'carrefour|leclerc|auchan'
			}).value;

			expect(rule.matches('Paiement CB CARREFOUR')).toBe(true);
			expect(rule.matches('Paiement CB LECLERC')).toBe(true);
			expect(rule.matches('Paiement CB AUCHAN')).toBe(true);
			expect(rule.matches('Paiement CB INTERMARCHE')).toBe(false);
		});

		it('should match partial strings', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'uber'
			}).value;

			expect(rule.matches('UBER TRIP PARIS')).toBe(true);
			expect(rule.matches('UBER EATS')).toBe(true);
		});

		it('should handle negative lookahead', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'uber(?!\\s*eats)'
			}).value;

			expect(rule.matches('UBER TRIP PARIS')).toBe(true);
			expect(rule.matches('UBER EATS')).toBe(false);
		});

		it('should return false for invalid regex (should not happen)', () => {
			// This tests the catch block - in practice should never happen
			// because we validate on create, but let's ensure the catch works
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'valid'
			}).value;

			// Force an invalid pattern via internal mutation (for testing only)
			(rule as unknown as { props: { pattern: string } }).props.pattern = '[invalid(';

			expect(rule.matches('test')).toBe(false);
		});
	});

	describe('update', () => {
		it('should update pattern', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'original'
			}).value;

			const result = rule.update({ pattern: 'updated' });

			expect(result.isSuccess).toBe(true);
			expect(rule.pattern).toBe('updated');
		});

		it('should fail update with invalid regex', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'original'
			}).value;

			const result = rule.update({ pattern: '[invalid(' });

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid regex pattern');
			expect(rule.pattern).toBe('original'); // unchanged
		});

		it('should update priority', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'test',
				priority: 0
			}).value;

			rule.update({ priority: 50 });

			expect(rule.priority).toBe(50);
		});

		it('should update isActive', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'test'
			}).value;

			rule.update({ isActive: false });

			expect(rule.isActive).toBe(false);
		});

		it('should update multiple properties', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'old',
				priority: 0
			}).value;

			rule.update({ pattern: 'new', priority: 100, isActive: false });

			expect(rule.pattern).toBe('new');
			expect(rule.priority).toBe(100);
			expect(rule.isActive).toBe(false);
		});

		it('should not update undefined properties', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'original',
				priority: 10
			}).value;

			rule.update({});

			expect(rule.pattern).toBe('original');
			expect(rule.priority).toBe(10);
			expect(rule.isActive).toBe(true);
		});
	});

	describe('activate', () => {
		it('should activate the rule', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'test'
			}).value;

			rule.update({ isActive: false });
			expect(rule.isActive).toBe(false);

			rule.activate();
			expect(rule.isActive).toBe(true);
		});
	});

	describe('deactivate', () => {
		it('should deactivate the rule', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'test'
			}).value;

			expect(rule.isActive).toBe(true);

			rule.deactivate();
			expect(rule.isActive).toBe(false);
		});
	});

	describe('reconstitute', () => {
		it('should reconstitute rule from persistence data', () => {
			const id = UniqueId.fromString('rule-456');
			const createdAt = new Date('2024-01-01');

			const result = CategoryRule.reconstitute(
				{
					categoryId,
					pattern: 'restored',
					priority: 50,
					source: 'boursorama',
					isActive: false,
					createdAt
				},
				id
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('rule-456');
			expect(result.value.pattern).toBe('restored');
			expect(result.value.priority).toBe(50);
			expect(result.value.source).toBe('boursorama');
			expect(result.value.isActive).toBe(false);
			expect(result.value.createdAt).toBe(createdAt);
		});

		it('should reconstitute rule with null source', () => {
			const result = CategoryRule.reconstitute(
				{
					categoryId,
					pattern: 'test',
					priority: 0,
					source: null,
					isActive: true,
					createdAt: new Date()
				},
				UniqueId.fromString('test')
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.source).toBeNull();
		});
	});

	describe('getters', () => {
		it('should return all properties', () => {
			const rule = CategoryRule.create({
				categoryId,
				pattern: 'full test',
				priority: 75,
				source: 'credit_mutuel'
			}).value;

			expect(rule.categoryId.toString()).toBe('cat-123');
			expect(rule.pattern).toBe('full test');
			expect(rule.priority).toBe(75);
			expect(rule.source).toBe('credit_mutuel');
			expect(rule.isActive).toBe(true);
			expect(rule.createdAt).toBeInstanceOf(Date);
		});
	});

	describe('entity equality', () => {
		it('should be equal if same id', () => {
			const id = UniqueId.fromString('same-id');
			const rule1 = CategoryRule.create(
				{ categoryId, pattern: 'rule 1' },
				id
			).value;
			const rule2 = CategoryRule.create(
				{ categoryId, pattern: 'rule 2', priority: 100 },
				id
			).value;

			expect(rule1.equals(rule2)).toBe(true);
		});

		it('should not be equal if different ids', () => {
			const rule1 = CategoryRule.create(
				{ categoryId, pattern: 'rule' },
				UniqueId.fromString('id-1')
			).value;
			const rule2 = CategoryRule.create(
				{ categoryId, pattern: 'rule' },
				UniqueId.fromString('id-2')
			).value;

			expect(rule1.equals(rule2)).toBe(false);
		});
	});
});
