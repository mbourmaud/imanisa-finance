/**
 * Property Loans API Routes
 * GET /api/properties/:id/loans - List loans for a property
 * POST /api/properties/:id/loans - Create loan for property
 */

import { type NextRequest, NextResponse } from 'next/server';
import { loanRepository, memberRepository, propertyRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id: propertyId } = await params;

		// Verify property exists
		const property = await propertyRepository.getById(propertyId);
		if (!property) {
			return NextResponse.json({ error: 'Property not found' }, { status: 404 });
		}

		const loans = await loanRepository.getByProperty(propertyId);
		const summary = await loanRepository.getSummary(propertyId);

		return NextResponse.json({ loans, summary });
	} catch (error) {
		console.error('Error fetching property loans:', error);
		return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
	}
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const { id: propertyId } = await params;
		const body = await request.json();

		// Verify property exists
		const property = await propertyRepository.getById(propertyId);
		if (!property) {
			return NextResponse.json({ error: 'Property not found' }, { status: 404 });
		}

		const {
			name,
			memberId,
			lender,
			loanNumber,
			initialAmount,
			remainingAmount,
			rate,
			monthlyPayment,
			startDate,
			endDate,
			notes,
		} = body;

		// Validate required fields
		if (!name || typeof name !== 'string') {
			return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
		}

		// Validate numeric fields
		if (typeof initialAmount !== 'number' || initialAmount <= 0) {
			return NextResponse.json(
				{ error: 'initialAmount must be a positive number' },
				{ status: 400 },
			);
		}
		if (typeof remainingAmount !== 'number' || remainingAmount < 0) {
			return NextResponse.json(
				{ error: 'remainingAmount must be a non-negative number' },
				{ status: 400 },
			);
		}
		if (remainingAmount > initialAmount) {
			return NextResponse.json(
				{ error: 'remainingAmount cannot exceed initialAmount' },
				{ status: 400 },
			);
		}
		if (typeof rate !== 'number' || rate < 0 || rate > 100) {
			return NextResponse.json(
				{ error: 'rate must be a number between 0 and 100' },
				{ status: 400 },
			);
		}
		if (typeof monthlyPayment !== 'number' || monthlyPayment < 0) {
			return NextResponse.json(
				{ error: 'monthlyPayment must be a non-negative number' },
				{ status: 400 },
			);
		}

		// Validate startDate
		if (!startDate) {
			return NextResponse.json({ error: 'Missing required field: startDate' }, { status: 400 });
		}
		const parsedStartDate = new Date(startDate);
		if (Number.isNaN(parsedStartDate.getTime())) {
			return NextResponse.json({ error: 'Invalid startDate format' }, { status: 400 });
		}

		// Validate endDate if provided
		let parsedEndDate: Date | undefined;
		if (endDate) {
			parsedEndDate = new Date(endDate);
			if (Number.isNaN(parsedEndDate.getTime())) {
				return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 });
			}
			if (parsedEndDate <= parsedStartDate) {
				return NextResponse.json({ error: 'endDate must be after startDate' }, { status: 400 });
			}
		}

		// Validate memberId if provided
		if (memberId) {
			const member = await memberRepository.getById(memberId);
			if (!member) {
				return NextResponse.json({ error: `Member not found: ${memberId}` }, { status: 400 });
			}
		}

		const loan = await loanRepository.create({
			propertyId,
			name,
			memberId,
			lender,
			loanNumber,
			initialAmount,
			remainingAmount,
			rate,
			monthlyPayment,
			startDate: parsedStartDate,
			endDate: parsedEndDate,
			notes,
		});

		return NextResponse.json(loan, { status: 201 });
	} catch (error) {
		console.error('Error creating loan:', error);
		return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
	}
}
