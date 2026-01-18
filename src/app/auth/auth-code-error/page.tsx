'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Button, GlassCard, RefreshCw, Wallet } from '@/components';

export default function AuthCodeErrorPage() {
	const router = useRouter();

	return (
		<div className="relative flex min-h-screen overflow-hidden bg-background p-6">
			{/* Background gradient blobs */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div
					className="absolute -right-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full"
					style={{
						backgroundColor: 'oklch(0.5 0.2 25 / 0.1)',
						filter: 'blur(64px)',
					}}
				/>
				<div
					className="absolute -bottom-40 -left-40 h-[400px] w-[400px] animate-pulse rounded-full"
					style={{
						backgroundColor: 'oklch(0.6 0.2 40 / 0.1)',
						filter: 'blur(64px)',
						animationDelay: '1s',
					}}
				/>
			</div>

			{/* Center content */}
			<div className="flex flex-col items-center justify-center w-full h-full">
				{/* Logo */}
				<div className="flex flex-col items-center gap-4 p-6">
					<div
						className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl"
						style={{
							background:
								'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary)) 50%, hsl(var(--primary) / 0.8))',
						}}
					>
						<Wallet style={{ height: '2rem', width: '2rem', color: 'white' }} />
					</div>
				</div>

				{/* Error card */}
				<div className="w-full max-w-md">
					<GlassCard padding="lg" variant="elevated">
						<div className="flex flex-col items-center gap-6">
							{/* Error icon */}
							<div
								className="flex h-16 w-16 items-center justify-center rounded-full"
								style={{ backgroundColor: 'oklch(0.9 0.05 25)' }}
							>
								<AlertTriangle
									style={{ height: '2rem', width: '2rem', color: 'oklch(0.55 0.2 25)' }}
								/>
							</div>

							{/* Title */}
							<h1 className="text-xl font-semibold tracking-tight text-center">
								Erreur d'authentification
							</h1>

							{/* Description */}
							<p className="text-muted-foreground text-center">
								Une erreur s'est produite lors de la connexion avec Google. Veuillez réessayer ou
								contacter le support si le problème persiste.
							</p>

							{/* Actions */}
							<div className="flex flex-col gap-3 w-full">
								<Button
									onClick={() => router.push('/login')}
									iconLeft={<RefreshCw style={{ height: '1.25rem', width: '1.25rem' }} />}
									fullWidth
								>
									Réessayer
								</Button>

								<Button
									asChild
									variant="secondary"
									iconLeft={<ArrowLeft style={{ height: '1.25rem', width: '1.25rem' }} />}
									fullWidth
								>
									<Link href="/">Retour à l'accueil</Link>
								</Button>
							</div>
						</div>
					</GlassCard>
				</div>

				{/* Footer */}
				<div className="absolute bottom-6">
					<p className="text-sm text-muted-foreground">Besoin d'aide ? Contactez le support</p>
				</div>
			</div>
		</div>
	);
}
