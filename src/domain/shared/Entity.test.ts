import { describe, it, expect } from 'vitest';
import { Entity } from './Entity';
import { UniqueId } from './UniqueId';

// Concrete implementation for testing
interface TestEntityProps {
	name: string;
	value: number;
}

class TestEntity extends Entity<TestEntityProps> {
	constructor(props: TestEntityProps, id?: UniqueId) {
		super(props, id);
	}

	get name(): string {
		return this.props.name;
	}

	get value(): number {
		return this.props.value;
	}
}

describe('Entity', () => {
	describe('constructor', () => {
		it('should create entity with generated id when none provided', () => {
			const entity = new TestEntity({ name: 'Test', value: 42 });

			expect(entity.id).toBeDefined();
			expect(entity.id.toString()).toBeDefined();
		});

		it('should create entity with provided id', () => {
			const customId = UniqueId.fromString('custom-id');
			const entity = new TestEntity({ name: 'Test', value: 42 }, customId);

			expect(entity.id.toString()).toBe('custom-id');
		});

		it('should store props correctly', () => {
			const entity = new TestEntity({ name: 'Test', value: 42 });

			expect(entity.name).toBe('Test');
			expect(entity.value).toBe(42);
		});
	});

	describe('id getter', () => {
		it('should return the entity id', () => {
			const id = UniqueId.fromString('entity-id');
			const entity = new TestEntity({ name: 'Test', value: 1 }, id);

			expect(entity.id).toBe(id);
		});
	});

	describe('equals', () => {
		it('should return true for entities with same id', () => {
			const id = UniqueId.fromString('same-id');
			const entity1 = new TestEntity({ name: 'Entity 1', value: 1 }, id);
			const entity2 = new TestEntity({ name: 'Entity 2', value: 2 }, id);

			expect(entity1.equals(entity2)).toBe(true);
		});

		it('should return false for entities with different ids', () => {
			const entity1 = new TestEntity(
				{ name: 'Entity', value: 1 },
				UniqueId.fromString('id-1')
			);
			const entity2 = new TestEntity(
				{ name: 'Entity', value: 1 },
				UniqueId.fromString('id-2')
			);

			expect(entity1.equals(entity2)).toBe(false);
		});

		it('should return false when comparing with null', () => {
			const entity = new TestEntity({ name: 'Test', value: 1 });

			expect(entity.equals(null as unknown as TestEntity)).toBe(false);
		});

		it('should return false when comparing with undefined', () => {
			const entity = new TestEntity({ name: 'Test', value: 1 });

			expect(entity.equals(undefined as unknown as TestEntity)).toBe(false);
		});

		it('should be reflexive - entity equals itself', () => {
			const entity = new TestEntity({ name: 'Test', value: 1 });

			expect(entity.equals(entity)).toBe(true);
		});

		it('should be symmetric', () => {
			const id = UniqueId.fromString('same-id');
			const entity1 = new TestEntity({ name: 'A', value: 1 }, id);
			const entity2 = new TestEntity({ name: 'B', value: 2 }, id);

			expect(entity1.equals(entity2)).toBe(entity2.equals(entity1));
		});
	});
});
