import type { AccountRepository } from '@domain/account/AccountRepository';
import type { Account } from '@domain/account/Account';
import type { UniqueId } from '@domain/shared/UniqueId';

export class InMemoryAccountRepository implements AccountRepository {
	private accounts: Map<string, Account> = new Map();

	async findById(id: UniqueId): Promise<Account | null> {
		return this.accounts.get(id.toString()) ?? null;
	}

	async findByBankId(bankId: UniqueId): Promise<Account[]> {
		const result: Account[] = [];
		for (const account of this.accounts.values()) {
			if (account.bankId.toString() === bankId.toString()) {
				result.push(account);
			}
		}
		return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	}

	async save(account: Account): Promise<void> {
		this.accounts.set(account.id.toString(), account);
	}

	async delete(id: UniqueId): Promise<void> {
		this.accounts.delete(id.toString());
	}

	deleteByBankId(bankId: UniqueId): void {
		for (const [id, account] of this.accounts.entries()) {
			if (account.bankId.toString() === bankId.toString()) {
				this.accounts.delete(id);
			}
		}
	}

	clear(): void {
		this.accounts.clear();
	}

	getAll(): Account[] {
		return Array.from(this.accounts.values());
	}
}
