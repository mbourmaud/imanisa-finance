'use client';

/**
 * Accounts Page
 *
 * Lists all accounts grouped by type with stats.
 * Uses TanStack Query for data fetching.
 */

import { useMemo } from 'react';
import Link from 'next/link';
import {
	Building,
	ChevronRight,
	CreditCard,
	Loader2,
	PiggyBank,
	Plus,
	TrendingUp,
	Wallet,
} from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAccountsQuery } from '@/features/accounts';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard, StatCardGrid } from '@/components/ui/stat-card';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { EmptyState } from '@/components/ui/empty-state';
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
	const { data: accounts = [], isLoading, isError } = useAccountsQuery() as {
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
			{} as Record<string, ApiAccount[]>
		);
	}, [accounts]);

	// Calculate total balance
	const totalBalance = useMemo(() => {
		return accounts.reduce(
			(sum, acc) => sum + acc.balance * (getOwnerShare(acc) / 100),
			0
		);
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
						<div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
						<Loader2 className="h-6 w-6 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
		<div className="space-y-8">
			{/* Header */}
			<PageHeader
				title="Comptes"
				description="Gérez vos comptes bancaires et suivez vos soldes"
				actions={
					<Button className="gap-2">
						<Plus className="h-4 w-4" />
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
			<div className="space-y-6">
				{accountGroups.map((group) => {
					const Icon = group.icon;
					return (
						<div key={group.type} className="glass-card p-5 sm:p-6">
							{/* Group Header */}
							<div className="flex items-center gap-3 mb-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<Icon className="h-5 w-5" />
								</div>
								<div>
									<h3 className="text-lg font-semibold">{group.label}</h3>
									<p className="text-sm text-muted-foreground">
										{group.accounts.length} compte{group.accounts.length > 1 ? 's' : ''}
									</p>
								</div>
							</div>

							{/* Account List */}
							<div className="space-y-2">
								{group.accounts.map((account) => (
									<Link
										key={account.id}
										href={`/dashboard/accounts/${account.id}`}
										className="flex items-center justify-between rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 p-4 transition-all group border border-white/20"
									>
										<div className="flex items-center gap-4">
											<div
												className="flex h-10 w-10 items-center justify-center rounded-lg"
												style={{
													backgroundColor: account.bank?.color ? `${account.bank.color}20` : undefined,
												}}
											>
												<Building
													className="h-5 w-5"
													style={{ color: account.bank?.color || undefined }}
												/>
											</div>
											<div>
												<p className="font-medium">{account.name}</p>
												<p className="text-xs text-muted-foreground">{account.bank?.name || 'Banque'}</p>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<MoneyDisplay amount={account.balance} format="compact" size="md" weight="semibold" />
											<ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
										</div>
									</Link>
								))}
							</div>
						</div>
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
							<Button className="gap-2">
								<Plus className="h-4 w-4" />
								Ajouter un compte
							</Button>
						}
					/>
				)}
			</div>
		</div>
	);
}
