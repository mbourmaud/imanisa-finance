/**
 * Profile API Routes
 * GET /api/profile - Get current user profile
 * PATCH /api/profile - Update current user profile
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const user = await requireAuth();

		const profile = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
			},
		});

		if (!profile) {
			return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
		}

		return NextResponse.json(profile);
	} catch (error) {
		console.error('Error fetching profile:', error);

		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PATCH(request: Request) {
	try {
		const user = await requireAuth();

		const body = await request.json();
		const { name, email } = body;

		// Validate name if provided
		if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
			return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
		}

		// Validate email if provided
		if (email !== undefined) {
			if (typeof email !== 'string' || !email.includes('@')) {
				return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
			}

			// Check if email is already taken by another user
			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			if (existingUser && existingUser.id !== user.id) {
				return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
			}
		}

		// Build update data
		const updateData: { name?: string; email?: string } = {};
		if (name !== undefined) updateData.name = name.trim();
		if (email !== undefined) updateData.email = email.trim();

		// Update profile
		const updatedProfile = await prisma.user.update({
			where: { id: user.id },
			data: updateData,
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
			},
		});

		return NextResponse.json(updatedProfile);
	} catch (error) {
		console.error('Error updating profile:', error);

		if (error instanceof Error && error.message === 'Unauthorized') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
