/**
 * Supabase Storage helpers for file management
 * Handles upload, download, and deletion of import files and bank logos
 */

import { createClient } from './server';

const IMPORTS_BUCKET = 'imports';
const BANK_LOGOS_BUCKET = 'bank-logos';

export interface UploadResult {
	path: string;
	error: Error | null;
}

export interface DownloadResult {
	data: Blob | null;
	error: Error | null;
}

export interface DeleteResult {
	error: Error | null;
}

/**
 * Generate a unique storage path for an import file
 */
function generateStoragePath(userId: string, filename: string): string {
	const timestamp = Date.now();
	const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
	return `${userId}/${timestamp}_${sanitizedFilename}`;
}

/**
 * Upload a raw file to Supabase Storage
 * @param userId - The ID of the user uploading the file
 * @param file - The file to upload (File or Buffer)
 * @param filename - Original filename
 * @returns The storage path and any error
 */
export async function uploadRawFile(
	userId: string,
	file: File | Buffer,
	filename: string,
): Promise<UploadResult> {
	try {
		const supabase = await createClient();
		const path = generateStoragePath(userId, filename);

		console.log('[Storage] Uploading file:', { userId, filename, path, bucket: IMPORTS_BUCKET });

		const { error } = await supabase.storage.from(IMPORTS_BUCKET).upload(path, file, {
			cacheControl: '3600',
			upsert: false,
		});

		if (error) {
			console.error('[Storage] Upload error:', error);
			return { path: '', error: new Error(error.message) };
		}

		console.log('[Storage] Upload successful:', path);
		return { path, error: null };
	} catch (err) {
		console.error('[Storage] Upload exception:', err);
		return { path: '', error: err instanceof Error ? err : new Error('Upload failed') };
	}
}

/**
 * Download a raw file from Supabase Storage
 * @param path - The storage path of the file
 * @returns The file data as a Blob and any error
 */
export async function downloadRawFile(path: string): Promise<DownloadResult> {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase.storage.from(IMPORTS_BUCKET).download(path);

		if (error) {
			return { data: null, error: new Error(error.message) };
		}

		return { data, error: null };
	} catch (err) {
		return { data: null, error: err instanceof Error ? err : new Error('Download failed') };
	}
}

/**
 * Delete a raw file from Supabase Storage
 * @param path - The storage path of the file to delete
 * @returns Any error that occurred
 */
export async function deleteRawFile(path: string): Promise<DeleteResult> {
	try {
		const supabase = await createClient();

		const { error } = await supabase.storage.from(IMPORTS_BUCKET).remove([path]);

		if (error) {
			return { error: new Error(error.message) };
		}

		return { error: null };
	} catch (err) {
		return { error: err instanceof Error ? err : new Error('Delete failed') };
	}
}

/**
 * Get a signed URL for downloading a file (temporary access)
 * @param path - The storage path of the file
 * @param expiresIn - Seconds until the URL expires (default: 3600 = 1 hour)
 * @returns The signed URL and any error
 */
export async function getSignedUrl(
	path: string,
	expiresIn: number = 3600,
): Promise<{ url: string | null; error: Error | null }> {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase.storage
			.from(IMPORTS_BUCKET)
			.createSignedUrl(path, expiresIn);

		if (error) {
			return { url: null, error: new Error(error.message) };
		}

		return { url: data.signedUrl, error: null };
	} catch (err) {
		return { url: null, error: err instanceof Error ? err : new Error('Failed to create signed URL') };
	}
}

// ============================================================================
// Bank Logo Storage Functions
// ============================================================================

const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_LOGO_DIMENSION = 200; // max 200x200 pixels

export interface BankLogoUploadResult {
	path: string | null;
	publicUrl: string | null;
	error: Error | null;
}

export interface LogoValidationResult {
	valid: boolean;
	error: string | null;
}

/**
 * Validate a logo file
 * @param file - The file to validate
 * @param mimeType - The MIME type of the file
 * @returns Validation result with error message if invalid
 */
export function validateLogoFile(fileSize: number, mimeType: string): LogoValidationResult {
	// Check MIME type
	if (!ALLOWED_LOGO_TYPES.includes(mimeType)) {
		return {
			valid: false,
			error: `Invalid file type. Allowed: PNG, JPG, SVG. Got: ${mimeType}`,
		};
	}

	// Check file size
	if (fileSize > MAX_LOGO_SIZE) {
		return {
			valid: false,
			error: `File too large. Maximum size: 5MB. Got: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`,
		};
	}

	return { valid: true, error: null };
}

/**
 * Validate image dimensions (for PNG/JPG only, not SVG)
 * @param buffer - The image buffer
 * @param mimeType - The MIME type
 * @returns Validation result
 */
export async function validateImageDimensions(
	buffer: ArrayBuffer,
	mimeType: string,
): Promise<LogoValidationResult> {
	// SVG files don't have fixed dimensions, skip dimension check
	if (mimeType === 'image/svg+xml') {
		return { valid: true, error: null };
	}

	// For PNG/JPG, check dimensions by reading the header
	const view = new DataView(buffer);

	try {
		let width = 0;
		let height = 0;

		if (mimeType === 'image/png') {
			// PNG: width at offset 16, height at offset 20 (big-endian 32-bit)
			if (buffer.byteLength >= 24) {
				width = view.getUint32(16, false);
				height = view.getUint32(20, false);
			}
		} else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
			// JPEG: Find SOF0 marker (0xFF 0xC0) and read dimensions
			const bytes = new Uint8Array(buffer);
			let i = 0;
			while (i < bytes.length - 9) {
				if (bytes[i] === 0xFF) {
					const marker = bytes[i + 1];
					// SOF0, SOF1, SOF2 markers
					if (marker >= 0xC0 && marker <= 0xC2) {
						height = (bytes[i + 5] << 8) | bytes[i + 6];
						width = (bytes[i + 7] << 8) | bytes[i + 8];
						break;
					}
					// Skip to next marker
					if (marker !== 0x00 && marker !== 0xFF) {
						const length = (bytes[i + 2] << 8) | bytes[i + 3];
						i += 2 + length;
						continue;
					}
				}
				i++;
			}
		}

		if (width > MAX_LOGO_DIMENSION || height > MAX_LOGO_DIMENSION) {
			return {
				valid: false,
				error: `Image dimensions too large. Maximum: ${MAX_LOGO_DIMENSION}x${MAX_LOGO_DIMENSION}. Got: ${width}x${height}`,
			};
		}

		return { valid: true, error: null };
	} catch {
		// If we can't read dimensions, let it pass (be permissive)
		return { valid: true, error: null };
	}
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
	const extensions: Record<string, string> = {
		'image/png': 'png',
		'image/jpeg': 'jpg',
		'image/jpg': 'jpg',
		'image/svg+xml': 'svg',
	};
	return extensions[mimeType] ?? 'png';
}

/**
 * Upload a bank logo to Supabase Storage
 * @param bankId - The ID of the bank
 * @param file - The file to upload
 * @param mimeType - The MIME type of the file
 * @returns The storage path, public URL, and any error
 */
export async function uploadBankLogo(
	bankId: string,
	file: Buffer | Blob,
	mimeType: string,
): Promise<BankLogoUploadResult> {
	try {
		const supabase = await createClient();
		const extension = getExtensionFromMimeType(mimeType);
		const path = `${bankId}.${extension}`;

		console.log('[Storage] Uploading bank logo:', { bankId, path, bucket: BANK_LOGOS_BUCKET });

		// Delete existing logo if any (different extension)
		const extensions = ['png', 'jpg', 'svg'];
		const pathsToDelete = extensions
			.filter((ext) => ext !== extension)
			.map((ext) => `${bankId}.${ext}`);

		if (pathsToDelete.length > 0) {
			await supabase.storage.from(BANK_LOGOS_BUCKET).remove(pathsToDelete);
		}

		// Upload new logo with upsert to replace existing
		const { error } = await supabase.storage.from(BANK_LOGOS_BUCKET).upload(path, file, {
			cacheControl: '86400', // 24 hours cache
			upsert: true,
			contentType: mimeType,
		});

		if (error) {
			console.error('[Storage] Bank logo upload error:', error);
			return { path: null, publicUrl: null, error: new Error(error.message) };
		}

		// Get public URL
		const { data: urlData } = supabase.storage.from(BANK_LOGOS_BUCKET).getPublicUrl(path);

		console.log('[Storage] Bank logo upload successful:', path);
		return { path, publicUrl: urlData.publicUrl, error: null };
	} catch (err) {
		console.error('[Storage] Bank logo upload exception:', err);
		return {
			path: null,
			publicUrl: null,
			error: err instanceof Error ? err : new Error('Logo upload failed'),
		};
	}
}

/**
 * Delete a bank logo from Supabase Storage
 * @param path - The storage path of the logo to delete
 * @returns Any error that occurred
 */
export async function deleteBankLogo(path: string): Promise<DeleteResult> {
	try {
		const supabase = await createClient();

		const { error } = await supabase.storage.from(BANK_LOGOS_BUCKET).remove([path]);

		if (error) {
			return { error: new Error(error.message) };
		}

		return { error: null };
	} catch (err) {
		return { error: err instanceof Error ? err : new Error('Delete failed') };
	}
}

/**
 * Get the public URL for a bank logo
 * @param path - The storage path of the logo
 * @returns The public URL
 */
export async function getBankLogoPublicUrl(path: string): Promise<string> {
	const supabase = await createClient();
	const { data } = supabase.storage.from(BANK_LOGOS_BUCKET).getPublicUrl(path);
	return data.publicUrl;
}
