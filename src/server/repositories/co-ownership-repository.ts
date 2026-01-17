/**
 * CoOwnership Repository
 * Handles data access for co-ownership/syndic information
 * 1:1 relationship with Property
 */

import { prisma } from '@/lib/prisma';
import type { CoOwnership } from '@/lib/prisma';

// Types
export interface CreateCoOwnershipDTO {
	propertyId: string;
	name: string;
	quarterlyAmount: number;
	link?: string;
	notes?: string;
}

export interface UpdateCoOwnershipDTO {
	name?: string;
	quarterlyAmount?: number;
	link?: string | null;
	notes?: string | null;
}

/**
 * CoOwnership repository
 */
export const coOwnershipRepository = {
	/**
	 * Get co-ownership by property ID (1:1 relationship)
	 */
	async getByProperty(propertyId: string): Promise<CoOwnership | null> {
		return prisma.coOwnership.findUnique({
			where: { propertyId },
		});
	},

	/**
	 * Create co-ownership
	 */
	async create(data: CreateCoOwnershipDTO): Promise<CoOwnership> {
		return prisma.coOwnership.create({
			data: {
				propertyId: data.propertyId,
				name: data.name,
				quarterlyAmount: data.quarterlyAmount,
				link: data.link,
				notes: data.notes,
			},
		});
	},

	/**
	 * Update co-ownership by property ID
	 */
	async update(propertyId: string, data: UpdateCoOwnershipDTO): Promise<CoOwnership> {
		return prisma.coOwnership.update({
			where: { propertyId },
			data,
		});
	},

	/**
	 * Delete co-ownership by property ID
	 */
	async delete(propertyId: string): Promise<void> {
		await prisma.coOwnership.delete({
			where: { propertyId },
		});
	},
};
