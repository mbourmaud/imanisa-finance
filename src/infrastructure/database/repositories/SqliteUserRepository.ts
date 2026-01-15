import type { UserRepository } from '@domain/user/UserRepository';
import type { User } from '@domain/user/User';
import type { Email } from '@domain/user/Email';
import { User as UserEntity } from '@domain/user/User';
import { UniqueId } from '@domain/shared/UniqueId';
import { execute } from '../turso';

interface UserRow {
	id: string;
	email: string;
	name: string;
	avatar_url: string | null;
	created_at: string;
}

export class SqliteUserRepository implements UserRepository {
	async findById(id: UniqueId): Promise<User | null> {
		const result = await execute('SELECT * FROM users WHERE id = ?', [id.toString()]);
		const row = result.rows[0] as unknown as UserRow | undefined;

		if (!row) return null;
		return this.toDomain(row);
	}

	async findByEmail(email: Email): Promise<User | null> {
		const result = await execute('SELECT * FROM users WHERE email = ?', [email.value]);
		const row = result.rows[0] as unknown as UserRow | undefined;

		if (!row) return null;
		return this.toDomain(row);
	}

	async save(user: User): Promise<void> {
		await execute(
			`INSERT INTO users (id, email, name, avatar_url, created_at)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				email = excluded.email,
				name = excluded.name,
				avatar_url = excluded.avatar_url`,
			[
				user.id.toString(),
				user.email.value,
				user.name,
				user.avatarUrl,
				user.createdAt.toISOString()
			]
		);
	}

	async delete(id: UniqueId): Promise<void> {
		await execute('DELETE FROM users WHERE id = ?', [id.toString()]);
	}

	private toDomain(row: UserRow): User | null {
		const result = UserEntity.reconstitute(
			{
				email: row.email,
				name: row.name,
				avatarUrl: row.avatar_url,
				createdAt: new Date(row.created_at)
			},
			UniqueId.fromString(row.id)
		);
		return result.isSuccess ? result.value : null;
	}
}
