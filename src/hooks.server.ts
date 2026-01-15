import type { Handle } from '@sveltejs/kit';
import { getSession, parseSessionFromCookies } from '@infrastructure/auth/session';
import { getContainerMode, getUserId } from '@infrastructure/container';
import { initScheduler } from '$lib/scraper/scheduler';

// Auto-start scheduler on server boot (production only)
const mode = getContainerMode();
if (mode === 'sqlite') {
	const cronExpression = process.env.SCRAPER_CRON || '0 8 * * 1';
	console.log(`[Hooks] Starting scheduler with cron: ${cronExpression}`);
	initScheduler({ binanceCron: cronExpression });
}

export const handle: Handle = async ({ event, resolve }) => {
	const mode = getContainerMode();
	
	if (mode === 'inmemory') {
		event.locals.user = {
			id: getUserId(),
			email: 'mathieu.bourmaud@gmail.com',
			name: 'Mathieu',
			avatarUrl: null
		};
		return resolve(event);
	}

	const sessionId = parseSessionFromCookies(event.request.headers.get('cookie'));
	
	if (sessionId) {
		const session = getSession(sessionId);
		if (session) {
			event.locals.user = {
				id: session.userId,
				email: session.email,
				name: session.name,
				avatarUrl: session.avatarUrl
			};
		} else {
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	const publicPaths = ['/login', '/api/auth'];
	const isPublicPath = publicPaths.some((path) => event.url.pathname.startsWith(path));

	if (!event.locals.user && !isPublicPath) {
		return new Response(null, {
			status: 302,
			headers: { Location: '/login' }
		});
	}

	return resolve(event);
};
