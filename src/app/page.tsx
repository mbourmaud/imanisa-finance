'use client';

import { useRouter } from 'next/navigation';
import { Button, ChevronRight, Heading, Text, User, VStack, Wallet } from '@/components';
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
		<div
			className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6"
		>
			{/* Background gradient blobs */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div
					className="absolute -right-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/10"
					style={{ filter: 'blur(64px)' }}
				/>
				<div
					className="absolute -bottom-40 -left-40 h-[400px] w-[400px] animate-pulse rounded-full"
					style={{
						backgroundColor: 'oklch(0.6 0.2 280 / 0.1)',
						filter: 'blur(64px)',
						animationDelay: '1s',
					}}
				/>
				<div
					className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5"
					style={{ filter: 'blur(64px)' }}
				/>
			</div>

			{/* Logo */}
			<VStack
				gap="lg"
				align="center"
				style={{ marginBottom: '4rem', animation: 'fadeIn 0.5s ease-out' }}
			>
				<div className="relative">
					<div
						className="flex h-20 w-20 items-center justify-center rounded-2xl"
						style={{
							background:
								'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary)) 50%, hsl(var(--primary) / 0.8))',
							boxShadow: '0 25px 50px -12px hsl(var(--primary) / 0.4)',
						}}
					>
						<Wallet style={{ height: '2.5rem', width: '2.5rem', color: 'white' }} />
					</div>
					<div
						className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full"
						style={{
							backgroundColor: 'oklch(0.7 0.2 145)',
							border: '4px solid hsl(var(--background))',
						}}
					/>
				</div>
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
			<div className="w-full max-w-sm">
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
							<div
								className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
								style={{
									background:
										'linear-gradient(to bottom right, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.1), oklch(0.6 0.2 30 / 0.2))',
									boxShadow: '0 10px 15px -3px hsl(var(--primary) / 0.1)',
								}}
							>
								<User style={{ height: '2rem', width: '2rem', color: 'hsl(var(--primary))' }} />
							</div>
							<div className="flex-1 text-left">
								<Text size="lg" weight="semibold">
									{entity.name}
								</Text>
								<Text size="sm" color="muted" style={{ marginTop: '0.125rem' }}>
									Accéder à mon espace
								</Text>
							</div>
							<div
								className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
							>
								<ChevronRight
									style={{ height: '1.25rem', width: '1.25rem', color: 'hsl(var(--primary))' }}
								/>
							</div>
						</Button>
					))}
				</VStack>
			</div>

			{/* Footer */}
			<div className="absolute bottom-6">
				<Text size="sm" style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>
					100% privé • Self-hosted
				</Text>
			</div>
		</div>
	);
}
