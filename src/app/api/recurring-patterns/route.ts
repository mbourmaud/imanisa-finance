/**
 * Recurring Patterns API Route
 * GET /api/recurring-patterns - List all detected recurring patterns
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { recurringPatternRepository } from '@/server/repositories';

export async function GET() {
	try {
		await requireAuth();
		const patterns = await recurringPatternRepository.getAll();
		return NextResponse.json(patterns);
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/recurring-patterns] GET error:', error);
		return NextResponse.json({ error: 'Impossible de charger les récurrences' }, { status: 500 });
	}
}
