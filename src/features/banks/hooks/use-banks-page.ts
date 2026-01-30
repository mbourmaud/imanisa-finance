'use client';

import { useCallback, useEffect, useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface AccountMember {
	id: string;
	name: string;
	ownerShare: number;
	color?: string | null;
}

interface Account {
	id: string;
	name: string;
	balance: number;
	type: string;
	members: AccountMember[];
}

interface Bank {
	id: string;
	name: string;
	logo: string | null;
	color: string;
	description: string | null;
	type: 'BANK' | 'INVESTMENT';
	parserKey: string;
	accountCount: number;
	totalBalance: number;
	accounts: Account[];
}

interface Member {
	id: string;
	name: string;
	color: string | null;
}

interface BanksSummary {
	totalBanksUsed: number;
	totalBanksAvailable: number;
	totalAccounts: number;
	totalBalance: number;
}

interface BanksResponse {
	banks: Bank[];
	bankAccounts: Bank[];
	investmentAccounts: Bank[];
	usedBanks: Bank[];
	summary: BanksSummary;
}

export type { Account, AccountMember, Bank, BanksResponse, BanksSummary, Member };

export function useBanksPage() {
	// Data state
	const [data, setData] = useState<BanksResponse | null>(null);
	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Add account dialog state
	const [showAddAccount, setShowAddAccount] = useState(false);
	const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

	// Track bank logos separately so we can update them after upload
	const [bankLogos, setBankLogos] = useState<Record<string, string | null>>({});

	// Handler for when a bank logo is updated
	const handleLogoChange = useCallback((bankId: string, newLogoUrl: string) => {
		setBankLogos((prev) => ({ ...prev, [bankId]: newLogoUrl }));
	}, []);

	// Refresh data function
	const refreshData = useCallback(async () => {
		const banksRes = await fetch('/api/banks');
		if (banksRes.ok) {
			setData(await banksRes.json());
		}
	}, []);

	// Fetch initial data
	useEffect(() => {
		async function fetchData() {
			try {
				const [banksRes, membersRes] = await Promise.all([
					fetch('/api/banks'),
					fetch('/api/members'),
				]);

				if (!banksRes.ok) throw new Error('Failed to fetch banks');
				if (!membersRes.ok) throw new Error('Failed to fetch members');

				const banksData = await banksRes.json();
				const membersData = await membersRes.json();

				setData(banksData);
				setMembers(membersData.members || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	// Open add account dialog for a specific bank
	const handleAddAccountClick = useCallback((bank: Bank) => {
		setSelectedBank(bank);
		setShowAddAccount(true);
	}, []);

	// Get bank logo (with local override)
	const getBankLogo = useCallback(
		(bankId: string, originalLogo: string | null) => {
			return bankLogos[bankId] ?? originalLogo;
		},
		[bankLogos],
	);

	return {
		// Data
		data,
		members,
		loading,
		error,

		// Bank logos
		bankLogos,
		getBankLogo,
		handleLogoChange,

		// Add account dialog
		showAddAccount,
		setShowAddAccount,
		selectedBank,

		// Actions
		handleAddAccountClick,
		refreshData,
	};
}
