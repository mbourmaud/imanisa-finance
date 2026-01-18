'use client';

/**
 * Transactions Page
 *
 * Shows transaction history with filtering and search.
 * Uses the new component library for consistent UI.
 */

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
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard, StatCardGrid } from '@/components/ui/stat-card';
import { MoneyDifference } from '@/components/common/MoneyDisplay';
import { formatMoney, formatDate as formatDateUtil } from '@/shared/utils';

// Mock transaction data
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
	return formatDateUtil(dateStr, 'D MMM');
}

export default function TransactionsPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<PageHeader
				title="Transactions"
				description="Historique de toutes vos transactions"
				actions={
					<Button variant="outline" className="gap-2">
						<Download className="h-4 w-4" />
						Exporter
					</Button>
				}
			/>

			{/* Stats Overview */}
			<StatCardGrid columns={3}>
				<StatCard
					label="Revenus"
					value={`+${formatMoney(income)}`}
					icon={ArrowDownLeft}
					variant="teal"
				/>

				<StatCard
					label="Dépenses"
					value={`-${formatMoney(expenses)}`}
					icon={ArrowUpRight}
					variant="coral"
				/>

				<StatCard
					label="Solde net"
					value={formatMoney(income - expenses)}
					icon={CreditCard}
					variant={income - expenses >= 0 ? 'teal' : 'coral'}
				/>
			</StatCardGrid>

			{/* Filters */}
			<div className="glass-card p-5">
				<div className="flex flex-col gap-4 sm:flex-row">
					<div className="relative flex-1 group">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
						<Input
							placeholder="Rechercher une transaction..."
							className="pl-10 h-11 rounded-xl bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:border-primary/50"
						/>
					</div>
					<Select defaultValue="all">
						<SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10">
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
						<SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10">
							<SelectValue placeholder="Compte" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tous les comptes</SelectItem>
							<SelectItem value="principal">Compte principal</SelectItem>
							<SelectItem value="joint">Compte joint</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline" className="gap-2 h-11 rounded-xl border-white/30 dark:border-white/10">
						<Calendar className="h-4 w-4" />
						Janvier 2025
					</Button>
					<Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-white/30 dark:border-white/10">
						<Filter className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Transactions List */}
			<div className="glass-card">
				{/* Header */}
				<div className="flex items-center justify-between p-5 pb-4 border-b border-white/10">
					<h3 className="text-lg font-semibold">Toutes les transactions</h3>
					<span className="text-sm text-muted-foreground">{transactions.length} opérations</span>
				</div>

				{/* List */}
				<div className="p-4 space-y-1">
					{transactions.map((tx) => (
						<div
							key={tx.id}
							className="flex items-center justify-between rounded-xl p-4 transition-all hover:bg-white/50 dark:hover:bg-white/5"
						>
							<div className="flex items-center gap-4">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-xl ${
										tx.amount > 0 ? 'bg-[oklch(0.55_0.15_145)]/10' : 'bg-muted/30'
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
								<MoneyDifference
									amount={tx.amount}
									size="md"
								/>
								<p className="text-xs text-muted-foreground mt-0.5">{formatDate(tx.date)}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
