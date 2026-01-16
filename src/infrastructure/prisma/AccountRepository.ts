import { Account } from '@domain/account/Account';
import type { AccountRepository as IAccountRepository } from '@domain/account/AccountRepository';
import { AccountType } from '@domain/account/AccountType';
import type { AssetCategory } from '@domain/account/AssetCategory';
import { UniqueId } from '@domain/shared/UniqueId';
import { AccountType as PrismaAccountType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class AccountRepository implements IAccountRepository {
	async findById(id: UniqueId): Promise<Account | null> {
		const record = await prisma.account.findUnique({
			where: { id: id.toString() },
		});

		if (!record) {
			return null;
		}

		return this.mapToDomain(record);
	}

	async findByBankId(bankId: UniqueId): Promise<Account[]> {
		const records = await prisma.account.findMany({
			where: { bankId: bankId.toString() },
			orderBy: { createdAt: 'asc' },
		});

		return records.map((record) => this.mapToDomain(record));
	}

	async save(account: Account): Promise<void> {
		const prismaType = this.mapAccountTypeToPrisma(account.type);

		await prisma.account.upsert({
			where: { id: account.id.toString() },
			update: {
				name: account.name,
				type: prismaType,
				assetCategory: account.assetCategory,
				balance: account.balance.amount,
				currency: account.balance.currency,
				updatedAt: new Date(),
			},
			create: {
				id: account.id.toString(),
				bankId: account.bankId.toString(),
				name: account.name,
				type: prismaType,
				assetCategory: account.assetCategory,
				balance: account.balance.amount,
				currency: account.balance.currency,
				createdAt: account.createdAt,
				updatedAt: account.updatedAt,
			},
		});
	}

	async delete(id: UniqueId): Promise<void> {
		await prisma.account.delete({
			where: { id: id.toString() },
		});
	}

	private mapToDomain(record: {
		id: string;
		bankId: string;
		name: string;
		type: string;
		assetCategory: string | null;
		balance: number;
		currency: string;
		createdAt: Date;
		updatedAt: Date;
	}): Account {
		const accountType = this.mapAccountTypeFromPrisma(record.type);
		const assetCategory =
			(record.assetCategory as AssetCategory) || Account.getDefaultAssetCategory(accountType);

		const result = Account.reconstitute(
			{
				bankId: UniqueId.fromString(record.bankId),
				name: record.name,
				type: accountType,
				assetCategory,
				balance: record.balance,
				currency: record.currency,
				createdAt: record.createdAt,
				updatedAt: record.updatedAt,
			},
			UniqueId.fromString(record.id),
		);

		if (result.isFailure) {
			throw new Error(`Failed to reconstitute Account: ${result.error}`);
		}

		return result.value;
	}

	private mapAccountTypeToPrisma(type: AccountType): PrismaAccountType {
		switch (type) {
			case AccountType.CHECKING:
				return PrismaAccountType.CHECKING;
			case AccountType.SAVINGS:
				return PrismaAccountType.SAVINGS;
			case AccountType.PEA:
				return PrismaAccountType.INVESTMENT;
			case AccountType.CTO:
				return PrismaAccountType.INVESTMENT;
			case AccountType.ASSURANCE_VIE:
				return PrismaAccountType.INVESTMENT;
			case AccountType.CRYPTO:
				return PrismaAccountType.INVESTMENT;
			case AccountType.REAL_ESTATE:
				return PrismaAccountType.INVESTMENT;
			case AccountType.LOAN:
				return PrismaAccountType.LOAN;
			case AccountType.CREDIT:
				return PrismaAccountType.CREDIT_CARD;
			default:
				return PrismaAccountType.CHECKING;
		}
	}

	private mapAccountTypeFromPrisma(type: string): AccountType {
		switch (type) {
			case 'CHECKING':
				return AccountType.CHECKING;
			case 'SAVINGS':
				return AccountType.SAVINGS;
			case 'INVESTMENT':
				// Default to PEA for investment types, but this should be refined
				// based on additional data if available
				return AccountType.PEA;
			case 'LOAN':
				return AccountType.LOAN;
			case 'CREDIT_CARD':
				return AccountType.CREDIT;
			default:
				return AccountType.CHECKING;
		}
	}
}
