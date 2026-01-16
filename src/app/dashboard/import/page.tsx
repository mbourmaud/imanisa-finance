import { FileSpreadsheet, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ImportPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Import</h1>
					<p className="text-muted-foreground">
						Importez vos données bancaires et d&apos;investissement
					</p>
				</div>
				<Button variant="outline">
					<RefreshCw className="mr-2 h-4 w-4" />
					Synchroniser tout
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<FileSpreadsheet className="h-10 w-10 text-primary" />
						<CardTitle className="mt-4">Import CSV/Excel</CardTitle>
						<CardDescription>Importez vos relevés bancaires au format CSV ou Excel</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full">
							<Upload className="mr-2 h-4 w-4" />
							Sélectionner un fichier
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<RefreshCw className="h-10 w-10 text-primary" />
						<CardTitle className="mt-4">Sources configurées</CardTitle>
						<CardDescription>Gérez vos sources de données automatiques</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">Aucune source configurée</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Historique des imports</CardTitle>
					<CardDescription>Derniers fichiers importés</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">Aucun import effectué</p>
				</CardContent>
			</Card>
		</div>
	);
}
