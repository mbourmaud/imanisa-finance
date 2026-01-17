/**
 * Account Members API Routes
 * POST /api/accounts/[id]/members - Add a member to the account
 * DELETE /api/accounts/[id]/members - Remove a member from the account
 * PATCH /api/accounts/[id]/members - Update a member's share
 */

import { type NextRequest, NextResponse } from 'next/server';
import { accountRepository, memberRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	const { id: accountId } = await params;

	try {
		const body = await request.json();
		const { memberId, ownerShare = 100 } = body;

		if (!memberId || typeof memberId !== 'string') {
			return NextResponse.json({ error: 'Missing required field: memberId' }, { status: 400 });
		}

		if (typeof ownerShare !== 'number' || ownerShare < 0 || ownerShare > 100) {
			return NextResponse.json(
				{ error: 'ownerShare must be a number between 0 and 100' },
				{ status: 400 },
			);
		}

		// Verify account exists
		const account = await accountRepository.getById(accountId);
		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		// Verify member exists
		const member = await memberRepository.getById(memberId);
		if (!member) {
			return NextResponse.json({ error: 'Member not found' }, { status: 404 });
		}

		// Check if member is already associated
		const existingMember = account.accountMembers.find((am) => am.memberId === memberId);
		if (existingMember) {
			return NextResponse.json(
				{ error: 'Member is already associated with this account' },
				{ status: 409 },
			);
		}

		const accountMember = await accountRepository.addMemberToAccount(accountId, memberId, ownerShare);

		return NextResponse.json(accountMember, { status: 201 });
	} catch (error) {
		console.error('Error adding member to account:', error);
		return NextResponse.json({ error: 'Failed to add member to account' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const { id: accountId } = await params;

	try {
		const { searchParams } = new URL(request.url);
		const memberId = searchParams.get('memberId');

		if (!memberId) {
			return NextResponse.json({ error: 'Missing required query param: memberId' }, { status: 400 });
		}

		// Verify account exists
		const account = await accountRepository.getById(accountId);
		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		// Verify member is associated with account
		const existingMember = account.accountMembers.find((am) => am.memberId === memberId);
		if (!existingMember) {
			return NextResponse.json({ error: 'Member is not associated with this account' }, { status: 404 });
		}

		await accountRepository.removeMemberFromAccount(accountId, memberId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing member from account:', error);
		return NextResponse.json({ error: 'Failed to remove member from account' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const { id: accountId } = await params;

	try {
		const body = await request.json();
		const { memberId, ownerShare } = body;

		if (!memberId || typeof memberId !== 'string') {
			return NextResponse.json({ error: 'Missing required field: memberId' }, { status: 400 });
		}

		if (typeof ownerShare !== 'number' || ownerShare < 0 || ownerShare > 100) {
			return NextResponse.json(
				{ error: 'ownerShare must be a number between 0 and 100' },
				{ status: 400 },
			);
		}

		// Verify account exists
		const account = await accountRepository.getById(accountId);
		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		// Verify member is associated with account
		const existingMember = account.accountMembers.find((am) => am.memberId === memberId);
		if (!existingMember) {
			return NextResponse.json({ error: 'Member is not associated with this account' }, { status: 404 });
		}

		const accountMember = await accountRepository.updateMemberShare(accountId, memberId, ownerShare);

		return NextResponse.json(accountMember);
	} catch (error) {
		console.error('Error updating member share:', error);
		return NextResponse.json({ error: 'Failed to update member share' }, { status: 500 });
	}
}
