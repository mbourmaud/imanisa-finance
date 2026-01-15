import type { BankRepository } from '@domain/bank/BankRepository';
import type { Bank } from '@domain/bank/Bank';
import { Bank as BankEntity } from '@domain/bank/Bank';
import { BankTemplate } from '@domain/bank/BankTemplate';
import { UniqueId } from '@domain/shared/UniqueId';
import { eq, desc } from 'drizzle-orm';
import { getDb, schema } from '../drizzle';

export class SqliteBankRepository implements BankRepository {
	async findById(id: UniqueId): Promise<Bank | null> {
		const db = getDb();
		const result = await db
			.select()
			.from(schema.banks)
			.where(eq(schema.banks.id, id.toString()))
			.limit(1);

		const row = result[0];
		if (!row) return null;
		return this.toDomain(row);
	}

	async findByUserId(userId: UniqueId): Promise<Bank[]> {
		const db = getDb();
		const result = await db
			.select()
			.from(schema.banks)
			.where(eq(schema.banks.userId, userId.toString()))
			.orderBy(desc(schema.banks.createdAt));

		return result
			.map((row) => this.toDomain(row))
			.filter((bank): bank is Bank => bank !== null);
	}

	async save(bank: Bank): Promise<void> {
		const db = getDb();
		await db
			.insert(schema.banks)
			.values({
				id: bank.id.toString(),
				userId: bank.userId.toString(),
				name: bank.name,
				template: bank.template,
				createdAt: bank.createdAt.toISOString()
			})
			.onConflictDoUpdate({
				target: schema.banks.id,
				set: {
					name: bank.name,
					template: bank.template
				}
			});
	}

	async delete(id: UniqueId): Promise<void> {
		const db = getDb();
		await db.delete(schema.banks).where(eq(schema.banks.id, id.toString()));
	}

	private toDomain(row: typeof schema.banks.$inferSelect): Bank | null {
		const result = BankEntity.reconstitute(
			{
				userId: UniqueId.fromString(row.userId),
				name: row.name,
				template: row.template as BankTemplate,
				createdAt: new Date(row.createdAt)
			},
			UniqueId.fromString(row.id)
		);
		return result.isSuccess ? result.value : null;
	}
}
