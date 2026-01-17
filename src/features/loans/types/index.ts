/**
 * Loan domain types
 */

import type { PropertyType, PropertyUsage } from '@prisma/client'

export interface Member {
	id: string
	name: string
	color: string | null
}

export interface LoanInsurance {
	id: string
	loanId: string
	memberId: string
	name: string
	provider: string
	contractNumber: string | null
	coveragePercent: number
	monthlyPremium: number
	link: string | null
	notes: string | null
	createdAt: string
	updatedAt: string
	member: Member
}

export interface PropertySummary {
	id: string
	name: string
	type: PropertyType
	address: string
	city: string
}

export interface LoanWithDetails {
	id: string
	propertyId: string
	memberId: string | null
	name: string
	lender: string | null
	loanNumber: string | null
	initialAmount: number
	remainingAmount: number
	rate: number
	monthlyPayment: number
	startDate: string
	endDate: string | null
	notes: string | null
	createdAt: string
	updatedAt: string
	property: PropertySummary
	member: Member | null
	loanInsurances: LoanInsurance[]
}

export interface LoanSummary {
	totalLoans: number
	totalRemaining: number
	totalMonthlyPayment: number
	totalInsurance: number
	averageRate: number
}

export interface LoansResponse {
	loans: LoanWithDetails[]
	summary: LoanSummary
}

export interface LoanFilters {
	propertyId?: string
	memberId?: string
}

export interface CreateLoanInput {
	name: string
	lender?: string | null
	loanNumber?: string | null
	initialAmount: number
	remainingAmount: number
	rate: number
	monthlyPayment: number
	startDate: string
	endDate?: string | null
	memberId?: string | null
	notes?: string | null
}

export interface UpdateLoanInput {
	name?: string
	lender?: string | null
	loanNumber?: string | null
	initialAmount?: number
	remainingAmount?: number
	rate?: number
	monthlyPayment?: number
	startDate?: string
	endDate?: string | null
	memberId?: string | null
	notes?: string | null
}

// Loan Insurance types
export interface CreateLoanInsuranceInput {
	memberId: string
	name: string
	provider: string
	contractNumber?: string | null
	coveragePercent: number
	monthlyPremium: number
	link?: string | null
	notes?: string | null
}

export interface UpdateLoanInsuranceInput {
	memberId?: string
	name?: string
	provider?: string
	contractNumber?: string | null
	coveragePercent?: number
	monthlyPremium?: number
	link?: string | null
	notes?: string | null
}

export type { PropertyType, PropertyUsage }
