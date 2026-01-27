'use client';

import { useRouter } from 'next/navigation';
import {
	AuthErrorBackground,
	AuthErrorCard,
	AuthErrorContainer,
	AuthErrorFooter,
	AuthErrorLogo,
} from '@/components';

export default function AuthCodeErrorPage() {
	const router = useRouter();

	return (
		<AuthErrorContainer>
			<AuthErrorBackground />
			<AuthErrorLogo />
			<AuthErrorCard onRetry={() => router.push('/login')} />
			<AuthErrorFooter />
		</AuthErrorContainer>
	);
}
