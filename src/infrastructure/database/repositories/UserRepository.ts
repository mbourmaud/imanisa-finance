import type { UserRepository } from '@domain/user/UserRepository';
import type { User } from '@domain/user/User';
import type { Email } from '@domain/user/Email';
import { User as UserEntity } from '@domain/user/User';
import { UniqueId } from '@domain/shared/UniqueId';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../drizzle';

export class UserRepositoryImpl implements UserRepository {
	async findById(id: UniqueId): Promise<User | null> {
		const db = getDb();
		const result = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.id, id.toString()))
			.limit(1);

		const row = result[0];
		if (!row) return null;
		return this.toDomain(row);
	}

	async findByEmail(email: Email): Promise<User | null> {
		const db = getDb();
		const result = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, email.value))
			.limit(1);

		const row = result[0];
		if (!row) return null;
		return this.toDomain(row);
	}

	async save(user: User): Promise<void> {
		const db = getDb();
		await db
			.insert(schema.users)
			.values({
				id: user.id.toString(),
				email: user.email.value,
				name: user.name,
				avatarUrl: user.avatarUrl,
				createdAt: user.createdAt.toISOString()
			})
			.onConflictDoUpdate({
				target: schema.users.id,
				set: {
					email: user.email.value,
					name: user.name,
					avatarUrl: user.avatarUrl
				}
			});
	}

	async delete(id: UniqueId): Promise<void> {
		const db = getDb();
		await db.delete(schema.users).where(eq(schema.users.id, id.toString()));
	}

	private toDomain(row: typeof schema.users.$inferSelect): User | null {
		const result = UserEntity.reconstitute(
			{
				email: row.email,
				name: row.name,
				avatarUrl: row.avatarUrl,
				createdAt: new Date(row.createdAt)
			},
			UniqueId.fromString(row.id)
		);
		return result.isSuccess ? result.value : null;
	}
}
