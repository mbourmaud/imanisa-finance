/**
 * Import Reprocess API Route
 * POST /api/imports/{id}/reprocess
 * - Deletes existing transactions linked to this import's account (within date range)
 * - Re-downloads and re-parses the raw file
 * - Useful after improving a parser
 */

import { type NextRequest, NextResponse } from 'next/server'
import { parseImport } from '@/features/import/parsers'
import { requireAuth } from '@/lib/auth'
import { downloadRawFile } from '@/lib/supabase/storage'
import {
	accountRepository,
	rawImportRepository,
	transactionRepository,
} from '@/server/repositories'

interface RouteParams {
	params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	const { id } = await params

	try {
		const user = await requireAuth()

		// Get import record
		const rawImport = await rawImportRepository.getById(id)

		if (!rawImport) {
			return NextResponse.json({ error: 'Import not found' }, { status: 404 })
		}

		// Verify ownership
		if (rawImport.userId !== user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
		}

		// Check if already processing
		if (rawImport.status === 'PROCESSING') {
			return NextResponse.json(
				{ error: 'Import is already being processed' },
				{ status: 409 },
			)
		}

		// Get account ID from request body or from import record
		const body = await request.json().catch(() => ({}))
		const accountId = body.accountId || rawImport.accountId

		if (!accountId) {
			return NextResponse.json(
				{ error: 'Account ID is required for reprocessing' },
				{ status: 400 },
			)
		}

		// Verify account exists
		const account = await accountRepository.getById(accountId)

		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 })
		}

		// Reset to pending
		await rawImportRepository.resetToPending(id)

		// Mark as processing
		await rawImportRepository.markProcessing(id)

		try {
			// Download file from storage
			const { data: fileBlob, error: downloadError } = await downloadRawFile(
				rawImport.storagePath,
			)

			if (downloadError || !fileBlob) {
				await rawImportRepository.markFailed(
					id,
					downloadError?.message || 'Failed to download file',
				)
				return NextResponse.json(
					{ error: 'Failed to download file from storage' },
					{ status: 500 },
				)
			}

			// Always pass ArrayBuffer to let the parser handle encoding
			// CSV files from French banks often use ISO-8859-1/Windows-1252 encoding
			const content = await fileBlob.arrayBuffer()

			// Parse the file
			const parseResult = await parseImport(
				rawImport.bankKey,
				content,
				rawImport.mimeType,
			)

			if (!parseResult.success || !parseResult.transactions) {
				const errorMsg = parseResult.errors?.join('; ') || 'Failed to parse file'
				await rawImportRepository.markFailed(id, errorMsg)
				return NextResponse.json(
					{
						error: 'Failed to parse file',
						details: parseResult.errors,
						warnings: parseResult.warnings,
					},
					{ status: 400 },
				)
			}

			// Get date range from parsed transactions
			const dates = parseResult.transactions.map((tx) => tx.date.getTime())
			const minDate = new Date(Math.min(...dates))
			const maxDate = new Date(Math.max(...dates))

			// Delete existing transactions in the date range for this account
			const deleteResult = await transactionRepository.deleteByAccountInDateRange(
				accountId,
				minDate,
				maxDate,
			)

			// Insert new transactions
			const insertResult = await transactionRepository.createManySimple(
				accountId,
				parseResult.transactions,
			)

			// Mark as processed
			await rawImportRepository.markProcessed(id, insertResult.count)

			// Update account ID if changed
			if (rawImport.accountId !== accountId) {
				await rawImportRepository.updateStatus(id, { accountId })
			}

			// Recalculate account balance after reprocess
			await accountRepository.recalculateBalance(accountId)

			return NextResponse.json({
				success: true,
				deletedCount: deleteResult.count,
				recordsCount: insertResult.count,
				warnings: parseResult.warnings,
				message: `Reprocessed: deleted ${deleteResult.count} old transactions, imported ${insertResult.count} new transactions`,
			})
		} catch (processError) {
			// Mark as failed if processing fails
			const errorMsg =
				processError instanceof Error
					? processError.message
					: 'Unknown processing error'
			await rawImportRepository.markFailed(id, errorMsg)
			throw processError
		}
	} catch (error) {
		console.error('Import reprocess error:', error)

		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
