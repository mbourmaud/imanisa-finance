/**
 * Account Sync API Route
 * POST /api/accounts/:id/sync - Recalculate account balance from transactions
 */

import { type NextRequest, NextResponse } from 'next/server';
import { accountRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		const account = await accountRepository.getById(id);

		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		// Recalculate balance from all transactions
		const updated = await accountRepository.recalculateBalance(id);

		return NextResponse.json(updated);
	} catch (error) {
		console.error('Error syncing account:', error);
		return NextResponse.json({ error: 'Failed to sync account' }, { status: 500 });
	}
}
