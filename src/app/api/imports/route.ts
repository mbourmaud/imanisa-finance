/**
 * Imports API Routes
 * GET /api/imports - List all imports for the current user
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { rawImportRepository } from '@/server/repositories';
import type { RawImportStatus } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		await requireAuth();

		const { searchParams } = new URL(request.url);
		const status = searchParams.get('status') as RawImportStatus | null;
		const accountId = searchParams.get('accountId');
		const limit = Number(searchParams.get('limit')) || 50;
		const offset = Number(searchParams.get('offset')) || 0;

		// If accountId is provided, filter by account
		if (accountId) {
			const imports = await rawImportRepository.getByAccountId(accountId, {
				limit,
				offset,
			});

			const total = await rawImportRepository.countByAccountId(accountId);

			return NextResponse.json({
				items: imports.map((imp) => ({
					id: imp.id,
					bankKey: imp.bankKey,
					filename: imp.filename,
					fileSize: imp.fileSize,
					mimeType: imp.mimeType,
					status: imp.status,
					errorMessage: imp.errorMessage,
					recordsCount: imp.recordsCount,
					skippedCount: imp.skippedCount,
					accountId: imp.accountId,
					processedAt: imp.processedAt,
					createdAt: imp.createdAt,
				})),
				total,
				limit,
				offset,
			});
		}

		// Otherwise, get all imports for the user (for other pages)
		const user = await requireAuth();
		const imports = await rawImportRepository.getByUserId(user.id, {
			status: status || undefined,
			limit,
			offset,
		});

		const total = await rawImportRepository.countByUserId(user.id, status || undefined);

		return NextResponse.json({
			items: imports.map((imp) => ({
				id: imp.id,
				bankKey: imp.bankKey,
				filename: imp.filename,
				fileSize: imp.fileSize,
				mimeType: imp.mimeType,
				status: imp.status,
				errorMessage: imp.errorMessage,
				recordsCount: imp.recordsCount,
				skippedCount: imp.skippedCount,
				account: imp.account,
				processedAt: imp.processedAt,
				createdAt: imp.createdAt,
			})),
			total,
			limit,
			offset,
		});
	} catch (error) {
		console.error('Error fetching imports:', error);

		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
