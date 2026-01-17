/**
 * Member by ID API Routes
 * GET /api/members/[id] - Get a specific member
 * PATCH /api/members/[id] - Update a member
 * DELETE /api/members/[id] - Delete a member
 */

import { type NextRequest, NextResponse } from 'next/server';
import { memberRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		const member = await memberRepository.getByIdWithAccounts(id);

		if (!member) {
			return NextResponse.json({ error: 'Member not found' }, { status: 404 });
		}

		return NextResponse.json(member);
	} catch (error) {
		console.error('Error fetching member:', error);
		return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		const body = await request.json();
		const { name, color, avatarUrl } = body;

		// Check if member exists
		const existing = await memberRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Member not found' }, { status: 404 });
		}

		const member = await memberRepository.update(id, {
			name,
			color,
			avatarUrl,
		});

		return NextResponse.json(member);
	} catch (error) {
		console.error('Error updating member:', error);
		return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	const { id } = await params;

	try {
		// Check if member exists
		const existing = await memberRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Member not found' }, { status: 404 });
		}

		await memberRepository.delete(id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting member:', error);

		// Check for foreign key constraint violation
		if (error instanceof Error && error.message.includes('foreign key constraint')) {
			return NextResponse.json(
				{ error: 'Cannot delete member with linked accounts. Remove account associations first.' },
				{ status: 400 },
			);
		}

		return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
	}
}
