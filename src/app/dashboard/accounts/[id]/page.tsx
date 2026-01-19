'use client'

import { useParams } from 'next/navigation'
import {
	AccountDetailHeader,
	AccountEditSheet,
	AccountLoadingState,
	AccountNotFoundState,
	AccountSettingsSheet,
	ConfirmDialog,
	Flex,
	FloatingToast,
	TransactionsSection,
} from '@/components'
import { useAccountDetailPage } from '@/features/accounts'

export default function AccountDetailPage() {
	const params = useParams()
	const accountId = params.id as string
	const page = useAccountDetailPage(accountId)

	if (page.isLoadingAccount) {
		return <AccountLoadingState />
	}

	if (page.isAccountError || !page.account) {
		return <AccountNotFoundState />
	}

	const { account } = page

	return (
		<Flex direction="col" gap="lg">
			<AccountDetailHeader
				accountName={account.name}
				accountDescription={account.description}
				accountNumber={account.accountNumber}
				accountType={account.type as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN'}
				balance={account.balance}
				currency={account.currency}
				transactionCount={account._count.transactions}
				bankName={account.bank.name}
				bankColor={account.bank.color}
				accountMembers={account.accountMembers}
				onEditClick={page.startEditingAccount}
				onSettingsClick={page.openSettings}
				onDeleteClick={page.openDeleteAccount}
			/>

			<AccountEditSheet
				open={page.isEditingAccount}
				onOpenChange={page.setIsEditingAccount}
				bankName={account.bank.name}
				bankColor={account.bank.color}
				editName={page.editName}
				onNameChange={page.setEditName}
				editDescription={page.editDescription}
				onDescriptionChange={page.setEditDescription}
				editAccountNumber={page.editAccountNumber}
				onAccountNumberChange={page.setEditAccountNumber}
				isPending={page.updateAccountPending}
				onSave={page.saveAccountDetails}
				onCancel={page.cancelEditingAccount}
			/>

			{page.error && (
				<FloatingToast
					message={page.error}
					isSuccess={page.error.includes('importées')}
					onClose={page.closeError}
				/>
			)}

			<AccountSettingsSheet
				open={page.showSettings}
				onOpenChange={page.setShowSettings}
				accountName={account.name}
				accountDescription={account.description}
				accountExportUrl={account.exportUrl}
				accountInitialBalance={account.initialBalance}
				accountInitialBalanceDate={account.initialBalanceDate}
				accountMembers={account.accountMembers}
				transactionCount={account._count.transactions}
				editName={page.editName}
				onNameChange={page.setEditName}
				onNameBlur={page.onNameBlur}
				onNameFocus={page.onNameFocus}
				editDescription={page.editDescription}
				onDescriptionChange={page.setEditDescription}
				onDescriptionBlur={page.onDescriptionBlur}
				onDescriptionFocus={page.onDescriptionFocus}
				exportUrlInput={page.exportUrlInput}
				onExportUrlChange={page.setExportUrlInput}
				onExportUrlBlur={page.onExportUrlBlur}
				onExportUrlFocus={page.onExportUrlFocus}
				editInitialBalance={page.editInitialBalance}
				onInitialBalanceChange={page.setEditInitialBalance}
				onInitialBalanceBlur={page.onInitialBalanceBlur}
				onInitialBalanceFocus={page.onInitialBalanceFocus}
				editInitialBalanceDate={page.editInitialBalanceDate}
				onInitialBalanceDateChange={page.setEditInitialBalanceDate}
				onInitialBalanceDateBlur={page.onInitialBalanceDateBlur}
				allMembers={page.allMembers}
				availableMembers={page.availableMembers}
				showMemberDropdown={page.showMemberDropdown}
				onMemberDropdownChange={page.setShowMemberDropdown}
				onAddMember={page.addMemberToAccount}
				onRemoveMember={page.removeMemberFromAccount}
				addMemberPending={page.addMemberPending}
				addMemberVariables={page.addMemberVariables}
				removeMemberPending={page.removeMemberPending}
				removeMemberVariables={page.removeMemberVariables}
				imports={page.accountImports}
				showAllImports={page.showAllImports}
				onShowAllImportsChange={page.setShowAllImports}
				onProcessImport={page.handleProcess}
				onReprocessImport={page.handleReprocess}
				onDeleteImport={page.onDeleteImportClick}
				processImportPending={page.processImportPending}
				processImportVariables={page.processImportVariables}
				reprocessImportPending={page.reprocessImportPending}
				reprocessImportVariables={page.reprocessImportVariables}
				deleteImportPending={page.deleteImportPending}
				deleteImportId={page.deleteImportId}
				onDeleteAccountClick={page.onDeleteAccountClickFromSettings}
			/>

			<TransactionsSection
				transactions={page.allTransactions}
				totalTransactions={page.totalTransactions}
				searchQuery={page.searchQuery}
				onSearchChange={page.setSearchQuery}
				isUploading={page.isUploading}
				isLoadingMore={page.isLoadingMore}
				hasMore={page.hasMore}
				dragActive={page.dragActive}
				onDragEnter={page.handleDrag}
				onDragLeave={page.handleDrag}
				onDragOver={page.handleDrag}
				onDrop={page.handleDrop}
				onFileSelect={page.handleFileSelect}
				onLoadMore={page.loadMore}
				loadMoreRef={page.loadMoreRef}
			/>

			<ConfirmDialog
				open={page.deleteAccountOpen}
				onOpenChange={page.setDeleteAccountOpen}
				title="Supprimer le compte"
				description={
					account._count.transactions > 0
						? `Êtes-vous sûr de vouloir supprimer "${account.name}" ? Ce compte contient ${account._count.transactions} transaction(s) qui seront également supprimées.`
						: `Êtes-vous sûr de vouloir supprimer "${account.name}" ?`
				}
				confirmLabel="Supprimer"
				variant="destructive"
				onConfirm={page.confirmDeleteAccount}
			/>

			<ConfirmDialog
				open={page.isDeleteImportDialogOpen}
				onOpenChange={page.onDeleteImportDialogChange}
				title="Supprimer l'import"
				description="Êtes-vous sûr de vouloir supprimer cet import ? Les transactions importées ne seront pas supprimées."
				confirmLabel="Supprimer"
				variant="destructive"
				onConfirm={page.confirmDeleteImport}
			/>
		</Flex>
	)
}
