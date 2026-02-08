/**
 * Transaction Summary API Route
 * GET /api/transactions/summary - Get income/expense totals with filters
 */

import { type NextRequest, NextResponse } from 'next/server';
import type { TransactionType } from '@/lib/prisma';
import { type TransactionFilters, transactionRepository } from '@/server/repositories';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const filters: TransactionFilters = {};

		const startDate = searchParams.get('startDate');
		if (startDate) filters.startDate = new Date(startDate);

		const endDate = searchParams.get('endDate');
		if (endDate) filters.endDate = new Date(endDate);

		const accountId = searchParams.get('accountId');
		if (accountId) filters.accountId = accountId;

		const memberId = searchParams.get('memberId');
		if (memberId) filters.memberId = memberId;

		const type = searchParams.get('type');
		if (type) filters.type = type as TransactionType;

		const categoryId = searchParams.get('categoryId');
		if (categoryId) filters.categoryId = categoryId;

		const search = searchParams.get('search');
		if (search) filters.search = search;

		const excludeInternal = searchParams.get('excludeInternal');
		if (excludeInternal === 'true') filters.excludeInternal = true;

		const summary = await transactionRepository.getSummary(filters);

		return NextResponse.json(summary);
	} catch (error) {
		console.error('Error fetching transaction summary:', error);
		return NextResponse.json({ error: 'Failed to fetch transaction summary' }, { status: 500 });
	}
}
