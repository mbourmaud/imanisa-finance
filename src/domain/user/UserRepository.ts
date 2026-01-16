import type { UniqueId } from '@domain/shared/UniqueId';
import type { Email } from './Email';
import type { User } from './User';

export interface UserRepository {
	findById(id: UniqueId): Promise<User | null>;
	findByEmail(email: Email): Promise<User | null>;
	save(user: User): Promise<void>;
	delete(id: UniqueId): Promise<void>;
}
