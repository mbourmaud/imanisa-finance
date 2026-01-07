import { redirect } from '@sveltejs/kit';
import { getGoogleAuthUrl } from '$lib/auth.js';

export function GET() {
    throw redirect(302, getGoogleAuthUrl());
}
