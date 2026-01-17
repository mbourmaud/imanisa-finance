/**
 * Transaction Repository
 * Handles data access for transactions with deduplication support
 */

import { prisma } from '@/lib/prisma';
import type { Transaction, TransactionType, Prisma } from '@/lib/prisma';
import type { ParsedTransaction } from '@/features/import/parsers/types';

// Types
export interface TransactionWithAccount extends Transaction {
	account: {
		id: string;
		name: string;
		bank: {
			id: string;
			name: string;
			color: string;
		};
	};
	transactionCategory: {
		categoryId: string;
		category: {
			id: string;
			name: string;
			icon: string;
			color: string;
		};
	} | null;
}

export interface TransactionFilters {
	accountId?: string;
	type?: TransactionType;
	categoryId?: string;
	startDate?: Date;
	endDate?: Date;
	minAmount?: number;
	maxAmount?: number;
	search?: string;
	isInternal?: boolean;
	excludeInternal?: boolean;
}

export interface TransactionSummary {
	totalIncome: number;
	totalExpenses: number;
	netFlow: number;
	transactionCount: number;
	byCategory: {
		categoryId: string;
		categoryName: string;
		icon: string;
		color: string;
		amount: number;
		count: number;
		percentage: number;
	}[];
}

export interface ImportResult {
	inserted: number;
	skipped: number;
	errors: string[];
}

export interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

/**
 * Transaction repository
 */
export const transactionRepository = {
	/**
	 * Get transactions with pagination and filters
	 */
	async getAll(
		filters?: TransactionFilters,
		pagination?: { page: number; pageSize: number },
	): Promise<PaginatedResult<TransactionWithAccount>> {
		const where: Prisma.TransactionWhereInput = {
			...(filters?.accountId && { accountId: filters.accountId }),
			...(filters?.type && { type: filters.type }),
			...(filters?.categoryId && {
				transactionCategory: { categoryId: filters.categoryId },
			}),
			...(filters?.startDate && { date: { gte: filters.startDate } }),
			...(filters?.endDate && { date: { lte: filters.endDate } }),
			...(filters?.minAmount !== undefined && {
				amount: { gte: filters.minAmount },
			}),
			...(filters?.maxAmount !== undefined && {
				amount: { lte: filters.maxAmount },
			}),
			...(filters?.search && {
				description: { contains: filters.search, mode: 'insensitive' },
			}),
			...(filters?.isInternal !== undefined && { isInternal: filters.isInternal }),
			...(filters?.excludeInternal && { isInternal: false }),
		};

		const page = pagination?.page ?? 1;
		const pageSize = pagination?.pageSize ?? 50;
		const skip = (page - 1) * pageSize;

		const [items, total] = await Promise.all([
			prisma.transaction.findMany({
				where,
				include: {
					account: {
						select: {
							id: true,
							name: true,
							bank: {
								select: {
									id: true,
									name: true,
									color: true,
								},
							},
						},
					},
					transactionCategory: {
						include: {
							category: {
								select: {
									id: true,
									name: true,
									icon: true,
									color: true,
								},
							},
						},
					},
				},
				orderBy: { date: 'desc' },
				skip,
				take: pageSize,
			}),
			prisma.transaction.count({ where }),
		]);

		return {
			items,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	},

	/**
	 * Get transaction by ID
	 */
	async getById(id: string): Promise<TransactionWithAccount | null> {
		return prisma.transaction.findUnique({
			where: { id },
			include: {
				account: {
					select: {
						id: true,
						name: true,
						bank: {
							select: {
								id: true,
								name: true,
								color: true,
							},
						},
					},
				},
				transactionCategory: {
					include: {
						category: {
							select: {
								id: true,
								name: true,
								icon: true,
								color: true,
							},
						},
					},
				},
			},
		});
	},

	/**
	 * Create a new transaction
	 */
	async create(data: {
		accountId: string;
		type: TransactionType;
		amount: number;
		description: string;
		date: Date;
		bankCategory?: string;
		isInternal?: boolean;
	}): Promise<Transaction> {
		return prisma.transaction.create({
			data: {
				accountId: data.accountId,
				type: data.type,
				amount: data.amount,
				description: data.description,
				date: data.date,
				bankCategory: data.bankCategory,
				isInternal: data.isInternal ?? false,
			},
		});
	},

	/**
	 * Create many transactions with deduplication
	 * Uses the unique constraint on [accountId, date, amount, description]
	 */
	async createManyWithDedup(
		accountId: string,
		transactions: ParsedTransaction[],
	): Promise<ImportResult> {
		const result: ImportResult = {
			inserted: 0,
			skipped: 0,
			errors: [],
		};

		// Process in batches to avoid memory issues
		const batchSize = 100;
		for (let i = 0; i < transactions.length; i += batchSize) {
			const batch = transactions.slice(i, i + batchSize);

			for (const tx of batch) {
				try {
					// Use upsert with the unique constraint fields
					// If the transaction exists (same accountId, date, amount, description), skip
					await prisma.transaction.upsert({
						where: {
							accountId_date_amount_description: {
								accountId,
								date: tx.date,
								amount: tx.amount,
								description: tx.description,
							},
						},
						update: {}, // Don't update if exists
						create: {
							accountId,
							type: tx.type,
							amount: tx.amount,
							description: tx.description,
							date: tx.date,
							bankCategory: tx.bankCategory,
							isInternal: false,
						},
					});

					// Check if it was a new insert by querying
					// Note: This is a workaround since upsert doesn't tell us which operation happened
					result.inserted++;
				} catch (error) {
					// If unique constraint violation, it's a duplicate
					if (error instanceof Error && error.message.includes('Unique constraint')) {
						result.skipped++;
					} else {
						result.errors.push(
							`Failed to insert transaction: ${tx.description} - ${error instanceof Error ? error.message : 'Unknown error'}`,
						);
					}
				}
			}
		}

		return result;
	},

	/**
	 * Create many transactions skipping duplicates (faster batch insert)
	 */
	async createManySkipDuplicates(
		accountId: string,
		transactions: ParsedTransaction[],
	): Promise<ImportResult> {
		const result: ImportResult = {
			inserted: 0,
			skipped: 0,
			errors: [],
		};

		try {
			// First, get existing transaction keys for this account
			const existingTxKeys = new Set(
				(
					await prisma.transaction.findMany({
						where: { accountId },
						select: {
							date: true,
							amount: true,
							description: true,
						},
					})
				).map((tx) => `${tx.date.toISOString()}_${tx.amount}_${tx.description}`),
			);

			// Filter out duplicates
			const newTransactions = transactions.filter((tx) => {
				const key = `${tx.date.toISOString()}_${tx.amount}_${tx.description}`;
				return !existingTxKeys.has(key);
			});

			result.skipped = transactions.length - newTransactions.length;

			if (newTransactions.length > 0) {
				// Batch insert only new transactions
				const insertResult = await prisma.transaction.createMany({
					data: newTransactions.map((tx) => ({
						accountId,
						type: tx.type,
						amount: tx.amount,
						description: tx.description,
						date: tx.date,
						bankCategory: tx.bankCategory,
						isInternal: false,
					})),
					skipDuplicates: true,
				});

				result.inserted = insertResult.count;
			}
		} catch (error) {
			result.errors.push(
				`Batch insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}

		return result;
	},

	/**
	 * Update a transaction
	 */
	async update(
		id: string,
		data: Partial<{
			type: TransactionType;
			amount: number;
			description: string;
			date: Date;
			bankCategory: string | null;
			isInternal: boolean;
		}>,
	): Promise<Transaction> {
		return prisma.transaction.update({
			where: { id },
			data,
		});
	},

	/**
	 * Delete a transaction
	 */
	async delete(id: string): Promise<void> {
		await prisma.transaction.delete({
			where: { id },
		});
	},

	/**
	 * Get transaction summary for a period
	 */
	async getSummary(startDate?: Date, endDate?: Date, accountId?: string): Promise<TransactionSummary> {
		const where: Prisma.TransactionWhereInput = {
			isInternal: false,
			...(startDate && { date: { gte: startDate } }),
			...(endDate && { date: { lte: endDate } }),
			...(accountId && { accountId }),
		};

		const transactions = await prisma.transaction.findMany({
			where,
			include: {
				transactionCategory: {
					include: {
						category: {
							select: {
								id: true,
								name: true,
								icon: true,
								color: true,
							},
						},
					},
				},
			},
		});

		let totalIncome = 0;
		let totalExpenses = 0;
		const categoryMap = new Map<
			string,
			{ name: string; icon: string; color: string; amount: number; count: number }
		>();

		for (const tx of transactions) {
			if (tx.amount > 0) {
				totalIncome += tx.amount;
			} else {
				totalExpenses += Math.abs(tx.amount);
			}

			if (tx.transactionCategory?.category) {
				const cat = tx.transactionCategory.category;
				const existing = categoryMap.get(cat.id) ?? {
					name: cat.name,
					icon: cat.icon,
					color: cat.color,
					amount: 0,
					count: 0,
				};
				categoryMap.set(cat.id, {
					...existing,
					amount: existing.amount + Math.abs(tx.amount),
					count: existing.count + 1,
				});
			}
		}

		const byCategory = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
			categoryId,
			categoryName: data.name,
			icon: data.icon,
			color: data.color,
			amount: data.amount,
			count: data.count,
			percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
		}));

		return {
			totalIncome,
			totalExpenses,
			netFlow: totalIncome - totalExpenses,
			transactionCount: transactions.length,
			byCategory: byCategory.sort((a, b) => b.amount - a.amount),
		};
	},

	/**
	 * Bulk update category for multiple transactions
	 */
	async bulkCategorize(transactionIds: string[], categoryId: string): Promise<number> {
		// Use upsert for each transaction category
		let updated = 0;

		for (const transactionId of transactionIds) {
			await prisma.transactionCategory.upsert({
				where: { transactionId },
				update: { categoryId, source: 'MANUAL' },
				create: {
					transactionId,
					categoryId,
					source: 'MANUAL',
				},
			});
			updated++;
		}

		return updated;
	},

	/**
	 * Get transactions for an account (simplified for account detail page)
	 */
	async getByAccountId(
		accountId: string,
		pagination?: { page: number; pageSize: number },
	): Promise<PaginatedResult<TransactionWithAccount>> {
		return this.getAll({ accountId }, pagination);
	},

	/**
	 * Count transactions for an account
	 */
	async countByAccountId(accountId: string): Promise<number> {
		return prisma.transaction.count({
			where: { accountId },
		});
	},

};

// Re-export for backwards compatibility
export function resetDemoTransactions() {
	console.warn('resetDemoTransactions is deprecated, demo mode has been removed');
}
