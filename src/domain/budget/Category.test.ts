import { describe, it, expect } from 'vitest';
import { Category } from './Category';
import { UniqueId } from '@domain/shared/UniqueId';

describe('Category', () => {
	describe('create', () => {
		it('should create a valid root category', () => {
			const result = Category.create({
				name: 'Alimentation',
				icon: '🍔',
				color: '#FF5733'
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.name).toBe('Alimentation');
			expect(result.value.icon).toBe('🍔');
			expect(result.value.color).toBe('#FF5733');
			expect(result.value.parentId).toBeNull();
			expect(result.value.isRoot).toBe(true);
		});

		it('should create a valid child category', () => {
			const parentId = UniqueId.fromString('parent-123');
			const result = Category.create({
				name: 'Restaurant',
				parentId,
				icon: '🍽️',
				color: '#FF5733'
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.parentId?.toString()).toBe('parent-123');
			expect(result.value.isRoot).toBe(false);
		});

		it('should trim name', () => {
			const result = Category.create({
				name: '  Trimmed Name  ',
				icon: '📦',
				color: '#123456'
			});

			expect(result.value.name).toBe('Trimmed Name');
		});

		it('should trim icon', () => {
			const result = Category.create({
				name: 'Test',
				icon: '  🎯  ',
				color: '#123456'
			});

			expect(result.value.icon).toBe('🎯');
		});

		it('should use provided id', () => {
			const customId = UniqueId.fromString('cat-custom');
			const result = Category.create(
				{
					name: 'Test',
					icon: '📦',
					color: '#123456'
				},
				customId
			);

			expect(result.value.id.toString()).toBe('cat-custom');
		});

		it('should set createdAt date', () => {
			const result = Category.create({
				name: 'Test',
				icon: '📦',
				color: '#123456'
			});

			expect(result.value.createdAt).toBeInstanceOf(Date);
		});

		it('should fail with empty name', () => {
			const result = Category.create({
				name: '',
				icon: '📦',
				color: '#123456'
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Category name is required');
		});

		it('should fail with whitespace-only name', () => {
			const result = Category.create({
				name: '   ',
				icon: '📦',
				color: '#123456'
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Category name is required');
		});

		it('should fail with empty icon', () => {
			const result = Category.create({
				name: 'Test',
				icon: '',
				color: '#123456'
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Category icon is required');
		});

		it('should fail with whitespace-only icon', () => {
			const result = Category.create({
				name: 'Test',
				icon: '   ',
				color: '#123456'
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Category icon is required');
		});

		it('should fail with invalid color format - missing hash', () => {
			const result = Category.create({
				name: 'Test',
				icon: '📦',
				color: '123456'
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Category color must be a valid hex color (e.g., #FF5733)');
		});

		it('should fail with invalid color format - wrong length', () => {
			const result = Category.create({
				name: 'Test',
				icon: '📦',
				color: '#123'
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Category color must be a valid hex color (e.g., #FF5733)');
		});

		it('should fail with invalid color format - invalid characters', () => {
			const result = Category.create({
				name: 'Test',
				icon: '📦',
				color: '#GGGGGG'
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Category color must be a valid hex color (e.g., #FF5733)');
		});

		it('should fail with empty color', () => {
			const result = Category.create({
				name: 'Test',
				icon: '📦',
				color: ''
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Category color must be a valid hex color (e.g., #FF5733)');
		});

		it('should accept lowercase hex color', () => {
			const result = Category.create({
				name: 'Test',
				icon: '📦',
				color: '#abcdef'
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.color).toBe('#abcdef');
		});

		it('should accept uppercase hex color', () => {
			const result = Category.create({
				name: 'Test',
				icon: '📦',
				color: '#ABCDEF'
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.color).toBe('#ABCDEF');
		});
	});

	describe('isRoot getter', () => {
		it('should return true for root category', () => {
			const category = Category.create({
				name: 'Root',
				icon: '📦',
				color: '#123456'
			}).value;

			expect(category.isRoot).toBe(true);
		});

		it('should return false for child category', () => {
			const parentId = UniqueId.fromString('parent');
			const category = Category.create({
				name: 'Child',
				parentId,
				icon: '📦',
				color: '#123456'
			}).value;

			expect(category.isRoot).toBe(false);
		});
	});

	describe('update', () => {
		it('should update name', () => {
			const category = Category.create({
				name: 'Original',
				icon: '📦',
				color: '#123456'
			}).value;

			category.update({ name: 'Updated' });

			expect(category.name).toBe('Updated');
		});

		it('should trim updated name', () => {
			const category = Category.create({
				name: 'Original',
				icon: '📦',
				color: '#123456'
			}).value;

			category.update({ name: '  Trimmed  ' });

			expect(category.name).toBe('Trimmed');
		});

		it('should update icon', () => {
			const category = Category.create({
				name: 'Test',
				icon: '📦',
				color: '#123456'
			}).value;

			category.update({ icon: '🎯' });

			expect(category.icon).toBe('🎯');
		});

		it('should update color', () => {
			const category = Category.create({
				name: 'Test',
				icon: '📦',
				color: '#123456'
			}).value;

			category.update({ color: '#654321' });

			expect(category.color).toBe('#654321');
		});

		it('should update multiple properties', () => {
			const category = Category.create({
				name: 'Test',
				icon: '📦',
				color: '#123456'
			}).value;

			category.update({ name: 'New Name', icon: '🎯', color: '#ABCDEF' });

			expect(category.name).toBe('New Name');
			expect(category.icon).toBe('🎯');
			expect(category.color).toBe('#ABCDEF');
		});

		it('should not update undefined properties', () => {
			const category = Category.create({
				name: 'Original',
				icon: '📦',
				color: '#123456'
			}).value;

			category.update({});

			expect(category.name).toBe('Original');
			expect(category.icon).toBe('📦');
			expect(category.color).toBe('#123456');
		});
	});

	describe('reconstitute', () => {
		it('should reconstitute category from persistence data', () => {
			const id = UniqueId.fromString('cat-456');
			const parentId = UniqueId.fromString('parent-789');
			const createdAt = new Date('2024-01-01');

			const result = Category.reconstitute(
				{
					name: 'Restored',
					parentId,
					icon: '🔄',
					color: '#AABBCC',
					createdAt
				},
				id
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('cat-456');
			expect(result.value.name).toBe('Restored');
			expect(result.value.parentId?.toString()).toBe('parent-789');
			expect(result.value.createdAt).toBe(createdAt);
		});

		it('should reconstitute root category with null parentId', () => {
			const result = Category.reconstitute(
				{
					name: 'Root',
					parentId: null,
					icon: '📦',
					color: '#123456',
					createdAt: new Date()
				},
				UniqueId.fromString('root')
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.parentId).toBeNull();
			expect(result.value.isRoot).toBe(true);
		});
	});

	describe('getters', () => {
		it('should return all properties', () => {
			const parentId = UniqueId.fromString('parent');
			const category = Category.create({
				name: 'Full',
				parentId,
				icon: '📦',
				color: '#AABBCC'
			}).value;

			expect(category.name).toBe('Full');
			expect(category.parentId?.toString()).toBe('parent');
			expect(category.icon).toBe('📦');
			expect(category.color).toBe('#AABBCC');
			expect(category.createdAt).toBeInstanceOf(Date);
		});
	});

	describe('entity equality', () => {
		it('should be equal if same id', () => {
			const id = UniqueId.fromString('same-id');
			const cat1 = Category.create(
				{ name: 'Cat 1', icon: '📦', color: '#111111' },
				id
			).value;
			const cat2 = Category.create(
				{ name: 'Cat 2', icon: '🎯', color: '#222222' },
				id
			).value;

			expect(cat1.equals(cat2)).toBe(true);
		});

		it('should not be equal if different ids', () => {
			const cat1 = Category.create(
				{ name: 'Cat', icon: '📦', color: '#123456' },
				UniqueId.fromString('id-1')
			).value;
			const cat2 = Category.create(
				{ name: 'Cat', icon: '📦', color: '#123456' },
				UniqueId.fromString('id-2')
			).value;

			expect(cat1.equals(cat2)).toBe(false);
		});
	});
});
