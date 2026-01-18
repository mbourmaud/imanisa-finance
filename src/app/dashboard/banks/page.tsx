'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
	AccountRowLink,
	AddAccountDialog,
	AddBankDropdown,
	BankRow,
	BankRowSkeleton,
	CreditCard,
	Flex,
	IconBox,
	Landmark,
	PageHeader,
	SectionHeader,
	StatCard,
	StatCardGrid,
	StatCardSkeleton,
	TrendingUp,
	Wallet,
} from '@/components'
import { AccountTypeBadge } from '@/components/accounts/AccountCard'
import { MemberAvatarGroup } from '@/components/members/MemberAvatar'
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

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function BanksPage() {
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
	const handleLogoChange = (bankId: string, newLogoUrl: string) => {
		setBankLogos((prev) => ({ ...prev, [bankId]: newLogoUrl }))
	}

	// Refresh data function
	const refreshData = async () => {
		const banksRes = await fetch('/api/banks')
		if (banksRes.ok) {
			setData(await banksRes.json())
		}
	}

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
	const handleAddAccountClick = (bank: Bank) => {
		setSelectedBank(bank)
		setNewAccountName('')
		setNewAccountDescription('')
		setNewAccountExportUrl('')
		setNewAccountType('CHECKING')
		setNewAccountMembers([])
		createAccountMutation.reset()
		setShowAddAccount(true)
	}

	// Create new account using mutation
	const handleCreateAccount = async () => {
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
	}

	// Toggle member selection
	const toggleMember = (memberId: string) => {
		setNewAccountMembers((prev) =>
			prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
		)
	}

	// Render accounts list for a bank
	const renderAccountsList = (accounts: Account[]) => {
		if (accounts.length === 0) return null

		return accounts.map((account) => {
			const memberData = account.members.map((m) => ({
				id: m.id,
				name: m.name,
				color: m.color || undefined,
			}))

			return (
				<AccountRowLink
					key={account.id}
					accountId={account.id}
					name={account.name}
					badge={
						<AccountTypeBadge
							type={account.type as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN'}
							variant="subtle"
							className="text-[10px]"
						/>
					}
					memberAvatars={
						account.members.length > 0 ? (
							<MemberAvatarGroup members={memberData} size="xs" max={4} spacing="normal" />
						) : undefined
					}
					balance={account.balance}
				/>
			)
		})
	}

	return (
		<div className="max-w-4xl">
			{/* Header */}
			<PageHeader
				title="Banques"
				description="Gérez vos établissements et importez vos données"
				size="sm"
			/>

			{/* Stats Cards */}
			{loading ? (
				<StatCardGrid columns={3}>
					<StatCardSkeleton variant="gold" />
					<StatCardSkeleton variant="teal" />
					<StatCardSkeleton variant="mint" />
				</StatCardGrid>
			) : error ? (
				<Flex direction="col" gap="lg" className="py-6">
					<span className="text-destructive">{error}</span>
				</Flex>
			) : (
				<StatCardGrid columns={3}>
					<StatCard
						variant="gold"
						icon={Landmark}
						label="Banques"
						value={data?.summary.totalBanksUsed ?? 0}
						description={`/ ${data?.summary.totalBanksAvailable ?? 0}`}
					/>
					<StatCard
						variant="teal"
						icon={CreditCard}
						label="Comptes actifs"
						value={data?.summary.totalAccounts ?? 0}
					/>
					<StatCard
						variant="mint"
						icon={Wallet}
						label="Solde total"
						value={new Intl.NumberFormat('fr-FR', {
							style: 'currency',
							currency: 'EUR',
						}).format(data?.summary.totalBalance ?? 0)}
					/>
				</StatCardGrid>
			)}

			{/* Bank accounts section */}
			<Flex direction="col" gap="sm" className="mt-8">
				<SectionHeader
					title="Comptes bancaires"
					size="sm"
					icon={<IconBox icon={Landmark} size="sm" variant="primary" rounded="md" />}
					showLine
					action={
						data?.bankAccounts && (
							<AddBankDropdown banks={data.bankAccounts} onSelectBank={handleAddAccountClick} />
						)
					}
				/>

				{loading ? (
					<Flex direction="col" gap="sm">
						<BankRowSkeleton />
						<BankRowSkeleton />
						<BankRowSkeleton />
					</Flex>
				) : (
					<Flex direction="col" gap="sm">
						{data?.bankAccounts.map((bank, index) => (
							<BankRow
								key={bank.id}
								bankId={bank.id}
								bankName={bank.name}
								bankColor={bank.color}
								logo={bankLogos[bank.id] ?? bank.logo}
								description={bank.description}
								accountCount={bank.accountCount}
								totalBalance={bank.totalBalance}
								onAddAccount={() => handleAddAccountClick(bank)}
								onLogoChange={(url) => handleLogoChange(bank.id, url)}
								accountsList={renderAccountsList(bank.accounts)}
								animationDelay={index * 50}
							/>
						))}
					</Flex>
				)}
			</Flex>

			{/* Investments section */}
			<Flex direction="col" gap="sm" className="mt-8">
				<SectionHeader
					title="Investissements"
					size="sm"
					icon={
						<IconBox
							icon={TrendingUp}
							size="sm"
							variant="custom"
							bgColor="hsl(270 60% 95%)"
							iconColor="hsl(270 60% 50%)"
							rounded="md"
						/>
					}
					showLine
					action={
						data?.investmentAccounts && (
							<AddBankDropdown
								banks={data.investmentAccounts}
								onSelectBank={handleAddAccountClick}
							/>
						)
					}
				/>

				{loading ? (
					<Flex direction="col" gap="sm">
						<BankRowSkeleton />
						<BankRowSkeleton />
					</Flex>
				) : (
					<Flex direction="col" gap="sm">
						{data?.investmentAccounts.map((bank, index) => (
							<BankRow
								key={bank.id}
								bankId={bank.id}
								bankName={bank.name}
								bankColor={bank.color}
								logo={bankLogos[bank.id] ?? bank.logo}
								description={bank.description}
								accountCount={bank.accountCount}
								totalBalance={bank.totalBalance}
								onAddAccount={() => handleAddAccountClick(bank)}
								onLogoChange={(url) => handleLogoChange(bank.id, url)}
								accountsList={renderAccountsList(bank.accounts)}
								animationDelay={index * 50}
							/>
						))}
					</Flex>
				)}
			</Flex>

			{/* Add Account Dialog */}
			<AddAccountDialog
				open={showAddAccount}
				onOpenChange={setShowAddAccount}
				bankName={selectedBank?.name || ''}
				error={createAccountMutation.error?.message}
				isPending={createAccountMutation.isPending}
				name={newAccountName}
				onNameChange={setNewAccountName}
				description={newAccountDescription}
				onDescriptionChange={setNewAccountDescription}
				exportUrl={newAccountExportUrl}
				onExportUrlChange={setNewAccountExportUrl}
				accountType={newAccountType}
				onAccountTypeChange={setNewAccountType}
				members={members}
				selectedMemberIds={newAccountMembers}
				onMemberToggle={toggleMember}
				onSubmit={handleCreateAccount}
			/>
		</div>
	)
}
