'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Building, ChevronRight, CreditCard, MoreHorizontal, PiggyBank, Plus, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAccounts, useAccountActions } from '@/features/accounts';
import { formatMoney, formatMoneyCompact } from '@/shared/utils';
import type { AccountType } from '@/features/accounts/types';

const accountTypeConfig: Record<AccountType, { label: string; icon: typeof Wallet }> = {
	checking: { label: 'Comptes courants', icon: Wallet },
	savings: { label: 'Épargne', icon: PiggyBank },
	investment: { label: 'Investissements', icon: TrendingUp },
	credit: { label: 'Crédits', icon: CreditCard },
};

export default function AccountsPage() {
	const { accounts, accountsByType, totalBalance, isLoading, refetch } = useAccounts();
	const { deleteAccount, openEditModal } = useAccountActions();

	// Group accounts by type for display
	const accountGroups = Object.entries(accountsByType)
		.filter(([_, accs]) => accs.length > 0)
		.map(([type, accs]) => ({
			type: type as AccountType,
			...accountTypeConfig[type as AccountType],
			accounts: accs,
			total: accs.reduce((sum, acc) => sum + acc.balance * (acc.ownerShare / 100), 0),
		}));

	// Calculate totals by type for stat cards
	const checkingTotal = accountsByType.checking?.reduce((s, a) => s + a.balance * (a.ownerShare / 100), 0) ?? 0;
	const savingsTotal = accountsByType.savings?.reduce((s, a) => s + a.balance * (a.ownerShare / 100), 0) ?? 0;
	const investmentTotal = accountsByType.investment?.reduce((s, a) => s + a.balance * (a.ownerShare / 100), 0) ?? 0;

	if (isLoading && accounts.length === 0) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-muted-foreground">Chargement...</div>
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
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
												<Building className="h-5 w-5 text-muted-foreground" />
											</div>
											<div>
												<p className="font-medium">{account.name}</p>
												<p className="text-xs text-muted-foreground">{account.bankName}</p>
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
			</div>
		</div>
	);
}
