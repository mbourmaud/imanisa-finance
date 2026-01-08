import type { Bank } from './Bank';
import type { UniqueId } from '@domain/shared/UniqueId';

export interface BankRepository {
	findById(id: UniqueId): Promise<Bank | null>;
	findByUserId(userId: UniqueId): Promise<Bank[]>;
	save(bank: Bank): Promise<void>;
	delete(id: UniqueId): Promise<void>;
}
