/**
 * Single Utility Contract API Routes
 * GET /api/utility-contracts/:id - Get utility contract by ID
 * PATCH /api/utility-contracts/:id - Update utility contract
 * DELETE /api/utility-contracts/:id - Delete utility contract
 */

import { type NextRequest, NextResponse } from 'next/server';
import type { UtilityType } from '@/lib/prisma';
import { utilityContractRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const contract = await utilityContractRepository.getById(id);

		if (!contract) {
			return NextResponse.json({ error: 'Utility contract not found' }, { status: 404 });
		}

		return NextResponse.json(contract);
	} catch (error) {
		console.error('Error fetching utility contract:', error);
		return NextResponse.json({ error: 'Failed to fetch utility contract' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Verify contract exists
		const existing = await utilityContractRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Utility contract not found' }, { status: 404 });
		}

		const { type, provider, contractNumber, monthlyAmount, link, notes } = body;

		// Validate type if provided
		if (type !== undefined) {
			const validTypes: UtilityType[] = ['ELECTRICITY', 'GAS', 'WATER', 'INTERNET', 'OTHER'];
			if (!validTypes.includes(type)) {
				return NextResponse.json(
					{ error: `Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}` },
					{ status: 400 },
				);
			}
		}

		// Validate provider if provided
		if (provider !== undefined && (typeof provider !== 'string' || provider.trim() === '')) {
			return NextResponse.json({ error: 'provider cannot be empty' }, { status: 400 });
		}

		// Validate monthlyAmount if provided
		if (monthlyAmount !== undefined) {
			if (typeof monthlyAmount !== 'number') {
				return NextResponse.json({ error: 'monthlyAmount must be a number' }, { status: 400 });
			}
			if (monthlyAmount < 0) {
				return NextResponse.json(
					{ error: 'monthlyAmount must be a non-negative number' },
					{ status: 400 },
				);
			}
		}

		// Build update data
		const updateData: Record<string, unknown> = {};
		if (type !== undefined) updateData.type = type;
		if (provider !== undefined) updateData.provider = provider.trim();
		if (contractNumber !== undefined) updateData.contractNumber = contractNumber?.trim() || null;
		if (monthlyAmount !== undefined) updateData.monthlyAmount = monthlyAmount;
		if (link !== undefined) updateData.link = link?.trim() || null;
		if (notes !== undefined) updateData.notes = notes?.trim() || null;

		const contract = await utilityContractRepository.update(id, updateData);

		return NextResponse.json(contract);
	} catch (error) {
		console.error('Error updating utility contract:', error);
		return NextResponse.json({ error: 'Failed to update utility contract' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Verify contract exists
		const existing = await utilityContractRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Utility contract not found' }, { status: 404 });
		}

		await utilityContractRepository.delete(id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting utility contract:', error);
		return NextResponse.json({ error: 'Failed to delete utility contract' }, { status: 500 });
	}
}
