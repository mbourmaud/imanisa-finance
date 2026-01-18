import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RefreshCw } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

interface AuthErrorCardProps {
	onRetry: () => void
}

/**
 * Error card for auth failures
 */
export function AuthErrorCard({ onRetry }: AuthErrorCardProps) {
	return (
		<div className="w-full max-w-md">
			<GlassCard padding="lg" variant="elevated">
				<div className="flex flex-col items-center gap-6">
					{/* Error icon */}
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[oklch(0.9_0.05_25)]">
						<AlertTriangle className="h-8 w-8 text-[oklch(0.55_0.2_25)]" />
					</div>

					{/* Title */}
					<h1 className="text-center text-xl font-semibold tracking-tight">
						Erreur d'authentification
					</h1>

					{/* Description */}
					<p className="text-center text-muted-foreground">
						Une erreur s'est produite lors de la connexion avec Google. Veuillez réessayer ou
						contacter le support si le problème persiste.
					</p>

					{/* Actions */}
					<div className="flex w-full flex-col gap-3">
						<Button
							onClick={onRetry}
							iconLeft={<RefreshCw className="h-5 w-5" />}
							fullWidth
						>
							Réessayer
						</Button>

						<Button
							asChild
							variant="secondary"
							iconLeft={<ArrowLeft className="h-5 w-5" />}
							fullWidth
						>
							<Link href="/">Retour à l'accueil</Link>
						</Button>
					</div>
				</div>
			</GlassCard>
		</div>
	)
}
