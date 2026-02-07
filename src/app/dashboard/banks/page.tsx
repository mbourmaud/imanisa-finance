'use client'

import {
	AddAccountSheet,
	BankSection,
	BanksStatsSection,
	EmptyState,
	Landmark,
} from '@/components'
import { useBanksPage } from '@/features/banks'
import { usePageHeader } from '@/shared/hooks'

export default function BanksPage() {
	const page = useBanksPage()

	usePageHeader('Banques')

	if (page.isError) {
		return (
			<EmptyState
				icon={Landmark}
				title="Erreur de chargement"
				description="Impossible de charger vos banques. Veuillez réessayer."
			/>
		)
	}

	return (
		<>
			<BanksStatsSection
				summary={page.data?.summary}
				isLoading={page.isLoading}
			/>

			<BankSection
				title="Comptes bancaires"
				banks={page.data?.bankAccounts}
				isLoading={page.isLoading}
				skeletonCount={3}
				onAddAccountClick={page.handleAddAccountClick}
			/>

			<BankSection
				title="Investissements"
				banks={page.data?.investmentAccounts}
				isLoading={page.isLoading}
				skeletonCount={2}
				onAddAccountClick={page.handleAddAccountClick}
			/>

			<AddAccountSheet
				open={page.showAddAccount}
				onOpenChange={page.setShowAddAccount}
				bankId={page.selectedBank?.id || ''}
				bankName={page.selectedBank?.name || ''}
				members={page.members}
				onSuccess={page.handleAccountCreated}
			/>
		</>
	)
}
