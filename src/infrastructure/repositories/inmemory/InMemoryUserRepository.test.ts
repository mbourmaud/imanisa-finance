import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from './InMemoryUserRepository';
import { User } from '@domain/user/User';
import { Email } from '@domain/user/Email';
import { UniqueId } from '@domain/shared/UniqueId';

describe('InMemoryUserRepository', () => {
	let repository: InMemoryUserRepository;

	beforeEach(() => {
		repository = new InMemoryUserRepository();
	});

	const createTestUser = (overrides?: { email?: string; name?: string }) => {
		const user = User.create({
			email: overrides?.email ?? 'test@example.com',
			name: overrides?.name ?? 'Test User'
		});
		if (user.isFailure) throw new Error(`Invalid user: ${user.error}`);

		return user.value;
	};

	describe('save', () => {
		it('should save a new user', async () => {
			const user = createTestUser();

			await repository.save(user);

			const found = await repository.findById(user.id);
			expect(found).not.toBeNull();
			expect(found?.name).toBe('Test User');
		});

		it('should update an existing user', async () => {
			const user = createTestUser();
			await repository.save(user);

			// Simulate updating by saving with same ID
			const updatedUser = User.reconstitute(
				{
					email: user.email.value, // Email value is the string
					name: 'Updated Name',
					avatarUrl: null,
					createdAt: user.createdAt
				},
				user.id
			).value;

			await repository.save(updatedUser);

			const found = await repository.findById(user.id);
			expect(found?.name).toBe('Updated Name');
		});
	});

	describe('findById', () => {
		it('should return null for non-existent user', async () => {
			const found = await repository.findById(UniqueId.create());
			expect(found).toBeNull();
		});

		it('should find user by ID', async () => {
			const user = createTestUser();
			await repository.save(user);

			const found = await repository.findById(user.id);
			expect(found).not.toBeNull();
			expect(found?.id.equals(user.id)).toBe(true);
		});
	});

	describe('findByEmail', () => {
		it('should return null for non-existent email', async () => {
			const email = Email.create('nonexistent@example.com').value;
			const found = await repository.findByEmail(email);
			expect(found).toBeNull();
		});

		it('should find user by email', async () => {
			const user = createTestUser({ email: 'specific@example.com' });
			await repository.save(user);

			const email = Email.create('specific@example.com').value;
			const found = await repository.findByEmail(email);

			expect(found).not.toBeNull();
			expect(found?.email.equals(email)).toBe(true);
		});
	});

	describe('delete', () => {
		it('should delete user', async () => {
			const user = createTestUser();
			await repository.save(user);

			await repository.delete(user.id);

			const found = await repository.findById(user.id);
			expect(found).toBeNull();
		});

		it('should not throw when deleting non-existent user', async () => {
			await expect(repository.delete(UniqueId.create())).resolves.toBeUndefined();
		});
	});

	describe('clear', () => {
		it('should remove all users', async () => {
			await repository.save(createTestUser({ email: 'user1@example.com' }));
			await repository.save(createTestUser({ email: 'user2@example.com' }));

			repository.clear();

			expect(repository.getAll()).toHaveLength(0);
		});
	});

	describe('getAll', () => {
		it('should return all users', async () => {
			await repository.save(createTestUser({ email: 'user1@example.com' }));
			await repository.save(createTestUser({ email: 'user2@example.com' }));

			const all = repository.getAll();
			expect(all).toHaveLength(2);
		});

		it('should return empty array when no users', () => {
			expect(repository.getAll()).toHaveLength(0);
		});
	});
});
