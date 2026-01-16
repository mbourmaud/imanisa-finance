import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
					<p className="text-muted-foreground">Configurez votre application</p>
				</div>
				<Button>
					<Save className="mr-2 h-4 w-4" />
					Enregistrer
				</Button>
			</div>

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Profil</CardTitle>
						<CardDescription>Vos informations personnelles</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">Configuration du profil à venir</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Propriétaires</CardTitle>
						<CardDescription>
							Gérez les propriétaires de vos actifs (personne, couple, SCI)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">Aucun propriétaire configuré</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Apparence</CardTitle>
						<CardDescription>Personnalisez l&apos;interface</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Options d&apos;apparence à venir (thème sombre/clair)
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Données</CardTitle>
						<CardDescription>Export et sauvegarde</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2">
							<Button variant="outline">Exporter les données</Button>
							<Button variant="outline">Importer une sauvegarde</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
