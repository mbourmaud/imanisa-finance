/**
 * Import Reprocess API Route
 * POST /api/imports/{id}/reprocess
 * - Deletes existing transactions linked to this import's account (within date range)
 * - Re-downloads and re-parses the raw file
 * - Useful after improving a parser
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { downloadRawFile } from '@/lib/supabase/storage';
import { parseImport } from '@/features/import/parsers';
import { rawImportRepository, accountRepository } from '@/server/repositories';
import { prisma } from '@/lib/prisma';

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

		// Get account ID from request body or from import record
		const body = await request.json().catch(() => ({}));
		const accountId = body.accountId || rawImport.accountId;

		if (!accountId) {
			return NextResponse.json(
				{ error: 'Account ID is required for reprocessing' },
				{ status: 400 },
			);
		}

		// Verify account exists (new schema: accounts are shared, no longer tied to users via banks)
		const account = await prisma.account.findUnique({
			where: { id: accountId },
		});

		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		// Reset to pending
		await rawImportRepository.resetToPending(id);

		// Mark as processing
		await rawImportRepository.markProcessing(id);

		try {
			// Download file from storage
			const { data: fileBlob, error: downloadError } = await downloadRawFile(rawImport.storagePath);

			if (downloadError || !fileBlob) {
				await rawImportRepository.markFailed(id, downloadError?.message || 'Failed to download file');
				return NextResponse.json({ error: 'Failed to download file from storage' }, { status: 500 });
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

			// Get date range from parsed transactions
			const dates = parseResult.transactions.map((tx) => tx.date.getTime());
			const minDate = new Date(Math.min(...dates));
			const maxDate = new Date(Math.max(...dates));

			// Delete existing transactions in the date range for this account
			// This is a simplistic approach - in production you might want more sophisticated deduplication
			const deleteCount = await prisma.transaction.deleteMany({
				where: {
					accountId,
					date: {
						gte: minDate,
						lte: maxDate,
					},
				},
			});

			// Insert new transactions
			const insertedTransactions = await prisma.transaction.createMany({
				data: parseResult.transactions.map((tx) => ({
					accountId,
					type: tx.type,
					amount: tx.amount,
					currency: 'EUR',
					description: tx.description,
					date: tx.date,
					bankCategory: tx.bankCategory,
					isInternal: false,
				})),
			});

			// Mark as processed
			await rawImportRepository.markProcessed(id, insertedTransactions.count);

			// Update account ID if changed
			if (rawImport.accountId !== accountId) {
				await rawImportRepository.updateStatus(id, { accountId });
			}

			// Recalculate account balance after reprocess
			await accountRepository.recalculateBalance(accountId);

			return NextResponse.json({
				success: true,
				deletedCount: deleteCount.count,
				recordsCount: insertedTransactions.count,
				warnings: parseResult.warnings,
				message: `Reprocessed: deleted ${deleteCount.count} old transactions, imported ${insertedTransactions.count} new transactions`,
			});
		} catch (processError) {
			// Mark as failed if processing fails
			const errorMsg = processError instanceof Error ? processError.message : 'Unknown processing error';
			await rawImportRepository.markFailed(id, errorMsg);
			throw processError;
		}
	} catch (error) {
		console.error('Import reprocess error:', error);

		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
