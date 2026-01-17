/**
 * Utility Contracts API Routes
 * GET /api/properties/:id/utility-contracts - List all utility contracts for a property
 * POST /api/properties/:id/utility-contracts - Create utility contract
 */

import { type NextRequest, NextResponse } from 'next/server';
import {
	propertyRepository,
	utilityContractRepository,
} from '@/server/repositories';
import type { UtilityType } from '@prisma/client';

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

		const contracts = await utilityContractRepository.getByProperty(propertyId);

		// Calculate total monthly amount
		const totalMonthlyAmount = contracts.reduce(
			(sum, contract) => sum + contract.monthlyAmount,
			0
		);

		return NextResponse.json({
			propertyId,
			propertyName: property.name,
			contracts,
			summary: {
				totalContracts: contracts.length,
				totalMonthlyAmount,
			},
		});
	} catch (error) {
		console.error('Error fetching utility contracts:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch utility contracts' },
			{ status: 500 },
		);
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

		const { type, provider, contractNumber, monthlyAmount, link, notes } = body;

		// Validate required fields
		if (!type) {
			return NextResponse.json({ error: 'type is required' }, { status: 400 });
		}
		const validTypes: UtilityType[] = ['ELECTRICITY', 'GAS', 'WATER', 'INTERNET', 'OTHER'];
		if (!validTypes.includes(type)) {
			return NextResponse.json(
				{ error: `Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}` },
				{ status: 400 }
			);
		}
		if (!provider || typeof provider !== 'string' || provider.trim() === '') {
			return NextResponse.json({ error: 'provider is required' }, { status: 400 });
		}
		if (monthlyAmount === undefined || typeof monthlyAmount !== 'number') {
			return NextResponse.json({ error: 'monthlyAmount is required and must be a number' }, { status: 400 });
		}
		if (monthlyAmount < 0) {
			return NextResponse.json({ error: 'monthlyAmount must be a non-negative number' }, { status: 400 });
		}

		const contract = await utilityContractRepository.create({
			propertyId,
			type,
			provider: provider.trim(),
			contractNumber: contractNumber?.trim() || undefined,
			monthlyAmount,
			link: link?.trim() || undefined,
			notes: notes?.trim() || undefined,
		});

		return NextResponse.json(contract, { status: 201 });
	} catch (error) {
		console.error('Error creating utility contract:', error);
		return NextResponse.json(
			{ error: 'Failed to create utility contract' },
			{ status: 500 },
		);
	}
}
