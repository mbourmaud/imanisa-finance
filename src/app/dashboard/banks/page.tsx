'use client';

import {
	AddAccountDialog,
	BankAccountsSection,
	BanksStatsSection,
	InvestmentAccountsSection,
	NarrowPageContainer,
	PageHeader,
} from '@/components';
import { useBanksPage } from '@/features/banks';

export default function BanksPage() {
	const page = useBanksPage();

	return (
		<NarrowPageContainer>
			<PageHeader title="Banques" description="Gérez vos établissements et importez vos données" />

			<BanksStatsSection summary={page.data?.summary} loading={page.loading} error={page.error} />

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

			<AddAccountDialog
				open={page.showAddAccount}
				onOpenChange={page.setShowAddAccount}
				bankId={page.selectedBank?.id || ''}
				bankName={page.selectedBank?.name || ''}
				members={page.members}
				onSuccess={page.refreshData}
			/>
		</NarrowPageContainer>
	);
}
