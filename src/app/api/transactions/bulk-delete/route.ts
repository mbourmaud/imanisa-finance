/**
 * Bulk Delete API Route
 * POST /api/transactions/bulk-delete - Delete multiple transactions
 */

import { type NextRequest, NextResponse } from 'next/server';
import { transactionRepository } from '@/server/repositories';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const { transactionIds } = body;

		if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
			return NextResponse.json({ error: 'Le champ transactionIds est requis' }, { status: 400 });
		}

		const deleted = await transactionRepository.deleteMany(transactionIds);

		return NextResponse.json({ deleted });
	} catch (error) {
		console.error('Error bulk deleting transactions:', error);
		return NextResponse.json(
			{ error: 'Impossible de supprimer les transactions' },
			{ status: 500 },
		);
	}
}
