/**
 * Utility Contract Repository
 * Handles data access for utility contracts (electricity, gas, water, internet, etc.)
 * 1:N relationship with Property
 */

import { prisma } from '@/lib/prisma';
import type { UtilityContract, UtilityType } from '@/lib/prisma';

// Types
export interface CreateUtilityContractDTO {
	propertyId: string;
	type: UtilityType;
	provider: string;
	contractNumber?: string;
	monthlyAmount: number;
	link?: string;
	notes?: string;
}

export interface UpdateUtilityContractDTO {
	type?: UtilityType;
	provider?: string;
	contractNumber?: string | null;
	monthlyAmount?: number;
	link?: string | null;
	notes?: string | null;
}

/**
 * Utility Contract repository
 */
export const utilityContractRepository = {
	/**
	 * Get all utility contracts for a property
	 */
	async getByProperty(propertyId: string): Promise<UtilityContract[]> {
		return prisma.utilityContract.findMany({
			where: { propertyId },
			orderBy: [{ type: 'asc' }, { provider: 'asc' }],
		});
	},

	/**
	 * Get utility contract by ID
	 */
	async getById(id: string): Promise<UtilityContract | null> {
		return prisma.utilityContract.findUnique({
			where: { id },
		});
	},

	/**
	 * Create utility contract
	 */
	async create(data: CreateUtilityContractDTO): Promise<UtilityContract> {
		return prisma.utilityContract.create({
			data: {
				propertyId: data.propertyId,
				type: data.type,
				provider: data.provider,
				contractNumber: data.contractNumber,
				monthlyAmount: data.monthlyAmount,
				link: data.link,
				notes: data.notes,
			},
		});
	},

	/**
	 * Update utility contract by ID
	 */
	async update(id: string, data: UpdateUtilityContractDTO): Promise<UtilityContract> {
		return prisma.utilityContract.update({
			where: { id },
			data,
		});
	},

	/**
	 * Delete utility contract by ID
	 */
	async delete(id: string): Promise<void> {
		await prisma.utilityContract.delete({
			where: { id },
		});
	},
};
