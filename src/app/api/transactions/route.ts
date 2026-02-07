/**
 * Transactions API Routes
 * GET /api/transactions - List transactions with filters and pagination
 * POST /api/transactions - Create a new transaction
 */

import { type NextRequest, NextResponse } from 'next/server';
import type { TransactionType } from '@/lib/prisma';
import { type TransactionFilters, transactionRepository } from '@/server/repositories';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const filters: TransactionFilters = {};

		const accountId = searchParams.get('accountId');
		if (accountId) filters.accountId = accountId;

		const memberId = searchParams.get('memberId');
		if (memberId) filters.memberId = memberId;

		const type = searchParams.get('type');
		if (type) filters.type = type as TransactionType;

		const categoryId = searchParams.get('categoryId');
		if (categoryId) filters.categoryId = categoryId;

		const startDate = searchParams.get('startDate');
		if (startDate) filters.startDate = new Date(startDate);

		const endDate = searchParams.get('endDate');
		if (endDate) filters.endDate = new Date(endDate);

		const minAmount = searchParams.get('minAmount');
		if (minAmount) filters.minAmount = Number(minAmount);

		const maxAmount = searchParams.get('maxAmount');
		if (maxAmount) filters.maxAmount = Number(maxAmount);

		const search = searchParams.get('search');
		if (search) filters.search = search;

		const excludeInternal = searchParams.get('excludeInternal');
		if (excludeInternal === 'true') filters.excludeInternal = true;

		const page = Number(searchParams.get('page')) || 1;
		const pageSize = Number(searchParams.get('pageSize')) || 50;

		const result = await transactionRepository.getAll(filters, { page, pageSize });

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error fetching transactions:', error);
		return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const { accountId, type, amount, description, categoryId, date } = body;

		if (!accountId || !type || amount === undefined || !description || !date) {
			return NextResponse.json(
				{ error: 'Missing required fields: accountId, type, amount, description, date' },
				{ status: 400 },
			);
		}

		const transaction = await transactionRepository.create({
			accountId,
			type,
			amount,
			description,
			date: new Date(date),
		});

		// If categoryId provided, link the transaction to the category
		if (categoryId) {
			await transactionRepository.bulkCategorize([transaction.id], categoryId);
		}

		return NextResponse.json(transaction, { status: 201 });
	} catch (error) {
		console.error('Error creating transaction:', error);
		return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
	}
}
