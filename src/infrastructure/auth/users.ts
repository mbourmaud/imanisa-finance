import { createHash } from 'crypto';
import { execute } from '@infrastructure/database/turso';

interface User {
	id: string;
	username: string;
	name: string;
	pin_hash: string;
	avatar_url: string | null;
}

function hashPin(pin: string): string {
	return createHash('sha256').update(pin).digest('hex');
}

export async function validatePin(username: string, pin: string): Promise<Omit<User, 'pin_hash'> | null> {
	const result = await execute('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username]);
	const user = result.rows[0] as unknown as User | undefined;

	if (!user) return null;

	const pinHash = hashPin(pin);
	if (user.pin_hash !== pinHash) return null;

	return {
		id: user.id,
		username: user.username,
		name: user.name,
		avatar_url: user.avatar_url
	};
}

export async function getUserByUsername(username: string): Promise<Omit<User, 'pin_hash'> | null> {
	const result = await execute('SELECT id, username, name, avatar_url FROM users WHERE LOWER(username) = LOWER(?)', [username]);
	const user = result.rows[0] as unknown as Omit<User, 'pin_hash'> | undefined;
	return user || null;
}

export async function getAllUsers(): Promise<Array<{ username: string; name: string }>> {
	const result = await execute('SELECT username, name FROM users');
	return result.rows as unknown as Array<{ username: string; name: string }>;
}
