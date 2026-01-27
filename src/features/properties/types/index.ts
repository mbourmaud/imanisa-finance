/**
 * Property domain types
 */

import type { InsuranceType, PropertyType, PropertyUsage, UtilityType } from '@/lib/prisma';

export interface Member {
	id: string;
	name: string;
	color: string | null;
}

export interface PropertyMemberWithDetails {
	id: string;
	memberId: string;
	ownershipShare: number;
	member: Member;
}

export interface LoanInsurance {
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
	member: Member;
}

export interface Loan {
	id: string;
	propertyId: string;
	memberId: string | null;
	name: string;
	lender: string | null;
	loanNumber: string | null;
	initialAmount: number;
	remainingAmount: number;
	rate: number;
	monthlyPayment: number;
	startDate: string;
	endDate: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	loanInsurances: LoanInsurance[];
}

export interface PropertyInsurance {
	id: string;
	propertyId: string;
	type: InsuranceType;
	provider: string;
	contractNumber: string | null;
	monthlyPremium: number;
	startDate: string;
	endDate: string | null;
	coverage: string | null;
	link: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CoOwnership {
	id: string;
	propertyId: string;
	name: string;
	quarterlyAmount: number;
	link: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface UtilityContract {
	id: string;
	propertyId: string;
	type: UtilityType;
	provider: string;
	contractNumber: string | null;
	monthlyAmount: number;
	link: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface PropertyWithDetails {
	id: string;
	name: string;
	type: PropertyType;
	usage: PropertyUsage;
	address: string;
	address2: string | null;
	city: string;
	postalCode: string;
	surface: number;
	rooms: number | null;
	bedrooms: number | null;
	purchasePrice: number;
	purchaseDate: string;
	notaryFees: number;
	agencyFees: number | null;
	currentValue: number;
	rentAmount: number | null;
	rentCharges: number | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	propertyMembers: PropertyMemberWithDetails[];
	loans: Loan[];
	insurance: PropertyInsurance | null;
	coOwnership: CoOwnership | null;
	utilityContracts: UtilityContract[];
	_count: {
		loans: number;
		utilityContracts: number;
	};
}

export interface PropertySummary {
	totalProperties: number;
	totalValue: number;
	totalLoansRemaining: number;
	totalEquity: number;
	byType: Record<string, { count: number; value: number }>;
	byUsage: Record<string, { count: number; value: number }>;
}

export interface PropertyFilters {
	type?: PropertyType;
	usage?: PropertyUsage;
	search?: string;
}

export interface MemberShare {
	memberId: string;
	ownershipShare: number;
}

export interface CreatePropertyInput {
	name: string;
	type: PropertyType;
	usage: PropertyUsage;
	address: string;
	address2?: string | null;
	city: string;
	postalCode: string;
	surface: number;
	rooms?: number | null;
	bedrooms?: number | null;
	purchasePrice: number;
	purchaseDate: string;
	notaryFees: number;
	agencyFees?: number | null;
	currentValue: number;
	rentAmount?: number | null;
	rentCharges?: number | null;
	notes?: string | null;
	memberShares?: MemberShare[];
}

export interface UpdatePropertyInput {
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
	purchaseDate?: string;
	notaryFees?: number;
	agencyFees?: number | null;
	currentValue?: number;
	rentAmount?: number | null;
	rentCharges?: number | null;
	notes?: string | null;
	memberShares?: MemberShare[];
}

// Property Insurance types
export interface CreatePropertyInsuranceInput {
	type: InsuranceType;
	provider: string;
	contractNumber?: string | null;
	monthlyPremium: number;
	startDate: string;
	endDate?: string | null;
	coverage?: string | null;
	link?: string | null;
	notes?: string | null;
}

export interface UpdatePropertyInsuranceInput {
	type?: InsuranceType;
	provider?: string;
	contractNumber?: string | null;
	monthlyPremium?: number;
	startDate?: string;
	endDate?: string | null;
	coverage?: string | null;
	link?: string | null;
	notes?: string | null;
}

// Co-ownership types
export interface CreateCoOwnershipInput {
	name: string;
	quarterlyAmount: number;
	link?: string | null;
	notes?: string | null;
}

export interface UpdateCoOwnershipInput {
	name?: string;
	quarterlyAmount?: number;
	link?: string | null;
	notes?: string | null;
}

// Utility contract types
export interface CreateUtilityContractInput {
	type: UtilityType;
	provider: string;
	contractNumber?: string | null;
	monthlyAmount: number;
	link?: string | null;
	notes?: string | null;
}

export interface UpdateUtilityContractInput {
	type?: UtilityType;
	provider?: string;
	contractNumber?: string | null;
	monthlyAmount?: number;
	link?: string | null;
	notes?: string | null;
}

export type { PropertyType, PropertyUsage, InsuranceType, UtilityType };

// Form types
export type { PropertyFormData } from './form-types';
export { initialPropertyFormData } from './form-types';
