interface SessionData {
	userId: string;
	email: string;
	name: string;
	avatarUrl: string | null;
	expiresAt: number;
}

const sessions = new Map<string, SessionData>();

export function createSession(data: Omit<SessionData, 'expiresAt'>): string {
	const sessionId = crypto.randomUUID();
	const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

	sessions.set(sessionId, {
		...data,
		expiresAt
	});

	return sessionId;
}

export function getSession(sessionId: string): SessionData | null {
	const session = sessions.get(sessionId);
	
	if (!session) return null;
	
	if (session.expiresAt < Date.now()) {
		sessions.delete(sessionId);
		return null;
	}

	return session;
}

export function deleteSession(sessionId: string): void {
	sessions.delete(sessionId);
}

export function createSessionCookie(sessionId: string): string {
	const maxAge = 7 * 24 * 60 * 60;
	return `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
	return 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

export function parseSessionFromCookies(cookieHeader: string | null): string | null {
	if (!cookieHeader) return null;
	
	const cookies = cookieHeader.split(';').map((c) => c.trim());
	const sessionCookie = cookies.find((c) => c.startsWith('session='));
	
	if (!sessionCookie) return null;
	
	return sessionCookie.split('=')[1];
}
