import type { AccountRepository } from '@domain/account/AccountRepository';
import type { Account } from '@domain/account/Account';
import { Account as AccountEntity } from '@domain/account/Account';
import { AccountType } from '@domain/account/AccountType';
import { AssetCategory } from '@domain/account/AssetCategory';
import { UniqueId } from '@domain/shared/UniqueId';
import { execute } from '../turso';

interface AccountRow {
	id: string;
	bank_id: string;
	name: string;
	type: string;
	asset_category: string;
	balance: number;
	currency: string;
	created_at: string;
	updated_at: string;
}

export class SqliteAccountRepository implements AccountRepository {
	async findById(id: UniqueId): Promise<Account | null> {
		const result = await execute('SELECT * FROM accounts WHERE id = ?', [id.toString()]);
		const row = result.rows[0] as unknown as AccountRow | undefined;

		if (!row) return null;
		return this.toDomain(row);
	}

	async findByBankId(bankId: UniqueId): Promise<Account[]> {
		const result = await execute(
			'SELECT * FROM accounts WHERE bank_id = ? ORDER BY created_at DESC',
			[bankId.toString()]
		);

		return (result.rows as unknown as AccountRow[])
			.map((row) => this.toDomain(row))
			.filter((account): account is Account => account !== null);
	}

	async save(account: Account): Promise<void> {
		await execute(
			`INSERT INTO accounts (id, bank_id, name, type, asset_category, balance, currency, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				name = excluded.name,
				type = excluded.type,
				asset_category = excluded.asset_category,
				balance = excluded.balance,
				currency = excluded.currency,
				updated_at = excluded.updated_at`,
			[
				account.id.toString(),
				account.bankId.toString(),
				account.name,
				account.type,
				account.assetCategory,
				account.balance.amount,
				account.balance.currency,
				account.createdAt.toISOString(),
				account.updatedAt.toISOString()
			]
		);
	}

	async delete(id: UniqueId): Promise<void> {
		await execute('DELETE FROM accounts WHERE id = ?', [id.toString()]);
	}

	private toDomain(row: AccountRow): Account | null {
		const result = AccountEntity.reconstitute(
			{
				bankId: UniqueId.fromString(row.bank_id),
				name: row.name,
				type: row.type as AccountType,
				assetCategory: (row.asset_category as AssetCategory) ?? AccountEntity.getDefaultAssetCategory(row.type as AccountType),
				balance: row.balance,
				currency: row.currency,
				createdAt: new Date(row.created_at),
				updatedAt: new Date(row.updated_at)
			},
			UniqueId.fromString(row.id)
		);
		return result.isSuccess ? result.value : null;
	}
}
