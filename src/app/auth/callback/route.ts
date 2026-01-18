import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
				// Sync user to Prisma database
				// Handle case where user exists with different ID (from seed data)
				const email = user.email || '';
				const name = user.user_metadata?.name || user.user_metadata?.full_name || null;
				const avatarUrl = user.user_metadata?.avatar_url || null;

				const existingUserById = await prisma.user.findUnique({ where: { id: user.id } });
				const existingUserByEmail = email
					? await prisma.user.findUnique({ where: { email } })
					: null;

				if (existingUserById) {
					await prisma.user.update({
						where: { id: user.id },
						data: { email, name, avatarUrl },
					});
				} else if (existingUserByEmail) {
					// Update existing user's ID to match Supabase
					await prisma.user.update({
						where: { email },
						data: { id: user.id, name, avatarUrl },
					});
				} else {
					await prisma.user.create({
						data: { id: user.id, email, name, avatarUrl },
					});
				}
			}

			const forwardedHost = request.headers.get('x-forwarded-host');
			const isLocalEnv = process.env.NODE_ENV === 'development';
			if (isLocalEnv) {
				return NextResponse.redirect(`${origin}${next}`);
			} else if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}${next}`);
			} else {
				return NextResponse.redirect(`${origin}${next}`);
			}
		}
	}

	// Return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
