/**
 * Property Repository
 * Handles data access for properties with members, loans, and related contracts
 */

import type {
	CoOwnership,
	Loan,
	Property,
	PropertyInsurance,
	PropertyMember,
	PropertyType,
	PropertyUsage,
	UtilityContract,
} from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

// Types
export interface PropertyMemberWithDetails {
	id: string;
	memberId: string;
	ownershipShare: number;
	member: {
		id: string;
		name: string;
		color: string | null;
	};
}

export interface PropertyWithMembers extends Property {
	propertyMembers: PropertyMemberWithDetails[];
}

export interface LoanInsuranceWithMember {
	id: string;
	loanId: string;
	memberId: string;
	name: string;
	provider: string;
	contractNumber: string | null;
	coveragePercent: number;
	monthlyPremium: number;
	link: string | null;
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
	member: {
		id: string;
		name: string;
		color: string | null;
	};
}

export interface LoanWithInsurances extends Loan {
	loanInsurances: LoanInsuranceWithMember[];
}

export interface PropertyWithDetails extends PropertyWithMembers {
	loans: LoanWithInsurances[];
	insurance: PropertyInsurance | null;
	coOwnership: CoOwnership | null;
	utilityContracts: UtilityContract[];
	_count: {
		loans: number;
		utilityContracts: number;
	};
}

export interface PropertyFilters {
	type?: PropertyType;
	usage?: PropertyUsage;
	memberId?: string;
	search?: string;
}

export interface CreatePropertyDTO {
	name: string;
	type: PropertyType;
	usage: PropertyUsage;
	address: string;
	address2?: string;
	city: string;
	postalCode: string;
	surface: number;
	rooms?: number;
	bedrooms?: number;
	purchasePrice: number;
	purchaseDate: Date;
	notaryFees: number;
	agencyFees?: number;
	currentValue: number;
	rentAmount?: number;
	rentCharges?: number;
	notes?: string;
	memberShares?: { memberId: string; ownershipShare: number }[];
}

export interface UpdatePropertyDTO {
	name?: string;
	type?: PropertyType;
	usage?: PropertyUsage;
	address?: string;
	address2?: string | null;
	city?: string;
	postalCode?: string;
	surface?: number;
	rooms?: number | null;
	bedrooms?: number | null;
	purchasePrice?: number;
	purchaseDate?: Date;
	notaryFees?: number;
	agencyFees?: number | null;
	currentValue?: number;
	rentAmount?: number | null;
	rentCharges?: number | null;
	notes?: string | null;
}

export interface PropertySummary {
	totalProperties: number;
	totalValue: number;
	totalLoansRemaining: number;
	totalEquity: number;
	byType: Record<string, { count: number; value: number }>;
	byUsage: Record<string, { count: number; value: number }>;
}

/**
 * Property repository
 */
export const propertyRepository = {
	/**
	 * Get all properties with optional filters
	 */
	async getAll(filters?: PropertyFilters): Promise<PropertyWithDetails[]> {
		const properties = await prisma.property.findMany({
			where: {
				...(filters?.type && { type: filters.type }),
				...(filters?.usage && { usage: filters.usage }),
				...(filters?.memberId && {
					propertyMembers: {
						some: { memberId: filters.memberId },
					},
				}),
				...(filters?.search && {
					OR: [
						{ name: { contains: filters.search, mode: 'insensitive' } },
						{ address: { contains: filters.search, mode: 'insensitive' } },
						{ city: { contains: filters.search, mode: 'insensitive' } },
					],
				}),
			},
			include: {
				propertyMembers: {
					include: {
						member: {
							select: {
								id: true,
								name: true,
								color: true,
							},
						},
					},
				},
				loans: {
					include: {
						loanInsurances: {
							include: {
								member: {
									select: {
										id: true,
										name: true,
										color: true,
									},
								},
							},
						},
					},
				},
				insurance: true,
				coOwnership: true,
				utilityContracts: true,
				_count: {
					select: {
						loans: true,
						utilityContracts: true,
					},
				},
			},
			orderBy: [{ name: 'asc' }],
		});

		return properties;
	},

	/**
	 * Get property by ID with all related data
	 */
	async getById(id: string): Promise<PropertyWithDetails | null> {
		const property = await prisma.property.findUnique({
			where: { id },
			include: {
				propertyMembers: {
					include: {
						member: {
							select: {
								id: true,
								name: true,
								color: true,
							},
						},
					},
				},
				loans: {
					include: {
						loanInsurances: {
							include: {
								member: {
									select: {
										id: true,
										name: true,
										color: true,
									},
								},
							},
						},
					},
				},
				insurance: true,
				coOwnership: true,
				utilityContracts: true,
				_count: {
					select: {
						loans: true,
						utilityContracts: true,
					},
				},
			},
		});

		return property;
	},

	/**
	 * Create a new property with optional member associations
	 */
	async create(data: CreatePropertyDTO): Promise<PropertyWithDetails> {
		const property = await prisma.property.create({
			data: {
				name: data.name,
				type: data.type,
				usage: data.usage,
				address: data.address,
				address2: data.address2,
				city: data.city,
				postalCode: data.postalCode,
				surface: data.surface,
				rooms: data.rooms,
				bedrooms: data.bedrooms,
				purchasePrice: data.purchasePrice,
				purchaseDate: data.purchaseDate,
				notaryFees: data.notaryFees,
				agencyFees: data.agencyFees,
				currentValue: data.currentValue,
				rentAmount: data.rentAmount,
				rentCharges: data.rentCharges,
				notes: data.notes,
				...(data.memberShares && {
					propertyMembers: {
						create: data.memberShares.map((ms) => ({
							memberId: ms.memberId,
							ownershipShare: ms.ownershipShare,
						})),
					},
				}),
			},
			include: {
				propertyMembers: {
					include: {
						member: {
							select: {
								id: true,
								name: true,
								color: true,
							},
						},
					},
				},
				loans: {
					include: {
						loanInsurances: {
							include: {
								member: {
									select: {
										id: true,
										name: true,
										color: true,
									},
								},
							},
						},
					},
				},
				insurance: true,
				coOwnership: true,
				utilityContracts: true,
				_count: {
					select: {
						loans: true,
						utilityContracts: true,
					},
				},
			},
		});

		return property;
	},

	/**
	 * Update a property
	 */
	async update(id: string, data: UpdatePropertyDTO): Promise<PropertyWithDetails> {
		const property = await prisma.property.update({
			where: { id },
			data,
			include: {
				propertyMembers: {
					include: {
						member: {
							select: {
								id: true,
								name: true,
								color: true,
							},
						},
					},
				},
				loans: {
					include: {
						loanInsurances: {
							include: {
								member: {
									select: {
										id: true,
										name: true,
										color: true,
									},
								},
							},
						},
					},
				},
				insurance: true,
				coOwnership: true,
				utilityContracts: true,
				_count: {
					select: {
						loans: true,
						utilityContracts: true,
					},
				},
			},
		});

		return property;
	},

	/**
	 * Delete a property (cascades to loans, insurance, coOwnership, utilityContracts)
	 */
	async delete(id: string): Promise<void> {
		await prisma.property.delete({
			where: { id },
		});
	},

	/**
	 * Add a member to a property
	 */
	async addMember(
		propertyId: string,
		memberId: string,
		ownershipShare: number = 100,
	): Promise<PropertyMember> {
		return prisma.propertyMember.create({
			data: {
				propertyId,
				memberId,
				ownershipShare,
			},
		});
	},

	/**
	 * Remove a member from a property
	 */
	async removeMember(propertyId: string, memberId: string): Promise<void> {
		await prisma.propertyMember.delete({
			where: {
				propertyId_memberId: {
					propertyId,
					memberId,
				},
			},
		});
	},

	/**
	 * Update a member's ownership share
	 */
	async updateMemberShare(
		propertyId: string,
		memberId: string,
		ownershipShare: number,
	): Promise<PropertyMember> {
		return prisma.propertyMember.update({
			where: {
				propertyId_memberId: {
					propertyId,
					memberId,
				},
			},
			data: { ownershipShare },
		});
	},

	/**
	 * Update all member shares for a property (replace existing)
	 */
	async updateMembers(
		propertyId: string,
		memberShares: { memberId: string; ownershipShare: number }[],
	): Promise<void> {
		await prisma.$transaction([
			// Delete existing members
			prisma.propertyMember.deleteMany({
				where: { propertyId },
			}),
			// Create new members
			prisma.propertyMember.createMany({
				data: memberShares.map((ms) => ({
					propertyId,
					memberId: ms.memberId,
					ownershipShare: ms.ownershipShare,
				})),
			}),
		]);
	},

	/**
	 * Get property summary statistics
	 */
	async getSummary(): Promise<PropertySummary> {
		const properties = await prisma.property.findMany({
			select: {
				type: true,
				usage: true,
				currentValue: true,
				loans: {
					select: {
						remainingAmount: true,
					},
				},
			},
		});

		const byType: Record<string, { count: number; value: number }> = {};
		const byUsage: Record<string, { count: number; value: number }> = {};
		let totalValue = 0;
		let totalLoansRemaining = 0;

		for (const property of properties) {
			totalValue += property.currentValue;

			const loansRemaining = property.loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
			totalLoansRemaining += loansRemaining;

			// By type
			if (!byType[property.type]) {
				byType[property.type] = { count: 0, value: 0 };
			}
			byType[property.type].count++;
			byType[property.type].value += property.currentValue;

			// By usage
			if (!byUsage[property.usage]) {
				byUsage[property.usage] = { count: 0, value: 0 };
			}
			byUsage[property.usage].count++;
			byUsage[property.usage].value += property.currentValue;
		}

		return {
			totalProperties: properties.length,
			totalValue,
			totalLoansRemaining,
			totalEquity: totalValue - totalLoansRemaining,
			byType,
			byUsage,
		};
	},
};
