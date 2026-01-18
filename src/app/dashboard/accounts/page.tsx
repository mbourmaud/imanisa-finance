'use client';

/**
 * Accounts Page
 *
 * Lists all accounts grouped by type with stats.
 * Uses TanStack Query for data fetching.
 */

import Link from 'next/link';
import { useMemo } from 'react';
import {
	Building,
	Button,
	ChevronRight,
	CreditCard,
	EmptyState,
	GlassCard,
	Loader2,
	PageHeader,
	PiggyBank,
	Plus,
	StatCard,
	StatCardGrid,
	TrendingUp,
	Wallet,
} from '@/components';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { useAccountsQuery } from '@/features/accounts';
import { formatMoneyCompact } from '@/shared/utils';

// Account type returned by API
interface ApiAccount {
	id: string;
	name: string;
	type: string;
	bankId: string;
	balance: number;
	currency: string;
	bank?: {
		id: string;
		name: string;
		color: string;
	};
	accountMembers?: Array<{
		ownerShare: number;
	}>;
}

const accountTypeConfig: Record<string, { label: string; icon: typeof Wallet }> = {
	CHECKING: { label: 'Comptes courants', icon: Wallet },
	SAVINGS: { label: 'Épargne', icon: PiggyBank },
	INVESTMENT: { label: 'Investissements', icon: TrendingUp },
	LOAN: { label: 'Crédits', icon: CreditCard },
	// Legacy lowercase types
	checking: { label: 'Comptes courants', icon: Wallet },
	savings: { label: 'Épargne', icon: PiggyBank },
	investment: { label: 'Investissements', icon: TrendingUp },
	credit: { label: 'Crédits', icon: CreditCard },
};

function getOwnerShare(account: ApiAccount): number {
	// Use first member's share or default to 100
	return account.accountMembers?.[0]?.ownerShare ?? 100;
}

export default function AccountsPage() {
	// Use TanStack Query for data fetching
	const {
		data: accounts = [],
		isLoading,
		isError,
	} = useAccountsQuery() as {
		data: ApiAccount[] | undefined;
		isLoading: boolean;
		isError: boolean;
	};

	// Group accounts by type
	const accountsByType = useMemo(() => {
		return accounts.reduce(
			(acc, account) => {
				const type = account.type;
				if (!acc[type]) {
					acc[type] = [];
				}
				acc[type].push(account);
				return acc;
			},
			{} as Record<string, ApiAccount[]>,
		);
	}, [accounts]);

	// Calculate total balance
	const totalBalance = useMemo(() => {
		return accounts.reduce((sum, acc) => sum + acc.balance * (getOwnerShare(acc) / 100), 0);
	}, [accounts]);

	// Group accounts by type for display
	const accountGroups = useMemo(() => {
		return Object.entries(accountsByType)
			.filter(([_, accs]) => accs.length > 0)
			.map(([type, accs]) => ({
				type,
				...(accountTypeConfig[type] || { label: type, icon: Wallet }),
				accounts: accs,
				total: accs.reduce((sum, acc) => sum + acc.balance * (getOwnerShare(acc) / 100), 0),
			}));
	}, [accountsByType]);

	// Calculate totals by type for stat cards
	const checkingTotal = useMemo(() => {
		const checkingAccounts = accountsByType.CHECKING || accountsByType.checking || [];
		return checkingAccounts.reduce((s, a) => s + a.balance * (getOwnerShare(a) / 100), 0);
	}, [accountsByType]);

	const savingsTotal = useMemo(() => {
		const savingsAccounts = accountsByType.SAVINGS || accountsByType.savings || [];
		return savingsAccounts.reduce((s, a) => s + a.balance * (getOwnerShare(a) / 100), 0);
	}, [accountsByType]);

	const investmentTotal = useMemo(() => {
		const investmentAccounts = accountsByType.INVESTMENT || accountsByType.investment || [];
		return investmentAccounts.reduce((s, a) => s + a.balance * (getOwnerShare(a) / 100), 0);
	}, [accountsByType]);

	if (isLoading) {
		return (
			<EmptyState
				title="Chargement des comptes..."
				iconElement={
					<div className="relative">
						<div
							className="h-12 w-12 rounded-full"
							style={{
								background:
									'linear-gradient(to bottom right, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))',
								animation: 'pulse 2s ease-in-out infinite',
							}}
						/>
						<Loader2
							style={{
								height: '1.5rem',
								width: '1.5rem',
								animation: 'spin 1s linear infinite',
								color: 'hsl(var(--primary))',
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
							}}
						/>
					</div>
				}
				size="md"
			/>
		);
	}

	if (isError) {
		return (
			<EmptyState
				icon={Wallet}
				title="Erreur de chargement"
				description="Impossible de charger vos comptes. Veuillez réessayer."
				size="md"
			/>
		);
	}

	return (
		<div className="flex flex-col gap-8">
			{/* Header */}
			<PageHeader
				title="Comptes"
				description="Gérez vos comptes bancaires et suivez vos soldes"
				actions={
					<Button style={{ gap: '0.5rem' }}>
						<Plus style={{ height: '1rem', width: '1rem' }} />
						Ajouter un compte
					</Button>
				}
			/>

			{/* Stats Overview */}
			<StatCardGrid columns={4}>
				<StatCard
					label="Solde total"
					value={formatMoneyCompact(totalBalance)}
					icon={Wallet}
					variant="default"
				/>

				<StatCard
					label="Comptes courants"
					value={formatMoneyCompact(checkingTotal)}
					icon={CreditCard}
					variant="default"
				/>

				<StatCard
					label="Épargne"
					value={formatMoneyCompact(savingsTotal)}
					icon={PiggyBank}
					variant="teal"
				/>

				<StatCard
					label="Investissements"
					value={formatMoneyCompact(investmentTotal)}
					icon={TrendingUp}
					variant="mint"
				/>
			</StatCardGrid>

			{/* Accounts by Type */}
			<div className="flex flex-col gap-6">
				{accountGroups.map((group) => {
					const Icon = group.icon;
					return (
						<GlassCard key={group.type} padding="lg">
							{/* Group Header */}
							<div className="flex items-center gap-3 mb-4">
								<div
									className="flex items-center justify-center h-10 w-10 rounded-xl"
									style={{
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<Icon style={{ height: '1.25rem', width: '1.25rem' }} />
								</div>
								<div className="flex flex-col">
									<h3 className="text-lg font-semibold tracking-tight">{group.label}</h3>
									<p className="text-sm text-muted-foreground">
										{group.accounts.length} compte{group.accounts.length > 1 ? 's' : ''}
									</p>
								</div>
							</div>

							{/* Account List */}
							<div className="flex flex-col gap-3">
								{group.accounts.map((account) => (
									<Link
										key={account.id}
										href={`/dashboard/accounts/${account.id}`}
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											borderRadius: '0.75rem',
											padding: '1rem',
											border: '1px solid hsl(var(--border) / 0.2)',
											backgroundColor: 'hsl(var(--background) / 0.5)',
											transition: 'all 0.2s',
										}}
									>
										<div className="flex items-center gap-4">
											<div
												className="flex items-center justify-center h-10 w-10 rounded-lg"
												style={{
													backgroundColor: account.bank?.color
														? `${account.bank.color}20`
														: undefined,
												}}
											>
												<Building
													style={{
														height: '1.25rem',
														width: '1.25rem',
														color: account.bank?.color || undefined,
													}}
												/>
											</div>
											<div className="flex flex-col">
												<p className="font-medium">{account.name}</p>
												<p className="text-xs text-muted-foreground">
													{account.bank?.name || 'Banque'}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<MoneyDisplay
												amount={account.balance}
												format="compact"
												size="md"
												weight="semibold"
											/>
											<ChevronRight
												style={{
													height: '1rem',
													width: '1rem',
													color: 'hsl(var(--muted-foreground) / 0.5)',
													transition: 'color 0.2s',
												}}
											/>
										</div>
									</Link>
								))}
							</div>
						</GlassCard>
					);
				})}

				{/* Empty state */}
				{accountGroups.length === 0 && (
					<EmptyState
						icon={Wallet}
						title="Aucun compte"
						description="Ajoutez votre premier compte pour commencer à suivre vos finances"
						size="lg"
						action={
							<Button style={{ gap: '0.5rem' }}>
								<Plus style={{ height: '1rem', width: '1rem' }} />
								Ajouter un compte
							</Button>
						}
					/>
				)}
			</div>
		</div>
	);
}
