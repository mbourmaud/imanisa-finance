import { createHash } from 'crypto';
import Database from 'better-sqlite3';

const DB_PATH = './data/imanisa.db';

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

export function validatePin(username: string, pin: string): Omit<User, 'pin_hash'> | null {
	const db = new Database(DB_PATH, { readonly: true });

	try {
		const user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username) as User | undefined;

		if (!user) return null;

		const pinHash = hashPin(pin);
		if (user.pin_hash !== pinHash) return null;

		return {
			id: user.id,
			username: user.username,
			name: user.name,
			avatar_url: user.avatar_url
		};
	} finally {
		db.close();
	}
}

export function getUserByUsername(username: string): Omit<User, 'pin_hash'> | null {
	const db = new Database(DB_PATH, { readonly: true });

	try {
		const user = db.prepare('SELECT id, username, name, avatar_url FROM users WHERE LOWER(username) = LOWER(?)').get(username) as Omit<User, 'pin_hash'> | undefined;
		return user || null;
	} finally {
		db.close();
	}
}

export function getAllUsers(): Array<{ username: string; name: string }> {
	const db = new Database(DB_PATH, { readonly: true });

	try {
		return db.prepare('SELECT username, name FROM users').all() as Array<{ username: string; name: string }>;
	} finally {
		db.close();
	}
}
