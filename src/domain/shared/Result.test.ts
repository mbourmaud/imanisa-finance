import { describe, it, expect } from 'vitest';
import { Result } from './Result';

describe('Result', () => {
	describe('ok', () => {
		it('should create a successful result', () => {
			const result = Result.ok('test value');

			expect(result.isSuccess).toBe(true);
			expect(result.isFailure).toBe(false);
			expect(result.value).toBe('test value');
		});

		it('should create a successful result with object value', () => {
			const value = { name: 'test', count: 42 };
			const result = Result.ok(value);

			expect(result.isSuccess).toBe(true);
			expect(result.value).toMatchInlineSnapshot(`
				{
				  "count": 42,
				  "name": "test",
				}
			`);
		});

		it('should create a successful result with null value', () => {
			const result = Result.ok(null);

			expect(result.isSuccess).toBe(true);
			expect(result.value).toBeNull();
		});
	});

	describe('fail', () => {
		it('should create a failed result with string error', () => {
			const result = Result.fail<string>('Something went wrong');

			expect(result.isSuccess).toBe(false);
			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Something went wrong');
		});

		it('should create a failed result with custom error type', () => {
			interface CustomError {
				code: string;
				message: string;
			}
			const error: CustomError = { code: 'ERR001', message: 'Validation failed' };
			const result = Result.fail<string, CustomError>(error);

			expect(result.isFailure).toBe(true);
			expect(result.error).toMatchInlineSnapshot(`
				{
				  "code": "ERR001",
				  "message": "Validation failed",
				}
			`);
		});
	});

	describe('value getter', () => {
		it('should throw error when accessing value from failed result', () => {
			const result = Result.fail<string>('error');

			expect(() => result.value).toThrow('Cannot get value from failed result');
		});
	});

	describe('error getter', () => {
		it('should throw error when accessing error from successful result', () => {
			const result = Result.ok('value');

			expect(() => result.error).toThrow('Cannot get error from successful result');
		});
	});

	describe('map', () => {
		it('should transform value in successful result', () => {
			const result = Result.ok(5);
			const mapped = result.map((x) => x * 2);

			expect(mapped.isSuccess).toBe(true);
			expect(mapped.value).toBe(10);
		});

		it('should pass through error in failed result', () => {
			const result = Result.fail<number>('error');
			const mapped = result.map((x) => x * 2);

			expect(mapped.isFailure).toBe(true);
			expect(mapped.error).toBe('error');
		});

		it('should allow type transformation', () => {
			const result = Result.ok(42);
			const mapped = result.map((x) => x.toString());

			expect(mapped.isSuccess).toBe(true);
			expect(mapped.value).toBe('42');
		});
	});

	describe('flatMap', () => {
		it('should chain successful results', () => {
			const result = Result.ok(10);
			const chained = result.flatMap((x) => {
				if (x > 5) {
					return Result.ok(`Value is ${x}`);
				}
				return Result.fail<string>('Too small');
			});

			expect(chained.isSuccess).toBe(true);
			expect(chained.value).toBe('Value is 10');
		});

		it('should return failure from inner result', () => {
			const result = Result.ok(3);
			const chained = result.flatMap((x) => {
				if (x > 5) {
					return Result.ok(`Value is ${x}`);
				}
				return Result.fail<string>('Too small');
			});

			expect(chained.isFailure).toBe(true);
			expect(chained.error).toBe('Too small');
		});

		it('should pass through outer failure', () => {
			const result = Result.fail<number>('outer error');
			const chained = result.flatMap((x) => Result.ok(x * 2));

			expect(chained.isFailure).toBe(true);
			expect(chained.error).toBe('outer error');
		});
	});
});
