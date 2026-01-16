import type { TransactionRepository } from '@domain/transaction/TransactionRepository';
import type { Transaction } from '@domain/transaction/Transaction';
import { Transaction as TransactionEntity } from '@domain/transaction/Transaction';
import { TransactionType } from '@domain/transaction/TransactionType';
import { TransactionCategory } from '@domain/transaction/TransactionCategory';
import { UniqueId } from '@domain/shared/UniqueId';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { getDb, schema } from '../drizzle';

export class TransactionRepositoryImpl implements TransactionRepository {
	async findById(id: UniqueId): Promise<Transaction | null> {
		const db = await getDb();
		const result = await db
			.select()
			.from(schema.transactions)
			.where(eq(schema.transactions.id, id.toString()))
			.limit(1);

		const row = result[0];
		if (!row) return null;
		return this.toDomain(row);
	}

	async findByAccountId(accountId: UniqueId): Promise<Transaction[]> {
		const db = await getDb();
		const result = await db
			.select()
			.from(schema.transactions)
			.where(eq(schema.transactions.accountId, accountId.toString()))
			.orderBy(desc(schema.transactions.date));

		return result
			.map((row) => this.toDomain(row))
			.filter((tx): tx is Transaction => tx !== null);
	}

	async findByAccountIdAndDateRange(accountId: UniqueId, startDate: Date, endDate: Date): Promise<Transaction[]> {
		const db = await getDb();
		const result = await db
			.select()
			.from(schema.transactions)
			.where(
				and(
					eq(schema.transactions.accountId, accountId.toString()),
					gte(schema.transactions.date, startDate.toISOString()),
					lte(schema.transactions.date, endDate.toISOString())
				)
			)
			.orderBy(desc(schema.transactions.date));

		return result
			.map((row) => this.toDomain(row))
			.filter((tx): tx is Transaction => tx !== null);
	}

	async saveMany(transactions: Transaction[]): Promise<void> {
		if (transactions.length === 0) return;

		const db = await getDb();
		for (const tx of transactions) {
			// Store amount with sign: negative for expenses, positive for income
			const signedAmount =
				tx.type === TransactionType.EXPENSE ? -tx.amount.amount : tx.amount.amount;

			await db
				.insert(schema.transactions)
				.values({
					id: tx.id.toString(),
					accountId: tx.accountId.toString(),
					type: tx.type,
					amount: signedAmount,
					currency: tx.amount.currency,
					description: tx.description,
					date: tx.date.toISOString(),
					category: tx.category,
					importedAt: tx.importedAt.toISOString()
				})
				.onConflictDoUpdate({
					target: schema.transactions.id,
					set: {
						type: tx.type,
						amount: signedAmount,
						currency: tx.amount.currency,
						description: tx.description,
						date: tx.date.toISOString(),
						category: tx.category
					}
				});
		}
	}

	async save(transaction: Transaction): Promise<void> {
		await this.saveMany([transaction]);
	}

	async delete(id: UniqueId): Promise<void> {
		const db = await getDb();
		await db.delete(schema.transactions).where(eq(schema.transactions.id, id.toString()));
	}

	async deleteByAccountId(accountId: UniqueId): Promise<void> {
		const db = await getDb();
		await db.delete(schema.transactions).where(eq(schema.transactions.accountId, accountId.toString()));
	}

	private toDomain(row: typeof schema.transactions.$inferSelect): Transaction | null {
		// Determine type from sign if not stored, otherwise use stored type
		const type = row.type
			? (row.type as TransactionType)
			: row.amount >= 0
				? TransactionType.INCOME
				: TransactionType.EXPENSE;

		// Amount in domain is always positive (absolute value)
		const absoluteAmount = Math.abs(row.amount);

		const result = TransactionEntity.reconstitute(
			{
				accountId: UniqueId.fromString(row.accountId),
				type,
				amount: absoluteAmount,
				currency: row.currency,
				description: row.description,
				date: new Date(row.date),
				category: row.category as TransactionCategory | null,
				importedAt: new Date(row.importedAt)
			},
			UniqueId.fromString(row.id)
		);
		return result.isSuccess ? result.value : null;
	}
}
