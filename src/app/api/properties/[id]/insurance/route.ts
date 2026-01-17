/**
 * Property Insurance API Routes
 * POST /api/properties/:id/insurance - Create property insurance (1:1)
 * PATCH /api/properties/:id/insurance - Update property insurance
 * DELETE /api/properties/:id/insurance - Delete property insurance
 */

import { type NextRequest, NextResponse } from 'next/server';
import {
	propertyRepository,
	propertyInsuranceRepository,
} from '@/server/repositories';
import type { InsuranceType } from '@prisma/client';

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

		const insurance = await propertyInsuranceRepository.getByProperty(propertyId);

		return NextResponse.json({
			propertyId,
			propertyName: property.name,
			insurance,
		});
	} catch (error) {
		console.error('Error fetching property insurance:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch property insurance' },
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

		// Check if insurance already exists (1:1 relationship)
		const existing = await propertyInsuranceRepository.getByProperty(propertyId);
		if (existing) {
			return NextResponse.json(
				{ error: 'Property insurance already exists. Use PATCH to update.' },
				{ status: 409 },
			);
		}

		const { type, provider, contractNumber, monthlyPremium, startDate, endDate, coverage, link, notes } = body;

		// Validate required fields
		if (!type) {
			return NextResponse.json({ error: 'type is required' }, { status: 400 });
		}
		const validTypes: InsuranceType[] = ['PNO', 'MRH'];
		if (!validTypes.includes(type)) {
			return NextResponse.json({ error: `Invalid type: ${type}. Must be PNO or MRH` }, { status: 400 });
		}
		if (!provider || typeof provider !== 'string' || provider.trim() === '') {
			return NextResponse.json({ error: 'provider is required' }, { status: 400 });
		}
		if (monthlyPremium === undefined || typeof monthlyPremium !== 'number') {
			return NextResponse.json({ error: 'monthlyPremium is required and must be a number' }, { status: 400 });
		}
		if (monthlyPremium < 0) {
			return NextResponse.json({ error: 'monthlyPremium must be a non-negative number' }, { status: 400 });
		}
		if (!startDate) {
			return NextResponse.json({ error: 'startDate is required' }, { status: 400 });
		}

		// Parse dates
		const parsedStartDate = new Date(startDate);
		if (Number.isNaN(parsedStartDate.getTime())) {
			return NextResponse.json({ error: 'Invalid startDate format' }, { status: 400 });
		}

		let parsedEndDate: Date | undefined;
		if (endDate) {
			parsedEndDate = new Date(endDate);
			if (Number.isNaN(parsedEndDate.getTime())) {
				return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 });
			}
		}

		const insurance = await propertyInsuranceRepository.create({
			propertyId,
			type,
			provider: provider.trim(),
			contractNumber: contractNumber?.trim() || undefined,
			monthlyPremium,
			startDate: parsedStartDate,
			endDate: parsedEndDate,
			coverage: coverage?.trim() || undefined,
			link: link?.trim() || undefined,
			notes: notes?.trim() || undefined,
		});

		return NextResponse.json(insurance, { status: 201 });
	} catch (error) {
		console.error('Error creating property insurance:', error);
		return NextResponse.json(
			{ error: 'Failed to create property insurance' },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id: propertyId } = await params;
		const body = await request.json();

		// Verify property exists
		const property = await propertyRepository.getById(propertyId);
		if (!property) {
			return NextResponse.json({ error: 'Property not found' }, { status: 404 });
		}

		// Verify insurance exists
		const existing = await propertyInsuranceRepository.getByProperty(propertyId);
		if (!existing) {
			return NextResponse.json(
				{ error: 'Property insurance not found. Use POST to create.' },
				{ status: 404 },
			);
		}

		const { type, provider, contractNumber, monthlyPremium, startDate, endDate, coverage, link, notes } = body;

		// Validate type if provided
		if (type !== undefined) {
			const validTypes: InsuranceType[] = ['PNO', 'MRH'];
			if (!validTypes.includes(type)) {
				return NextResponse.json({ error: `Invalid type: ${type}. Must be PNO or MRH` }, { status: 400 });
			}
		}

		// Validate provider if provided
		if (provider !== undefined && (typeof provider !== 'string' || provider.trim() === '')) {
			return NextResponse.json({ error: 'provider cannot be empty' }, { status: 400 });
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

		// Build update data
		const updateData: Record<string, unknown> = {};
		if (type !== undefined) updateData.type = type;
		if (provider !== undefined) updateData.provider = provider.trim();
		if (contractNumber !== undefined) updateData.contractNumber = contractNumber?.trim() || null;
		if (monthlyPremium !== undefined) updateData.monthlyPremium = monthlyPremium;
		if (startDate !== undefined) {
			const parsedStartDate = new Date(startDate);
			if (Number.isNaN(parsedStartDate.getTime())) {
				return NextResponse.json({ error: 'Invalid startDate format' }, { status: 400 });
			}
			updateData.startDate = parsedStartDate;
		}
		if (endDate !== undefined) {
			if (endDate === null) {
				updateData.endDate = null;
			} else {
				const parsedEndDate = new Date(endDate);
				if (Number.isNaN(parsedEndDate.getTime())) {
					return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 });
				}
				updateData.endDate = parsedEndDate;
			}
		}
		if (coverage !== undefined) updateData.coverage = coverage?.trim() || null;
		if (link !== undefined) updateData.link = link?.trim() || null;
		if (notes !== undefined) updateData.notes = notes?.trim() || null;

		const insurance = await propertyInsuranceRepository.update(propertyId, updateData);

		return NextResponse.json(insurance);
	} catch (error) {
		console.error('Error updating property insurance:', error);
		return NextResponse.json(
			{ error: 'Failed to update property insurance' },
			{ status: 500 },
		);
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id: propertyId } = await params;

		// Verify property exists
		const property = await propertyRepository.getById(propertyId);
		if (!property) {
			return NextResponse.json({ error: 'Property not found' }, { status: 404 });
		}

		// Verify insurance exists
		const existing = await propertyInsuranceRepository.getByProperty(propertyId);
		if (!existing) {
			return NextResponse.json({ error: 'Property insurance not found' }, { status: 404 });
		}

		await propertyInsuranceRepository.delete(propertyId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting property insurance:', error);
		return NextResponse.json(
			{ error: 'Failed to delete property insurance' },
			{ status: 500 },
		);
	}
}
