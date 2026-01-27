import { Card, CardContent } from '@/components'
import { GoogleLoginButton } from './GoogleLoginButton'

interface LoginCardProps {
	onGoogleLogin: () => void
	isLoading: boolean
}

/**
 * Login card with Google OAuth button
 */
export function LoginCard({ onGoogleLogin, isLoading }: LoginCardProps) {
	return (
		<div className="w-full max-w-sm">
			<Card padding="lg" variant="elevated">
				<CardContent>
					<div className="flex flex-col gap-6">
						<h2 className="text-center text-lg font-semibold tracking-tight">
							Connexion
						</h2>
						<GoogleLoginButton onClick={onGoogleLogin} isLoading={isLoading} />
						<p className="text-center text-sm text-muted-foreground">
							Vos données restent privées et sécurisées
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
