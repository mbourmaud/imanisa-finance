import { describe, it, expect } from 'vitest';
import { ValueObject } from './ValueObject';

// Concrete implementation for testing
interface TestValueObjectProps {
	name: string;
	value: number;
}

class TestValueObject extends ValueObject<TestValueObjectProps> {
	constructor(props: TestValueObjectProps) {
		super(props);
	}

	get name(): string {
		return this.props.name;
	}

	get value(): number {
		return this.props.value;
	}
}

describe('ValueObject', () => {
	describe('constructor', () => {
		it('should create value object with frozen props', () => {
			const props = { name: 'Test', value: 42 };
			const vo = new TestValueObject(props);

			expect(vo.name).toBe('Test');
			expect(vo.value).toBe(42);
		});

		it('should freeze the props object', () => {
			const vo = new TestValueObject({ name: 'Test', value: 42 });

			// Attempting to modify props should have no effect (frozen)
			expect(() => {
				(vo as unknown as { props: { name: string } }).props.name = 'Modified';
			}).toThrow();
		});
	});

	describe('equals', () => {
		it('should return true for value objects with same props', () => {
			const vo1 = new TestValueObject({ name: 'Same', value: 100 });
			const vo2 = new TestValueObject({ name: 'Same', value: 100 });

			expect(vo1.equals(vo2)).toBe(true);
		});

		it('should return false for value objects with different props', () => {
			const vo1 = new TestValueObject({ name: 'First', value: 100 });
			const vo2 = new TestValueObject({ name: 'Second', value: 100 });

			expect(vo1.equals(vo2)).toBe(false);
		});

		it('should return false when comparing with null', () => {
			const vo = new TestValueObject({ name: 'Test', value: 1 });

			expect(vo.equals(null as unknown as TestValueObject)).toBe(false);
		});

		it('should return false when comparing with undefined', () => {
			const vo = new TestValueObject({ name: 'Test', value: 1 });

			expect(vo.equals(undefined as unknown as TestValueObject)).toBe(false);
		});

		it('should be reflexive - value object equals itself', () => {
			const vo = new TestValueObject({ name: 'Test', value: 1 });

			expect(vo.equals(vo)).toBe(true);
		});

		it('should be symmetric', () => {
			const vo1 = new TestValueObject({ name: 'A', value: 1 });
			const vo2 = new TestValueObject({ name: 'A', value: 1 });

			expect(vo1.equals(vo2)).toBe(vo2.equals(vo1));
		});

		it('should compare complex nested objects', () => {
			interface NestedProps {
				nested: { a: number; b: string };
			}

			class NestedValueObject extends ValueObject<NestedProps> {
				constructor(props: NestedProps) {
					super(props);
				}
			}

			const vo1 = new NestedValueObject({ nested: { a: 1, b: 'test' } });
			const vo2 = new NestedValueObject({ nested: { a: 1, b: 'test' } });
			const vo3 = new NestedValueObject({ nested: { a: 2, b: 'test' } });

			expect(vo1.equals(vo2)).toBe(true);
			expect(vo1.equals(vo3)).toBe(false);
		});
	});
});
