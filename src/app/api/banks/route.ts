/**
 * Banks API Routes (Read-Only)
 * GET /api/banks - List all supported banks with their accounts
 *
 * Banks are stored in the database (seeded) and represent banks with functional parsers.
 */

import { NextResponse } from 'next/server';
import type { Bank } from '@/lib/prisma';
import { accountRepository, bankRepository } from '@/server/repositories';

export interface BankWithAccounts extends Bank {
	accountCount: number;
	totalBalance: number;
	accounts: {
		id: string;
		name: string;
		balance: number;
		type: string;
		exportUrl: string | null;
		members: { id: string; name: string; ownerShare: number; color: string | null; avatarUrl: string | null }[];
	}[];
}

export interface BanksSummary {
	totalBanksUsed: number;
	totalBanksAvailable: number;
	totalAccounts: number;
	totalBalance: number;
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const memberId = searchParams.get('memberId') ?? undefined;

		// Get all banks from database
		const allBanks = await bankRepository.getAll();

		// Get all accounts grouped by bank
		const accountsByBank = await accountRepository.getAllGroupedByBank();
		const summary = await accountRepository.getSummary();

		// Build response with all banks
		const banks: BankWithAccounts[] = allBanks.map((bank) => {
			let accounts = accountsByBank[bank.id] ?? [];

			// Filter accounts by member if specified
			if (memberId) {
				accounts = accounts.filter((acc) =>
					acc.accountMembers.some((am) => am.member.id === memberId),
				);
			}

			return {
				...bank,
				accountCount: accounts.length,
				totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
				accounts: accounts.map((acc) => ({
					id: acc.id,
					name: acc.name,
					balance: acc.balance,
					type: acc.type,
					exportUrl: acc.exportUrl ?? null,
					members: acc.accountMembers.map((am) => ({
						id: am.member.id,
						name: am.member.name,
						ownerShare: am.ownerShare,
						color: am.member.color,
						avatarUrl: am.member.avatarUrl,
					})),
				})),
			};
		});

		// Separate banks by type
		const bankAccounts = banks.filter((b) => b.type === 'BANK');
		const investmentAccounts = banks.filter((b) => b.type === 'INVESTMENT');

		// Banks that have at least one account
		const usedBanks = banks.filter((b) => b.accountCount > 0);

		// Recalculate summary based on filtered accounts
		const filteredTotalAccounts = banks.reduce((sum, b) => sum + b.accountCount, 0);
		const filteredTotalBalance = banks.reduce((sum, b) => sum + b.totalBalance, 0);

		const banksSummary: BanksSummary = {
			totalBanksUsed: usedBanks.length,
			totalBanksAvailable: allBanks.length,
			totalAccounts: memberId ? filteredTotalAccounts : summary.totalAccounts,
			totalBalance: memberId ? filteredTotalBalance : summary.totalBalance,
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
		const message = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json(
			{
				error: 'Failed to fetch banks',
				debug: process.env.NODE_ENV === 'production' ? message : undefined,
				hasDbUrl: !!process.env.DATABASE_URL,
			},
			{ status: 500 },
		);
	}
}
