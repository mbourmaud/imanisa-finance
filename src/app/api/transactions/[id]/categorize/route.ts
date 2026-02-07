/**
 * Transaction Categorize API Route
 * POST /api/transactions/{id}/categorize
 * - Assigns a category to a transaction (manual categorization)
 * - Creates/updates a rule from the transaction description for future auto-matching
 */

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { categoryRuleRepository } from '@/server/repositories';
import { clearRuleCache, normalizeDescription } from '@/server/services/categorization';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		await requireAuth();

		const body = await request.json().catch(() => null);
		if (!body?.categoryId) {
			return NextResponse.json({ error: 'La catégorie est requise' }, { status: 400 });
		}

		// Verify transaction exists
		const transaction = await prisma.transaction.findUnique({
			where: { id },
			select: { id: true, description: true },
		});

		if (!transaction) {
			return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 });
		}

		// Verify category exists
		const category = await prisma.category.findUnique({
			where: { id: body.categoryId },
			select: { id: true, name: true },
		});

		if (!category) {
			return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });
		}

		// Upsert TransactionCategory (manual, confidence 1.0)
		await prisma.transactionCategory.upsert({
			where: { transactionId: id },
			update: {
				categoryId: body.categoryId,
				source: 'MANUAL',
				confidence: 1.0,
			},
			create: {
				transactionId: id,
				categoryId: body.categoryId,
				source: 'MANUAL',
				confidence: 1.0,
			},
		});

		// Create/update a rule from this description (priority 200 > seed 100 > AI)
		// Only create rule if createRule is not explicitly false
		if (body.createRule !== false) {
			const normalizedPattern = normalizeDescription(transaction.description);
			await categoryRuleRepository.upsertByPattern(normalizedPattern, body.categoryId, 200);
			clearRuleCache();
		}

		return NextResponse.json({
			success: true,
			transactionId: id,
			categoryId: body.categoryId,
			categoryName: category.name,
			ruleCreated: body.createRule !== false,
		});
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/transactions/categorize] POST error:', error);
		return NextResponse.json(
			{ error: 'Impossible de catégoriser la transaction' },
			{ status: 500 },
		);
	}
}
