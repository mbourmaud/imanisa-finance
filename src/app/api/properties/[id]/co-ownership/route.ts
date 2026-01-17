/**
 * CoOwnership API Routes
 * GET /api/properties/:id/co-ownership - Get co-ownership (1:1)
 * POST /api/properties/:id/co-ownership - Create co-ownership
 * PATCH /api/properties/:id/co-ownership - Update co-ownership
 * DELETE /api/properties/:id/co-ownership - Delete co-ownership
 */

import { type NextRequest, NextResponse } from 'next/server';
import {
	propertyRepository,
	coOwnershipRepository,
} from '@/server/repositories';

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

		const coOwnership = await coOwnershipRepository.getByProperty(propertyId);

		return NextResponse.json({
			propertyId,
			propertyName: property.name,
			coOwnership,
		});
	} catch (error) {
		console.error('Error fetching co-ownership:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch co-ownership' },
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

		// Check if co-ownership already exists (1:1 relationship)
		const existing = await coOwnershipRepository.getByProperty(propertyId);
		if (existing) {
			return NextResponse.json(
				{ error: 'Co-ownership already exists. Use PATCH to update.' },
				{ status: 409 },
			);
		}

		const { name, quarterlyAmount, link, notes } = body;

		// Validate required fields
		if (!name || typeof name !== 'string' || name.trim() === '') {
			return NextResponse.json({ error: 'name is required' }, { status: 400 });
		}
		if (quarterlyAmount === undefined || typeof quarterlyAmount !== 'number') {
			return NextResponse.json({ error: 'quarterlyAmount is required and must be a number' }, { status: 400 });
		}
		if (quarterlyAmount < 0) {
			return NextResponse.json({ error: 'quarterlyAmount must be a non-negative number' }, { status: 400 });
		}

		const coOwnership = await coOwnershipRepository.create({
			propertyId,
			name: name.trim(),
			quarterlyAmount,
			link: link?.trim() || undefined,
			notes: notes?.trim() || undefined,
		});

		return NextResponse.json(coOwnership, { status: 201 });
	} catch (error) {
		console.error('Error creating co-ownership:', error);
		return NextResponse.json(
			{ error: 'Failed to create co-ownership' },
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

		// Verify co-ownership exists
		const existing = await coOwnershipRepository.getByProperty(propertyId);
		if (!existing) {
			return NextResponse.json(
				{ error: 'Co-ownership not found. Use POST to create.' },
				{ status: 404 },
			);
		}

		const { name, quarterlyAmount, link, notes } = body;

		// Validate name if provided
		if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
			return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 });
		}

		// Validate quarterlyAmount if provided
		if (quarterlyAmount !== undefined) {
			if (typeof quarterlyAmount !== 'number') {
				return NextResponse.json({ error: 'quarterlyAmount must be a number' }, { status: 400 });
			}
			if (quarterlyAmount < 0) {
				return NextResponse.json({ error: 'quarterlyAmount must be a non-negative number' }, { status: 400 });
			}
		}

		// Build update data
		const updateData: Record<string, unknown> = {};
		if (name !== undefined) updateData.name = name.trim();
		if (quarterlyAmount !== undefined) updateData.quarterlyAmount = quarterlyAmount;
		if (link !== undefined) updateData.link = link?.trim() || null;
		if (notes !== undefined) updateData.notes = notes?.trim() || null;

		const coOwnership = await coOwnershipRepository.update(propertyId, updateData);

		return NextResponse.json(coOwnership);
	} catch (error) {
		console.error('Error updating co-ownership:', error);
		return NextResponse.json(
			{ error: 'Failed to update co-ownership' },
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

		// Verify co-ownership exists
		const existing = await coOwnershipRepository.getByProperty(propertyId);
		if (!existing) {
			return NextResponse.json({ error: 'Co-ownership not found' }, { status: 404 });
		}

		await coOwnershipRepository.delete(propertyId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting co-ownership:', error);
		return NextResponse.json(
			{ error: 'Failed to delete co-ownership' },
			{ status: 500 },
		);
	}
}
