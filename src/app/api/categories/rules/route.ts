/**
 * Category Rules API Route
 * GET /api/categories/rules - List all rules
 * POST /api/categories/rules - Create a new rule
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { categoryRuleRepository } from '@/server/repositories';
import { clearRuleCache } from '@/server/services/categorization';

export async function GET() {
	try {
		await requireAuth();
		const rules = await categoryRuleRepository.getAll();
		return NextResponse.json(rules);
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/categories/rules] GET error:', error);
		return NextResponse.json({ error: 'Impossible de charger les règles' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		await requireAuth();

		const body = await request.json().catch(() => null);
		if (!body?.pattern?.trim() || !body?.categoryId) {
			return NextResponse.json({ error: 'Le motif et la catégorie sont requis' }, { status: 400 });
		}

		const rule = await categoryRuleRepository.create({
			pattern: body.pattern.trim(),
			categoryId: body.categoryId,
			matchType: body.matchType,
			priority: body.priority,
			sourceFilter: body.sourceFilter,
		});

		// Clear cached rules so the engine picks up the new rule
		clearRuleCache();

		return NextResponse.json(rule, { status: 201 });
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/categories/rules] POST error:', error);
		return NextResponse.json({ error: 'Impossible de créer la règle' }, { status: 500 });
	}
}
