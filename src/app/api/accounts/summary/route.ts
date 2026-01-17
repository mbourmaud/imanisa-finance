/**
 * Account Summary API Route
 * GET /api/accounts/summary - Get account totals by type
 */

import { NextResponse } from 'next/server';
import { accountRepository } from '@/server/repositories';

export async function GET() {
	try {
		const summary = await accountRepository.getSummary();
		return NextResponse.json(summary);
	} catch (error) {
		console.error('Error fetching account summary:', error);
		return NextResponse.json({ error: 'Failed to fetch account summary' }, { status: 500 });
	}
}
