/**
 * Property Insurance Repository
 * Handles data access for property insurance (PNO/MRH)
 * 1:1 relationship with Property
 */

import type { InsuranceType, PropertyInsurance } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

// Types
export interface CreatePropertyInsuranceDTO {
	propertyId: string;
	type: InsuranceType;
	provider: string;
	contractNumber?: string;
	monthlyPremium: number;
	startDate: Date;
	endDate?: Date;
	coverage?: string;
	link?: string;
	notes?: string;
}

export interface UpdatePropertyInsuranceDTO {
	type?: InsuranceType;
	provider?: string;
	contractNumber?: string | null;
	monthlyPremium?: number;
	startDate?: Date;
	endDate?: Date | null;
	coverage?: string | null;
	link?: string | null;
	notes?: string | null;
}

/**
 * Property Insurance repository
 */
export const propertyInsuranceRepository = {
	/**
	 * Get property insurance by property ID (1:1 relationship)
	 */
	async getByProperty(propertyId: string): Promise<PropertyInsurance | null> {
		return prisma.propertyInsurance.findUnique({
			where: { propertyId },
		});
	},

	/**
	 * Create property insurance
	 */
	async create(data: CreatePropertyInsuranceDTO): Promise<PropertyInsurance> {
		return prisma.propertyInsurance.create({
			data: {
				propertyId: data.propertyId,
				type: data.type,
				provider: data.provider,
				contractNumber: data.contractNumber,
				monthlyPremium: data.monthlyPremium,
				startDate: data.startDate,
				endDate: data.endDate,
				coverage: data.coverage,
				link: data.link,
				notes: data.notes,
			},
		});
	},

	/**
	 * Update property insurance by property ID
	 */
	async update(propertyId: string, data: UpdatePropertyInsuranceDTO): Promise<PropertyInsurance> {
		return prisma.propertyInsurance.update({
			where: { propertyId },
			data,
		});
	},

	/**
	 * Delete property insurance by property ID
	 */
	async delete(propertyId: string): Promise<void> {
		await prisma.propertyInsurance.delete({
			where: { propertyId },
		});
	},
};
