/**
 * Single Loan Insurance API Routes
 * PATCH /api/loan-insurances/:id - Update loan insurance
 * DELETE /api/loan-insurances/:id - Delete loan insurance
 */

import { type NextRequest, NextResponse } from 'next/server';
import { loanInsuranceRepository, memberRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Verify insurance exists
		const existing = await loanInsuranceRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Loan insurance not found' }, { status: 404 });
		}

		const { memberId, name, provider, contractNumber, coveragePercent, monthlyPremium, link, notes } = body;

		// Validate memberId if provided
		if (memberId !== undefined) {
			const member = await memberRepository.getById(memberId);
			if (!member) {
				return NextResponse.json({ error: `Member not found: ${memberId}` }, { status: 400 });
			}
		}

		// Validate coveragePercent if provided
		if (coveragePercent !== undefined) {
			if (typeof coveragePercent !== 'number') {
				return NextResponse.json({ error: 'coveragePercent must be a number' }, { status: 400 });
			}
			if (coveragePercent < 0 || coveragePercent > 100) {
				return NextResponse.json({ error: 'coveragePercent must be between 0 and 100' }, { status: 400 });
			}
		}

		// Validate monthlyPremium if provided
		if (monthlyPremium !== undefined) {
			if (typeof monthlyPremium !== 'number') {
				return NextResponse.json({ error: 'monthlyPremium must be a number' }, { status: 400 });
			}
			if (monthlyPremium < 0) {
				return NextResponse.json({ error: 'monthlyPremium must be a non-negative number' }, { status: 400 });
			}
		}

		// Validate name if provided
		if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
			return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 });
		}

		// Validate provider if provided
		if (provider !== undefined && (typeof provider !== 'string' || provider.trim() === '')) {
			return NextResponse.json({ error: 'provider cannot be empty' }, { status: 400 });
		}

		// Build update data
		const updateData: Record<string, unknown> = {};
		if (memberId !== undefined) updateData.memberId = memberId;
		if (name !== undefined) updateData.name = name.trim();
		if (provider !== undefined) updateData.provider = provider.trim();
		if (contractNumber !== undefined) updateData.contractNumber = contractNumber?.trim() || null;
		if (coveragePercent !== undefined) updateData.coveragePercent = coveragePercent;
		if (monthlyPremium !== undefined) updateData.monthlyPremium = monthlyPremium;
		if (link !== undefined) updateData.link = link?.trim() || null;
		if (notes !== undefined) updateData.notes = notes?.trim() || null;

		const insurance = await loanInsuranceRepository.update(id, updateData);

		return NextResponse.json(insurance);
	} catch (error) {
		console.error('Error updating loan insurance:', error);
		return NextResponse.json({ error: 'Failed to update loan insurance' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Verify insurance exists
		const existing = await loanInsuranceRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Loan insurance not found' }, { status: 404 });
		}

		await loanInsuranceRepository.delete(id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting loan insurance:', error);
		return NextResponse.json({ error: 'Failed to delete loan insurance' }, { status: 500 });
	}
}
