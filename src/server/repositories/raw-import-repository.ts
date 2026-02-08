/**
 * Raw Import Repository
 * Handles data access for RawImport records
 * Handles data access for RawImport records (file storage tracking)
 */

import type { RawImportStatus } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

export interface CreateRawImportDTO {
	userId: string;
	bankKey: string;
	filename: string;
	storagePath: string;
	fileSize: number;
	mimeType: string;
	accountId?: string;
}

export interface UpdateRawImportDTO {
	status?: RawImportStatus;
	errorMessage?: string | null;
	recordsCount?: number | null;
	skippedCount?: number | null;
	accountId?: string | null;
	processedAt?: Date | null;
}

export interface RawImport {
	id: string;
	userId: string;
	bankKey: string;
	filename: string;
	storagePath: string;
	fileSize: number;
	mimeType: string;
	status: RawImportStatus;
	errorMessage: string | null;
	recordsCount: number | null;
	skippedCount: number | null;
	accountId: string | null;
	processedAt: Date | null;
	createdAt: Date;
}

export interface RawImportWithAccount extends RawImport {
	account: {
		id: string;
		name: string;
	} | null;
}

/**
 * Raw Import repository
 */
export const rawImportRepository = {
	/**
	 * Create a new raw import record
	 */
	async create(data: CreateRawImportDTO): Promise<RawImport> {
		return prisma.rawImport.create({
			data: {
				userId: data.userId,
				bankKey: data.bankKey,
				filename: data.filename,
				storagePath: data.storagePath,
				fileSize: data.fileSize,
				mimeType: data.mimeType,
				accountId: data.accountId,
			},
		});
	},

	/**
	 * Get a raw import by ID
	 */
	async getById(id: string): Promise<RawImportWithAccount | null> {
		return prisma.rawImport.findUnique({
			where: { id },
			include: {
				account: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	},

	/**
	 * Get all raw imports for a user
	 */
	async getByUserId(
		userId: string,
		options?: {
			status?: RawImportStatus;
			limit?: number;
			offset?: number;
		},
	): Promise<RawImportWithAccount[]> {
		return prisma.rawImport.findMany({
			where: {
				userId,
				...(options?.status && { status: options.status }),
			},
			include: {
				account: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
			take: options?.limit,
			skip: options?.offset,
		});
	},

	/**
	 * Count raw imports for a user
	 */
	async countByUserId(userId: string, status?: RawImportStatus): Promise<number> {
		return prisma.rawImport.count({
			where: {
				userId,
				...(status && { status }),
			},
		});
	},

	/**
	 * Get raw imports for a specific account
	 */
	async getByAccountId(
		accountId: string,
		options?: {
			limit?: number;
			offset?: number;
		},
	): Promise<RawImport[]> {
		return prisma.rawImport.findMany({
			where: { accountId },
			orderBy: { createdAt: 'desc' },
			take: options?.limit,
			skip: options?.offset,
		});
	},

	/**
	 * Count raw imports for an account
	 */
	async countByAccountId(accountId: string): Promise<number> {
		return prisma.rawImport.count({
			where: { accountId },
		});
	},

	/**
	 * Update a raw import's status and related fields
	 */
	async updateStatus(id: string, data: UpdateRawImportDTO): Promise<RawImport> {
		return prisma.rawImport.update({
			where: { id },
			data,
		});
	},

	/**
	 * Mark import as processing
	 */
	async markProcessing(id: string): Promise<RawImport> {
		return prisma.rawImport.update({
			where: { id },
			data: {
				status: 'PROCESSING',
				errorMessage: null,
			},
		});
	},

	/**
	 * Mark import as processed successfully
	 */
	async markProcessed(id: string, recordsCount: number): Promise<RawImport> {
		return prisma.rawImport.update({
			where: { id },
			data: {
				status: 'PROCESSED',
				recordsCount,
				processedAt: new Date(),
				errorMessage: null,
			},
		});
	},

	/**
	 * Mark import as failed
	 */
	async markFailed(id: string, errorMessage: string): Promise<RawImport> {
		return prisma.rawImport.update({
			where: { id },
			data: {
				status: 'FAILED',
				errorMessage,
			},
		});
	},

	/**
	 * Reset import to pending (for reprocessing)
	 */
	async resetToPending(id: string): Promise<RawImport> {
		return prisma.rawImport.update({
			where: { id },
			data: {
				status: 'PENDING',
				errorMessage: null,
				recordsCount: null,
				processedAt: null,
			},
		});
	},

	/**
	 * Delete a raw import record
	 */
	async delete(id: string): Promise<void> {
		await prisma.rawImport.delete({
			where: { id },
		});
	},

	/**
	 * Get pending imports (for batch processing)
	 */
	async getPending(limit: number = 10): Promise<RawImport[]> {
		return prisma.rawImport.findMany({
			where: { status: 'PENDING' },
			orderBy: { createdAt: 'asc' },
			take: limit,
		});
	},
};
