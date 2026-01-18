'use client';

/**
 * Accounts Page
 *
 * Lists all accounts grouped by type with stats.
 * Uses TanStack Query for data fetching.
 */

import { useMemo } from 'react';
import {
	AccountListItem,
	AccountTypeHeader,
	AddAccountButton,
	CreditCard,
	EmptyState,
	Flex,
	GlassCard,
	LoadingSpinner,
	PageHeader,
	PiggyBank,
	StatCard,
	StatCardGrid,
	TrendingUp,
	Wallet,
} from '@/components';
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
				iconElement={<LoadingSpinner size="md" />}
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
		<Flex direction="col" gap="xl">
			{/* Header */}
			<PageHeader
				title="Comptes"
				description="Gérez vos comptes bancaires et suivez vos soldes"
				actions={<AddAccountButton />}
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
			<Flex direction="col" gap="lg">
				{accountGroups.map((group) => (
					<GlassCard key={group.type} padding="lg">
						{/* Group Header */}
						<AccountTypeHeader
							icon={group.icon}
							title={group.label}
							count={group.accounts.length}
						/>

						{/* Account List */}
						<Flex direction="col" gap="sm">
							{group.accounts.map((account) => (
								<AccountListItem
									key={account.id}
									id={account.id}
									name={account.name}
									bankName={account.bank?.name}
									bankColor={account.bank?.color}
									balance={account.balance}
									currency={account.currency}
								/>
							))}
						</Flex>
					</GlassCard>
				))}

				{/* Empty state */}
				{accountGroups.length === 0 && (
					<EmptyState
						icon={Wallet}
						title="Aucun compte"
						description="Ajoutez votre premier compte pour commencer à suivre vos finances"
						size="lg"
						action={<AddAccountButton />}
					/>
				)}
			</Flex>
		</Flex>
	);
}
