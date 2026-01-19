'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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

// Types
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

export function useAccountDetailPage(accountId: string) {
	const router = useRouter()
	const pageSize = 30

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

	const {
		data: transactionsData,
		isLoading: isLoadingTransactions,
		isFetching: isFetchingTransactions,
	} = useTransactionsQuery(
		{ accountId, search: searchQuery || undefined },
		{ page: currentPage, pageSize }
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

	// Edit states
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
			{ threshold: 0.1, rootMargin: '100px' }
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
					`${result.process.recordsCount} transactions importées, ${result.process.skippedCount} doublons ignorés`
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

	// Settings sheet inline handlers
	const onNameBlur = () => {
		if (!account) return
		if (editName && editName !== account.name) saveAccountDetails()
	}

	const onNameFocus = () => {
		if (!account) return
		if (!editName) setEditName(account.name)
	}

	const onDescriptionBlur = () => {
		if (!account) return
		if (editDescription !== (account.description || '')) saveAccountDetails()
	}

	const onDescriptionFocus = () => {
		if (!account) return
		if (editDescription === '') setEditDescription(account.description || '')
	}

	const onExportUrlBlur = () => {
		if (!account) return
		const currentValue = exportUrlInput !== '' ? exportUrlInput : account.exportUrl || ''
		if (currentValue !== (account.exportUrl || '')) saveExportUrl()
	}

	const onExportUrlFocus = () => {
		if (!account) return
		if (exportUrlInput === '') setExportUrlInput(account.exportUrl || '')
	}

	const onInitialBalanceBlur = () => {
		if (!account) return
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
	}

	const onInitialBalanceFocus = () => {
		if (!account) return
		if (editInitialBalance === '') {
			setEditInitialBalance(account.initialBalance?.toString() || '0')
			if (account.initialBalanceDate) {
				setEditInitialBalanceDate(new Date(account.initialBalanceDate).toISOString().split('T')[0])
			}
		}
	}

	const onInitialBalanceDateBlur = () => {
		if (!account) return
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
	}

	const onDeleteAccountClickFromSettings = () => {
		setShowSettings(false)
		setDeleteAccountOpen(true)
	}

	const onDeleteImportClick = (id: string) => {
		setDeleteImportId(id)
	}

	const onDeleteImportDialogChange = (open: boolean) => {
		if (!open) setDeleteImportId(null)
	}

	const openSettings = () => setShowSettings(true)
	const openDeleteAccount = () => setDeleteAccountOpen(true)
	const closeError = () => setError(null)

	// ===== Computed values =====
	const accountImports = imports ?? []
	const isUploading = uploadImportMutation.isPending
	const isLoadingMore = isFetchingTransactions && currentPage > 1

	const availableMembers = useMemo(() => {
		if (!account) return []
		return (allMembers ?? []).filter(
			(m) => !account.accountMembers.some((am) => am.memberId === m.id)
		)
	}, [allMembers, account])

	return {
		// Query state
		account,
		isLoadingAccount,
		isAccountError,

		// Transactions
		allTransactions,
		totalTransactions,
		searchQuery,
		setSearchQuery,
		hasMore,
		isLoadingMore,
		loadMore,
		loadMoreRef,

		// Imports
		accountImports,
		isUploading,

		// Members
		allMembers,
		availableMembers,

		// UI State
		error,
		setError,
		showSettings,
		setShowSettings,
		showAllImports,
		setShowAllImports,
		dragActive,

		// Edit states
		editName,
		setEditName,
		editDescription,
		setEditDescription,
		editAccountNumber,
		setEditAccountNumber,
		exportUrlInput,
		setExportUrlInput,
		editInitialBalance,
		setEditInitialBalance,
		editInitialBalanceDate,
		setEditInitialBalanceDate,
		isEditingAccount,
		setIsEditingAccount,

		// Confirmation dialogs
		deleteAccountOpen,
		setDeleteAccountOpen,
		deleteImportId,
		setDeleteImportId,

		// Members dropdown
		showMemberDropdown,
		setShowMemberDropdown,

		// Handlers
		handleDrag,
		handleDrop,
		handleFileSelect,
		handleProcess,
		handleReprocess,
		confirmDeleteImport,
		confirmDeleteAccount,
		addMemberToAccount,
		removeMemberFromAccount,
		saveAccountDetails,
		saveExportUrl,
		saveInitialBalance,
		startEditingAccount,
		cancelEditingAccount,

		// Settings sheet inline handlers
		onNameBlur,
		onNameFocus,
		onDescriptionBlur,
		onDescriptionFocus,
		onExportUrlBlur,
		onExportUrlFocus,
		onInitialBalanceBlur,
		onInitialBalanceFocus,
		onInitialBalanceDateBlur,
		onDeleteAccountClickFromSettings,
		onDeleteImportClick,
		onDeleteImportDialogChange,
		openSettings,
		openDeleteAccount,
		closeError,

		// Computed
		isDeleteImportDialogOpen: deleteImportId !== null,

		// Mutation states
		updateAccountPending: updateAccountMutation.isPending,
		addMemberPending: addMemberMutation.isPending,
		addMemberVariables: addMemberMutation.variables,
		removeMemberPending: removeMemberMutation.isPending,
		removeMemberVariables: removeMemberMutation.variables,
		processImportPending: processImportMutation.isPending,
		processImportVariables: processImportMutation.variables,
		reprocessImportPending: reprocessImportMutation.isPending,
		reprocessImportVariables: reprocessImportMutation.variables,
		deleteImportPending: deleteImportMutation.isPending,
	}
}
