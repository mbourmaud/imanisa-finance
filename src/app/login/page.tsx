'use client'

import {
	LandingBackground,
	LandingContainer,
	LandingFooter,
	LoginCard,
	LoginLogo,
} from '@/components'
import { useGoogleLoginMutation } from '@/features/auth'

export default function LoginPage() {
	const { mutate: handleGoogleLogin, isPending } = useGoogleLoginMutation()

	return (
		<LandingContainer>
			<LandingBackground />
			<LoginLogo />
			<LoginCard onGoogleLogin={() => handleGoogleLogin()} isLoading={isPending} />
			<LandingFooter />
		</LandingContainer>
	)
}
