/**
 * Account Repository
 * Handles data access for accounts with Bank relation
 */

import { prisma } from '@/lib/prisma';
import type { Account, AccountMember, AccountType, Bank } from '@prisma/client';

// Types
export interface AccountWithMembers extends Account {
	bank: Bank;
	accountMembers: {
		id: string;
		memberId: string;
		ownerShare: number;
		member: {
			id: string;
			name: string;
			color: string | null;
		};
	}[];
}

export interface AccountWithDetails extends AccountWithMembers {
	_count: {
		transactions: number;
	};
}

export interface AccountFilters {
	type?: AccountType;
	bankId?: string;
	memberId?: string;
	search?: string;
}

export interface CreateAccountDTO {
	name: string;
	bankId: string;
	type?: AccountType;
	description?: string;
	accountNumber?: string;
	balance?: number;
	currency?: string;
	exportUrl?: string;
	memberIds?: string[];
	memberShares?: { memberId: string; ownerShare: number }[];
}

export interface UpdateAccountDTO {
	name?: string;
	type?: AccountType;
	description?: string;
	accountNumber?: string;
	balance?: number;
	exportUrl?: string;
}

export interface AccountSummary {
	totalAccounts: number;
	totalBalance: number;
	byType: Record<string, { count: number; balance: number }>;
	byBank: Record<string, { count: number; balance: number; bankName: string }>;
}

/**
 * Account repository
 */
export const accountRepository = {
	/**
	 * Get all accounts with optional filters
	 */
	async getAll(filters?: AccountFilters): Promise<AccountWithDetails[]> {
		const accounts = await prisma.account.findMany({
			where: {
				...(filters?.type && { type: filters.type }),
				...(filters?.bankId && { bankId: filters.bankId }),
				...(filters?.memberId && {
					accountMembers: {
						some: { memberId: filters.memberId },
					},
				}),
				...(filters?.search && {
					OR: [
						{ name: { contains: filters.search, mode: 'insensitive' } },
						{ accountNumber: { contains: filters.search, mode: 'insensitive' } },
					],
				}),
			},
			include: {
				bank: true,
				accountMembers: {
					include: {
						member: {
							select: {
								id: true,
								name: true,
								color: true,
							},
						},
					},
				},
				_count: {
					select: { transactions: true },
				},
			},
			orderBy: [{ bank: { name: 'asc' } }, { name: 'asc' }],
		});

		return accounts;
	},

	/**
	 * Get accounts grouped by bank
	 */
	async getAllGroupedByBank(): Promise<Record<string, AccountWithDetails[]>> {
		const accounts = await this.getAll();
		const grouped: Record<string, AccountWithDetails[]> = {};

		for (const account of accounts) {
			if (!grouped[account.bankId]) {
				grouped[account.bankId] = [];
			}
			grouped[account.bankId].push(account);
		}

		return grouped;
	},

	/**
	 * Get accounts by bank ID
	 */
	async getByBank(bankId: string): Promise<AccountWithDetails[]> {
		return this.getAll({ bankId });
	},

	/**
	 * Get account by ID
	 */
	async getById(id: string): Promise<AccountWithDetails | null> {
		const account = await prisma.account.findUnique({
			where: { id },
			include: {
				bank: true,
				accountMembers: {
					include: {
						member: {
							select: {
								id: true,
								name: true,
								color: true,
							},
						},
					},
				},
				_count: {
					select: { transactions: true },
				},
			},
		});

		return account;
	},

	/**
	 * Create a new account with optional member associations
	 */
	async create(data: CreateAccountDTO): Promise<AccountWithDetails> {
		const account = await prisma.account.create({
			data: {
				name: data.name,
				bankId: data.bankId,
				type: data.type ?? 'CHECKING',
				description: data.description,
				accountNumber: data.accountNumber,
				balance: data.balance ?? 0,
				currency: data.currency ?? 'EUR',
				exportUrl: data.exportUrl,
				...(data.memberShares && {
					accountMembers: {
						create: data.memberShares.map((ms) => ({
							memberId: ms.memberId,
							ownerShare: ms.ownerShare,
						})),
					},
				}),
				...(data.memberIds &&
					!data.memberShares && {
						accountMembers: {
							create: data.memberIds.map((memberId) => ({
								memberId,
								ownerShare: 100 / data.memberIds!.length,
							})),
						},
					}),
			},
			include: {
				bank: true,
				accountMembers: {
					include: {
						member: {
							select: {
								id: true,
								name: true,
								color: true,
							},
						},
					},
				},
				_count: {
					select: { transactions: true },
				},
			},
		});

		return account;
	},

	/**
	 * Create account with specific members and shares
	 */
	async createWithMembers(
		data: Omit<CreateAccountDTO, 'memberIds' | 'memberShares'>,
		memberShares: { memberId: string; ownerShare: number }[],
	): Promise<AccountWithDetails> {
		return this.create({ ...data, memberShares });
	},

	/**
	 * Update an account
	 */
	async update(id: string, data: UpdateAccountDTO): Promise<AccountWithDetails> {
		const account = await prisma.account.update({
			where: { id },
			data,
			include: {
				bank: true,
				accountMembers: {
					include: {
						member: {
							select: {
								id: true,
								name: true,
								color: true,
							},
						},
					},
				},
				_count: {
					select: { transactions: true },
				},
			},
		});

		return account;
	},

	/**
	 * Update account balance
	 */
	async updateBalance(id: string, balance: number): Promise<AccountWithDetails> {
		return this.update(id, { balance });
	},

	/**
	 * Calculate and update account balance from transactions
	 * INCOME transactions are positive, EXPENSE transactions are negative
	 */
	async recalculateBalance(id: string): Promise<AccountWithDetails> {
		// Sum all transactions for this account
		const result = await prisma.transaction.aggregate({
			where: { accountId: id },
			_sum: { amount: true },
		});

		// Get transactions grouped by type to calculate correctly
		const incomeSum = await prisma.transaction.aggregate({
			where: { accountId: id, type: 'INCOME' },
			_sum: { amount: true },
		});

		const expenseSum = await prisma.transaction.aggregate({
			where: { accountId: id, type: 'EXPENSE' },
			_sum: { amount: true },
		});

		// Balance = income - expenses (amounts are stored as positive values)
		const income = incomeSum._sum.amount ?? 0;
		const expenses = expenseSum._sum.amount ?? 0;
		const balance = income - expenses;

		return this.updateBalance(id, balance);
	},

	/**
	 * Delete an account
	 */
	async delete(id: string): Promise<void> {
		await prisma.account.delete({
			where: { id },
		});
	},

	/**
	 * Add a member to an account
	 */
	async addMemberToAccount(
		accountId: string,
		memberId: string,
		ownerShare: number = 100,
	): Promise<AccountMember> {
		return prisma.accountMember.create({
			data: {
				accountId,
				memberId,
				ownerShare,
			},
		});
	},

	/**
	 * Remove a member from an account
	 */
	async removeMemberFromAccount(accountId: string, memberId: string): Promise<void> {
		await prisma.accountMember.delete({
			where: {
				accountId_memberId: {
					accountId,
					memberId,
				},
			},
		});
	},

	/**
	 * Update a member's share in an account
	 */
	async updateMemberShare(
		accountId: string,
		memberId: string,
		ownerShare: number,
	): Promise<AccountMember> {
		return prisma.accountMember.update({
			where: {
				accountId_memberId: {
					accountId,
					memberId,
				},
			},
			data: { ownerShare },
		});
	},

	/**
	 * Get account summary
	 */
	async getSummary(): Promise<AccountSummary> {
		const accounts = await prisma.account.findMany({
			select: {
				type: true,
				bankId: true,
				balance: true,
				bank: {
					select: {
						name: true,
					},
				},
			},
		});

		const byType: Record<string, { count: number; balance: number }> = {};
		const byBank: Record<string, { count: number; balance: number; bankName: string }> = {};
		let totalBalance = 0;

		for (const account of accounts) {
			totalBalance += account.balance;

			// By type
			if (!byType[account.type]) {
				byType[account.type] = { count: 0, balance: 0 };
			}
			byType[account.type].count++;
			byType[account.type].balance += account.balance;

			// By bank
			if (!byBank[account.bankId]) {
				byBank[account.bankId] = { count: 0, balance: 0, bankName: account.bank.name };
			}
			byBank[account.bankId].count++;
			byBank[account.bankId].balance += account.balance;
		}

		return {
			totalAccounts: accounts.length,
			totalBalance,
			byType,
			byBank,
		};
	},

	/**
	 * Get banks with their accounts summary (for banks page)
	 */
	async getBanksSummary(): Promise<
		{
			bankId: string;
			bank: Bank;
			accountCount: number;
			totalBalance: number;
			accounts: AccountWithDetails[];
		}[]
	> {
		const groupedAccounts = await this.getAllGroupedByBank();
		const result = [];

		for (const [bankId, accounts] of Object.entries(groupedAccounts)) {
			if (accounts.length > 0) {
				result.push({
					bankId,
					bank: accounts[0].bank,
					accountCount: accounts.length,
					totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
					accounts,
				});
			}
		}

		return result.sort((a, b) => a.bank.name.localeCompare(b.bank.name));
	},
};
