'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useCreateAccountMutation } from '@/features/accounts'

// =============================================================================
// TYPES
// =============================================================================

interface AccountMember {
	id: string
	name: string
	ownerShare: number
	color?: string | null
}

interface Account {
	id: string
	name: string
	balance: number
	type: string
	members: AccountMember[]
}

interface Bank {
	id: string
	name: string
	logo: string | null
	color: string
	description: string | null
	type: 'BANK' | 'INVESTMENT'
	parserKey: string
	accountCount: number
	totalBalance: number
	accounts: Account[]
}

interface Member {
	id: string
	name: string
	color: string | null
}

interface BanksSummary {
	totalBanksUsed: number
	totalBanksAvailable: number
	totalAccounts: number
	totalBalance: number
}

interface BanksResponse {
	banks: Bank[]
	bankAccounts: Bank[]
	investmentAccounts: Bank[]
	usedBanks: Bank[]
	summary: BanksSummary
}

export type { Account, AccountMember, Bank, BanksResponse, BanksSummary, Member }

export function useBanksPage() {
	// Data state
	const [data, setData] = useState<BanksResponse | null>(null)
	const [members, setMembers] = useState<Member[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Add account dialog state
	const [showAddAccount, setShowAddAccount] = useState(false)
	const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
	const [newAccountName, setNewAccountName] = useState('')
	const [newAccountDescription, setNewAccountDescription] = useState('')
	const [newAccountExportUrl, setNewAccountExportUrl] = useState('')
	const [newAccountType, setNewAccountType] = useState('CHECKING')
	const [newAccountMembers, setNewAccountMembers] = useState<string[]>([])

	// Track bank logos separately so we can update them after upload
	const [bankLogos, setBankLogos] = useState<Record<string, string | null>>({})

	// Create account mutation
	const createAccountMutation = useCreateAccountMutation()

	// Handler for when a bank logo is updated
	const handleLogoChange = useCallback((bankId: string, newLogoUrl: string) => {
		setBankLogos((prev) => ({ ...prev, [bankId]: newLogoUrl }))
	}, [])

	// Refresh data function
	const refreshData = useCallback(async () => {
		const banksRes = await fetch('/api/banks')
		if (banksRes.ok) {
			setData(await banksRes.json())
		}
	}, [])

	// Fetch initial data
	useEffect(() => {
		async function fetchData() {
			try {
				const [banksRes, membersRes] = await Promise.all([
					fetch('/api/banks'),
					fetch('/api/members'),
				])

				if (!banksRes.ok) throw new Error('Failed to fetch banks')
				if (!membersRes.ok) throw new Error('Failed to fetch members')

				const banksData = await banksRes.json()
				const membersData = await membersRes.json()

				setData(banksData)
				setMembers(membersData.members || [])
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	// Open add account dialog for a specific bank
	const handleAddAccountClick = useCallback((bank: Bank) => {
		setSelectedBank(bank)
		setNewAccountName('')
		setNewAccountDescription('')
		setNewAccountExportUrl('')
		setNewAccountType('CHECKING')
		setNewAccountMembers([])
		createAccountMutation.reset()
		setShowAddAccount(true)
	}, [createAccountMutation])

	// Create new account using mutation
	const handleCreateAccount = useCallback(async () => {
		if (!selectedBank || !newAccountName.trim()) return

		try {
			await createAccountMutation.mutateAsync({
				name: newAccountName.trim(),
				description: newAccountDescription.trim() || undefined,
				exportUrl: newAccountExportUrl.trim() || undefined,
				bankId: selectedBank.id,
				type: newAccountType as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN',
				memberIds: newAccountMembers.length > 0 ? newAccountMembers : undefined,
			})

			// Refresh data to show new account
			await refreshData()
			setShowAddAccount(false)
			toast.success('Compte créé avec succès')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Erreur lors de la création du compte')
		}
	}, [
		selectedBank,
		newAccountName,
		newAccountDescription,
		newAccountExportUrl,
		newAccountType,
		newAccountMembers,
		createAccountMutation,
		refreshData,
	])

	// Toggle member selection
	const toggleMember = useCallback((memberId: string) => {
		setNewAccountMembers((prev) =>
			prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
		)
	}, [])

	// Get bank logo (with local override)
	const getBankLogo = useCallback(
		(bankId: string, originalLogo: string | null) => {
			return bankLogos[bankId] ?? originalLogo
		},
		[bankLogos]
	)

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
		newAccountName,
		setNewAccountName,
		newAccountDescription,
		setNewAccountDescription,
		newAccountExportUrl,
		setNewAccountExportUrl,
		newAccountType,
		setNewAccountType,
		newAccountMembers,
		toggleMember,

		// Actions
		handleAddAccountClick,
		handleCreateAccount,

		// Mutation state
		createAccountError: createAccountMutation.error?.message,
		createAccountPending: createAccountMutation.isPending,
	}
}
