import { describe, it, expect } from 'vitest';
import { User } from './User';
import { UniqueId } from '@domain/shared/UniqueId';

describe('User', () => {
	describe('create', () => {
		it('should create a valid user', () => {
			const result = User.create({
				email: 'test@example.com',
				name: 'John Doe'
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.name).toBe('John Doe');
			expect(result.value.email.value).toBe('test@example.com');
		});

		it('should create user with avatar URL', () => {
			const result = User.create({
				email: 'user@example.com',
				name: 'Jane Doe',
				avatarUrl: 'https://example.com/avatar.jpg'
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.avatarUrl).toBe('https://example.com/avatar.jpg');
		});

		it('should create user without avatar URL', () => {
			const result = User.create({
				email: 'user@example.com',
				name: 'No Avatar'
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.avatarUrl).toBeNull();
		});

		it('should trim user name', () => {
			const result = User.create({
				email: 'user@example.com',
				name: '  Trimmed Name  '
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.name).toBe('Trimmed Name');
		});

		it('should use provided id', () => {
			const customId = UniqueId.fromString('user-custom');
			const result = User.create(
				{
					email: 'user@example.com',
					name: 'Test User'
				},
				customId
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('user-custom');
		});

		it('should set createdAt date', () => {
			const result = User.create({
				email: 'user@example.com',
				name: 'Test'
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.createdAt).toBeInstanceOf(Date);
		});

		it('should fail with invalid email', () => {
			const result = User.create({
				email: 'invalid-email',
				name: 'Test User'
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid email format');
		});

		it('should fail with empty name', () => {
			const result = User.create({
				email: 'user@example.com',
				name: ''
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Name is required');
		});

		it('should fail with whitespace-only name', () => {
			const result = User.create({
				email: 'user@example.com',
				name: '   '
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Name is required');
		});
	});

	describe('reconstitute', () => {
		it('should reconstitute user from persistence data', () => {
			const id = UniqueId.fromString('user-456');
			const createdAt = new Date('2024-01-01');

			const result = User.reconstitute(
				{
					email: 'restored@example.com',
					name: 'Restored User',
					avatarUrl: 'https://example.com/avatar.png',
					createdAt
				},
				id
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('user-456');
			expect(result.value.name).toBe('Restored User');
			expect(result.value.email.value).toBe('restored@example.com');
			expect(result.value.avatarUrl).toBe('https://example.com/avatar.png');
			expect(result.value.createdAt).toBe(createdAt);
		});

		it('should reconstitute user with null avatar', () => {
			const result = User.reconstitute(
				{
					email: 'user@example.com',
					name: 'No Avatar',
					avatarUrl: null,
					createdAt: new Date()
				},
				UniqueId.fromString('no-avatar')
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.avatarUrl).toBeNull();
		});

		it('should fail reconstitution with invalid email', () => {
			const result = User.reconstitute(
				{
					email: 'invalid',
					name: 'Test',
					avatarUrl: null,
					createdAt: new Date()
				},
				UniqueId.fromString('test')
			);

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid email format');
		});
	});

	describe('getters', () => {
		it('should return email', () => {
			const user = User.create({
				email: 'test@example.com',
				name: 'Test'
			}).value;

			expect(user.email.value).toBe('test@example.com');
		});

		it('should return name', () => {
			const user = User.create({
				email: 'test@example.com',
				name: 'Test User'
			}).value;

			expect(user.name).toBe('Test User');
		});

		it('should return avatarUrl', () => {
			const user = User.create({
				email: 'test@example.com',
				name: 'Test',
				avatarUrl: 'https://example.com/img.jpg'
			}).value;

			expect(user.avatarUrl).toBe('https://example.com/img.jpg');
		});

		it('should return createdAt', () => {
			const user = User.create({
				email: 'test@example.com',
				name: 'Test'
			}).value;

			expect(user.createdAt).toBeInstanceOf(Date);
		});
	});

	describe('entity equality', () => {
		it('should be equal if same id', () => {
			const id = UniqueId.fromString('same-user-id');
			const user1 = User.create(
				{ email: 'user1@example.com', name: 'User 1' },
				id
			).value;
			const user2 = User.create(
				{ email: 'user2@example.com', name: 'User 2' },
				id
			).value;

			expect(user1.equals(user2)).toBe(true);
		});

		it('should not be equal if different ids', () => {
			const user1 = User.create(
				{ email: 'user@example.com', name: 'User' },
				UniqueId.fromString('id-1')
			).value;
			const user2 = User.create(
				{ email: 'user@example.com', name: 'User' },
				UniqueId.fromString('id-2')
			).value;

			expect(user1.equals(user2)).toBe(false);
		});
	});
});
