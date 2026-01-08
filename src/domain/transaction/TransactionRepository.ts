import type { Transaction } from './Transaction';
import type { UniqueId } from '@domain/shared/UniqueId';

export interface TransactionRepository {
	findById(id: UniqueId): Promise<Transaction | null>;
	findByAccountId(accountId: UniqueId): Promise<Transaction[]>;
	findByAccountIdAndDateRange(accountId: UniqueId, startDate: Date, endDate: Date): Promise<Transaction[]>;
	saveMany(transactions: Transaction[]): Promise<void>;
	save(transaction: Transaction): Promise<void>;
	delete(id: UniqueId): Promise<void>;
	deleteByAccountId(accountId: UniqueId): Promise<void>;
}
