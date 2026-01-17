/**
 * Single Loan API Routes
 * GET /api/loans/:id - Get loan by ID with insurances
 * PATCH /api/loans/:id - Update loan
 * DELETE /api/loans/:id - Delete loan (cascade insurances)
 */

import { type NextRequest, NextResponse } from 'next/server';
import { loanRepository, memberRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const loan = await loanRepository.getById(id);

		if (!loan) {
			return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
		}

		return NextResponse.json(loan);
	} catch (error) {
		console.error('Error fetching loan:', error);
		return NextResponse.json({ error: 'Failed to fetch loan' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Verify loan exists
		const existing = await loanRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
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

		// Validate numeric fields if provided
		if (initialAmount !== undefined && (typeof initialAmount !== 'number' || initialAmount <= 0)) {
			return NextResponse.json({ error: 'initialAmount must be a positive number' }, { status: 400 });
		}
		if (remainingAmount !== undefined && (typeof remainingAmount !== 'number' || remainingAmount < 0)) {
			return NextResponse.json({ error: 'remainingAmount must be a non-negative number' }, { status: 400 });
		}
		if (rate !== undefined && (typeof rate !== 'number' || rate < 0 || rate > 100)) {
			return NextResponse.json({ error: 'rate must be a number between 0 and 100' }, { status: 400 });
		}
		if (monthlyPayment !== undefined && (typeof monthlyPayment !== 'number' || monthlyPayment < 0)) {
			return NextResponse.json({ error: 'monthlyPayment must be a non-negative number' }, { status: 400 });
		}

		// Validate remaining vs initial (using existing values if not provided)
		const effectiveInitial = initialAmount ?? existing.initialAmount;
		const effectiveRemaining = remainingAmount ?? existing.remainingAmount;
		if (effectiveRemaining > effectiveInitial) {
			return NextResponse.json({ error: 'remainingAmount cannot exceed initialAmount' }, { status: 400 });
		}

		// Validate memberId if provided
		if (memberId !== undefined && memberId !== null) {
			const member = await memberRepository.getById(memberId);
			if (!member) {
				return NextResponse.json({ error: `Member not found: ${memberId}` }, { status: 400 });
			}
		}

		// Build update data
		const updateData: Record<string, unknown> = {};
		if (name !== undefined) updateData.name = name;
		if (memberId !== undefined) updateData.memberId = memberId;
		if (lender !== undefined) updateData.lender = lender;
		if (loanNumber !== undefined) updateData.loanNumber = loanNumber;
		if (initialAmount !== undefined) updateData.initialAmount = initialAmount;
		if (remainingAmount !== undefined) updateData.remainingAmount = remainingAmount;
		if (rate !== undefined) updateData.rate = rate;
		if (monthlyPayment !== undefined) updateData.monthlyPayment = monthlyPayment;
		if (startDate !== undefined) {
			const parsedDate = new Date(startDate);
			if (Number.isNaN(parsedDate.getTime())) {
				return NextResponse.json({ error: 'Invalid startDate format' }, { status: 400 });
			}
			updateData.startDate = parsedDate;
		}
		if (endDate !== undefined) {
			if (endDate === null) {
				updateData.endDate = null;
			} else {
				const parsedDate = new Date(endDate);
				if (Number.isNaN(parsedDate.getTime())) {
					return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 });
				}
				updateData.endDate = parsedDate;
			}
		}
		if (notes !== undefined) updateData.notes = notes;

		const loan = await loanRepository.update(id, updateData);

		return NextResponse.json(loan);
	} catch (error) {
		console.error('Error updating loan:', error);
		return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Verify loan exists
		const existing = await loanRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
		}

		await loanRepository.delete(id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting loan:', error);
		return NextResponse.json({ error: 'Failed to delete loan' }, { status: 500 });
	}
}
