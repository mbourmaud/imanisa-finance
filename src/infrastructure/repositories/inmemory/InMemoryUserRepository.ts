import type { UserRepository } from '@domain/user/UserRepository';
import type { User } from '@domain/user/User';
import type { Email } from '@domain/user/Email';
import type { UniqueId } from '@domain/shared/UniqueId';

export class InMemoryUserRepository implements UserRepository {
	private users: Map<string, User> = new Map();

	async findById(id: UniqueId): Promise<User | null> {
		return this.users.get(id.toString()) ?? null;
	}

	async findByEmail(email: Email): Promise<User | null> {
		for (const user of this.users.values()) {
			if (user.email.value === email.value) {
				return user;
			}
		}
		return null;
	}

	async save(user: User): Promise<void> {
		this.users.set(user.id.toString(), user);
	}

	async delete(id: UniqueId): Promise<void> {
		this.users.delete(id.toString());
	}

	clear(): void {
		this.users.clear();
	}

	getAll(): User[] {
		return Array.from(this.users.values());
	}
}
