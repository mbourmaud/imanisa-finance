'use client'

import {
	AddAccountDialog,
	BankAccountsSection,
	BanksStatsSection,
	Flex,
	InvestmentAccountsSection,
	NarrowPageContainer,
	PageHeader,
} from '@/components'
import { useBanksPage } from '@/features/banks'

export default function BanksPage() {
	const page = useBanksPage()

	return (
		<NarrowPageContainer>
			<PageHeader
				title="Banques"
				description="Gérez vos établissements et importez vos données"
				size="sm"
			/>

			<BanksStatsSection
				summary={page.data?.summary}
				loading={page.loading}
				error={page.error}
			/>

			<Flex direction="col" gap="xl">
				<BankAccountsSection
					banks={page.data?.bankAccounts}
					loading={page.loading}
					onAddAccountClick={page.handleAddAccountClick}
					getBankLogo={page.getBankLogo}
					onLogoChange={page.handleLogoChange}
				/>

				<InvestmentAccountsSection
					banks={page.data?.investmentAccounts}
					loading={page.loading}
					onAddAccountClick={page.handleAddAccountClick}
					getBankLogo={page.getBankLogo}
					onLogoChange={page.handleLogoChange}
				/>
			</Flex>

			<AddAccountDialog
				open={page.showAddAccount}
				onOpenChange={page.setShowAddAccount}
				bankName={page.selectedBank?.name || ''}
				error={page.createAccountError}
				isPending={page.createAccountPending}
				name={page.newAccountName}
				onNameChange={page.setNewAccountName}
				description={page.newAccountDescription}
				onDescriptionChange={page.setNewAccountDescription}
				exportUrl={page.newAccountExportUrl}
				onExportUrlChange={page.setNewAccountExportUrl}
				accountType={page.newAccountType}
				onAccountTypeChange={page.setNewAccountType}
				members={page.members}
				selectedMemberIds={page.newAccountMembers}
				onMemberToggle={page.toggleMember}
				onSubmit={page.handleCreateAccount}
			/>
		</NarrowPageContainer>
	)
}
