import { ArrowDownIcon, ArrowUpIcon, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
				<p className="text-muted-foreground">Vue d&apos;ensemble de votre situation financière</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Patrimoine Net</CardTitle>
						<Wallet className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.--- €</div>
						<p className="text-xs text-muted-foreground">Actifs - Passifs</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Revenus (mois)</CardTitle>
						<ArrowUpIcon className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.--- €</div>
						<p className="text-xs text-muted-foreground">Ce mois-ci</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Dépenses (mois)</CardTitle>
						<ArrowDownIcon className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.--- €</div>
						<p className="text-xs text-muted-foreground">Ce mois-ci</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Investissements</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.--- €</div>
						<p className="text-xs text-muted-foreground">Valeur totale</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Évolution du patrimoine</CardTitle>
						<CardDescription>Les 12 derniers mois</CardDescription>
					</CardHeader>
					<CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
						Graphique à venir
					</CardContent>
				</Card>

				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Répartition des actifs</CardTitle>
						<CardDescription>Par catégorie</CardDescription>
					</CardHeader>
					<CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
						Graphique à venir
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Dernières transactions</CardTitle>
						<CardDescription>Les 5 dernières opérations</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">Aucune transaction</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Budget du mois</CardTitle>
						<CardDescription>Suivi des catégories</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">Aucune catégorie configurée</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
