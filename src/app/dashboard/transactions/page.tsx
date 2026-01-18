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
	Box,
	Button,
	Calendar,
	CreditCard,
	Download,
	Filter,
	GlassCard,
	Heading,
	HStack,
	Input,
	PageHeader,
	Search,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StatCard,
	StatCardGrid,
	Text,
	VStack,
} from '@/components';
import { MoneyDifference } from '@/components/common/MoneyDisplay';
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
		<VStack gap="xl">
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
				<Box display="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
					<HStack gap="md" style={{ flexWrap: 'wrap' }}>
						<Box style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
							<Search
								style={{
									position: 'absolute',
									left: '0.75rem',
									top: '50%',
									transform: 'translateY(-50%)',
									height: '1rem',
									width: '1rem',
									color: 'hsl(var(--muted-foreground))',
								}}
							/>
							<Input
								placeholder="Rechercher une transaction..."
								style={{
									paddingLeft: '2.5rem',
									height: '2.75rem',
									borderRadius: '0.75rem',
								}}
							/>
						</Box>
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
					</HStack>
				</Box>
			</GlassCard>

			{/* Transactions List */}
			<GlassCard style={{ padding: 0 }}>
				{/* Header */}
				<HStack
					justify="between"
					align="center"
					p="md"
					style={{ borderBottom: '1px solid hsl(var(--border))' }}
				>
					<Heading level={3} size="md">
						Toutes les transactions
					</Heading>
					<Text size="sm" color="muted">
						{transactions.length} opérations
					</Text>
				</HStack>

				{/* List */}
				<VStack gap="xs" p="md">
					{transactions.map((tx) => (
						<HStack
							key={tx.id}
							justify="between"
							align="center"
							p="md"
							style={{
								borderRadius: '0.75rem',
								transition: 'background-color 0.2s',
							}}
						>
							<HStack gap="md" align="center">
								<Box
									display="flex"
									style={{
										borderRadius: '0.75rem',
										height: '2.5rem',
										width: '2.5rem',
										alignItems: 'center',
										justifyContent: 'center',
										backgroundColor:
											tx.amount > 0 ? 'oklch(0.55 0.15 145 / 0.1)' : 'hsl(var(--muted) / 0.3)',
									}}
								>
									{tx.amount > 0 ? (
										<ArrowDownLeft
											style={{ height: '1.25rem', width: '1.25rem', color: 'oklch(0.55 0.15 145)' }}
										/>
									) : (
										<CreditCard
											style={{
												height: '1.25rem',
												width: '1.25rem',
												color: 'hsl(var(--muted-foreground))',
											}}
										/>
									)}
								</Box>
								<VStack gap="none">
									<Text weight="medium">{tx.description}</Text>
									<Text size="xs" color="muted">
										{tx.category} · {tx.account}
									</Text>
								</VStack>
							</HStack>
							<VStack gap="none" align="end">
								<MoneyDifference amount={tx.amount} size="md" />
								<Text size="xs" color="muted" style={{ marginTop: '0.125rem' }}>
									{formatDate(tx.date)}
								</Text>
							</VStack>
						</HStack>
					))}
				</VStack>
			</GlassCard>
		</VStack>
	);
}
