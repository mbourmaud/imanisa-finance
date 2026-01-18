'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	AlertTriangle,
	ArrowLeft,
	Button,
	Flex,
	GlassCard,
	Heading,
	RefreshCw,
	Text,
	VStack,
	Wallet,
} from '@/components';

export default function AuthCodeErrorPage() {
	const router = useRouter();

	return (
		<div
			className="relative flex min-h-screen overflow-hidden bg-background p-6"
		>
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
			<Flex direction="col" align="center" justify="center" fullWidth fullHeight>
				{/* Logo */}
				<VStack gap="md" align="center" p="lg">
					<div
						className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl"
						style={{
							background:
								'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary)) 50%, hsl(var(--primary) / 0.8))',
						}}
					>
						<Wallet style={{ height: '2rem', width: '2rem', color: 'white' }} />
					</div>
				</VStack>

				{/* Error card */}
				<div className="w-full max-w-md">
					<GlassCard padding="lg" variant="elevated">
						<VStack gap="lg" align="center">
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
							<Heading level={1} size="xl" align="center">
								Erreur d'authentification
							</Heading>

							{/* Description */}
							<Text color="muted" align="center">
								Une erreur s'est produite lors de la connexion avec Google. Veuillez réessayer ou
								contacter le support si le problème persiste.
							</Text>

							{/* Actions */}
							<VStack gap="sm" fullWidth>
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
							</VStack>
						</VStack>
					</GlassCard>
				</div>

				{/* Footer */}
				<div className="absolute bottom-6">
					<Text size="sm" color="muted">
						Besoin d'aide ? Contactez le support
					</Text>
				</div>
			</Flex>
		</div>
	);
}
