/**
 * Import Upload API Route
 * POST /api/imports/upload
 * - Receives the file (multipart/form-data)
 * - Uploads to Supabase Storage
 * - Creates the RawImport entry in database
 * - Returns the import ID
 */

import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadRawFile } from '@/lib/supabase/storage';
import { rawImportRepository, userRepository } from '@/server/repositories';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
	'text/csv',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Bank key validation - we accept any non-empty string now
// as bankKey comes from the bank's template or name
function isValidBankKey(key: string): boolean {
	return key.length > 0 && key.length <= 100;
}

export async function POST(request: NextRequest) {
	try {
		const user = await requireAuth();

		// Ensure user exists in Prisma (sync from Supabase)
		await userRepository.syncFromAuth(user.id, user.email, user.name);

		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const bankKey = formData.get('bankKey') as string | null;
		const accountId = formData.get('accountId') as string | null;

		// Validate required fields
		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 });
		}

		if (!bankKey) {
			return NextResponse.json({ error: 'Bank key is required' }, { status: 400 });
		}

		if (!isValidBankKey(bankKey)) {
			return NextResponse.json({ error: 'Invalid bank key' }, { status: 400 });
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
				{ status: 400 },
			);
		}

		// Validate file type
		const mimeType = file.type || getMimeTypeFromExtension(file.name);
		if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
			return NextResponse.json(
				{ error: 'Invalid file type. Only CSV and Excel files are allowed.' },
				{ status: 400 },
			);
		}

		// Upload file to Supabase Storage
		const { path, error: uploadError } = await uploadRawFile(user.id, file, file.name);

		if (uploadError) {
			console.error('Upload error:', uploadError.message);
			return NextResponse.json(
				{ error: `Failed to upload file: ${uploadError.message}` },
				{ status: 500 },
			);
		}

		// Create RawImport record in database
		const rawImport = await rawImportRepository.create({
			userId: user.id,
			bankKey,
			filename: file.name,
			storagePath: path,
			fileSize: file.size,
			mimeType,
			accountId: accountId || undefined,
		});

		return NextResponse.json(
			{
				id: rawImport.id,
				filename: rawImport.filename,
				status: rawImport.status,
				message: 'File uploaded successfully',
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error('Import upload error:', error);

		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Return more specific error message in development
		const errorMessage =
			process.env.NODE_ENV === 'development' && error instanceof Error
				? error.message
				: 'Internal server error';

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

/**
 * Infer MIME type from file extension
 */
function getMimeTypeFromExtension(filename: string): string {
	const ext = filename.toLowerCase().split('.').pop();
	switch (ext) {
		case 'csv':
			return 'text/csv';
		case 'xlsx':
			return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		case 'xls':
			return 'application/vnd.ms-excel';
		default:
			return 'application/octet-stream';
	}
}
