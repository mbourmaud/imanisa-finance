import type { UserRepository } from '@domain/user/UserRepository';
import type { User } from '@domain/user/User';
import type { Email } from '@domain/user/Email';
import { User as UserEntity } from '@domain/user/User';
import { UniqueId } from '@domain/shared/UniqueId';
import { getDatabase } from '../connection';

interface UserRow {
	id: string;
	email: string;
	name: string;
	avatar_url: string | null;
	created_at: string;
}

export class SqliteUserRepository implements UserRepository {
	async findById(id: UniqueId): Promise<User | null> {
		const db = getDatabase();
		const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id.toString()) as UserRow | undefined;
		
		if (!row) return null;
		return this.toDomain(row);
	}

	async findByEmail(email: Email): Promise<User | null> {
		const db = getDatabase();
		const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.value) as UserRow | undefined;
		
		if (!row) return null;
		return this.toDomain(row);
	}

	async save(user: User): Promise<void> {
		const db = getDatabase();
		db.prepare(`
			INSERT INTO users (id, email, name, avatar_url, created_at)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				email = excluded.email,
				name = excluded.name,
				avatar_url = excluded.avatar_url
		`).run(
			user.id.toString(),
			user.email.value,
			user.name,
			user.avatarUrl,
			user.createdAt.toISOString()
		);
	}

	async delete(id: UniqueId): Promise<void> {
		const db = getDatabase();
		db.prepare('DELETE FROM users WHERE id = ?').run(id.toString());
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
