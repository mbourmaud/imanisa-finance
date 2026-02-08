import { NextResponse } from 'next/server';
import { userRepository } from '@/server/repositories';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get('code');
	const next = searchParams.get('next') ?? '/dashboard';

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		// If exchange fails, the middleware may have already consumed the PKCE flow.
		// Check if we already have a valid session from the middleware.
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!error || user) {
			if (user) {
				// Sync user to Prisma database using repository
				const email = user.email || '';
				const name = user.user_metadata?.name || user.user_metadata?.full_name || null;
				const avatarUrl = user.user_metadata?.avatar_url || null;

				try {
					await userRepository.syncFromAuth(user.id, email, name, avatarUrl);
				} catch (syncError) {
					console.error('[auth/callback] Failed to sync user:', syncError);
				}
			}

			const forwardedHost = request.headers.get('x-forwarded-host');
			const isLocalEnv = process.env.NODE_ENV === 'development';
			if (isLocalEnv) {
				return NextResponse.redirect(`${origin}${next}`);
			}
			if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}${next}`);
			}
			return NextResponse.redirect(`${origin}${next}`);
		}
	}

	// Return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
