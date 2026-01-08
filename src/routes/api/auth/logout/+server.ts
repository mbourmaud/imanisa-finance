import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSession, clearSessionCookie, parseSessionFromCookies } from '@infrastructure/auth/session';

export const GET: RequestHandler = async ({ request, cookies }) => {
	const sessionId = parseSessionFromCookies(request.headers.get('cookie'));
	
	if (sessionId) {
		deleteSession(sessionId);
	}

	cookies.delete('session', { path: '/' });

	redirect(302, '/login');
};
