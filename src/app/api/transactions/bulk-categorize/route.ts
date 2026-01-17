/**
 * Bulk Categorize API Route
 * POST /api/transactions/bulk-categorize - Categorize multiple transactions
 */

import { type NextRequest, NextResponse } from 'next/server';
import { transactionRepository } from '@/server/repositories';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const { transactionIds, categoryId } = body;

		if (!transactionIds || !Array.isArray(transactionIds) || !categoryId) {
			return NextResponse.json(
				{ error: 'Missing required fields: transactionIds, categoryId' },
				{ status: 400 },
			);
		}

		const updated = await transactionRepository.bulkCategorize(transactionIds, categoryId);

		return NextResponse.json({ updated });
	} catch (error) {
		console.error('Error bulk categorizing transactions:', error);
		return NextResponse.json({ error: 'Failed to categorize transactions' }, { status: 500 });
	}
}
