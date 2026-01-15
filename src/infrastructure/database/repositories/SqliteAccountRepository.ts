import type { AccountRepository } from '@domain/account/AccountRepository';
import type { Account } from '@domain/account/Account';
import { Account as AccountEntity } from '@domain/account/Account';
import { AccountType } from '@domain/account/AccountType';
import { AssetCategory } from '@domain/account/AssetCategory';
import { UniqueId } from '@domain/shared/UniqueId';
import { eq, desc } from 'drizzle-orm';
import { getDb, schema } from '../drizzle';

export class SqliteAccountRepository implements AccountRepository {
	async findById(id: UniqueId): Promise<Account | null> {
		const db = getDb();
		const result = await db
			.select()
			.from(schema.accounts)
			.where(eq(schema.accounts.id, id.toString()))
			.limit(1);

		const row = result[0];
		if (!row) return null;
		return this.toDomain(row);
	}

	async findByBankId(bankId: UniqueId): Promise<Account[]> {
		const db = getDb();
		const result = await db
			.select()
			.from(schema.accounts)
			.where(eq(schema.accounts.bankId, bankId.toString()))
			.orderBy(desc(schema.accounts.createdAt));

		return result
			.map((row) => this.toDomain(row))
			.filter((account): account is Account => account !== null);
	}

	async save(account: Account): Promise<void> {
		const db = getDb();
		await db
			.insert(schema.accounts)
			.values({
				id: account.id.toString(),
				bankId: account.bankId.toString(),
				name: account.name,
				type: account.type,
				assetCategory: account.assetCategory,
				balance: account.balance.amount,
				currency: account.balance.currency,
				createdAt: account.createdAt.toISOString(),
				updatedAt: account.updatedAt.toISOString()
			})
			.onConflictDoUpdate({
				target: schema.accounts.id,
				set: {
					name: account.name,
					type: account.type,
					assetCategory: account.assetCategory,
					balance: account.balance.amount,
					currency: account.balance.currency,
					updatedAt: account.updatedAt.toISOString()
				}
			});
	}

	async delete(id: UniqueId): Promise<void> {
		const db = getDb();
		await db.delete(schema.accounts).where(eq(schema.accounts.id, id.toString()));
	}

	private toDomain(row: typeof schema.accounts.$inferSelect): Account | null {
		const result = AccountEntity.reconstitute(
			{
				bankId: UniqueId.fromString(row.bankId),
				name: row.name,
				type: row.type as AccountType,
				assetCategory: (row.assetCategory as AssetCategory) ?? AccountEntity.getDefaultAssetCategory(row.type as AccountType),
				balance: row.balance,
				currency: row.currency,
				createdAt: new Date(row.createdAt),
				updatedAt: new Date(row.updatedAt)
			},
			UniqueId.fromString(row.id)
		);
		return result.isSuccess ? result.value : null;
	}
}
