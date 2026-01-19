'use client'

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
} from '@/components'
import { useAccountsPage } from '@/features/accounts'

export default function AccountsPage() {
	const page = useAccountsPage()

	if (page.isLoading) {
		return (
			<EmptyState
				title="Chargement des comptes..."
				iconElement={<LoadingSpinner size="md" />}
				size="md"
			/>
		)
	}

	if (page.isError) {
		return (
			<EmptyState
				icon={Wallet}
				title="Erreur de chargement"
				description="Impossible de charger vos comptes. Veuillez réessayer."
				size="md"
			/>
		)
	}

	return (
		<Flex direction="col" gap="xl">
			<PageHeader
				title="Comptes"
				description="Gérez vos comptes bancaires et suivez vos soldes"
				actions={<AddAccountButton />}
			/>

			<StatCardGrid columns={4}>
				<StatCard
					label="Solde total"
					value={page.formattedTotalBalance}
					icon={Wallet}
					variant="default"
				/>
				<StatCard
					label="Comptes courants"
					value={page.formattedCheckingTotal}
					icon={CreditCard}
					variant="default"
				/>
				<StatCard
					label="Épargne"
					value={page.formattedSavingsTotal}
					icon={PiggyBank}
					variant="teal"
				/>
				<StatCard
					label="Investissements"
					value={page.formattedInvestmentTotal}
					icon={TrendingUp}
					variant="mint"
				/>
			</StatCardGrid>

			<Flex direction="col" gap="lg">
				{page.accountGroups.map((group) => (
					<GlassCard key={group.type} padding="lg">
						<AccountTypeHeader
							icon={group.icon}
							title={group.label}
							count={group.accounts.length}
						/>
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

				{!page.hasAccounts && (
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
	)
}
