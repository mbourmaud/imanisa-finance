/**
 * Single Import API Routes
 * GET /api/imports/{id} - Get import details
 * DELETE /api/imports/{id} - Delete import and associated file
 */

import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { deleteRawFile } from '@/lib/supabase/storage';
import { rawImportRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		const user = await requireAuth();

		const rawImport = await rawImportRepository.getById(id);

		if (!rawImport) {
			return NextResponse.json({ error: 'Import not found' }, { status: 404 });
		}

		// Verify ownership
		if (rawImport.userId !== user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		return NextResponse.json({
			id: rawImport.id,
			bankKey: rawImport.bankKey,
			filename: rawImport.filename,
			fileSize: rawImport.fileSize,
			mimeType: rawImport.mimeType,
			status: rawImport.status,
			errorMessage: rawImport.errorMessage,
			recordsCount: rawImport.recordsCount,
			account: rawImport.account,
			processedAt: rawImport.processedAt,
			createdAt: rawImport.createdAt,
		});
	} catch (error) {
		console.error('Error fetching import:', error);

		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		const user = await requireAuth();

		const rawImport = await rawImportRepository.getById(id);

		if (!rawImport) {
			return NextResponse.json({ error: 'Import not found' }, { status: 404 });
		}

		// Verify ownership
		if (rawImport.userId !== user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Delete file from storage
		const { error: deleteFileError } = await deleteRawFile(rawImport.storagePath);

		if (deleteFileError) {
			console.warn('Failed to delete file from storage:', deleteFileError);
			// Continue with deletion even if file removal fails
		}

		// Delete database record
		await rawImportRepository.delete(id);

		return NextResponse.json({
			success: true,
			message: 'Import deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting import:', error);

		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
