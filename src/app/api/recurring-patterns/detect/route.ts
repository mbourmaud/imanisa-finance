/**
 * Recurring Detection API Route
 * POST /api/recurring-patterns/detect - Trigger recurring pattern detection
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { runRecurringDetection } from '@/server/services/categorization';

export async function POST() {
	try {
		await requireAuth();

		const result = await runRecurringDetection();

		return NextResponse.json({
			success: true,
			...result,
			message:
				`Détection terminée : ${result.detected} patterns trouvés, ` +
				`${result.created} créés, ${result.updated} mis à jour`,
		});
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/recurring-patterns/detect] POST error:', error);
		return NextResponse.json(
			{ error: 'Erreur lors de la détection des récurrences' },
			{ status: 500 },
		);
	}
}
