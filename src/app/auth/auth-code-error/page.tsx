'use client';

import { AlertTriangle, ArrowLeft, RefreshCw, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthCodeErrorPage() {
	const router = useRouter();

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6">
			{/* Background gradient blobs */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-red-500/10 blur-3xl animate-pulse" />
				<div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
			</div>

			{/* Logo */}
			<div className="mb-8 flex flex-col items-center gap-4 animate-fade-in">
				<div className="relative">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-xl">
						<Wallet className="h-8 w-8 text-white" />
					</div>
				</div>
			</div>

			{/* Error card */}
			<div className="w-full max-w-md">
				<div className="rounded-3xl bg-card/80 backdrop-blur-sm border border-border/40 p-8 shadow-xl text-center">
					<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
						<AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
					</div>

					<h1 className="text-2xl font-bold mb-3">Erreur d'authentification</h1>

					<p className="text-muted-foreground mb-8">
						Une erreur s'est produite lors de la connexion avec Google.
						Veuillez reessayer ou contacter le support si le probleme persiste.
					</p>

					<div className="space-y-3">
						<button
							type="button"
							onClick={() => router.push('/login')}
							className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
						>
							<RefreshCw className="h-5 w-5" />
							Reessayer
						</button>

						<Link
							href="/"
							className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300"
						>
							<ArrowLeft className="h-5 w-5" />
							Retour a l'accueil
						</Link>
					</div>
				</div>
			</div>

			{/* Footer */}
			<p className="absolute bottom-6 text-sm text-muted-foreground/50">
				Besoin d'aide ? Contactez le support
			</p>
		</div>
	);
}
