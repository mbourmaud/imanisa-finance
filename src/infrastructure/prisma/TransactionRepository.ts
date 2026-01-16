import { UniqueId } from '@domain/shared/UniqueId';
import { Transaction } from '@domain/transaction/Transaction';
import type { TransactionCategory } from '@domain/transaction/TransactionCategory';
import type { TransactionRepository as ITransactionRepository } from '@domain/transaction/TransactionRepository';
import { TransactionType } from '@domain/transaction/TransactionType';
import { prisma } from '@/lib/prisma';

export class TransactionRepository implements ITransactionRepository {
	async findById(id: UniqueId): Promise<Transaction | null> {
		const prismaTransaction = await prisma.transaction.findUnique({
			where: { id: id.toString() },
			include: { transactionCategory: { include: { category: true } } },
		});

		if (!prismaTransaction) {
			return null;
		}

		return this.mapToDomain(prismaTransaction);
	}

	async findByAccountId(accountId: UniqueId): Promise<Transaction[]> {
		const transactions = await prisma.transaction.findMany({
			where: { accountId: accountId.toString() },
			include: { transactionCategory: { include: { category: true } } },
			orderBy: { date: 'desc' },
		});

		return transactions.map((t) => this.mapToDomain(t)).filter(this.isNotNull);
	}

	async findByAccountIdAndDateRange(
		accountId: UniqueId,
		startDate: Date,
		endDate: Date,
	): Promise<Transaction[]> {
		const transactions = await prisma.transaction.findMany({
			where: {
				accountId: accountId.toString(),
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			include: { transactionCategory: { include: { category: true } } },
			orderBy: { date: 'desc' },
		});

		return transactions.map((t) => this.mapToDomain(t)).filter(this.isNotNull);
	}

	async saveMany(transactions: Transaction[]): Promise<void> {
		const operations = transactions.map((transaction) => this.createOrUpdateOperation(transaction));

		if (operations.length > 0) {
			await prisma.$transaction(operations);
		}
	}

	async save(transaction: Transaction): Promise<void> {
		const operation = this.createOrUpdateOperation(transaction);
		await prisma.$transaction([operation]);
	}

	async delete(id: UniqueId): Promise<void> {
		await prisma.transaction.delete({
			where: { id: id.toString() },
		});
	}

	async deleteByAccountId(accountId: UniqueId): Promise<void> {
		await prisma.transaction.deleteMany({
			where: { accountId: accountId.toString() },
		});
	}

	private createOrUpdateOperation(transaction: Transaction) {
		const id = transaction.id.toString();
		const data = {
			accountId: transaction.accountId.toString(),
			type: this.mapTransactionTypeToPrisma(transaction.type),
			amount: transaction.amount.amount,
			currency: transaction.amount.currency,
			description: transaction.description,
			date: transaction.date,
			importedAt: transaction.importedAt,
		};

		return prisma.transaction.upsert({
			where: { id },
			update: data,
			create: {
				id,
				...data,
			},
		});
	}

	private mapToDomain(prismaTransaction: {
		id: string;
		accountId: string;
		type: string;
		amount: number;
		currency: string;
		description: string;
		date: Date;
		importedAt: Date;
		transactionCategory: {
			category: {
				name: string;
			};
		} | null;
	}): Transaction | null {
		const idResult = UniqueId.fromString(prismaTransaction.id);
		const accountIdResult = UniqueId.fromString(prismaTransaction.accountId);
		const transactionType = this.mapTransactionTypeFromPrisma(prismaTransaction.type);

		if (!transactionType) {
			return null;
		}

		const category = prismaTransaction.transactionCategory
			? (prismaTransaction.transactionCategory.category.name as TransactionCategory)
			: null;

		const result = Transaction.reconstitute(
			{
				accountId: accountIdResult,
				type: transactionType,
				amount: prismaTransaction.amount,
				currency: prismaTransaction.currency,
				description: prismaTransaction.description,
				date: prismaTransaction.date,
				category: category,
				importedAt: prismaTransaction.importedAt,
			},
			idResult,
		);

		return result.isSuccess ? result.value : null;
	}

	private mapTransactionTypeToPrisma(type: TransactionType): 'INCOME' | 'EXPENSE' {
		switch (type) {
			case TransactionType.INCOME:
				return 'INCOME';
			case TransactionType.EXPENSE:
				return 'EXPENSE';
			case TransactionType.TRANSFER:
				return 'EXPENSE';
			default:
				return 'EXPENSE';
		}
	}

	private mapTransactionTypeFromPrisma(type: string): TransactionType | null {
		switch (type) {
			case 'INCOME':
				return TransactionType.INCOME;
			case 'EXPENSE':
				return TransactionType.EXPENSE;
			default:
				return null;
		}
	}

	private isNotNull<T>(value: T | null): value is T {
		return value !== null;
	}
}
