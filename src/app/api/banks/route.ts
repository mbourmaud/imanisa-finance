/**
 * Banks API Routes (Read-Only)
 * GET /api/banks - List all supported banks with their accounts
 *
 * Banks are stored in the database (seeded) and represent banks with functional parsers.
 */

import { NextResponse } from 'next/server';
import { accountRepository, bankRepository } from '@/server/repositories';
import type { Bank, } from '@/lib/prisma';

export interface BankWithAccounts extends Bank {
	accountCount: number;
	totalBalance: number;
	accounts: {
		id: string;
		name: string;
		balance: number;
		type: string;
		members: { id: string; name: string; ownerShare: number }[];
	}[];
}

export interface BanksSummary {
	totalBanksUsed: number;
	totalBanksAvailable: number;
	totalAccounts: number;
	totalBalance: number;
}

export async function GET() {
	try {
		// Get all banks from database
		const allBanks = await bankRepository.getAll();

		// Get all accounts grouped by bank
		const accountsByBank = await accountRepository.getAllGroupedByBank();
		const summary = await accountRepository.getSummary();

		// Build response with all banks
		const banks: BankWithAccounts[] = allBanks.map((bank) => {
			const accounts = accountsByBank[bank.id] ?? [];
			return {
				...bank,
				accountCount: accounts.length,
				totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
				accounts: accounts.map((acc) => ({
					id: acc.id,
					name: acc.name,
					balance: acc.balance,
					type: acc.type,
					members: acc.accountMembers.map((am) => ({
						id: am.member.id,
						name: am.member.name,
						ownerShare: am.ownerShare,
					})),
				})),
			};
		});

		// Separate banks by type
		const bankAccounts = banks.filter((b) => b.type === 'BANK');
		const investmentAccounts = banks.filter((b) => b.type === 'INVESTMENT');

		// Banks that have at least one account
		const usedBanks = banks.filter((b) => b.accountCount > 0);

		const banksSummary: BanksSummary = {
			totalBanksUsed: usedBanks.length,
			totalBanksAvailable: allBanks.length,
			totalAccounts: summary.totalAccounts,
			totalBalance: summary.totalBalance,
		};

		return NextResponse.json({
			banks,
			bankAccounts,
			investmentAccounts,
			usedBanks,
			summary: banksSummary,
		});
	} catch (error) {
		console.error('Error fetching banks:', error);
		return NextResponse.json({ error: 'Failed to fetch banks' }, { status: 500 });
	}
}
