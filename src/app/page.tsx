'use client';

import { LandingBackground, LandingContainer, LandingFooter, LandingLogo } from '@/components';
import { GoogleLoginButton } from '@/components/login/GoogleLoginButton';
import { useGoogleLoginMutation } from '@/features/auth';

export default function HomePage() {
	const { mutate: handleGoogleLogin, isPending } = useGoogleLoginMutation();

	return (
		<LandingContainer>
			<LandingBackground />
			<LandingLogo />
			<div className="flex w-full max-w-sm flex-col items-center gap-8">
				<div className="flex flex-col items-center gap-2">
					<h2 className="text-xl font-semibold tracking-tight">Bienvenue</h2>
					<p className="text-center text-sm text-muted-foreground">
						Connectez-vous pour accéder à votre espace
					</p>
				</div>
				<GoogleLoginButton onClick={() => handleGoogleLogin()} isLoading={isPending} />
			</div>
			<LandingFooter />
		</LandingContainer>
	);
}
