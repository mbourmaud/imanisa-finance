/**
 * Import Process API Route
 * POST /api/imports/{id}/process
 * - Downloads the raw file from Storage
 * - Parses with the appropriate parser based on bankKey
 * - Inserts transactions into database with deduplication
 * - Updates RawImport status with inserted/skipped counts
 */

import { type NextRequest, NextResponse } from 'next/server';
import { parseImport } from '@/features/import/parsers';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { downloadRawFile } from '@/lib/supabase/storage';
import {
	accountRepository,
	rawImportRepository,
	transactionRepository,
} from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		const user = await requireAuth();

		// Get import record
		const rawImport = await rawImportRepository.getById(id);

		if (!rawImport) {
			return NextResponse.json({ error: 'Import not found' }, { status: 404 });
		}

		// Verify ownership
		if (rawImport.userId !== user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Check if already processing
		if (rawImport.status === 'PROCESSING') {
			return NextResponse.json({ error: 'Import is already being processed' }, { status: 409 });
		}

		// Mark as processing
		await rawImportRepository.markProcessing(id);

		try {
			// Download file from storage
			const { data: fileBlob, error: downloadError } = await downloadRawFile(rawImport.storagePath);

			if (downloadError || !fileBlob) {
				await rawImportRepository.markFailed(
					id,
					downloadError?.message || 'Failed to download file',
				);
				return NextResponse.json(
					{ error: 'Failed to download file from storage' },
					{ status: 500 },
				);
			}

			// Always pass ArrayBuffer to let the parser handle encoding
			// CSV files from French banks often use ISO-8859-1/Windows-1252 encoding
			const content = await fileBlob.arrayBuffer();

			// Parse the file
			const parseResult = await parseImport(rawImport.bankKey, content, rawImport.mimeType);

			if (!parseResult.success || !parseResult.transactions) {
				const errorMsg = parseResult.errors?.join('; ') || 'Failed to parse file';
				await rawImportRepository.markFailed(id, errorMsg);
				return NextResponse.json(
					{
						error: 'Failed to parse file',
						details: parseResult.errors,
						warnings: parseResult.warnings,
					},
					{ status: 400 },
				);
			}

			// Get account ID from request body or from import record
			const body = await request.json().catch(() => ({}));
			const accountId = body.accountId || rawImport.accountId;

			if (!accountId) {
				await rawImportRepository.markFailed(id, 'Account ID is required');
				return NextResponse.json(
					{ error: 'Account ID is required. Please specify an account for these transactions.' },
					{ status: 400 },
				);
			}

			// Verify account exists (using new schema without bank relation)
			const account = await accountRepository.getById(accountId);

			if (!account) {
				await rawImportRepository.markFailed(id, 'Account not found');
				return NextResponse.json({ error: 'Account not found' }, { status: 404 });
			}

			// Insert transactions with deduplication
			const importResult = await transactionRepository.createManySkipDuplicates(
				accountId,
				parseResult.transactions,
			);

			// Update import status with counts
			await prisma.rawImport.update({
				where: { id },
				data: {
					status: 'PROCESSED',
					recordsCount: importResult.inserted,
					skippedCount: importResult.skipped,
					processedAt: new Date(),
					errorMessage: importResult.errors.length > 0 ? importResult.errors.join('; ') : null,
					accountId: accountId,
				},
			});

			// Recalculate account balance after import
			await accountRepository.recalculateBalance(accountId);

			// Build response message
			let message = `Successfully imported ${importResult.inserted} transaction${importResult.inserted !== 1 ? 's' : ''}`;
			if (importResult.skipped > 0) {
				message += `, ${importResult.skipped} duplicate${importResult.skipped !== 1 ? 's' : ''} skipped`;
			}

			return NextResponse.json({
				success: true,
				recordsCount: importResult.inserted,
				skippedCount: importResult.skipped,
				errors: importResult.errors,
				warnings: parseResult.warnings,
				message,
			});
		} catch (processError) {
			// Mark as failed if processing fails
			const errorMsg =
				processError instanceof Error ? processError.message : 'Unknown processing error';
			await rawImportRepository.markFailed(id, errorMsg);
			throw processError;
		}
	} catch (error) {
		console.error('Import process error:', error);

		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
