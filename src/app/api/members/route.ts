/**
 * Members API Routes
 * GET /api/members - List all household members
 * POST /api/members - Create a new member
 */

import { type NextRequest, NextResponse } from 'next/server';
import { memberRepository } from '@/server/repositories';

export async function GET() {
	try {
		const members = await memberRepository.getAllWithAccounts();

		return NextResponse.json({ members });
	} catch (error) {
		console.error('Error fetching members:', error);
		return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, color, avatarUrl } = body;

		if (!name || typeof name !== 'string') {
			return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
		}

		const member = await memberRepository.create({
			name,
			color,
			avatarUrl,
		});

		return NextResponse.json(member, { status: 201 });
	} catch (error) {
		console.error('Error creating member:', error);
		return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
	}
}
