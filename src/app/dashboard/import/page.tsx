'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Card,
	ConfirmSheet,
	ExternalLink,
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	ImportDropZone,
	ImportErrorBanner,
	ImportFormGrid,
	ImportRefreshButton,
	ImportStatsCard,
	ImportTable,
	Label,
	PageHeader,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components';
import { ImportFormatInfo } from '@/components/import/ImportFormatInfo';
import { useImportPage } from '@/features/imports';

export default function ImportPage() {
	const page = useImportPage();

	return (
		<>
			<PageHeader title="Import" />

			{page.uploadError && (
				<ImportErrorBanner message={page.uploadError} onClose={page.closeUploadError} />
			)}

			<ImportFormGrid
				formCard={
					<Card padding="lg">
						<div className="flex flex-col gap-4">
							<page.form.Field
								name="bankId"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="import-bank-select">1. Banque *</FieldLabel>
											<Select
												name={field.name}
												value={field.state.value}
												onValueChange={field.handleChange}
											>
												<SelectTrigger id="import-bank-select" aria-invalid={isInvalid}>
													<SelectValue placeholder="Sélectionner une banque..." />
												</SelectTrigger>
												<SelectContent>
													{page.bankOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{page.noBanksHelpText && (
												<FieldDescription>{page.noBanksHelpText}</FieldDescription>
											)}
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									)
								}}
							/>

							<page.form.Field
								name="accountId"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid} data-disabled={!page.selectedBankId}>
											<FieldLabel htmlFor="import-account-select">2. Compte *</FieldLabel>
											<Select
												name={field.name}
												value={field.state.value}
												onValueChange={field.handleChange}
												disabled={!page.selectedBankId}
											>
												<SelectTrigger id="import-account-select" aria-invalid={isInvalid}>
													<SelectValue placeholder={page.accountPlaceholder} />
												</SelectTrigger>
												<SelectContent>
													{page.accountOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{page.noAccountsHelpText && (
												<FieldDescription>{page.noAccountsHelpText}</FieldDescription>
											)}
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									)
								}}
							/>

							{page.selectedFormatInfo && (
								<ImportFormatInfo formatInfo={page.selectedFormatInfo} />
							)}

							{page.selectedAccountExportUrl && (
								<a
									href={page.selectedAccountExportUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
								>
									<ExternalLink className="h-4 w-4" />
									Accéder au site de la banque pour télécharger vos relevés
								</a>
							)}

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

			<div className="flex items-center justify-between">
				<h2 className="text-sm font-medium text-muted-foreground">Historique des imports</h2>
				<ImportRefreshButton onClick={() => page.refetchImports()} />
			</div>

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

			<AlertDialog open={page.isReprocessDialogOpen} onOpenChange={(open) => { if (!open) page.cancelReprocess() }}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirmer le retraitement</AlertDialogTitle>
						<AlertDialogDescription asChild>
							<div>
								{page.reprocessPreview && (
									<>
										<p>
											Attention : <strong>{page.reprocessPreview.affectedCount} transaction{page.reprocessPreview.affectedCount > 1 ? 's' : ''}</strong> seront supprimées pour ce compte sur la période du{' '}
											<strong>{new Date(page.reprocessPreview.minDate).toLocaleDateString('fr-FR')}</strong> au{' '}
											<strong>{new Date(page.reprocessPreview.maxDate).toLocaleDateString('fr-FR')}</strong>, y compris les transactions manuelles ou provenant d&apos;autres imports.
										</p>
										<p className="mt-2">
											Elles seront remplacées par <strong>{page.reprocessPreview.newCount}</strong> transactions issues du fichier.
										</p>
									</>
								)}
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction onClick={page.confirmReprocess}>
							Retraiter
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
