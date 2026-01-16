import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoansPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Crédits</h1>
					<p className="text-muted-foreground">Suivez vos emprunts et échéanciers</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Ajouter un crédit
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Capital restant dû</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.--- €</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Mensualités totales</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.--- €/mois</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Crédits actifs</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Mes crédits</CardTitle>
					<CardDescription>Liste de vos emprunts</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Aucun crédit. Ajoutez votre premier crédit pour commencer.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
