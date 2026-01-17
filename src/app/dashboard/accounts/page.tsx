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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
			<div className="flex items-center justify-center h-64">
				<div className="flex flex-col items-center gap-4">
					<div className="relative">
						<div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
						<Loader2 className="h-6 w-6 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
					</div>
					<p className="text-sm text-muted-foreground">Chargement des comptes...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-muted-foreground">Erreur lors du chargement des comptes</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Comptes</h1>
					<p className="mt-1 text-muted-foreground">Gérez vos comptes bancaires et suivez vos soldes</p>
				</div>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Ajouter un compte
				</Button>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4 stagger-children">
				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Solde total</p>
							<p className="stat-card-value">{formatMoneyCompact(totalBalance)}</p>
						</div>
						<div className="stat-card-icon">
							<Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Comptes courants</p>
							<p className="stat-card-value">{formatMoneyCompact(checkingTotal)}</p>
						</div>
						<div className="stat-card-icon">
							<CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Épargne</p>
							<p className="stat-card-value">{formatMoneyCompact(savingsTotal)}</p>
						</div>
						<div className="stat-card-icon">
							<PiggyBank className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Investissements</p>
							<p className="stat-card-value">{formatMoneyCompact(investmentTotal)}</p>
						</div>
						<div className="stat-card-icon">
							<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>
			</div>

			{/* Accounts by Type */}
			<div className="space-y-6">
				{accountGroups.map((group) => {
					const Icon = group.icon;
					return (
						<Card key={group.type} className="border-border/60">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
										<Icon className="h-5 w-5" />
									</div>
									<div>
										<CardTitle className="text-lg font-medium">{group.label}</CardTitle>
										<p className="text-sm text-muted-foreground">
											{group.accounts.length} compte{group.accounts.length > 1 ? 's' : ''}
										</p>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-2">
								{group.accounts.map((account) => (
									<Link
										key={account.id}
										href={`/dashboard/accounts/${account.id}`}
										className="flex items-center justify-between rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50 group"
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
											<p className="font-medium number-display">{formatMoneyCompact(account.balance)}</p>
											<ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
										</div>
									</Link>
								))}
							</CardContent>
						</Card>
					);
				})}

				{/* Empty state */}
				{accountGroups.length === 0 && (
					<div className="text-center py-16">
						<div className="h-20 w-20 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
							<Wallet className="h-10 w-10 text-muted-foreground/50" />
						</div>
						<p className="font-semibold text-foreground">Aucun compte</p>
						<p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
							Ajoutez votre premier compte pour commencer à suivre vos finances
						</p>
						<Button className="mt-6 gap-2">
							<Plus className="h-4 w-4" />
							Ajouter un compte
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
