'use client'

import { useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CreditCard, PiggyBank, TrendingUp, Wallet } from 'lucide-react'
import { useAccountsQuery } from '@/features/accounts'
import { useSelectedMemberId } from '@/shared/hooks'
import { formatMoneyCompact } from '@/shared/utils'

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

interface AccountGroup {
	type: string;
	label: string;
	icon: LucideIcon;
	accounts: ApiAccount[];
	total: number;
}

const accountTypeConfig: Record<string, { label: string; icon: LucideIcon }> = {
	CHECKING: { label: 'Comptes courants', icon: Wallet },
	SAVINGS: { label: 'Épargne', icon: PiggyBank },
	INVESTMENT: { label: 'Investissements', icon: TrendingUp },
	LOAN: { label: 'Crédits', icon: CreditCard },
};

function getOwnerShare(account: ApiAccount): number {
	return account.accountMembers?.reduce((sum, m) => sum + (m.ownerShare ?? 0), 0) ?? 100;
}

export function useAccountsPage() {
	const memberId = useSelectedMemberId()
	const {
		data: accounts = [],
		isLoading,
		isError,
	} = useAccountsQuery(memberId ? { memberId } : undefined) as {
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
	const accountGroups = useMemo((): AccountGroup[] => {
		return Object.entries(accountsByType)
			.filter(([, accs]) => accs.length > 0)
			.map(([type, accs]) => ({
				type,
				...(accountTypeConfig[type] || { label: type, icon: Wallet }),
				accounts: accs,
				total: accs.reduce((sum, acc) => sum + acc.balance * (getOwnerShare(acc) / 100), 0),
			}));
	}, [accountsByType]);

	// Calculate totals by type for stat cards
	const checkingTotal = useMemo(() => {
		const checkingAccounts = accountsByType.CHECKING || [];
		return checkingAccounts.reduce((s, a) => s + a.balance * (getOwnerShare(a) / 100), 0);
	}, [accountsByType]);

	const savingsTotal = useMemo(() => {
		const savingsAccounts = accountsByType.SAVINGS || [];
		return savingsAccounts.reduce((s, a) => s + a.balance * (getOwnerShare(a) / 100), 0);
	}, [accountsByType]);

	const investmentTotal = useMemo(() => {
		const investmentAccounts = accountsByType.INVESTMENT || [];
		return investmentAccounts.reduce((s, a) => s + a.balance * (getOwnerShare(a) / 100), 0);
	}, [accountsByType]);

	// Formatted values for display
	const formattedTotalBalance = formatMoneyCompact(totalBalance);
	const formattedCheckingTotal = formatMoneyCompact(checkingTotal);
	const formattedSavingsTotal = formatMoneyCompact(savingsTotal);
	const formattedInvestmentTotal = formatMoneyCompact(investmentTotal);

	return {
		// State
		isLoading,
		isError,

		// Data
		accountGroups,
		hasAccounts: accountGroups.length > 0,

		// Formatted stats
		formattedTotalBalance,
		formattedCheckingTotal,
		formattedSavingsTotal,
		formattedInvestmentTotal,
	};
}

export type { ApiAccount, AccountGroup };
