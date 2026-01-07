import * as db from './db.js';

const ALLOWED_EMAILS = [
    'mathis.music@gmail.com',
    'ADD_YOUR_WIFE_EMAIL_HERE'
];

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

export function isEmailAllowed(email) {
    return ALLOWED_EMAILS.includes(email.toLowerCase());
}

export function getGoogleAuthUrl() {
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `${APP_URL}/api/auth/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account'
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForTokens(code) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: `${APP_URL}/api/auth/callback`,
            grant_type: 'authorization_code'
        })
    });
    return response.json();
}

export async function getGoogleUserInfo(accessToken) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.json();
}

export function createSessionForUser(user) {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    db.createSession({
        id: sessionId,
        user_id: user.id,
        expires_at: expiresAt
    });
    
    return { sessionId, expiresAt };
}

export function getSessionFromCookie(cookies) {
    const sessionId = cookies.get('session');
    if (!sessionId) return null;
    return db.getSession(sessionId);
}

export function createSessionCookie(sessionId, expiresAt) {
    return {
        name: 'session',
        value: sessionId,
        options: {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(expiresAt)
        }
    };
}

export function deleteSessionCookie() {
    return {
        name: 'session',
        value: '',
        options: {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0
        }
    };
}
