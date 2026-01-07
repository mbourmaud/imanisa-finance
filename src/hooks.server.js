import { getSessionFromCookie } from '$lib/auth.js';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/callback', '/api/auth/logout'];

export async function handle({ event, resolve }) {
    const session = getSessionFromCookie(event.cookies);
    
    event.locals.user = session ? {
        id: session.user_id,
        email: session.email,
        name: session.name,
        picture: session.picture
    } : null;

    const isPublicPath = PUBLIC_PATHS.some(path => event.url.pathname.startsWith(path));
    
    if (!session && !isPublicPath) {
        return new Response(null, {
            status: 302,
            headers: { Location: '/login' }
        });
    }

    return resolve(event);
}
