/**
 * Loan Insurance Repository
 * Handles data access for loan insurances (one per co-borrower/member)
 */

import type { LoanInsurance } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

// Types
export interface LoanInsuranceWithMember extends LoanInsurance {
	member: {
		id: string;
		name: string;
		color: string | null;
	};
}

export interface CreateLoanInsuranceDTO {
	loanId: string;
	memberId: string;
	name: string;
	provider: string;
	contractNumber?: string;
	coveragePercent: number;
	monthlyPremium: number;
	link?: string;
	notes?: string;
}

export interface UpdateLoanInsuranceDTO {
	memberId?: string;
	name?: string;
	provider?: string;
	contractNumber?: string | null;
	coveragePercent?: number;
	monthlyPremium?: number;
	link?: string | null;
	notes?: string | null;
}

// Include configuration for consistent query patterns
const loanInsuranceWithMemberInclude = {
	member: {
		select: {
			id: true,
			name: true,
			color: true,
		},
	},
} as const;

/**
 * Loan Insurance repository
 */
export const loanInsuranceRepository = {
	/**
	 * Get all insurances for a specific loan
	 */
	async getByLoan(loanId: string): Promise<LoanInsuranceWithMember[]> {
		const insurances = await prisma.loanInsurance.findMany({
			where: { loanId },
			include: loanInsuranceWithMemberInclude,
			orderBy: [{ member: { name: 'asc' } }],
		});

		return insurances;
	},

	/**
	 * Get loan insurance by ID with member details
	 */
	async getById(id: string): Promise<LoanInsuranceWithMember | null> {
		const insurance = await prisma.loanInsurance.findUnique({
			where: { id },
			include: loanInsuranceWithMemberInclude,
		});

		return insurance;
	},

	/**
	 * Create a new loan insurance
	 */
	async create(data: CreateLoanInsuranceDTO): Promise<LoanInsuranceWithMember> {
		const insurance = await prisma.loanInsurance.create({
			data: {
				loanId: data.loanId,
				memberId: data.memberId,
				name: data.name,
				provider: data.provider,
				contractNumber: data.contractNumber,
				coveragePercent: data.coveragePercent,
				monthlyPremium: data.monthlyPremium,
				link: data.link,
				notes: data.notes,
			},
			include: loanInsuranceWithMemberInclude,
		});

		return insurance;
	},

	/**
	 * Update a loan insurance
	 */
	async update(id: string, data: UpdateLoanInsuranceDTO): Promise<LoanInsuranceWithMember> {
		const insurance = await prisma.loanInsurance.update({
			where: { id },
			data,
			include: loanInsuranceWithMemberInclude,
		});

		return insurance;
	},

	/**
	 * Delete a loan insurance
	 */
	async delete(id: string): Promise<void> {
		await prisma.loanInsurance.delete({
			where: { id },
		});
	},
};
