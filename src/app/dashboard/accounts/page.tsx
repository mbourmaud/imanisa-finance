import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Comptes</h1>
					<p className="text-muted-foreground">Gérez vos comptes bancaires et suivez vos soldes</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Ajouter un compte
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Tous les comptes</CardTitle>
					<CardDescription>Liste de vos comptes bancaires</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Aucun compte configuré. Ajoutez votre premier compte pour commencer.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
