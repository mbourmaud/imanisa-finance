'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, ChevronRight, Heading, Text, User, VStack, Wallet } from '@/components';
import { useEntityStore } from '@/shared/stores/entity-store';

export default function HomePage() {
	const router = useRouter();
	const { entities, setSelectedEntity } = useEntityStore();

	const handleSelectProfile = (entityId: string) => {
		setSelectedEntity(entityId);
		router.push('/dashboard');
	};

	// Seulement les profils individuels pour le login
	const individualEntities = entities.filter((e) => e.type === 'individual');

	return (
		<Box
			display="flex"
			p="lg"
			style={{
				position: 'relative',
				overflow: 'hidden',
				backgroundColor: 'hsl(var(--background))',
				minHeight: '100vh',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{/* Background gradient blobs */}
			<Box style={{ position: 'absolute', overflow: 'hidden', inset: 0, zIndex: -10 }}>
				<Box
					style={{
						position: 'absolute',
						borderRadius: '9999px',
						top: '-10rem',
						right: '-10rem',
						height: '500px',
						width: '500px',
						backgroundColor: 'hsl(var(--primary) / 0.1)',
						filter: 'blur(64px)',
						animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
					}}
				/>
				<Box
					style={{
						position: 'absolute',
						borderRadius: '9999px',
						bottom: '-10rem',
						left: '-10rem',
						height: '400px',
						width: '400px',
						backgroundColor: 'oklch(0.6 0.2 280 / 0.1)',
						filter: 'blur(64px)',
						animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
						animationDelay: '1s',
					}}
				/>
				<Box
					style={{
						position: 'absolute',
						borderRadius: '9999px',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						height: '600px',
						width: '600px',
						backgroundColor: 'hsl(var(--primary) / 0.05)',
						filter: 'blur(64px)',
					}}
				/>
			</Box>

			{/* Logo */}
			<VStack
				gap="lg"
				align="center"
				style={{ marginBottom: '4rem', animation: 'fadeIn 0.5s ease-out' }}
			>
				<Box style={{ position: 'relative' }}>
					<Box
						display="flex"
						style={{
							borderRadius: '1rem',
							height: '5rem',
							width: '5rem',
							alignItems: 'center',
							justifyContent: 'center',
							background:
								'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary)) 50%, hsl(var(--primary) / 0.8))',
							boxShadow: '0 25px 50px -12px hsl(var(--primary) / 0.4)',
						}}
					>
						<Wallet style={{ height: '2.5rem', width: '2.5rem', color: 'white' }} />
					</Box>
					<Box
						style={{
							position: 'absolute',
							borderRadius: '9999px',
							bottom: '-0.25rem',
							right: '-0.25rem',
							height: '1.25rem',
							width: '1.25rem',
							backgroundColor: 'oklch(0.7 0.2 145)',
							border: '4px solid hsl(var(--background))',
						}}
					/>
				</Box>
				<VStack gap="xs" align="center">
					<Heading
						level={1}
						size="2xl"
						style={{
							fontWeight: 700,
							letterSpacing: '-0.025em',
							backgroundImage:
								'linear-gradient(to right, hsl(var(--foreground)), hsl(var(--foreground) / 0.7))',
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
						}}
					>
						Imanisa
					</Heading>
					<Text color="muted" size="lg">
						Finance familiale
					</Text>
				</VStack>
			</VStack>

			{/* Profile selector */}
			<Box style={{ width: '100%', maxWidth: '24rem' }}>
				<Text size="xl" weight="semibold" align="center" style={{ marginBottom: '1.5rem' }}>
					Qui êtes-vous ?
				</Text>

				<VStack gap="md">
					{individualEntities.map((entity, index) => (
						<Button
							key={entity.id}
							variant="ghost"
							onClick={() => handleSelectProfile(entity.id)}
							fullWidth
							style={{
								padding: '1.5rem',
								borderRadius: '1.5rem',
								backgroundColor: 'hsl(var(--card) / 0.8)',
								backdropFilter: 'blur(8px)',
								border: '1px solid hsl(var(--border) / 0.4)',
								display: 'flex',
								alignItems: 'center',
								gap: '1.25rem',
								justifyContent: 'flex-start',
								animationDelay: `${0.1 + index * 0.1}s`,
							}}
						>
							<Box
								display="flex"
								style={{
									borderRadius: '0.75rem',
									height: '4rem',
									width: '4rem',
									alignItems: 'center',
									justifyContent: 'center',
									background:
										'linear-gradient(to bottom right, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.1), oklch(0.6 0.2 30 / 0.2))',
									boxShadow: '0 10px 15px -3px hsl(var(--primary) / 0.1)',
								}}
							>
								<User style={{ height: '2rem', width: '2rem', color: 'hsl(var(--primary))' }} />
							</Box>
							<Box style={{ flex: 1, textAlign: 'left' }}>
								<Text size="lg" weight="semibold">
									{entity.name}
								</Text>
								<Text size="sm" color="muted" style={{ marginTop: '0.125rem' }}>
									Accéder à mon espace
								</Text>
							</Box>
							<Box
								display="flex"
								style={{
									borderRadius: '9999px',
									height: '2.5rem',
									width: '2.5rem',
									alignItems: 'center',
									justifyContent: 'center',
									backgroundColor: 'hsl(var(--primary) / 0.1)',
								}}
							>
								<ChevronRight
									style={{ height: '1.25rem', width: '1.25rem', color: 'hsl(var(--primary))' }}
								/>
							</Box>
						</Button>
					))}
				</VStack>
			</Box>

			{/* Footer */}
			<Box style={{ position: 'absolute', bottom: '1.5rem' }}>
				<Text size="sm" style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>
					100% privé • Self-hosted
				</Text>
			</Box>
		</Box>
	);
}
