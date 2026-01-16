import { Bank } from '@domain/bank/Bank';
import type { BankRepository as IBankRepository } from '@domain/bank/BankRepository';
import { BankTemplate } from '@domain/bank/BankTemplate';
import { UniqueId } from '@domain/shared/UniqueId';
import { prisma } from '@/lib/prisma';

export class BankRepository implements IBankRepository {
	async findById(id: UniqueId): Promise<Bank | null> {
		const record = await prisma.bank.findUnique({
			where: { id: id.toString() },
		});

		if (!record) {
			return null;
		}

		return this.mapToDomain(record);
	}

	async findByUserId(userId: UniqueId): Promise<Bank[]> {
		const records = await prisma.bank.findMany({
			where: { userId: userId.toString() },
			orderBy: { createdAt: 'desc' },
		});

		return records.map((record) => this.mapToDomain(record));
	}

	async save(bank: Bank): Promise<void> {
		await prisma.bank.upsert({
			where: { id: bank.id.toString() },
			update: {
				name: bank.name,
				template: bank.template,
			},
			create: {
				id: bank.id.toString(),
				userId: bank.userId.toString(),
				name: bank.name,
				template: bank.template,
				createdAt: bank.createdAt,
			},
		});
	}

	async delete(id: UniqueId): Promise<void> {
		await prisma.bank.delete({
			where: { id: id.toString() },
		});
	}

	private mapToDomain(record: {
		id: string;
		userId: string;
		name: string;
		template: string | null;
		createdAt: Date;
	}): Bank {
		const template = (record.template || BankTemplate.OTHER) as BankTemplate;

		const result = Bank.reconstitute(
			{
				userId: UniqueId.fromString(record.userId),
				name: record.name,
				template,
				createdAt: record.createdAt,
			},
			UniqueId.fromString(record.id),
		);

		if (result.isFailure) {
			throw new Error(`Failed to reconstitute Bank: ${result.error}`);
		}

		return result.value;
	}
}
