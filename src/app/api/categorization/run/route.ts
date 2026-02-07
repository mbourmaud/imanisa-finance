/**
 * Categorization Run API Route
 * POST /api/categorization/run - Manually trigger the categorization pipeline
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { runCategorizationPipeline } from '@/server/services/categorization';

export async function POST(request: Request) {
	try {
		await requireAuth();

		const body = await request.json().catch(() => ({}));
		const accountId = body.accountId as string | undefined;

		const stats = await runCategorizationPipeline(accountId);

		return NextResponse.json({
			success: true,
			stats,
			message:
				`Catégorisation terminée : ${stats.ruleMatches} règles, ` +
				`${stats.bankMatches} banque, ${stats.aiMatches} IA, ` +
				`${stats.transferMatches} virements, ${stats.unmatched} non catégorisées`,
		});
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/categorization/run] POST error:', error);
		return NextResponse.json({ error: 'Erreur lors de la catégorisation' }, { status: 500 });
	}
}
