import { json, type RequestHandler } from '@sveltejs/kit';
import { validatePin } from '@infrastructure/auth/users';
import { createSession, createSessionCookie } from '@infrastructure/auth/session';

export const POST: RequestHandler = async ({ request }) => {
	const { username, pin } = await request.json();

	if (!username || !pin) {
		return json({ error: 'Username et PIN requis' }, { status: 400 });
	}

	const user = validatePin(username, pin);

	if (!user) {
		return json({ error: 'Code PIN incorrect' }, { status: 401 });
	}

	const sessionId = createSession({
		userId: user.id,
		email: `${user.username}@imanisa.local`,
		name: user.name,
		avatarUrl: user.avatar_url
	});

	return new Response(JSON.stringify({ success: true, user: { name: user.name } }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Set-Cookie': createSessionCookie(sessionId)
		}
	});
};
