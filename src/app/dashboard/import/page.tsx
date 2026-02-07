'use client';

import {
	Card,
	ConfirmSheet,
	ImportDropZone,
	ImportErrorBanner,
	ImportFormGrid,
	ImportRefreshButton,
	ImportStatsCard,
	ImportTable,
	Label,
} from '@/components';
import { useImportPage } from '@/features/imports';
import { SelectField } from '@/lib/forms';
import { usePageHeader } from '@/shared/hooks';

export default function ImportPage() {
	const page = useImportPage();

	usePageHeader(
		'Import',
		undefined,
		<ImportRefreshButton onClick={() => page.refetchImports()} />,
	);

	return (
		<>
			{page.uploadError && (
				<ImportErrorBanner message={page.uploadError} onClose={page.closeUploadError} />
			)}

			<ImportFormGrid
				formCard={
					<Card padding="lg">
						<div className="flex flex-col gap-4">
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

							<div className="flex flex-col gap-1">
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
							</div>
						</div>
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

			<ImportTable
				imports={page.imports}
				isLoading={page.isLoading}
				getBankName={page.getBankNameForImport}
				onProcess={page.handleProcess}
				onReprocess={page.handleReprocess}
				onDelete={page.onDeleteImportClick}
			/>

			<ConfirmSheet
				open={page.isDeleteDialogOpen}
				onOpenChange={page.onDeleteImportDialogChange}
				title="Supprimer l'import"
				description="Êtes-vous sûr de vouloir supprimer cet import ? Les transactions importées ne seront pas supprimées."
				confirmLabel="Supprimer"
				variant="destructive"
				onConfirm={page.confirmDeleteImport}
			/>
		</>
	);
}
