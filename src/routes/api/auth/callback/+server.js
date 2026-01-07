import { redirect } from '@sveltejs/kit';
import { 
    exchangeCodeForTokens, 
    getGoogleUserInfo, 
    isEmailAllowed,
    createSessionForUser,
    createSessionCookie
} from '$lib/auth.js';
import * as db from '$lib/db.js';

export async function GET({ url, cookies }) {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error || !code) {
        throw redirect(302, '/login?error=failed');
    }

    try {
        const tokens = await exchangeCodeForTokens(code);
        
        if (tokens.error) {
            console.error('Token exchange error:', tokens);
            throw redirect(302, '/login?error=failed');
        }

        const userInfo = await getGoogleUserInfo(tokens.access_token);

        if (!isEmailAllowed(userInfo.email)) {
            console.warn('Unauthorized email attempt:', userInfo.email);
            throw redirect(302, '/login?error=unauthorized');
        }

        const userId = crypto.randomUUID();
        db.createUser({
            id: userId,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture
        });

        const user = db.getUserByEmail(userInfo.email);
        const { sessionId, expiresAt } = createSessionForUser(user);
        
        const cookie = createSessionCookie(sessionId, expiresAt);
        cookies.set(cookie.name, cookie.value, cookie.options);

        throw redirect(302, '/');

    } catch (err) {
        if (err.status === 302) throw err;
        console.error('Auth callback error:', err);
        throw redirect(302, '/login?error=failed');
    }
}
