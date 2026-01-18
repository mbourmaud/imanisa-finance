'use client';

import { useState } from 'react';
import { Box, Button, GlassCard, Heading, Text, VStack, Wallet } from '@/components';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
	const supabase = createClient();

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});
			if (error) {
				console.error('Error:', error.message);
			}
		} catch (error) {
			console.error('Login error:', error);
		} finally {
			setIsLoading(false);
		}
	};

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
				style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}
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

			{/* Login card */}
			<Box style={{ maxWidth: '24rem', width: '100%' }}>
				<GlassCard padding="lg" variant="elevated">
					<VStack gap="lg">
						<Heading level={2} size="lg" align="center">
							Connexion
						</Heading>

						<Button
							onClick={handleGoogleLogin}
							disabled={isLoading}
							variant="outline"
							fullWidth
							style={{
								padding: '1rem',
								borderRadius: '1rem',
								backgroundColor: 'white',
								color: '#1f2937',
								borderColor: '#e5e7eb',
								gap: '0.75rem',
							}}
						>
							<svg
								style={{ height: '1.25rem', width: '1.25rem' }}
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<title>Logo Google</title>
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							{isLoading ? 'Connexion...' : 'Continuer avec Google'}
						</Button>

						<Text color="muted" size="sm" align="center">
							Vos donnees restent privees et securisees
						</Text>
					</VStack>
				</GlassCard>
			</Box>

			{/* Footer */}
			<Box style={{ position: 'absolute', bottom: '1.5rem' }}>
				<Text size="sm" style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>
					100% prive - Self-hosted
				</Text>
			</Box>
		</Box>
	);
}
