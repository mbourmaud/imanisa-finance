/**
 * Transaction Summary API Route
 * GET /api/transactions/summary - Get income/expense totals
 */

import { type NextRequest, NextResponse } from 'next/server';
import { transactionRepository } from '@/server/repositories';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		const summary = await transactionRepository.getSummary(
			startDate ? new Date(startDate) : undefined,
			endDate ? new Date(endDate) : undefined,
		);

		return NextResponse.json(summary);
	} catch (error) {
		console.error('Error fetching transaction summary:', error);
		return NextResponse.json({ error: 'Failed to fetch transaction summary' }, { status: 500 });
	}
}
