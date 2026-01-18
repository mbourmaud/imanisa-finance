/**
 * Accounts API Routes
 * GET /api/accounts - List all accounts
 * POST /api/accounts - Create a new account
 */

import { type NextRequest, NextResponse } from 'next/server';
import type { AccountType } from '@/lib/prisma';
import { accountRepository, bankRepository } from '@/server/repositories';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const filters: {
			type?: AccountType;
			bankId?: string;
			memberId?: string;
			search?: string;
		} = {};

		const type = searchParams.get('type');
		if (type) filters.type = type as AccountType;

		const bankId = searchParams.get('bankId');
		if (bankId) filters.bankId = bankId;

		const memberId = searchParams.get('memberId');
		if (memberId) filters.memberId = memberId;

		const search = searchParams.get('search');
		if (search) filters.search = search;

		const accounts = await accountRepository.getAll(filters);
		const summary = await accountRepository.getSummary();

		return NextResponse.json({ accounts, summary });
	} catch (error) {
		console.error('Error fetching accounts:', error);
		return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			name,
			bankId,
			type,
			description,
			accountNumber,
			balance,
			currency,
			exportUrl,
			memberIds,
			memberShares,
		} = body;

		// Validate required fields
		if (!name || typeof name !== 'string') {
			return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
		}

		if (!bankId || typeof bankId !== 'string') {
			return NextResponse.json({ error: 'Missing required field: bankId' }, { status: 400 });
		}

		// Validate that the bank exists
		const bank = await bankRepository.getById(bankId);
		if (!bank) {
			return NextResponse.json({ error: `Bank not found: ${bankId}` }, { status: 400 });
		}

		// Validate type if provided
		const validTypes: AccountType[] = ['CHECKING', 'SAVINGS', 'INVESTMENT', 'LOAN'];
		if (type && !validTypes.includes(type)) {
			return NextResponse.json({ error: `Invalid account type: ${type}` }, { status: 400 });
		}

		// Validate memberShares if provided
		if (memberShares && Array.isArray(memberShares)) {
			for (const share of memberShares) {
				if (!share.memberId || typeof share.ownerShare !== 'number') {
					return NextResponse.json(
						{ error: 'Invalid memberShares format. Each entry needs memberId and ownerShare.' },
						{ status: 400 },
					);
				}
				if (share.ownerShare < 0 || share.ownerShare > 100) {
					return NextResponse.json(
						{ error: 'ownerShare must be between 0 and 100' },
						{ status: 400 },
					);
				}
			}
		}

		const account = await accountRepository.create({
			name,
			bankId,
			type: type ?? 'CHECKING',
			description,
			accountNumber,
			balance: balance ?? 0,
			currency: currency ?? 'EUR',
			exportUrl,
			memberIds,
			memberShares,
		});

		return NextResponse.json(account, { status: 201 });
	} catch (error) {
		console.error('Error creating account:', error);
		return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
	}
}
