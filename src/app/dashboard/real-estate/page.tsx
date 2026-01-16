import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RealEstatePage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Immobilier</h1>
					<p className="text-muted-foreground">Gérez votre patrimoine immobilier</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Ajouter un bien
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.--- €</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Revenus locatifs</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.--- €/mois</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Rendement</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.-- %</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Mes biens</CardTitle>
					<CardDescription>Liste de vos propriétés</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Aucun bien immobilier. Ajoutez votre premier bien pour commencer.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
