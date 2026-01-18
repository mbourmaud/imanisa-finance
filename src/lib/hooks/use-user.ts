'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUser() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const supabase = createClient();

		// Get initial session (works better with SSR cookies)
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
			setLoading(false);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);

	return {
		user,
		loading,
		avatarUrl: user?.user_metadata?.avatar_url as string | undefined,
		fullName: user?.user_metadata?.full_name as string | undefined,
		email: user?.email,
	};
}
