import type { TransactionRepository } from '@domain/transaction/TransactionRepository';
import type { Transaction } from '@domain/transaction/Transaction';
import { Transaction as TransactionEntity } from '@domain/transaction/Transaction';
import { TransactionType } from '@domain/transaction/TransactionType';
import { TransactionCategory } from '@domain/transaction/TransactionCategory';
import { UniqueId } from '@domain/shared/UniqueId';
import { getDatabase } from '../connection';

interface TransactionRow {
	id: string;
	account_id: string;
	type: string;
	amount: number;
	currency: string;
	description: string;
	date: string;
	category: string | null;
	imported_at: string;
}

export class SqliteTransactionRepository implements TransactionRepository {
	async findById(id: UniqueId): Promise<Transaction | null> {
		const db = getDatabase();
		const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id.toString()) as TransactionRow | undefined;
		
		if (!row) return null;
		return this.toDomain(row);
	}

	async findByAccountId(accountId: UniqueId): Promise<Transaction[]> {
		const db = getDatabase();
		const rows = db.prepare('SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC').all(accountId.toString()) as TransactionRow[];
		
		return rows.map((row) => this.toDomain(row)).filter((tx): tx is Transaction => tx !== null);
	}

	async findByAccountIdAndDateRange(accountId: UniqueId, startDate: Date, endDate: Date): Promise<Transaction[]> {
		const db = getDatabase();
		const rows = db.prepare(`
			SELECT * FROM transactions 
			WHERE account_id = ? AND date >= ? AND date <= ?
			ORDER BY date DESC
		`).all(accountId.toString(), startDate.toISOString(), endDate.toISOString()) as TransactionRow[];
		
		return rows.map((row) => this.toDomain(row)).filter((tx): tx is Transaction => tx !== null);
	}

	async saveMany(transactions: Transaction[]): Promise<void> {
		const db = getDatabase();
		const stmt = db.prepare(`
			INSERT INTO transactions (id, account_id, type, amount, currency, description, date, category, imported_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				type = excluded.type,
				amount = excluded.amount,
				currency = excluded.currency,
				description = excluded.description,
				date = excluded.date,
				category = excluded.category
		`);

		const insertMany = db.transaction((txs: Transaction[]) => {
			for (const tx of txs) {
				stmt.run(
					tx.id.toString(),
					tx.accountId.toString(),
					tx.type,
					tx.amount.amount,
					tx.amount.currency,
					tx.description,
					tx.date.toISOString(),
					tx.category,
					tx.importedAt.toISOString()
				);
			}
		});

		insertMany(transactions);
	}

	async save(transaction: Transaction): Promise<void> {
		await this.saveMany([transaction]);
	}

	async delete(id: UniqueId): Promise<void> {
		const db = getDatabase();
		db.prepare('DELETE FROM transactions WHERE id = ?').run(id.toString());
	}

	async deleteByAccountId(accountId: UniqueId): Promise<void> {
		const db = getDatabase();
		db.prepare('DELETE FROM transactions WHERE account_id = ?').run(accountId.toString());
	}

	private toDomain(row: TransactionRow): Transaction | null {
		const result = TransactionEntity.reconstitute(
			{
				accountId: UniqueId.fromString(row.account_id),
				type: row.type as TransactionType,
				amount: row.amount,
				currency: row.currency,
				description: row.description,
				date: new Date(row.date),
				category: row.category as TransactionCategory | null,
				importedAt: new Date(row.imported_at)
			},
			UniqueId.fromString(row.id)
		);
		return result.isSuccess ? result.value : null;
	}
}
