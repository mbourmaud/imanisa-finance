/**
 * Import Reprocess Preview API Route
 * GET /api/imports/{id}/reprocess-preview
 * Returns the count and date range of transactions that would be affected by a reprocess
 */

import { type NextRequest, NextResponse } from 'next/server';
import { parseImport } from '@/features/import/parsers';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { downloadRawFile } from '@/lib/supabase/storage';
import { rawImportRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		const user = await requireAuth();

		// Get import record
		const rawImport = await rawImportRepository.getById(id);

		if (!rawImport) {
			return NextResponse.json({ error: 'Import introuvable' }, { status: 404 });
		}

		// Verify ownership
		if (rawImport.userId !== user.id) {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
		}

		const accountId = rawImport.accountId;

		if (!accountId) {
			return NextResponse.json({ error: 'Aucun compte associé à cet import' }, { status: 400 });
		}

		// Download and parse the file to get the date range
		const { data: fileBlob, error: downloadError } = await downloadRawFile(rawImport.storagePath);

		if (downloadError || !fileBlob) {
			return NextResponse.json({ error: 'Impossible de télécharger le fichier' }, { status: 500 });
		}

		const content = await fileBlob.arrayBuffer();
		const parseResult = await parseImport(rawImport.bankKey, content, rawImport.mimeType);

		if (!parseResult.success || !parseResult.transactions?.length) {
			return NextResponse.json({ error: 'Impossible de parser le fichier' }, { status: 400 });
		}

		// Get date range from parsed transactions
		const dates = parseResult.transactions.map((tx) => tx.date.getTime());
		const minDate = new Date(Math.min(...dates));
		const maxDate = new Date(Math.max(...dates));

		// Count transactions that would be deleted
		const affectedCount = await prisma.transaction.count({
			where: {
				accountId,
				date: {
					gte: minDate,
					lte: maxDate,
				},
			},
		});

		return NextResponse.json({
			affectedCount,
			newCount: parseResult.transactions.length,
			minDate: minDate.toISOString(),
			maxDate: maxDate.toISOString(),
			accountId,
		});
	} catch (error) {
		console.error('Reprocess preview error:', error);

		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
		}

		return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
	}
}
