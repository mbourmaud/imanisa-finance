import type { TransactionRepository } from '@domain/transaction/TransactionRepository';
import type { Transaction } from '@domain/transaction/Transaction';
import type { UniqueId } from '@domain/shared/UniqueId';

export class InMemoryTransactionRepository implements TransactionRepository {
	private transactions: Map<string, Transaction> = new Map();

	async findById(id: UniqueId): Promise<Transaction | null> {
		return this.transactions.get(id.toString()) ?? null;
	}

	async findByAccountId(accountId: UniqueId): Promise<Transaction[]> {
		const result: Transaction[] = [];
		for (const tx of this.transactions.values()) {
			if (tx.accountId.toString() === accountId.toString()) {
				result.push(tx);
			}
		}
		return result.sort((a, b) => b.date.getTime() - a.date.getTime());
	}

	async findByAccountIdAndDateRange(accountId: UniqueId, startDate: Date, endDate: Date): Promise<Transaction[]> {
		const result: Transaction[] = [];
		for (const tx of this.transactions.values()) {
			if (
				tx.accountId.toString() === accountId.toString() &&
				tx.date >= startDate &&
				tx.date <= endDate
			) {
				result.push(tx);
			}
		}
		return result.sort((a, b) => b.date.getTime() - a.date.getTime());
	}

	async saveMany(transactions: Transaction[]): Promise<void> {
		for (const tx of transactions) {
			this.transactions.set(tx.id.toString(), tx);
		}
	}

	async save(transaction: Transaction): Promise<void> {
		this.transactions.set(transaction.id.toString(), transaction);
	}

	async delete(id: UniqueId): Promise<void> {
		this.transactions.delete(id.toString());
	}

	async deleteByAccountId(accountId: UniqueId): Promise<void> {
		for (const [id, tx] of this.transactions.entries()) {
			if (tx.accountId.toString() === accountId.toString()) {
				this.transactions.delete(id);
			}
		}
	}

	clear(): void {
		this.transactions.clear();
	}

	getAll(): Transaction[] {
		return Array.from(this.transactions.values());
	}
}
