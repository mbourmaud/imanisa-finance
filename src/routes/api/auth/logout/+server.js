import { redirect } from '@sveltejs/kit';
import { deleteSessionCookie } from '$lib/auth.js';
import * as db from '$lib/db.js';

export async function GET({ cookies }) {
    const sessionId = cookies.get('session');
    
    if (sessionId) {
        db.deleteSession(sessionId);
    }
    
    const cookie = deleteSessionCookie();
    cookies.set(cookie.name, cookie.value, cookie.options);
    
    throw redirect(302, '/login');
}
