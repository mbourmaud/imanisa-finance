import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BudgetPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Budget</h1>
					<p className="text-muted-foreground">Suivez vos dépenses par catégorie</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">
						<Settings className="mr-2 h-4 w-4" />
						Règles
					</Button>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Nouvelle catégorie
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="col-span-2">
					<CardHeader>
						<CardTitle>Dépenses du mois</CardTitle>
						<CardDescription>Par catégorie</CardDescription>
					</CardHeader>
					<CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
						Graphique à venir
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Catégories</CardTitle>
						<CardDescription>Budget mensuel</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">Aucune catégorie configurée</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
