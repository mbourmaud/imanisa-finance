'use client'

/**
 * Account Detail Page
 *
 * Uses TanStack Query for data fetching and mutations.
 * Supports infinite scroll for transactions, import management, and account settings.
 */

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import {
	useAccountQuery,
	useAddAccountMemberMutation,
	useDeleteAccountMutation,
	useRemoveAccountMemberMutation,
	useSyncAccountMutation,
	useUpdateAccountMutation,
} from '@/features/accounts'
import {
	useDeleteImportMutation,
	useImportsQuery,
	useProcessImportMutation,
	useReprocessImportMutation,
	useUploadImportMutation,
} from '@/features/imports'
import { useMembersQuery } from '@/features/members'
import { useTransactionsQuery } from '@/features/transactions/hooks/use-transactions-query'

// =============================================================================
// TYPES
// =============================================================================

interface AccountMember {
	id: string
	memberId: string
	ownerShare: number
	member: {
		id: string
		name: string
		color: string | null
	}
}

interface Bank {
	id: string
	name: string
	logo: string | null
	color: string
	description: string | null
	type: 'BANK' | 'INVESTMENT'
	parserKey: string
}

interface AccountDetail {
	id: string
	name: string
	description: string | null
	bankId: string
	type: string
	accountNumber: string | null
	balance: number
	initialBalance: number
	initialBalanceDate: string | null
	currency: string
	exportUrl: string | null
	bank: Bank
	accountMembers: AccountMember[]
	_count: {
		transactions: number
	}
}

interface RawImport {
	id: string
	bankKey: string
	filename: string
	fileSize: number
	mimeType: string
	status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
	errorMessage: string | null
	recordsCount: number | null
	skippedCount: number | null
	processedAt: string | null
	createdAt: string
}

interface ApiTransaction {
	id: string
	date: string
	description: string
	amount: number
	type: string
	transactionCategory?: {
		categoryId: string
		category: { id: string; name: string; icon: string; color: string }
	} | null
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function AccountDetailPage() {
	const params = useParams()
	const router = useRouter()
	const accountId = params.id as string

	// ===== TanStack Query Hooks =====
	const {
		data: account,
		isLoading: isLoadingAccount,
		isError: isAccountError,
	} = useAccountQuery(accountId) as {
		data: AccountDetail | undefined
		isLoading: boolean
		isError: boolean
	}

	const { data: imports = [] } = useImportsQuery({ accountId }) as {
		data: RawImport[] | undefined
	}

	const { data: allMembers = [] } = useMembersQuery()

	// Transactions with pagination
	const [searchQuery, setSearchQuery] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const pageSize = 30

	const {
		data: transactionsData,
		isLoading: isLoadingTransactions,
		isFetching: isFetchingTransactions,
	} = useTransactionsQuery(
		{ accountId, search: searchQuery || undefined },
		{ page: currentPage, pageSize },
	)

	// ===== Mutations =====
	const updateAccountMutation = useUpdateAccountMutation()
	const deleteAccountMutation = useDeleteAccountMutation()
	const syncAccountMutation = useSyncAccountMutation()
	const addMemberMutation = useAddAccountMemberMutation()
	const removeMemberMutation = useRemoveAccountMemberMutation()
	const uploadImportMutation = useUploadImportMutation()
	const processImportMutation = useProcessImportMutation()
	const reprocessImportMutation = useReprocessImportMutation()
	const deleteImportMutation = useDeleteImportMutation()

	// ===== Local UI State =====
	const [showSettings, setShowSettings] = useState(false)
	const [showAllImports, setShowAllImports] = useState(false)
	const [dragActive, setDragActive] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Edit states (inline editing in settings)
	const [editName, setEditName] = useState('')
	const [editDescription, setEditDescription] = useState('')
	const [editAccountNumber, setEditAccountNumber] = useState('')
	const [exportUrlInput, setExportUrlInput] = useState('')
	const [editInitialBalance, setEditInitialBalance] = useState('')
	const [editInitialBalanceDate, setEditInitialBalanceDate] = useState('')

	// Edit drawer
	const [isEditingAccount, setIsEditingAccount] = useState(false)

	// Confirmation dialogs
	const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
	const [deleteImportId, setDeleteImportId] = useState<string | null>(null)

	// Members dropdown
	const [showMemberDropdown, setShowMemberDropdown] = useState(false)

	// Infinite scroll refs
	const observerRef = useRef<IntersectionObserver | null>(null)
	const loadMoreRef = useRef<HTMLDivElement | null>(null)

	// Accumulated transactions for infinite scroll
	const [allTransactions, setAllTransactions] = useState<ApiTransaction[]>([])

	// Track total and hasMore
	const totalTransactions = transactionsData?.total ?? 0
	const hasMore = currentPage < (transactionsData?.totalPages ?? 0)

	// Update accumulated transactions when new data arrives
	useEffect(() => {
		if (transactionsData?.items) {
			const items = transactionsData.items as unknown as ApiTransaction[]
			if (currentPage === 1) {
				setAllTransactions(items)
			} else {
				setAllTransactions((prev) => {
					const existingIds = new Set(prev.map((t) => t.id))
					const newItems = items.filter((t) => !existingIds.has(t.id))
					return [...prev, ...newItems]
				})
			}
		}
	}, [transactionsData?.items, currentPage])

	// Reset transactions when search changes
	useEffect(() => {
		setCurrentPage(1)
		setAllTransactions([])
	}, [])

	// Infinite scroll observer
	const loadMore = useCallback(() => {
		if (!isFetchingTransactions && hasMore) {
			setCurrentPage((prev) => prev + 1)
		}
	}, [isFetchingTransactions, hasMore])

	useEffect(() => {
		const currentRef = loadMoreRef.current
		if (!currentRef || allTransactions.length === 0 || !hasMore) return

		if (observerRef.current) {
			observerRef.current.disconnect()
		}

		observerRef.current = new IntersectionObserver(
			(entries) => {
				const [entry] = entries
				if (entry.isIntersecting && !isFetchingTransactions) {
					loadMore()
				}
			},
			{ threshold: 0.1, rootMargin: '100px' },
		)

		observerRef.current.observe(currentRef)

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect()
			}
		}
	}, [allTransactions.length, hasMore, isFetchingTransactions, loadMore])

	// ===== Handlers =====
	const handleUpload = async (file: File) => {
		if (!account) return

		setError(null)
		try {
			const result = await uploadImportMutation.mutateAsync({
				file,
				bankKey: account.bank.parserKey,
				accountId: account.id,
			})

			if (result.process.skippedCount > 0) {
				setError(
					`${result.process.recordsCount} transactions importées, ${result.process.skippedCount} doublons ignorés`,
				)
			}

			setCurrentPage(1)
			setAllTransactions([])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed')
		}
	}

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) handleUpload(file)
		e.target.value = ''
	}

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true)
		} else if (e.type === 'dragleave') {
			setDragActive(false)
		}
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)
		const file = e.dataTransfer.files?.[0]
		if (file) handleUpload(file)
	}

	const handleProcess = async (importId: string) => {
		try {
			await processImportMutation.mutateAsync({ importId, accountId })
			setCurrentPage(1)
			setAllTransactions([])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Processing failed')
		}
	}

	const handleReprocess = async (importId: string) => {
		try {
			await reprocessImportMutation.mutateAsync({ importId, accountId })
			setCurrentPage(1)
			setAllTransactions([])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Reprocessing failed')
		}
	}

	const confirmDeleteImport = async () => {
		if (!deleteImportId) return
		try {
			await deleteImportMutation.mutateAsync({ importId: deleteImportId, accountId })
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Delete failed')
		} finally {
			setDeleteImportId(null)
		}
	}

	const confirmDeleteAccount = async () => {
		if (!account) return
		try {
			await deleteAccountMutation.mutateAsync(accountId)
			router.push('/dashboard/banks')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossible de supprimer le compte')
		}
	}

	const addMemberToAccount = async (memberId: string) => {
		setShowMemberDropdown(false)
		try {
			await addMemberMutation.mutateAsync({ accountId, memberId, ownerShare: 100 })
		} catch (err) {
			console.error('Error adding member:', err)
		}
	}

	const removeMemberFromAccount = async (memberId: string) => {
		try {
			await removeMemberMutation.mutateAsync({ accountId, memberId })
		} catch (err) {
			console.error('Error removing member:', err)
		}
	}

	// Save functions for inline editing
	const saveAccountDetails = async () => {
		if (!account) return
		const name = editName || account.name
		if (!name.trim()) return

		try {
			await updateAccountMutation.mutateAsync({
				id: accountId,
				input: {
					name: name.trim(),
					description:
						(editDescription !== '' ? editDescription : account.description)?.trim() || undefined,
					accountNumber:
						(editAccountNumber !== '' ? editAccountNumber : account.accountNumber)?.trim() ||
						undefined,
				},
			})
			setIsEditingAccount(false)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossible de sauvegarder')
		}
	}

	const saveExportUrl = async () => {
		if (!account) return
		const urlValue = exportUrlInput !== '' ? exportUrlInput : account.exportUrl || ''
		if (urlValue === (account.exportUrl || '')) return

		try {
			await updateAccountMutation.mutateAsync({
				id: accountId,
				input: { exportUrl: urlValue || undefined },
			})
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossible de sauvegarder')
		}
	}

	const saveInitialBalance = async () => {
		if (!account) return

		const balanceStr =
			editInitialBalance !== '' ? editInitialBalance : account.initialBalance?.toString() || '0'
		const balanceValue = parseFloat(balanceStr.replace(',', '.'))
		if (Number.isNaN(balanceValue)) {
			setError('Montant invalide')
			return
		}

		const dateValue =
			editInitialBalanceDate ||
			(account.initialBalanceDate
				? new Date(account.initialBalanceDate).toISOString().split('T')[0]
				: '')

		try {
			await updateAccountMutation.mutateAsync({
				id: accountId,
				input: {
					initialBalance: balanceValue,
					initialBalanceDate: dateValue ? new Date(dateValue).toISOString() : undefined,
				},
			})
			await syncAccountMutation.mutateAsync(accountId)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossible de sauvegarder')
		}
	}

	const startEditingAccount = () => {
		if (!account) return
		setEditName(account.name)
		setEditDescription(account.description || '')
		setEditAccountNumber(account.accountNumber || '')
		setIsEditingAccount(true)
	}

	const cancelEditingAccount = () => {
		setIsEditingAccount(false)
		setEditName('')
		setEditDescription('')
		setEditAccountNumber('')
	}

	// ===== Computed values =====
	const accountImports = imports ?? []
	const isUploading = uploadImportMutation.isPending
	const isLoadingMore = isFetchingTransactions && currentPage > 1

	const availableMembers = useMemo(() => {
		if (!account) return []
		return (allMembers ?? []).filter(
			(m) => !account.accountMembers.some((am) => am.memberId === m.id),
		)
	}, [allMembers, account])

	// ===== Render =====
	if (isLoadingAccount) {
		return <AccountLoadingState />
	}

	if (isAccountError || !account) {
		return <AccountNotFoundState />
	}

	return (
		<Flex direction="col" gap="lg">
			{/* Header */}
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
				onEditClick={startEditingAccount}
				onSettingsClick={() => setShowSettings(true)}
				onDeleteClick={() => setDeleteAccountOpen(true)}
			/>

			{/* Account Edit Sheet */}
			<AccountEditSheet
				open={isEditingAccount}
				onOpenChange={setIsEditingAccount}
				bankName={account.bank.name}
				bankColor={account.bank.color}
				editName={editName}
				onNameChange={setEditName}
				editDescription={editDescription}
				onDescriptionChange={setEditDescription}
				editAccountNumber={editAccountNumber}
				onAccountNumberChange={setEditAccountNumber}
				isPending={updateAccountMutation.isPending}
				onSave={saveAccountDetails}
				onCancel={cancelEditingAccount}
			/>

			{/* Error/Success Toast */}
			{error && (
				<FloatingToast
					message={error}
					isSuccess={error.includes('importées')}
					onClose={() => setError(null)}
				/>
			)}

			{/* Settings Sheet */}
			<AccountSettingsSheet
				open={showSettings}
				onOpenChange={setShowSettings}
				accountName={account.name}
				accountDescription={account.description}
				accountExportUrl={account.exportUrl}
				accountInitialBalance={account.initialBalance}
				accountInitialBalanceDate={account.initialBalanceDate}
				accountMembers={account.accountMembers}
				transactionCount={account._count.transactions}
				editName={editName}
				onNameChange={setEditName}
				onNameBlur={() => {
					if (editName && editName !== account.name) {
						saveAccountDetails()
					}
				}}
				onNameFocus={() => {
					if (!editName) setEditName(account.name)
				}}
				editDescription={editDescription}
				onDescriptionChange={setEditDescription}
				onDescriptionBlur={() => {
					if (editDescription !== (account.description || '')) {
						saveAccountDetails()
					}
				}}
				onDescriptionFocus={() => {
					if (editDescription === '') setEditDescription(account.description || '')
				}}
				exportUrlInput={exportUrlInput}
				onExportUrlChange={setExportUrlInput}
				onExportUrlBlur={() => {
					const currentValue = exportUrlInput !== '' ? exportUrlInput : account.exportUrl || ''
					if (currentValue !== (account.exportUrl || '')) {
						saveExportUrl()
					}
				}}
				onExportUrlFocus={() => {
					if (exportUrlInput === '') setExportUrlInput(account.exportUrl || '')
				}}
				editInitialBalance={editInitialBalance}
				onInitialBalanceChange={setEditInitialBalance}
				onInitialBalanceBlur={() => {
					const currentValue =
						editInitialBalance !== '' ? editInitialBalance : account.initialBalance?.toString() || '0'
					if (
						currentValue !== (account.initialBalance?.toString() || '0') ||
						editInitialBalanceDate !==
							(account.initialBalanceDate
								? new Date(account.initialBalanceDate).toISOString().split('T')[0]
								: '')
					) {
						saveInitialBalance()
					}
				}}
				onInitialBalanceFocus={() => {
					if (editInitialBalance === '') {
						setEditInitialBalance(account.initialBalance?.toString() || '0')
						if (account.initialBalanceDate) {
							setEditInitialBalanceDate(
								new Date(account.initialBalanceDate).toISOString().split('T')[0],
							)
						}
					}
				}}
				editInitialBalanceDate={editInitialBalanceDate}
				onInitialBalanceDateChange={setEditInitialBalanceDate}
				onInitialBalanceDateBlur={() => {
					const currentBalanceDate =
						editInitialBalanceDate !== ''
							? editInitialBalanceDate
							: account.initialBalanceDate
								? new Date(account.initialBalanceDate).toISOString().split('T')[0]
								: ''
					const currentBalance =
						editInitialBalance !== '' ? editInitialBalance : account.initialBalance?.toString() || '0'
					if (
						currentBalanceDate !==
							(account.initialBalanceDate
								? new Date(account.initialBalanceDate).toISOString().split('T')[0]
								: '') ||
						currentBalance !== (account.initialBalance?.toString() || '0')
					) {
						saveInitialBalance()
					}
				}}
				allMembers={allMembers}
				availableMembers={availableMembers}
				showMemberDropdown={showMemberDropdown}
				onMemberDropdownChange={setShowMemberDropdown}
				onAddMember={addMemberToAccount}
				onRemoveMember={removeMemberFromAccount}
				addMemberPending={addMemberMutation.isPending}
				addMemberVariables={addMemberMutation.variables}
				removeMemberPending={removeMemberMutation.isPending}
				removeMemberVariables={removeMemberMutation.variables}
				imports={accountImports}
				showAllImports={showAllImports}
				onShowAllImportsChange={setShowAllImports}
				onProcessImport={handleProcess}
				onReprocessImport={handleReprocess}
				onDeleteImport={(id) => setDeleteImportId(id)}
				processImportPending={processImportMutation.isPending}
				processImportVariables={processImportMutation.variables}
				reprocessImportPending={reprocessImportMutation.isPending}
				reprocessImportVariables={reprocessImportMutation.variables}
				deleteImportPending={deleteImportMutation.isPending}
				deleteImportId={deleteImportId}
				onDeleteAccountClick={() => {
					setShowSettings(false)
					setDeleteAccountOpen(true)
				}}
			/>

			{/* Transactions Section */}
			<TransactionsSection
				transactions={allTransactions}
				totalTransactions={totalTransactions}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				isUploading={isUploading}
				isLoadingMore={isLoadingMore}
				hasMore={hasMore}
				dragActive={dragActive}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
				onFileSelect={handleFileSelect}
				onLoadMore={loadMore}
				loadMoreRef={loadMoreRef}
			/>

			{/* Confirmation Dialogs */}
			<ConfirmDialog
				open={deleteAccountOpen}
				onOpenChange={setDeleteAccountOpen}
				title="Supprimer le compte"
				description={
					account._count.transactions > 0
						? `Êtes-vous sûr de vouloir supprimer "${account.name}" ? Ce compte contient ${account._count.transactions} transaction(s) qui seront également supprimées.`
						: `Êtes-vous sûr de vouloir supprimer "${account.name}" ?`
				}
				confirmLabel="Supprimer"
				variant="destructive"
				onConfirm={confirmDeleteAccount}
			/>

			<ConfirmDialog
				open={deleteImportId !== null}
				onOpenChange={(open) => !open && setDeleteImportId(null)}
				title="Supprimer l'import"
				description="Êtes-vous sûr de vouloir supprimer cet import ? Les transactions importées ne seront pas supprimées."
				confirmLabel="Supprimer"
				variant="destructive"
				onConfirm={confirmDeleteImport}
			/>
		</Flex>
	)
}
