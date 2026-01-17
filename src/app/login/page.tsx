'use client';

import { Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

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
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6">
			{/* Background gradient blobs */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
				<div
					className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl animate-pulse"
					style={{ animationDelay: '1s' }}
				/>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
			</div>

			{/* Logo */}
			<div className="mb-12 flex flex-col items-center gap-5 animate-fade-in">
				<div className="relative">
					<div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-2xl shadow-primary/40">
						<Wallet className="h-10 w-10 text-white" />
					</div>
					<div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-400 border-4 border-background" />
				</div>
				<div className="text-center">
					<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
						Imanisa
					</h1>
					<p className="mt-2 text-muted-foreground text-lg">Finance familiale</p>
				</div>
			</div>

			{/* Login card */}
			<div className="w-full max-w-sm">
				<div className="rounded-3xl bg-card/80 backdrop-blur-sm border border-border/40 p-8 shadow-xl">
					<h2 className="text-xl font-semibold text-center mb-6">Connexion</h2>

					<button
						type="button"
						onClick={handleGoogleLogin}
						disabled={isLoading}
						className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						<svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
					</button>

					<p className="mt-6 text-center text-sm text-muted-foreground">
						Vos donnees restent privees et securisees
					</p>
				</div>
			</div>

			{/* Footer */}
			<p className="absolute bottom-6 text-sm text-muted-foreground/50">
				100% prive - Self-hosted
			</p>
		</div>
	);
}
