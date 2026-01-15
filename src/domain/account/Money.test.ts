import { describe, it, expect } from 'vitest';
import { Money } from './Money';

describe('Money', () => {
	describe('create', () => {
		it('should create Money with amount and default currency EUR', () => {
			const result = Money.create(100.50);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount).toBe(100.50);
			expect(result.value.currency).toBe('EUR');
		});

		it('should create Money with specified currency', () => {
			const result = Money.create(50, 'USD');

			expect(result.isSuccess).toBe(true);
			expect(result.value.currency).toBe('USD');
		});

		it('should normalize currency to uppercase', () => {
			const result = Money.create(100, 'eur');

			expect(result.isSuccess).toBe(true);
			expect(result.value.currency).toBe('EUR');
		});

		it('should trim currency whitespace', () => {
			const result = Money.create(100, '  USD  ');

			expect(result.isSuccess).toBe(true);
			expect(result.value.currency).toBe('USD');
		});

		it('should create Money with zero amount', () => {
			const result = Money.create(0);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount).toBe(0);
		});

		it('should create Money with negative amount', () => {
			const result = Money.create(-50.25);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount).toBe(-50.25);
		});

		it('should fail for NaN amount', () => {
			const result = Money.create(NaN);

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Amount must be a valid number');
		});

		it('should fail for invalid currency length', () => {
			const result = Money.create(100, 'EU');

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Currency must be a 3-letter code');
		});

		it('should fail for too long currency', () => {
			const result = Money.create(100, 'EURO');

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Currency must be a 3-letter code');
		});
	});

	describe('getters', () => {
		it('should return amount', () => {
			const money = Money.create(100.50).value;

			expect(money.amount).toBe(100.50);
		});

		it('should return currency', () => {
			const money = Money.create(100, 'USD').value;

			expect(money.currency).toBe('USD');
		});
	});

	describe('add', () => {
		it('should add two Money objects with same currency', () => {
			const money1 = Money.create(100).value;
			const money2 = Money.create(50).value;
			const result = money1.add(money2);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount).toBe(150);
			expect(result.value.currency).toBe('EUR');
		});

		it('should add negative amounts', () => {
			const money1 = Money.create(100).value;
			const money2 = Money.create(-30).value;
			const result = money1.add(money2);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount).toBe(70);
		});

		it('should fail when adding different currencies', () => {
			const money1 = Money.create(100, 'EUR').value;
			const money2 = Money.create(50, 'USD').value;
			const result = money1.add(money2);

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Cannot add money with different currencies');
		});
	});

	describe('subtract', () => {
		it('should subtract two Money objects with same currency', () => {
			const money1 = Money.create(100).value;
			const money2 = Money.create(30).value;
			const result = money1.subtract(money2);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount).toBe(70);
		});

		it('should handle resulting negative amount', () => {
			const money1 = Money.create(30).value;
			const money2 = Money.create(100).value;
			const result = money1.subtract(money2);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount).toBe(-70);
		});

		it('should fail when subtracting different currencies', () => {
			const money1 = Money.create(100, 'EUR').value;
			const money2 = Money.create(50, 'USD').value;
			const result = money1.subtract(money2);

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Cannot subtract money with different currencies');
		});
	});

	describe('multiply', () => {
		it('should multiply Money by positive factor', () => {
			const money = Money.create(100).value;
			const result = money.multiply(2.5);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount).toBe(250);
		});

		it('should multiply by zero', () => {
			const money = Money.create(100).value;
			const result = money.multiply(0);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount).toBe(0);
		});

		it('should multiply by negative factor', () => {
			const money = Money.create(100).value;
			const result = money.multiply(-1);

			expect(result.isSuccess).toBe(true);
			expect(result.value.amount).toBe(-100);
		});

		it('should preserve currency', () => {
			const money = Money.create(100, 'USD').value;
			const result = money.multiply(2);

			expect(result.value.currency).toBe('USD');
		});
	});

	describe('format', () => {
		it('should format EUR currency in French locale', () => {
			const money = Money.create(1234.56).value;
			const formatted = money.format();

			// Should contain the amount and currency symbol
			expect(formatted).toContain('1');
			expect(formatted).toContain('234');
			expect(formatted).toContain('56');
			expect(formatted).toContain('€');
		});

		it('should format USD currency', () => {
			const money = Money.create(1000, 'USD').value;
			const formatted = money.format();

			expect(formatted).toContain('1');
			expect(formatted).toContain('000');
			expect(formatted).toContain('$');
		});

		it('should format negative amounts', () => {
			const money = Money.create(-500).value;
			const formatted = money.format();

			expect(formatted).toContain('500');
			expect(formatted).toContain('-');
		});
	});

	describe('value object equality', () => {
		it('should equal Money with same amount and currency', () => {
			const money1 = Money.create(100, 'EUR').value;
			const money2 = Money.create(100, 'EUR').value;

			expect(money1.equals(money2)).toBe(true);
		});

		it('should not equal Money with different amount', () => {
			const money1 = Money.create(100, 'EUR').value;
			const money2 = Money.create(200, 'EUR').value;

			expect(money1.equals(money2)).toBe(false);
		});

		it('should not equal Money with different currency', () => {
			const money1 = Money.create(100, 'EUR').value;
			const money2 = Money.create(100, 'USD').value;

			expect(money1.equals(money2)).toBe(false);
		});
	});
});
