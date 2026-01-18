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

		// Get loans with details
		const loans = await loanRepository.getAll(filters);

		// Get summary statistics
		const summary = await loanRepository.getSummary(filters.propertyId);

		// Calculate total insurance from all loan insurances
		let totalInsurance = 0;
		for (const loan of loans) {
			for (const insurance of loan.loanInsurances) {
				totalInsurance += insurance.monthlyPremium;
			}
		}

		return NextResponse.json({
			loans,
			summary: {
				...summary,
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
