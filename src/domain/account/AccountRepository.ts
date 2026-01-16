import type { UniqueId } from '@domain/shared/UniqueId';
import type { Account } from './Account';

export interface AccountRepository {
	findById(id: UniqueId): Promise<Account | null>;
	findByBankId(bankId: UniqueId): Promise<Account[]>;
	save(account: Account): Promise<void>;
	delete(id: UniqueId): Promise<void>;
}
