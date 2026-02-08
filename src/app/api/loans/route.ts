/**
 * GET /api/loans
 * Returns all loans with property info and summary statistics
 */

import { NextResponse } from 'next/server';
import { loanRepository } from '@/server/repositories';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		// Optional filters
		const filters = {
			propertyId: searchParams.get('propertyId') || undefined,
			memberId: searchParams.get('memberId') || undefined,
			search: searchParams.get('search') || undefined,
		};

		// Get loans with details (already filtered by memberId/propertyId)
		const loans = await loanRepository.getAll(filters);

		// Compute summary from filtered loans
		const totalRemaining = loans.reduce((sum, l) => sum + l.remainingAmount, 0)
		const totalMonthlyPayment = loans.reduce((sum, l) => sum + l.monthlyPayment, 0)
		const averageRate = loans.length > 0
			? Math.round((loans.reduce((sum, l) => sum + l.rate, 0) / loans.length) * 100) / 100
			: 0

		let totalInsurance = 0
		for (const loan of loans) {
			for (const insurance of loan.loanInsurances) {
				totalInsurance += insurance.monthlyPremium
			}
		}

		return NextResponse.json({
			loans,
			summary: {
				totalLoans: loans.length,
				totalRemaining,
				totalMonthlyPayment,
				averageRate,
				totalInsurance,
			},
		});
	} catch (error) {
		console.error('Error fetching loans:', error);
		return NextResponse.json(
			{ error: 'Erreur lors de la récupération des crédits' },
			{ status: 500 },
		);
	}
}
