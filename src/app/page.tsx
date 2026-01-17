'use client';

import { User, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6">
			{/* Background gradient blobs */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
				<div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
			</div>

			{/* Logo */}
			<div className="mb-16 flex flex-col items-center gap-5 animate-fade-in">
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

			{/* Profile selector */}
			<div className="w-full max-w-sm stagger-children">
				<p className="mb-8 text-center text-xl font-semibold">Qui êtes-vous ?</p>

				<div className="space-y-4">
					{individualEntities.map((entity, index) => (
						<button
							key={entity.id}
							type="button"
							onClick={() => handleSelectProfile(entity.id)}
							className="w-full flex items-center gap-5 p-6 rounded-3xl bg-card/80 backdrop-blur-sm border border-border/40 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
							style={{ animationDelay: `${0.1 + index * 0.1}s` }}
						>
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-orange-500/20 group-hover:from-primary/30 group-hover:to-orange-500/30 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/10">
								<User className="h-8 w-8 text-primary" />
							</div>
							<div className="flex-1 text-left">
								<p className="text-xl font-semibold group-hover:text-primary transition-colors">{entity.name}</p>
								<p className="text-sm text-muted-foreground mt-0.5">Accéder à mon espace</p>
							</div>
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
								<svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<title>Flèche vers la droite</title>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Footer */}
			<p className="absolute bottom-6 text-sm text-muted-foreground/50">
				100% privé • Self-hosted
			</p>
		</div>
	);
}
