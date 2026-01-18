/**
 * Single Property API Routes
 * GET /api/properties/:id - Get property by ID with all related data
 * PATCH /api/properties/:id - Update property
 * DELETE /api/properties/:id - Delete property (cascade)
 */

import { type NextRequest, NextResponse } from 'next/server';
import type { PropertyType, PropertyUsage } from '@/lib/prisma';
import { memberRepository, propertyRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const property = await propertyRepository.getById(id);

		if (!property) {
			return NextResponse.json({ error: 'Property not found' }, { status: 404 });
		}

		return NextResponse.json(property);
	} catch (error) {
		console.error('Error fetching property:', error);
		return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Verify property exists first
		const existing = await propertyRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Property not found' }, { status: 404 });
		}

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

		// Validate type if provided
		if (type !== undefined) {
			const validTypes: PropertyType[] = ['HOUSE', 'APARTMENT'];
			if (!validTypes.includes(type)) {
				return NextResponse.json(
					{ error: `Invalid property type: ${type}. Must be HOUSE or APARTMENT` },
					{ status: 400 },
				);
			}
		}

		// Validate usage if provided
		if (usage !== undefined) {
			const validUsages: PropertyUsage[] = ['PRIMARY', 'SECONDARY', 'RENTAL'];
			if (!validUsages.includes(usage)) {
				return NextResponse.json(
					{ error: `Invalid property usage: ${usage}. Must be PRIMARY, SECONDARY or RENTAL` },
					{ status: 400 },
				);
			}
		}

		// Validate numeric fields if provided
		if (surface !== undefined && (typeof surface !== 'number' || surface <= 0)) {
			return NextResponse.json({ error: 'surface must be a positive number' }, { status: 400 });
		}
		if (purchasePrice !== undefined && (typeof purchasePrice !== 'number' || purchasePrice < 0)) {
			return NextResponse.json(
				{ error: 'purchasePrice must be a non-negative number' },
				{ status: 400 },
			);
		}
		if (notaryFees !== undefined && (typeof notaryFees !== 'number' || notaryFees < 0)) {
			return NextResponse.json(
				{ error: 'notaryFees must be a non-negative number' },
				{ status: 400 },
			);
		}
		if (currentValue !== undefined && (typeof currentValue !== 'number' || currentValue < 0)) {
			return NextResponse.json(
				{ error: 'currentValue must be a non-negative number' },
				{ status: 400 },
			);
		}

		// Build update data object
		const updateData: Record<string, unknown> = {};
		if (name !== undefined) updateData.name = name;
		if (type !== undefined) updateData.type = type;
		if (usage !== undefined) updateData.usage = usage;
		if (address !== undefined) updateData.address = address;
		if (address2 !== undefined) updateData.address2 = address2;
		if (city !== undefined) updateData.city = city;
		if (postalCode !== undefined) updateData.postalCode = postalCode;
		if (surface !== undefined) updateData.surface = surface;
		if (rooms !== undefined) updateData.rooms = rooms;
		if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
		if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice;
		if (purchaseDate !== undefined) updateData.purchaseDate = new Date(purchaseDate);
		if (notaryFees !== undefined) updateData.notaryFees = notaryFees;
		if (agencyFees !== undefined) updateData.agencyFees = agencyFees;
		if (currentValue !== undefined) updateData.currentValue = currentValue;
		if (rentAmount !== undefined) updateData.rentAmount = rentAmount;
		if (rentCharges !== undefined) updateData.rentCharges = rentCharges;
		if (notes !== undefined) updateData.notes = notes;

		// Handle memberShares update if provided
		if (memberShares !== undefined) {
			if (!Array.isArray(memberShares)) {
				return NextResponse.json({ error: 'memberShares must be an array' }, { status: 400 });
			}

			for (const share of memberShares) {
				if (!share.memberId || typeof share.ownershipShare !== 'number') {
					return NextResponse.json(
						{ error: 'Invalid memberShares format. Each entry needs memberId and ownershipShare.' },
						{ status: 400 },
					);
				}
				if (share.ownershipShare < 0 || share.ownershipShare > 100) {
					return NextResponse.json(
						{ error: 'ownershipShare must be between 0 and 100' },
						{ status: 400 },
					);
				}
				// Verify member exists
				const member = await memberRepository.getById(share.memberId);
				if (!member) {
					return NextResponse.json(
						{ error: `Member not found: ${share.memberId}` },
						{ status: 400 },
					);
				}
			}

			// Update members separately
			await propertyRepository.updateMembers(id, memberShares);
		}

		// Update property fields
		const property = await propertyRepository.update(id, updateData);

		return NextResponse.json(property);
	} catch (error) {
		console.error('Error updating property:', error);
		return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Verify property exists first
		const existing = await propertyRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Property not found' }, { status: 404 });
		}

		await propertyRepository.delete(id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting property:', error);
		return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
	}
}
