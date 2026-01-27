'use client'

import {
	Card,
	ConfirmDialog,
	Flex,
	ImportDropZone,
	ImportErrorBanner,
	ImportFormGrid,
	ImportHistorySection,
	ImportRefreshButton,
	ImportRow,
	ImportStatsCard,
	Label,
	PageHeader,
} from '@/components'
import { useImportPage } from '@/features/imports'
import { SelectField } from '@/lib/forms'

export default function ImportPage() {
	const page = useImportPage()

	return (
		<Flex direction="col" gap="xl">
			<PageHeader
				title="Import"
				description="Importez vos relevés bancaires et conservez les fichiers bruts"
				actions={<ImportRefreshButton onClick={() => page.refetchImports()} />}
			/>

			{page.uploadError && (
				<ImportErrorBanner message={page.uploadError} onClose={page.closeUploadError} />
			)}

			<ImportFormGrid
				formCard={
					<Card padding="lg">
						<Flex direction="col" gap="md">
							<page.form.AppField name="bankId">
								{() => (
									<SelectField
										label="1. Banque *"
										placeholder="Sélectionner une banque..."
										options={page.bankOptions}
										helpText={page.noBanksHelpText}
									/>
								)}
							</page.form.AppField>

							<page.form.AppField name="accountId">
								{() => (
									<SelectField
										label="2. Compte *"
										placeholder={page.accountPlaceholder}
										options={page.accountOptions}
										disabled={!page.selectedBankId}
										helpText={page.noAccountsHelpText}
									/>
								)}
							</page.form.AppField>

							<Flex direction="col" gap="xs">
								<Label htmlFor="import-file-input">3. Fichier</Label>
								<ImportDropZone
									canUpload={!!page.canUpload}
									isUploading={page.isUploading}
									isDragActive={page.dragActive}
									onDragEnter={page.handleDrag}
									onDragLeave={page.handleDrag}
									onDragOver={page.handleDrag}
									onDrop={page.handleDrop}
									onFileSelect={page.handleFileSelect}
								/>
							</Flex>
						</Flex>
					</Card>
				}
				statsCard={
					<ImportStatsCard
						totalFiles={page.imports.length}
						processedCount={page.processedCount}
						totalRecords={page.totalRecords}
						pendingCount={page.pendingCount}
					/>
				}
			/>

			<ImportHistorySection isLoading={page.isLoading} isEmpty={page.imports.length === 0}>
				{page.imports.map((imp) => (
					<ImportRow
						key={imp.id}
						data={imp}
						bankName={page.getBankNameForImport(imp.bankKey)}
						onProcess={page.handleProcess}
						onReprocess={page.handleReprocess}
						onDelete={() => page.onDeleteImportClick(imp.id)}
					/>
				))}
			</ImportHistorySection>

			<ConfirmDialog
				open={page.isDeleteDialogOpen}
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
