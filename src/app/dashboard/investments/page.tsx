import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvestmentsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Investissements</h1>
					<p className="text-muted-foreground">PEA, CTO, Assurance-vie, Crypto</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">
						<RefreshCw className="mr-2 h-4 w-4" />
						Actualiser les cours
					</Button>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Nouvelle source
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
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
						<CardTitle className="text-sm font-medium">Plus-value latente</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.--- €</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Performance</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">---.-- %</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Positions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Positions</CardTitle>
					<CardDescription>Toutes vos positions d&apos;investissement</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Aucune position. Ajoutez une source d&apos;investissement pour commencer.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
