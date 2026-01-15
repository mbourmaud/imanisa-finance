import { describe, it, expect } from 'vitest';
import { UniqueId } from './UniqueId';

describe('UniqueId', () => {
	describe('create', () => {
		it('should create a new unique identifier', () => {
			const id = UniqueId.create();

			expect(id.toString()).toBeDefined();
			expect(typeof id.toString()).toBe('string');
		});

		it('should create unique identifiers each time', () => {
			const id1 = UniqueId.create();
			const id2 = UniqueId.create();

			expect(id1.toString()).not.toBe(id2.toString());
		});

		it('should create UUID format', () => {
			const id = UniqueId.create();
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

			expect(id.toString()).toMatch(uuidRegex);
		});
	});

	describe('fromString', () => {
		it('should create UniqueId from existing string', () => {
			const originalValue = 'my-custom-id-123';
			const id = UniqueId.fromString(originalValue);

			expect(id.toString()).toBe(originalValue);
		});

		it('should preserve UUID string', () => {
			const uuidString = '550e8400-e29b-41d4-a716-446655440000';
			const id = UniqueId.fromString(uuidString);

			expect(id.toString()).toBe(uuidString);
		});

		it('should create from empty string', () => {
			const id = UniqueId.fromString('');

			expect(id.toString()).toBe('');
		});
	});

	describe('toString', () => {
		it('should return the underlying string value', () => {
			const value = 'test-id';
			const id = UniqueId.fromString(value);

			expect(id.toString()).toBe(value);
		});
	});

	describe('equals', () => {
		it('should return true for same value', () => {
			const id1 = UniqueId.fromString('same-value');
			const id2 = UniqueId.fromString('same-value');

			expect(id1.equals(id2)).toBe(true);
		});

		it('should return false for different values', () => {
			const id1 = UniqueId.fromString('value-1');
			const id2 = UniqueId.fromString('value-2');

			expect(id1.equals(id2)).toBe(false);
		});

		it('should be symmetric', () => {
			const id1 = UniqueId.fromString('test');
			const id2 = UniqueId.fromString('test');

			expect(id1.equals(id2)).toBe(id2.equals(id1));
		});

		it('should be reflexive', () => {
			const id = UniqueId.fromString('test');

			expect(id.equals(id)).toBe(true);
		});
	});
});
