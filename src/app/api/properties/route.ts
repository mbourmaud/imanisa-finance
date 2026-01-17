/**
 * Properties API Routes
 * GET /api/properties - List all properties with members and summary stats
 * POST /api/properties - Create a new property
 */

import { type NextRequest, NextResponse } from 'next/server';
import { propertyRepository, memberRepository } from '@/server/repositories';
import type { PropertyType, PropertyUsage } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const filters: {
			type?: PropertyType;
			usage?: PropertyUsage;
			memberId?: string;
			search?: string;
		} = {};

		const type = searchParams.get('type');
		if (type) filters.type = type as PropertyType;

		const usage = searchParams.get('usage');
		if (usage) filters.usage = usage as PropertyUsage;

		const memberId = searchParams.get('memberId');
		if (memberId) filters.memberId = memberId;

		const search = searchParams.get('search');
		if (search) filters.search = search;

		const properties = await propertyRepository.getAll(filters);
		const summary = await propertyRepository.getSummary();

		return NextResponse.json({ properties, summary });
	} catch (error) {
		console.error('Error fetching properties:', error);
		return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			name,
			type,
			usage,
			address,
			address2,
			city,
			postalCode,
			surface,
			rooms,
			bedrooms,
			purchasePrice,
			purchaseDate,
			notaryFees,
			agencyFees,
			currentValue,
			rentAmount,
			rentCharges,
			notes,
			memberShares,
		} = body;

		// Validate required fields
		if (!name || typeof name !== 'string') {
			return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
		}

		// Validate type
		const validTypes: PropertyType[] = ['HOUSE', 'APARTMENT'];
		if (!type || !validTypes.includes(type)) {
			return NextResponse.json({ error: `Invalid property type: ${type}. Must be HOUSE or APARTMENT` }, { status: 400 });
		}

		// Validate usage
		const validUsages: PropertyUsage[] = ['PRIMARY', 'SECONDARY', 'RENTAL'];
		if (!usage || !validUsages.includes(usage)) {
			return NextResponse.json({ error: `Invalid property usage: ${usage}. Must be PRIMARY, SECONDARY or RENTAL` }, { status: 400 });
		}

		// Validate address fields
		if (!address || typeof address !== 'string') {
			return NextResponse.json({ error: 'Missing required field: address' }, { status: 400 });
		}
		if (!city || typeof city !== 'string') {
			return NextResponse.json({ error: 'Missing required field: city' }, { status: 400 });
		}
		if (!postalCode || typeof postalCode !== 'string') {
			return NextResponse.json({ error: 'Missing required field: postalCode' }, { status: 400 });
		}

		// Validate numeric fields
		if (typeof surface !== 'number' || surface <= 0) {
			return NextResponse.json({ error: 'surface must be a positive number' }, { status: 400 });
		}
		if (typeof purchasePrice !== 'number' || purchasePrice < 0) {
			return NextResponse.json({ error: 'purchasePrice must be a non-negative number' }, { status: 400 });
		}
		if (typeof notaryFees !== 'number' || notaryFees < 0) {
			return NextResponse.json({ error: 'notaryFees must be a non-negative number' }, { status: 400 });
		}
		if (typeof currentValue !== 'number' || currentValue < 0) {
			return NextResponse.json({ error: 'currentValue must be a non-negative number' }, { status: 400 });
		}

		// Validate purchaseDate
		if (!purchaseDate) {
			return NextResponse.json({ error: 'Missing required field: purchaseDate' }, { status: 400 });
		}
		const parsedPurchaseDate = new Date(purchaseDate);
		if (Number.isNaN(parsedPurchaseDate.getTime())) {
			return NextResponse.json({ error: 'Invalid purchaseDate format' }, { status: 400 });
		}

		// Validate memberShares if provided
		if (memberShares && Array.isArray(memberShares)) {
			for (const share of memberShares) {
				if (!share.memberId || typeof share.ownershipShare !== 'number') {
					return NextResponse.json(
						{ error: 'Invalid memberShares format. Each entry needs memberId and ownershipShare.' },
						{ status: 400 },
					);
				}
				if (share.ownershipShare < 0 || share.ownershipShare > 100) {
					return NextResponse.json({ error: 'ownershipShare must be between 0 and 100' }, { status: 400 });
				}
				// Verify member exists
				const member = await memberRepository.getById(share.memberId);
				if (!member) {
					return NextResponse.json({ error: `Member not found: ${share.memberId}` }, { status: 400 });
				}
			}
		}

		const property = await propertyRepository.create({
			name,
			type,
			usage,
			address,
			address2,
			city,
			postalCode,
			surface,
			rooms,
			bedrooms,
			purchasePrice,
			purchaseDate: parsedPurchaseDate,
			notaryFees,
			agencyFees,
			currentValue,
			rentAmount,
			rentCharges,
			notes,
			memberShares,
		});

		return NextResponse.json(property, { status: 201 });
	} catch (error) {
		console.error('Error creating property:', error);
		return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
	}
}
