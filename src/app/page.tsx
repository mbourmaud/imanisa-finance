import { ArrowRight, BarChart3, PiggyBank, Shield, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="border-b">
				<div className="container mx-auto flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-2 font-semibold">
						<Wallet className="h-6 w-6" />
						<span>Imanisa Finance</span>
					</div>
					<nav className="flex items-center gap-4">
						<Button variant="ghost" asChild>
							<Link href="/login">Connexion</Link>
						</Button>
						<Button asChild>
							<Link href="/dashboard">
								Dashboard
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</nav>
				</div>
			</header>

			<main className="flex-1">
				<section className="container mx-auto px-4 py-24 text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
						Gérez votre patrimoine
						<br />
						<span className="text-primary">en toute simplicité</span>
					</h1>
					<p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
						Suivez vos comptes, investissements, crédits et budget au même endroit. Une vision
						claire de votre situation financière.
					</p>
					<div className="mt-10 flex items-center justify-center gap-4">
						<Button size="lg" asChild>
							<Link href="/dashboard">
								Commencer
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
				</section>

				<section className="container mx-auto px-4 py-16">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader>
								<Wallet className="h-10 w-10 text-primary" />
								<CardTitle className="mt-4">Comptes bancaires</CardTitle>
								<CardDescription>
									Centralisez tous vos comptes et suivez vos soldes en temps réel
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<BarChart3 className="h-10 w-10 text-primary" />
								<CardTitle className="mt-4">Investissements</CardTitle>
								<CardDescription>
									PEA, CTO, Assurance-vie, Crypto - tout au même endroit
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<PiggyBank className="h-10 w-10 text-primary" />
								<CardTitle className="mt-4">Budget</CardTitle>
								<CardDescription>
									Catégorisez vos dépenses et suivez votre budget mensuel
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<Shield className="h-10 w-10 text-primary" />
								<CardTitle className="mt-4">Données privées</CardTitle>
								<CardDescription>
									Vos données restent sur votre serveur, 100% privées
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</section>
			</main>

			<footer className="border-t py-8">
				<div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
					Imanisa Finance - Gestion de patrimoine personnel
				</div>
			</footer>
		</div>
	);
}
