/**
 * Loan Insurances API Routes
 * GET /api/loans/:id/insurances - List all insurances for a loan
 * POST /api/loans/:id/insurances - Create insurance for a loan
 */

import { type NextRequest, NextResponse } from 'next/server';
import {
	loanRepository,
	loanInsuranceRepository,
	memberRepository,
} from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id: loanId } = await params;

		// Verify loan exists
		const loan = await loanRepository.getById(loanId);
		if (!loan) {
			return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
		}

		const insurances = await loanInsuranceRepository.getByLoan(loanId);

		return NextResponse.json({
			loanId,
			loanName: loan.name,
			insurances,
		});
	} catch (error) {
		console.error('Error fetching loan insurances:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch loan insurances' },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const { id: loanId } = await params;
		const body = await request.json();

		// Verify loan exists
		const loan = await loanRepository.getById(loanId);
		if (!loan) {
			return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
		}

		const { memberId, name, provider, contractNumber, coveragePercent, monthlyPremium, link, notes } = body;

		// Validate required fields
		if (!memberId) {
			return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
		}
		if (!name || typeof name !== 'string' || name.trim() === '') {
			return NextResponse.json({ error: 'name is required' }, { status: 400 });
		}
		if (!provider || typeof provider !== 'string' || provider.trim() === '') {
			return NextResponse.json({ error: 'provider is required' }, { status: 400 });
		}
		if (coveragePercent === undefined || typeof coveragePercent !== 'number') {
			return NextResponse.json({ error: 'coveragePercent is required and must be a number' }, { status: 400 });
		}
		if (coveragePercent < 0 || coveragePercent > 100) {
			return NextResponse.json({ error: 'coveragePercent must be between 0 and 100' }, { status: 400 });
		}
		if (monthlyPremium === undefined || typeof monthlyPremium !== 'number') {
			return NextResponse.json({ error: 'monthlyPremium is required and must be a number' }, { status: 400 });
		}
		if (monthlyPremium < 0) {
			return NextResponse.json({ error: 'monthlyPremium must be a non-negative number' }, { status: 400 });
		}

		// Verify member exists
		const member = await memberRepository.getById(memberId);
		if (!member) {
			return NextResponse.json({ error: `Member not found: ${memberId}` }, { status: 400 });
		}

		const insurance = await loanInsuranceRepository.create({
			loanId,
			memberId,
			name: name.trim(),
			provider: provider.trim(),
			contractNumber: contractNumber?.trim() || undefined,
			coveragePercent,
			monthlyPremium,
			link: link?.trim() || undefined,
			notes: notes?.trim() || undefined,
		});

		return NextResponse.json(insurance, { status: 201 });
	} catch (error) {
		console.error('Error creating loan insurance:', error);
		return NextResponse.json(
			{ error: 'Failed to create loan insurance' },
			{ status: 500 },
		);
	}
}
