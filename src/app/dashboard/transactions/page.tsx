import {
	ArrowDownLeft,
	ArrowUpRight,
	Calendar,
	CreditCard,
	Download,
	Filter,
	Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const transactions = [
	{
		id: 'tx-1',
		description: 'Carrefour Market',
		amount: -125.4,
		date: '2025-01-16',
		category: 'Courses',
		account: 'Compte principal',
	},
	{
		id: 'tx-2',
		description: 'Virement Salaire',
		amount: 3200.0,
		date: '2025-01-15',
		category: 'Revenus',
		account: 'Compte principal',
	},
	{
		id: 'tx-3',
		description: 'EDF',
		amount: -89.0,
		date: '2025-01-15',
		category: 'Factures',
		account: 'Compte principal',
	},
	{
		id: 'tx-4',
		description: 'Amazon Prime',
		amount: -6.99,
		date: '2025-01-14',
		category: 'Abonnements',
		account: 'Compte principal',
	},
	{
		id: 'tx-5',
		description: 'Restaurant Le Petit Bistrot',
		amount: -52.0,
		date: '2025-01-13',
		category: 'Sorties',
		account: 'Compte joint',
	},
	{
		id: 'tx-6',
		description: 'SNCF - Billet TGV',
		amount: -85.0,
		date: '2025-01-12',
		category: 'Transport',
		account: 'Compte principal',
	},
	{
		id: 'tx-7',
		description: 'Loyer Janvier',
		amount: -950.0,
		date: '2025-01-10',
		category: 'Logement',
		account: 'Compte joint',
	},
	{
		id: 'tx-8',
		description: 'Virement vers Livret A',
		amount: -500.0,
		date: '2025-01-05',
		category: 'Épargne',
		account: 'Compte principal',
	},
	{
		id: 'tx-9',
		description: 'Pharmacie',
		amount: -23.5,
		date: '2025-01-04',
		category: 'Santé',
		account: 'Compte principal',
	},
	{
		id: 'tx-10',
		description: 'Spotify',
		amount: -9.99,
		date: '2025-01-03',
		category: 'Abonnements',
		account: 'Compte principal',
	},
];

const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
const expenses = transactions
	.filter((t) => t.amount < 0)
	.reduce((s, t) => s + Math.abs(t.amount), 0);

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
	}).format(amount);
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (date.toDateString() === today.toDateString()) {
		return "Aujourd'hui";
	}
	if (date.toDateString() === yesterday.toDateString()) {
		return 'Hier';
	}
	return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
}

export default function TransactionsPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
					<p className="mt-1 text-muted-foreground">Historique de toutes vos transactions</p>
				</div>
				<Button variant="outline" className="gap-2">
					<Download className="h-4 w-4" />
					Exporter
				</Button>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 stagger-children">
				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Revenus</p>
							<p className="stat-card-value value-positive">+{formatCurrency(income)}</p>
						</div>
						<div className="stat-card-icon bg-[oklch(0.55_0.15_145)]/10 text-[oklch(0.55_0.15_145)]">
							<ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Dépenses</p>
							<p className="stat-card-value value-negative">-{formatCurrency(expenses)}</p>
						</div>
						<div className="stat-card-icon bg-[oklch(0.55_0.2_25)]/10 text-[oklch(0.55_0.2_25)]">
							<ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card col-span-2 sm:col-span-1">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Solde net</p>
							<p className={`stat-card-value ${income - expenses >= 0 ? 'value-positive' : 'value-negative'}`}>
								{formatCurrency(income - expenses)}
							</p>
						</div>
						<div className="stat-card-icon">
							<CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<Card className="border-border/60">
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 sm:flex-row">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input placeholder="Rechercher une transaction..." className="pl-10" />
						</div>
						<Select defaultValue="all">
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Catégorie" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Toutes</SelectItem>
								<SelectItem value="courses">Courses</SelectItem>
								<SelectItem value="factures">Factures</SelectItem>
								<SelectItem value="sorties">Sorties</SelectItem>
								<SelectItem value="transport">Transport</SelectItem>
								<SelectItem value="revenus">Revenus</SelectItem>
							</SelectContent>
						</Select>
						<Select defaultValue="all">
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Compte" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tous les comptes</SelectItem>
								<SelectItem value="principal">Compte principal</SelectItem>
								<SelectItem value="joint">Compte joint</SelectItem>
							</SelectContent>
						</Select>
						<Button variant="outline" className="gap-2">
							<Calendar className="h-4 w-4" />
							Janvier 2025
						</Button>
						<Button variant="outline" size="icon">
							<Filter className="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Transactions List */}
			<Card className="border-border/60">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg font-medium">Toutes les transactions</CardTitle>
						<p className="text-sm text-muted-foreground">{transactions.length} opérations</p>
					</div>
				</CardHeader>
				<CardContent className="space-y-1">
					{transactions.map((tx) => (
						<div
							key={tx.id}
							className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-muted/30"
						>
							<div className="flex items-center gap-4">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-lg ${
										tx.amount > 0 ? 'bg-[oklch(0.55_0.15_145)]/10' : 'bg-muted/50'
									}`}
								>
									{tx.amount > 0 ? (
										<ArrowDownLeft className="h-5 w-5 text-[oklch(0.55_0.15_145)]" />
									) : (
										<CreditCard className="h-5 w-5 text-muted-foreground" />
									)}
								</div>
								<div>
									<p className="font-medium">{tx.description}</p>
									<p className="text-xs text-muted-foreground">
										{tx.category} · {tx.account}
									</p>
								</div>
							</div>
							<div className="text-right">
								<p
									className={`font-medium number-display ${tx.amount > 0 ? 'value-positive' : ''}`}
								>
									{tx.amount > 0 ? '+' : ''}
									{formatCurrency(tx.amount)}
								</p>
								<p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
