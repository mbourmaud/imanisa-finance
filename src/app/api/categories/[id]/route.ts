/**
 * Category Detail API Route
 * GET /api/categories/{id} - Get category details
 * PATCH /api/categories/{id} - Update a category
 * DELETE /api/categories/{id} - Delete a category
 */

import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { categoryRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		await requireAuth();
		const category = await categoryRepository.getById(id);

		if (!category) {
			return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });
		}

		return NextResponse.json(category);
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/categories] GET by id error:', error);
		return NextResponse.json({ error: 'Impossible de charger la catégorie' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		await requireAuth();

		const body = await request.json().catch(() => null);
		if (!body) {
			return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
		}

		const category = await categoryRepository.update(id, {
			...(body.name && { name: body.name.trim() }),
			...(body.icon && { icon: body.icon }),
			...(body.color && { color: body.color }),
			...(body.parentId !== undefined && { parentId: body.parentId }),
		});

		return NextResponse.json(category);
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/categories] PATCH error:', error);
		return NextResponse.json({ error: 'Impossible de modifier la catégorie' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		await requireAuth();
		await categoryRepository.delete(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}
		console.error('[API/categories] DELETE error:', error);
		return NextResponse.json({ error: 'Impossible de supprimer la catégorie' }, { status: 500 });
	}
}
