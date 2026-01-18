'use client'

/**
 * Import Page
 *
 * CSV/Excel file import with bank/account selection.
 * Uses the new component library for consistent UI.
 */

import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
	Flex,
	GlassCard,
	ImportDropZone,
	ImportErrorBanner,
	ImportHistorySection,
	ImportRefreshButton,
	ImportRow,
	ImportStatsCard,
	Label,
	PageHeader,
} from '@/components'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
	importFormSchema,
	useDeleteImportMutation,
	useImportsQuery,
	useProcessImportMutation,
	useReprocessImportMutation,
	useUploadImportMutation,
} from '@/features/imports'
import { SelectField, useAppForm } from '@/lib/forms'

interface Bank {
	id: string
	name: string
	template: string | null
	accountCount: number
	accounts: {
		id: string
		name: string
		bankId: string
		type: string
		balance: number
	}[]
}

export default function ImportPage() {
	const [dragActive, setDragActive] = useState(false)
	const [deleteImportId, setDeleteImportId] = useState<string | null>(null)

	const {
		data: imports = [],
		isLoading: isLoadingImports,
		refetch: refetchImports,
	} = useImportsQuery()

	const { data: banksData, isLoading: isLoadingBanks } = useQuery<{ banks: Bank[] }>({
		queryKey: ['banks'],
		queryFn: async () => {
			const response = await fetch('/api/banks')
			if (!response.ok) throw new Error('Failed to fetch banks')
			return response.json()
		},
	})

	const banks = banksData?.banks ?? []

	const form = useAppForm({
		defaultValues: {
			bankId: '',
			accountId: '',
		},
		validators: {
			onChange: importFormSchema,
		},
	})

	const selectedBankId = useStore(form.store, (state) => state.values.bankId)
	const selectedAccountId = useStore(form.store, (state) => state.values.accountId)

	const filteredAccounts = useMemo(() => {
		if (!selectedBankId) return []
		const bank = banks.find((b) => b.id === selectedBankId)
		return bank?.accounts ?? []
	}, [selectedBankId, banks])

	const selectedBank = banks.find((b) => b.id === selectedBankId)

	const uploadMutation = useUploadImportMutation()
	const processMutation = useProcessImportMutation()
	const reprocessMutation = useReprocessImportMutation()
	const deleteMutation = useDeleteImportMutation()

	const isUploading = uploadMutation.isPending
	const isLoading = isLoadingImports || isLoadingBanks

	const handleUpload = async (file: File) => {
		const bankId = form.getFieldValue('bankId')
		const accountId = form.getFieldValue('accountId')

		if (!bankId) {
			toast.error('Veuillez sélectionner une banque')
			return
		}

		if (!accountId) {
			toast.error('Veuillez sélectionner un compte')
			return
		}

		const bankKey = selectedBank?.template || selectedBank?.name || 'other'

		try {
			await uploadMutation.mutateAsync({
				file,
				bankKey,
				accountId,
			})
			toast.success('Fichier importé avec succès')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Échec de l'upload")
		}
	}

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			handleUpload(file)
		}
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
		if (file) {
			handleUpload(file)
		}
	}

	const handleProcess = async (importId: string, accountId?: string) => {
		if (!accountId) return
		try {
			await processMutation.mutateAsync({ importId, accountId })
			toast.success('Import traité avec succès')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Échec du traitement')
		}
	}

	const handleReprocess = async (importId: string, accountId?: string) => {
		if (!accountId) return
		try {
			await reprocessMutation.mutateAsync({ importId, accountId })
			toast.success('Import retraité avec succès')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Échec du retraitement')
		}
	}

	const confirmDeleteImport = async () => {
		if (!deleteImportId) return

		try {
			await deleteMutation.mutateAsync({ importId: deleteImportId })
			toast.success('Import supprimé')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Échec de la suppression')
		} finally {
			setDeleteImportId(null)
		}
	}

	const getBankNameForImport = (bankKey: string): string => {
		const bankByTemplate = banks.find((b) => b.template === bankKey)
		if (bankByTemplate) return bankByTemplate.name

		const bankByName = banks.find((b) => b.name === bankKey)
		if (bankByName) return bankByName.name

		return bankKey
	}

	const pendingCount = imports.filter((i) => i.status === 'PENDING').length
	const processedCount = imports.filter((i) => i.status === 'PROCESSED').length
	const totalRecords = imports.reduce((sum, i) => sum + (i.recordsCount || 0), 0)

	const canUpload = selectedBankId && selectedAccountId && !isUploading

	const bankOptions = banks.map((bank) => ({
		value: bank.id,
		label: bank.template ? `${bank.name} (${bank.template})` : bank.name,
	}))

	const accountOptions = filteredAccounts.map((account) => ({
		value: account.id,
		label: `${account.name} (${account.type})`,
	}))

	return (
		<Flex direction="col" gap="xl">
			<PageHeader
				title="Import"
				description="Importez vos relevés bancaires et conservez les fichiers bruts"
				actions={<ImportRefreshButton onClick={() => refetchImports()} />}
			/>

			{uploadMutation.error && (
				<ImportErrorBanner
					message={uploadMutation.error.message}
					onClose={() => uploadMutation.reset()}
				/>
			)}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<GlassCard padding="lg">
					<Flex direction="col" gap="md">
						<form.AppField name="bankId">
							{() => (
								<SelectField
									label="1. Banque *"
									placeholder="Sélectionner une banque..."
									options={bankOptions}
									helpText={
										banks.length === 0 && !isLoading
											? "Aucune banque configurée. Ajoutez d'abord une banque dans les paramètres."
											: undefined
									}
								/>
							)}
						</form.AppField>

						<form.AppField name="accountId">
							{() => (
								<SelectField
									label="2. Compte *"
									placeholder={
										selectedBankId ? 'Sélectionner un compte...' : "Sélectionnez d'abord une banque"
									}
									options={accountOptions}
									disabled={!selectedBankId}
									helpText={
										selectedBankId && filteredAccounts.length === 0
											? "Aucun compte pour cette banque. Ajoutez d'abord un compte."
											: undefined
									}
								/>
							)}
						</form.AppField>

						<Flex direction="col" gap="xs">
							<Label htmlFor="import-file-input">3. Fichier</Label>
							<ImportDropZone
								canUpload={!!canUpload}
								isUploading={isUploading}
								isDragActive={dragActive}
								onDragEnter={handleDrag}
								onDragLeave={handleDrag}
								onDragOver={handleDrag}
								onDrop={handleDrop}
								onFileSelect={handleFileSelect}
							/>
						</Flex>
					</Flex>
				</GlassCard>

				<ImportStatsCard
					totalFiles={imports.length}
					processedCount={processedCount}
					totalRecords={totalRecords}
					pendingCount={pendingCount}
				/>
			</div>

			<ImportHistorySection isLoading={isLoading} isEmpty={imports.length === 0}>
				{imports.map((imp) => (
					<ImportRow
						key={imp.id}
						data={imp}
						bankName={getBankNameForImport(imp.bankKey)}
						onProcess={handleProcess}
						onReprocess={handleReprocess}
						onDelete={() => setDeleteImportId(imp.id)}
					/>
				))}
			</ImportHistorySection>

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
