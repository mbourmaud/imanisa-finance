import type { Account } from './Account';
import type { UniqueId } from '@domain/shared/UniqueId';

export interface AccountRepository {
	findById(id: UniqueId): Promise<Account | null>;
	findByBankId(bankId: UniqueId): Promise<Account[]>;
	save(account: Account): Promise<void>;
	delete(id: UniqueId): Promise<void>;
}
