/**
 * Single Account API Routes
 * GET /api/accounts/:id - Get account by ID
 * PATCH /api/accounts/:id - Update account
 * DELETE /api/accounts/:id - Delete account
 */

import { type NextRequest, NextResponse } from 'next/server';
import { accountRepository } from '@/server/repositories';

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const account = await accountRepository.getById(id);

		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		return NextResponse.json(account);
	} catch (error) {
		console.error('Error fetching account:', error);
		return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const body = await request.json();

		const account = await accountRepository.update(id, body);

		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		return NextResponse.json(account);
	} catch (error) {
		console.error('Error updating account:', error);
		return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Verify account exists first
		const existing = await accountRepository.getById(id);
		if (!existing) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		await accountRepository.delete(id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting account:', error);
		return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
	}
}
