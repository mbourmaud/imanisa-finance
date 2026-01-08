import type { User } from './User';
import type { Email } from './Email';
import type { UniqueId } from '@domain/shared/UniqueId';

export interface UserRepository {
	findById(id: UniqueId): Promise<User | null>;
	findByEmail(email: Email): Promise<User | null>;
	save(user: User): Promise<void>;
	delete(id: UniqueId): Promise<void>;
}
