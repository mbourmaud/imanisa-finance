/**
 * Loan Repository
 * Handles data access for loans with property, member, and insurance details
 */

import { prisma } from '@/lib/prisma';
import type { Loan, LoanInsurance, Property } from '@prisma/client';

// Types
export interface LoanInsuranceWithMember extends LoanInsurance {
	member: {
		id: string;
		name: string;
		color: string | null;
	};
}

export interface LoanWithDetails extends Loan {
	property: {
		id: string;
		name: string;
		type: Property['type'];
		address: string;
		city: string;
	};
	member: {
		id: string;
		name: string;
		color: string | null;
	} | null;
	loanInsurances: LoanInsuranceWithMember[];
}

export interface LoanFilters {
	propertyId?: string;
	memberId?: string;
	search?: string;
}

export interface CreateLoanDTO {
	propertyId: string;
	memberId?: string;
	name: string;
	lender?: string;
	loanNumber?: string;
	initialAmount: number;
	remainingAmount: number;
	rate: number;
	monthlyPayment: number;
	startDate: Date;
	endDate?: Date;
	notes?: string;
}

export interface UpdateLoanDTO {
	memberId?: string | null;
	name?: string;
	lender?: string | null;
	loanNumber?: string | null;
	initialAmount?: number;
	remainingAmount?: number;
	rate?: number;
	monthlyPayment?: number;
	startDate?: Date;
	endDate?: Date | null;
	notes?: string | null;
}

export interface LoanSummary {
	totalLoans: number;
	totalRemaining: number;
	totalMonthlyPayment: number;
	averageRate: number;
}

// Include configuration for consistent query patterns
const loanWithDetailsInclude = {
	property: {
		select: {
			id: true,
			name: true,
			type: true,
			address: true,
			city: true,
		},
	},
	member: {
		select: {
			id: true,
			name: true,
			color: true,
		},
	},
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
} as const;

/**
 * Loan repository
 */
export const loanRepository = {
	/**
	 * Get all loans with optional filters
	 */
	async getAll(filters?: LoanFilters): Promise<LoanWithDetails[]> {
		const loans = await prisma.loan.findMany({
			where: {
				...(filters?.propertyId && { propertyId: filters.propertyId }),
				...(filters?.memberId && { memberId: filters.memberId }),
				...(filters?.search && {
					OR: [
						{ name: { contains: filters.search, mode: 'insensitive' } },
						{ lender: { contains: filters.search, mode: 'insensitive' } },
						{ loanNumber: { contains: filters.search, mode: 'insensitive' } },
					],
				}),
			},
			include: loanWithDetailsInclude,
			orderBy: [{ property: { name: 'asc' } }, { name: 'asc' }],
		});

		return loans;
	},

	/**
	 * Get loans for a specific property
	 */
	async getByProperty(propertyId: string): Promise<LoanWithDetails[]> {
		const loans = await prisma.loan.findMany({
			where: { propertyId },
			include: loanWithDetailsInclude,
			orderBy: [{ name: 'asc' }],
		});

		return loans;
	},

	/**
	 * Get loan by ID with all details
	 */
	async getById(id: string): Promise<LoanWithDetails | null> {
		const loan = await prisma.loan.findUnique({
			where: { id },
			include: loanWithDetailsInclude,
		});

		return loan;
	},

	/**
	 * Create a new loan
	 */
	async create(data: CreateLoanDTO): Promise<LoanWithDetails> {
		const loan = await prisma.loan.create({
			data: {
				propertyId: data.propertyId,
				memberId: data.memberId,
				name: data.name,
				lender: data.lender,
				loanNumber: data.loanNumber,
				initialAmount: data.initialAmount,
				remainingAmount: data.remainingAmount,
				rate: data.rate,
				monthlyPayment: data.monthlyPayment,
				startDate: data.startDate,
				endDate: data.endDate,
				notes: data.notes,
			},
			include: loanWithDetailsInclude,
		});

		return loan;
	},

	/**
	 * Update a loan
	 */
	async update(id: string, data: UpdateLoanDTO): Promise<LoanWithDetails> {
		const loan = await prisma.loan.update({
			where: { id },
			data,
			include: loanWithDetailsInclude,
		});

		return loan;
	},

	/**
	 * Delete a loan (cascades to loanInsurances)
	 */
	async delete(id: string): Promise<void> {
		await prisma.loan.delete({
			where: { id },
		});
	},

	/**
	 * Get loan summary statistics
	 */
	async getSummary(propertyId?: string): Promise<LoanSummary> {
		const loans = await prisma.loan.findMany({
			where: propertyId ? { propertyId } : undefined,
			select: {
				remainingAmount: true,
				monthlyPayment: true,
				rate: true,
			},
		});

		if (loans.length === 0) {
			return {
				totalLoans: 0,
				totalRemaining: 0,
				totalMonthlyPayment: 0,
				averageRate: 0,
			};
		}

		const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
		const totalMonthlyPayment = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
		const averageRate = loans.reduce((sum, loan) => sum + loan.rate, 0) / loans.length;

		return {
			totalLoans: loans.length,
			totalRemaining,
			totalMonthlyPayment,
			averageRate: Math.round(averageRate * 100) / 100,
		};
	},
};
