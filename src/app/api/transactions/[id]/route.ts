/**
 * Single Transaction API Routes
 * GET /api/transactions/:id - Get transaction by ID
 * PATCH /api/transactions/:id - Update transaction
 * DELETE /api/transactions/:id - Delete transaction
 */

import { type NextRequest, NextResponse } from 'next/server';
import { transactionRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const transaction = await transactionRepository.getById(id);

		if (!transaction) {
			return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
		}

		return NextResponse.json(transaction);
	} catch (error) {
		console.error('Error fetching transaction:', error);
		return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Parse date if provided
		if (body.date) {
			body.date = new Date(body.date);
		}

		const transaction = await transactionRepository.update(id, body);

		if (!transaction) {
			return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
		}

		return NextResponse.json(transaction);
	} catch (error) {
		console.error('Error updating transaction:', error);
		return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Verify transaction exists first
		const existing = await transactionRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
		}

		await transactionRepository.delete(id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting transaction:', error);
		return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
	}
}
