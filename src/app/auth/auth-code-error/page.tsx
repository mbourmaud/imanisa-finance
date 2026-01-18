'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	AlertTriangle,
	ArrowLeft,
	RefreshCw,
	Wallet,
	Box,
	VStack,
	Flex,
	Heading,
	Text,
	Button,
	GlassCard,
} from '@/components';

export default function AuthCodeErrorPage() {
	const router = useRouter();

	return (
		<Box
			display="flex"
			position="relative"
			overflow="hidden"
			bg="background"
			p="lg"
			style={{ minHeight: '100vh' }}
		>
			{/* Background gradient blobs */}
			<Box position="absolute" overflow="hidden" style={{ inset: 0, zIndex: -10 }}>
				<Box
					position="absolute"
					rounded="full"
					style={{
						top: '-10rem',
						right: '-10rem',
						height: '500px',
						width: '500px',
						backgroundColor: 'oklch(0.5 0.2 25 / 0.1)',
						filter: 'blur(64px)',
						animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
					}}
				/>
				<Box
					position="absolute"
					rounded="full"
					style={{
						bottom: '-10rem',
						left: '-10rem',
						height: '400px',
						width: '400px',
						backgroundColor: 'oklch(0.6 0.2 40 / 0.1)',
						filter: 'blur(64px)',
						animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
						animationDelay: '1s',
					}}
				/>
			</Box>

			{/* Center content */}
			<Flex direction="col" align="center" justify="center" fullWidth fullHeight>
				{/* Logo */}
				<VStack gap="md" align="center" p="lg">
					<Box
						display="flex"
						rounded="2xl"
						shadow="xl"
						style={{
							height: '4rem',
							width: '4rem',
							alignItems: 'center',
							justifyContent: 'center',
							background: 'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary)) 50%, hsl(var(--primary) / 0.8))',
						}}
					>
						<Wallet style={{ height: '2rem', width: '2rem', color: 'white' }} />
					</Box>
				</VStack>

				{/* Error card */}
				<Box style={{ maxWidth: '28rem', width: '100%' }}>
					<GlassCard padding="lg" variant="elevated">
						<VStack gap="lg" align="center">
							{/* Error icon */}
							<Box
								display="flex"
								rounded="full"
								style={{
									height: '4rem',
									width: '4rem',
									alignItems: 'center',
									justifyContent: 'center',
									backgroundColor: 'oklch(0.9 0.05 25)',
								}}
							>
								<AlertTriangle style={{ height: '2rem', width: '2rem', color: 'oklch(0.55 0.2 25)' }} />
							</Box>

							{/* Title */}
							<Heading level={1} size="xl" align="center">
								Erreur d'authentification
							</Heading>

							{/* Description */}
							<Text color="muted" align="center">
								Une erreur s'est produite lors de la connexion avec Google.
								Veuillez réessayer ou contacter le support si le problème persiste.
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
				</Box>

				{/* Footer */}
				<Box position="absolute" style={{ bottom: '1.5rem' }}>
					<Text size="sm" color="muted">
						Besoin d'aide ? Contactez le support
					</Text>
				</Box>
			</Flex>
		</Box>
	);
}
