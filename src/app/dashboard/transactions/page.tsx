import { Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TransactionsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
					<p className="text-muted-foreground">Historique de toutes vos transactions</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">
						<Filter className="mr-2 h-4 w-4" />
						Filtrer
					</Button>
					<Button variant="outline">
						<Download className="mr-2 h-4 w-4" />
						Exporter
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Toutes les transactions</CardTitle>
					<CardDescription>Liste complète de vos opérations</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Aucune transaction. Importez vos relevés pour commencer.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
