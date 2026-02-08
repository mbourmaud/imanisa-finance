/**
 * Property Document Repository
 * Handles data access for property documents stored in Supabase Storage
 */

import { prisma } from '@/lib/prisma'

export interface CreatePropertyDocumentDTO {
	propertyId: string
	name: string
	storagePath: string
	filename: string
	fileSize: number
	mimeType: string
}

export const propertyDocumentRepository = {
	async getByProperty(propertyId: string) {
		return prisma.propertyDocument.findMany({
			where: { propertyId },
			orderBy: { createdAt: 'desc' },
		})
	},

	async getById(id: string) {
		return prisma.propertyDocument.findUnique({
			where: { id },
		})
	},

	async create(data: CreatePropertyDocumentDTO) {
		return prisma.propertyDocument.create({
			data: {
				propertyId: data.propertyId,
				name: data.name,
				storagePath: data.storagePath,
				filename: data.filename,
				fileSize: data.fileSize,
				mimeType: data.mimeType,
			},
		})
	},

	async delete(id: string) {
		return prisma.propertyDocument.delete({
			where: { id },
		})
	},
}
