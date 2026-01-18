/**
 * Authentication utilities
 * Handles auth with Supabase and demo mode bypass
 */

import { config } from './config';
import { createClient } from './supabase/server';

export interface User {
	id: string;
	email: string;
	name: string;
}

export interface Session {
	user: User;
	expires: Date;
}

/**
 * Get the current session from Supabase
 * In demo mode, returns a fake session
 */
export async function getSession(): Promise<Session | null> {
	if (config.isDemoMode) {
		return {
			user: config.demoUser,
			expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
		};
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	return {
		user: {
			id: user.id,
			email: user.email || '',
			name: user.user_metadata?.name || user.email || 'Utilisateur',
		},
		expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
	};
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
	const session = await getSession();
	return session?.user ?? null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
	if (config.isDemoMode) {
		return true;
	}

	const session = await getSession();
	return session !== null;
}

/**
 * Require authentication - throws if not authenticated
 * Use in API routes and server components
 */
export async function requireAuth(): Promise<User> {
	if (config.isDemoMode) {
		return config.demoUser;
	}

	const user = await getCurrentUser();

	if (!user) {
		throw new Error('Unauthorized');
	}

	return user;
}

/**
 * Get owner ID for the current user
 * In demo mode, returns the demo owner
 */
export async function getCurrentOwnerId(): Promise<string> {
	if (config.isDemoMode) {
		return config.demoOwner.id;
	}

	const user = await getCurrentUser();
	if (!user) {
		throw new Error('Unauthorized');
	}

	// In real mode, lookup the owner from the database
	// return await getOwnerByUserId(user.id);

	return user.id;
}
