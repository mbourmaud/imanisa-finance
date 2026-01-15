import { describe, it, expect } from 'vitest';
import { Email } from './Email';

describe('Email', () => {
	describe('create', () => {
		it('should create valid email', () => {
			const result = Email.create('test@example.com');

			expect(result.isSuccess).toBe(true);
			expect(result.value.value).toBe('test@example.com');
		});

		it('should normalize to lowercase', () => {
			const result = Email.create('TEST@EXAMPLE.COM');

			expect(result.isSuccess).toBe(true);
			expect(result.value.value).toBe('test@example.com');
		});

		it('should trim whitespace', () => {
			const result = Email.create('  user@domain.com  ');

			expect(result.isSuccess).toBe(true);
			expect(result.value.value).toBe('user@domain.com');
		});

		it('should accept valid email formats', () => {
			const validEmails = [
				'simple@example.com',
				'user.name@example.com',
				'user+tag@example.com',
				'user123@example.co.uk'
			];

			validEmails.forEach((email) => {
				const result = Email.create(email);
				expect(result.isSuccess).toBe(true);
			});
		});

		it('should fail for email without @', () => {
			const result = Email.create('invalidemail.com');

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid email format');
		});

		it('should fail for email without domain', () => {
			const result = Email.create('user@');

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid email format');
		});

		it('should fail for email without local part', () => {
			const result = Email.create('@example.com');

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid email format');
		});

		it('should fail for email without TLD', () => {
			const result = Email.create('user@domain');

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid email format');
		});

		it('should fail for email with spaces', () => {
			const result = Email.create('user name@example.com');

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid email format');
		});

		it('should fail for empty string', () => {
			const result = Email.create('');

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid email format');
		});
	});

	describe('value getter', () => {
		it('should return the email value', () => {
			const email = Email.create('test@example.com').value;

			expect(email.value).toBe('test@example.com');
		});
	});

	describe('value object equality', () => {
		it('should equal Email with same value', () => {
			const email1 = Email.create('test@example.com').value;
			const email2 = Email.create('TEST@EXAMPLE.COM').value;

			expect(email1.equals(email2)).toBe(true);
		});

		it('should not equal Email with different value', () => {
			const email1 = Email.create('user1@example.com').value;
			const email2 = Email.create('user2@example.com').value;

			expect(email1.equals(email2)).toBe(false);
		});
	});
});
