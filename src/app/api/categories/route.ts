/**
 * Categories API Route
 * GET /api/categories - List all categories
 * POST /api/categories - Create a new category
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { categoryRepository } from '@/server/repositories';

export async function GET() {
	try {
		await requireAuth();
		const categories = await categoryRepository.getAll();
		return NextResponse.json(categories);
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/categories] GET error:', error);
		return NextResponse.json({ error: 'Impossible de charger les catégories' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		await requireAuth();

		const body = await request.json().catch(() => null);
		if (!body?.name?.trim()) {
			return NextResponse.json({ error: 'Le nom de la catégorie est requis' }, { status: 400 });
		}

		const category = await categoryRepository.create({
			name: body.name.trim(),
			icon: body.icon,
			color: body.color,
			parentId: body.parentId,
		});

		return NextResponse.json(category, { status: 201 });
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/categories] POST error:', error);
		return NextResponse.json({ error: 'Impossible de créer la catégorie' }, { status: 500 });
	}
}
