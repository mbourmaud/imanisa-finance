/**
 * Account Sync API Route
 * POST /api/accounts/:id/sync - Sync account balance with bank
 */

import { type NextRequest, NextResponse } from 'next/server';
import { accountRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// In demo mode, just update the lastSyncAt timestamp
		// In real mode, this would call the bank API
		const account = await accountRepository.getById(id);

		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		// Simulate sync by updating lastSyncAt
		const updated = await accountRepository.updateBalance(id, account.balance);

		return NextResponse.json(updated);
	} catch (error) {
		console.error('Error syncing account:', error);
		return NextResponse.json({ error: 'Failed to sync account' }, { status: 500 });
	}
}
