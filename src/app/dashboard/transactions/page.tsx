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
	Button,
	Calendar,
	CreditCard,
	Download,
	Filter,
	Flex,
	GlassCard,
	ListHeader,
	PageHeader,
	SearchInput,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StatCard,
	StatCardGrid,
	TransactionListItem,
} from '@/components';
import { formatDate as formatDateUtil, formatMoney } from '@/shared/utils';

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
		<Flex direction="col" gap="xl">
			{/* Header */}
			<PageHeader
				title="Transactions"
				description="Historique de toutes vos transactions"
				actions={
					<Button
						variant="outline"
						iconLeft={<Download style={{ height: '1rem', width: '1rem' }} />}
					>
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
			<GlassCard padding="md">
				<Flex direction="col" gap="md">
					<Flex direction="row" gap="md" wrap="wrap">
						<SearchInput
							placeholder="Rechercher une transaction..."
							size="md"
							minWidth="200px"
						/>
						<Select defaultValue="all">
							<SelectTrigger style={{ width: '180px', height: '2.75rem', borderRadius: '0.75rem' }}>
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
							<SelectTrigger style={{ width: '180px', height: '2.75rem', borderRadius: '0.75rem' }}>
								<SelectValue placeholder="Compte" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tous les comptes</SelectItem>
								<SelectItem value="principal">Compte principal</SelectItem>
								<SelectItem value="joint">Compte joint</SelectItem>
							</SelectContent>
						</Select>
						<Button
							variant="outline"
							iconLeft={<Calendar style={{ height: '1rem', width: '1rem' }} />}
							style={{ height: '2.75rem', borderRadius: '0.75rem' }}
						>
							Janvier 2025
						</Button>
						<Button
							variant="outline"
							size="icon"
							style={{ height: '2.75rem', width: '2.75rem', borderRadius: '0.75rem' }}
						>
							<Filter style={{ height: '1rem', width: '1rem' }} />
						</Button>
					</Flex>
				</Flex>
			</GlassCard>

			{/* Transactions List */}
			<GlassCard style={{ padding: 0 }}>
				{/* Header */}
				<ListHeader
					title="Toutes les transactions"
					subtitle={`${transactions.length} opérations`}
				/>

				{/* List */}
				<Flex direction="col" gap="xs" style={{ padding: '1rem' }}>
					{transactions.map((tx) => (
						<TransactionListItem
							key={tx.id}
							description={tx.description}
							amount={tx.amount}
							category={tx.category}
							account={tx.account}
							dateLabel={formatDate(tx.date)}
						/>
					))}
				</Flex>
			</GlassCard>
		</Flex>
	);
}
