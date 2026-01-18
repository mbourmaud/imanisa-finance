/**
 * Bank Logo Upload API Route
 * POST /api/banks/:id/logo - Upload a logo for a bank
 *
 * Accepts multipart/form-data with a 'logo' field
 * Validates: PNG/JPG/SVG only, max 5MB, max 200x200 pixels
 */

import { type NextRequest, NextResponse } from 'next/server';
import { uploadBankLogo, validateImageDimensions, validateLogoFile } from '@/lib/supabase/storage';
import { bankRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Verify bank exists
		const bank = await bankRepository.getById(id);
		if (!bank) {
			return NextResponse.json({ error: 'Bank not found' }, { status: 404 });
		}

		// Parse multipart form data
		const formData = await request.formData();
		const logoFile = formData.get('logo');

		if (!logoFile || !(logoFile instanceof File)) {
			return NextResponse.json(
				{ error: 'No logo file provided. Send a file with field name "logo".' },
				{ status: 400 },
			);
		}

		const mimeType = logoFile.type;
		const fileSize = logoFile.size;

		// Validate file type and size
		const basicValidation = validateLogoFile(fileSize, mimeType);
		if (!basicValidation.valid) {
			return NextResponse.json({ error: basicValidation.error }, { status: 400 });
		}

		// Read file as buffer for dimension validation
		const arrayBuffer = await logoFile.arrayBuffer();

		// Validate dimensions (for PNG/JPG only)
		const dimensionValidation = await validateImageDimensions(arrayBuffer, mimeType);
		if (!dimensionValidation.valid) {
			return NextResponse.json({ error: dimensionValidation.error }, { status: 400 });
		}

		// Upload to Supabase Storage
		const buffer = Buffer.from(arrayBuffer);
		const uploadResult = await uploadBankLogo(id, buffer, mimeType);

		if (uploadResult.error) {
			return NextResponse.json(
				{ error: `Upload failed: ${uploadResult.error.message}` },
				{ status: 500 },
			);
		}

		// Update bank with logo path
		const updatedBank = await bankRepository.update(id, {
			logo: uploadResult.path,
		});

		return NextResponse.json({
			success: true,
			bank: updatedBank,
			logo: {
				path: uploadResult.path,
				publicUrl: uploadResult.publicUrl,
			},
		});
	} catch (error) {
		console.error('Error uploading bank logo:', error);
		return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
	}
}
