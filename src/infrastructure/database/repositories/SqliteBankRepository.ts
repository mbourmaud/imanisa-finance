import type { BankRepository } from '@domain/bank/BankRepository';
import type { Bank } from '@domain/bank/Bank';
import { Bank as BankEntity } from '@domain/bank/Bank';
import { BankTemplate } from '@domain/bank/BankTemplate';
import { UniqueId } from '@domain/shared/UniqueId';
import { execute } from '../turso';

interface BankRow {
	id: string;
	user_id: string;
	name: string;
	template: string;
	created_at: string;
}

export class SqliteBankRepository implements BankRepository {
	async findById(id: UniqueId): Promise<Bank | null> {
		const result = await execute('SELECT * FROM banks WHERE id = ?', [id.toString()]);
		const row = result.rows[0] as unknown as BankRow | undefined;

		if (!row) return null;
		return this.toDomain(row);
	}

	async findByUserId(userId: UniqueId): Promise<Bank[]> {
		const result = await execute(
			'SELECT * FROM banks WHERE user_id = ? ORDER BY created_at DESC',
			[userId.toString()]
		);

		return (result.rows as unknown as BankRow[])
			.map((row) => this.toDomain(row))
			.filter((bank): bank is Bank => bank !== null);
	}

	async save(bank: Bank): Promise<void> {
		await execute(
			`INSERT INTO banks (id, user_id, name, template, created_at)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				name = excluded.name,
				template = excluded.template`,
			[
				bank.id.toString(),
				bank.userId.toString(),
				bank.name,
				bank.template,
				bank.createdAt.toISOString()
			]
		);
	}

	async delete(id: UniqueId): Promise<void> {
		await execute('DELETE FROM banks WHERE id = ?', [id.toString()]);
	}

	private toDomain(row: BankRow): Bank | null {
		const result = BankEntity.reconstitute(
			{
				userId: UniqueId.fromString(row.user_id),
				name: row.name,
				template: row.template as BankTemplate,
				createdAt: new Date(row.created_at)
			},
			UniqueId.fromString(row.id)
		);
		return result.isSuccess ? result.value : null;
	}
}
