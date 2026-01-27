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

		if (!error) {
			// Get the authenticated user
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				// Sync user to Prisma database using repository
				const email = user.email || '';
				const name = user.user_metadata?.name || user.user_metadata?.full_name || null;
				const avatarUrl = user.user_metadata?.avatar_url || null;

				await userRepository.syncFromAuth(user.id, email, name, avatarUrl);
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
