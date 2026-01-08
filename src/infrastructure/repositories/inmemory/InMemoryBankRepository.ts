import type { BankRepository } from '@domain/bank/BankRepository';
import type { Bank } from '@domain/bank/Bank';
import type { UniqueId } from '@domain/shared/UniqueId';

export class InMemoryBankRepository implements BankRepository {
	private banks: Map<string, Bank> = new Map();

	async findById(id: UniqueId): Promise<Bank | null> {
		return this.banks.get(id.toString()) ?? null;
	}

	async findByUserId(userId: UniqueId): Promise<Bank[]> {
		const result: Bank[] = [];
		for (const bank of this.banks.values()) {
			if (bank.userId.toString() === userId.toString()) {
				result.push(bank);
			}
		}
		return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	}

	async save(bank: Bank): Promise<void> {
		this.banks.set(bank.id.toString(), bank);
	}

	async delete(id: UniqueId): Promise<void> {
		this.banks.delete(id.toString());
	}

	clear(): void {
		this.banks.clear();
	}

	getAll(): Bank[] {
		return Array.from(this.banks.values());
	}
}
