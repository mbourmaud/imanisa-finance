import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BanksPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Banques</h1>
					<p className="text-muted-foreground">Gérez vos établissements bancaires</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Ajouter une banque
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Mes banques</CardTitle>
					<CardDescription>Liste de vos établissements bancaires</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Aucune banque configurée. Ajoutez votre première banque pour commencer.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
