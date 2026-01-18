'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	AlertCircle,
	Button,
	CheckCircle2,
	Clock,
	EmptyState,
	FileSpreadsheet,
	GlassCard,
	Label,
	Loader2,
	PageHeader,
	RefreshCw,
	RotateCcw,
	StatCard,
	StatCardGrid,
	Trash2,
	Upload,
} from '@/components';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
	importFormSchema,
	useDeleteImportMutation,
	useImportsQuery,
	useProcessImportMutation,
	useReprocessImportMutation,
	useUploadImportMutation,
	type RawImport,
} from '@/features/imports';
import { SelectField, useAppForm } from '@/lib/forms';

interface Bank {
	id: string;
	name: string;
	template: string | null;
	accountCount: number;
	accounts: {
		id: string;
		name: string;
		bankId: string;
		type: string;
		balance: number;
	}[];
}

function getStatusIcon(status: RawImport['status']) {
	switch (status) {
		case 'PROCESSED':
			return (
				<CheckCircle2 style={{ height: '1rem', width: '1rem', color: 'oklch(0.55 0.15 145)' }} />
			);
		case 'PROCESSING':
			return (
				<Loader2
					style={{
						height: '1rem',
						width: '1rem',
						color: 'hsl(var(--primary))',
						animation: 'spin 1s linear infinite',
					}}
				/>
			);
		case 'FAILED':
			return <AlertCircle style={{ height: '1rem', width: '1rem', color: 'oklch(0.55 0.2 25)' }} />;
		default:
			return (
				<Clock style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }} />
			);
	}
}

function getStatusLabel(status: RawImport['status']) {
	switch (status) {
		case 'PROCESSED':
			return 'Traité';
		case 'PROCESSING':
			return 'En cours...';
		case 'FAILED':
			return 'Erreur';
		default:
			return 'En attente';
	}
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString('fr-FR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export default function ImportPage() {
	// UI state only
	const [dragActive, setDragActive] = useState(false);
	const [deleteImportId, setDeleteImportId] = useState<string | null>(null);

	// TanStack Query for data
	const { data: imports = [], isLoading: isLoadingImports, refetch: refetchImports } = useImportsQuery();

	const { data: banksData, isLoading: isLoadingBanks } = useQuery<{ banks: Bank[] }>({
		queryKey: ['banks'],
		queryFn: async () => {
			const response = await fetch('/api/banks');
			if (!response.ok) throw new Error('Failed to fetch banks');
			return response.json();
		},
	});

	const banks = banksData?.banks ?? [];

	// TanStack Form for bank/account selection
	const form = useAppForm({
		defaultValues: {
			bankId: '',
			accountId: '',
		},
		validators: {
			onChange: importFormSchema,
		},
	});

	// Watch form values for filtering accounts
	const selectedBankId = form.useStore((state) => state.values.bankId);
	const selectedAccountId = form.useStore((state) => state.values.accountId);

	// Reset account when bank changes
	const filteredAccounts = useMemo(() => {
		if (!selectedBankId) return [];
		const bank = banks.find((b) => b.id === selectedBankId);
		return bank?.accounts ?? [];
	}, [selectedBankId, banks]);

	// Get selected bank info
	const selectedBank = banks.find((b) => b.id === selectedBankId);

	// Mutations
	const uploadMutation = useUploadImportMutation();
	const processMutation = useProcessImportMutation();
	const reprocessMutation = useReprocessImportMutation();
	const deleteMutation = useDeleteImportMutation();

	const isUploading = uploadMutation.isPending;
	const isLoading = isLoadingImports || isLoadingBanks;

	// Handle file upload
	const handleUpload = async (file: File) => {
		// Validate form first
		const bankId = form.getFieldValue('bankId');
		const accountId = form.getFieldValue('accountId');

		if (!bankId) {
			toast.error('Veuillez sélectionner une banque');
			return;
		}

		if (!accountId) {
			toast.error('Veuillez sélectionner un compte');
			return;
		}

		// Use bank template as bankKey, or bank name if no template
		const bankKey = selectedBank?.template || selectedBank?.name || 'other';

		try {
			await uploadMutation.mutateAsync({
				file,
				bankKey,
				accountId,
			});
			toast.success('Fichier importé avec succès');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Échec de l\'upload');
		}
	};

	// Handle file selection
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleUpload(file);
		}
		// Reset input to allow re-selecting the same file
		e.target.value = '';
	};

	// Handle drag and drop
	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		const file = e.dataTransfer.files?.[0];
		if (file) {
			handleUpload(file);
		}
	};

	// Process import
	const handleProcess = async (importId: string, accountId?: string) => {
		if (!accountId) return;
		try {
			await processMutation.mutateAsync({ importId, accountId });
			toast.success('Import traité avec succès');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Échec du traitement');
		}
	};

	// Reprocess import
	const handleReprocess = async (importId: string, accountId?: string) => {
		if (!accountId) return;
		try {
			await reprocessMutation.mutateAsync({ importId, accountId });
			toast.success('Import retraité avec succès');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Échec du retraitement');
		}
	};

	// Delete import
	const confirmDeleteImport = async () => {
		if (!deleteImportId) return;

		try {
			await deleteMutation.mutateAsync({ importId: deleteImportId });
			toast.success('Import supprimé');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Échec de la suppression');
		} finally {
			setDeleteImportId(null);
		}
	};

	// Find bank name for an import
	const getBankNameForImport = (bankKey: string): string => {
		// Try to find by template first
		const bankByTemplate = banks.find((b) => b.template === bankKey);
		if (bankByTemplate) return bankByTemplate.name;

		// Try to find by name
		const bankByName = banks.find((b) => b.name === bankKey);
		if (bankByName) return bankByName.name;

		return bankKey;
	};

	const pendingCount = imports.filter((i) => i.status === 'PENDING').length;
	const processedCount = imports.filter((i) => i.status === 'PROCESSED').length;
	const totalRecords = imports.reduce((sum, i) => sum + (i.recordsCount || 0), 0);

	const canUpload = selectedBankId && selectedAccountId && !isUploading;

	// Build options for selects
	const bankOptions = banks.map((bank) => ({
		value: bank.id,
		label: bank.template ? `${bank.name} (${bank.template})` : bank.name,
	}));

	const accountOptions = filteredAccounts.map((account) => ({
		value: account.id,
		label: `${account.name} (${account.type})`,
	}));

	return (
		<div className="flex flex-col gap-8">
			{/* Header */}
			<PageHeader
				title="Import"
				description="Importez vos relevés bancaires et conservez les fichiers bruts"
				actions={
					<Button
						variant="outline"
						onClick={() => refetchImports()}
						iconLeft={<RefreshCw style={{ height: '1rem', width: '1rem' }} />}
					>
						Actualiser
					</Button>
				}
			/>

			{/* Error message from mutations */}
			{uploadMutation.error && (
				<div
					className="rounded-lg border p-4"
					style={{
						borderColor: 'oklch(0.55 0.2 25 / 0.2)',
						backgroundColor: 'oklch(0.55 0.2 25 / 0.05)',
					}}
				>
					<div className="flex items-center gap-3" style={{ color: 'oklch(0.55 0.2 25)' }}>
						<AlertCircle style={{ height: '1rem', width: '1rem' }} />
						<span className="font-medium">{uploadMutation.error.message}</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => uploadMutation.reset()}
							style={{ marginLeft: 'auto', height: '1.5rem', padding: '0 0.5rem' }}
						>
							Fermer
						</Button>
					</div>
				</div>
			)}

			{/* Upload Section */}
			<div className="grid grid-cols-2 gap-6">
				{/* CSV Import */}
				<GlassCard padding="lg">
					<div className="flex flex-col gap-4">
						{/* Bank selector with TanStack Form */}
						<form.AppField name="bankId">
							{() => (
								<SelectField
									label="1. Banque *"
									placeholder="Sélectionner une banque..."
									options={bankOptions}
									helpText={banks.length === 0 && !isLoading ? "Aucune banque configurée. Ajoutez d'abord une banque dans les paramètres." : undefined}
								/>
							)}
						</form.AppField>

						{/* Account selector with TanStack Form */}
						<form.AppField
							name="accountId"
							listeners={{
								onChange: () => {
									// Reset accountId when bankId changes by clearing it if bank changed
								},
							}}
						>
							{() => (
								<SelectField
									label="2. Compte *"
									placeholder={selectedBankId ? 'Sélectionner un compte...' : "Sélectionnez d'abord une banque"}
									options={accountOptions}
									disabled={!selectedBankId}
									helpText={selectedBankId && filteredAccounts.length === 0 ? "Aucun compte pour cette banque. Ajoutez d'abord un compte." : undefined}
								/>
							)}
						</form.AppField>

						{/* Drop zone */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="import-file-input">3. Fichier</Label>
							<div
								role="presentation"
								onDragEnter={handleDrag}
								onDragLeave={handleDrag}
								onDragOver={handleDrag}
								onDrop={handleDrop}
								className="flex rounded-xl p-8"
								style={{
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									border: '2px dashed',
									transition: 'all 0.2s',
									borderColor: !canUpload
										? 'hsl(var(--border) / 0.4)'
										: dragActive
											? 'hsl(var(--primary))'
											: 'hsl(var(--border) / 0.6)',
									backgroundColor: !canUpload
										? 'hsl(var(--muted) / 0.1)'
										: dragActive
											? 'hsl(var(--primary) / 0.05)'
											: 'hsl(0 0% 100% / 0.5)',
									opacity: !canUpload ? 0.6 : 1,
								}}
							>
								<div
									className="flex rounded-2xl"
									style={{
										height: '3.5rem',
										width: '3.5rem',
										alignItems: 'center',
										justifyContent: 'center',
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									{isUploading ? (
										<Loader2
											style={{
												height: '1.75rem',
												width: '1.75rem',
												animation: 'spin 1s linear infinite',
											}}
										/>
									) : (
										<FileSpreadsheet style={{ height: '1.75rem', width: '1.75rem' }} />
									)}
								</div>
								<h3
									className="text-base font-semibold tracking-tight"
									style={{ marginTop: '0.5rem' }}
								>
									{isUploading ? 'Upload en cours...' : 'Import CSV / Excel'}
								</h3>
								<p
									className="text-sm text-muted-foreground text-center"
									style={{ marginTop: '0.25rem', maxWidth: '20rem' }}
								>
									Glissez votre fichier ici ou cliquez pour sélectionner
								</p>
								<label htmlFor="import-file-input" style={{ marginTop: '1rem' }}>
									<input
										id="import-file-input"
										type="file"
										accept=".csv,.xlsx,.xls"
										onChange={handleFileSelect}
										style={{ display: 'none' }}
										disabled={!canUpload}
									/>
									<Button
										disabled={!canUpload}
										asChild
										iconLeft={<Upload style={{ height: '1rem', width: '1rem' }} />}
									>
										<span>Sélectionner un fichier</span>
									</Button>
								</label>
								<p className="text-xs text-muted-foreground" style={{ marginTop: '0.5rem' }}>
									.csv, .xlsx · Max 10 MB
								</p>
							</div>
						</div>
					</div>
				</GlassCard>

				{/* Stats */}
				<GlassCard padding="lg">
					<div className="flex flex-col gap-4">
						<h3 className="text-base font-semibold tracking-tight">Statistiques d&apos;import</h3>
						<StatCardGrid columns={3}>
							<StatCard label="Fichiers" value={String(imports.length)} icon={FileSpreadsheet} />
							<StatCard label="Traités" value={String(processedCount)} icon={CheckCircle2} />
							<StatCard label="Transactions" value={String(totalRecords)} icon={RefreshCw} />
						</StatCardGrid>

						{pendingCount > 0 && (
							<div
								className="rounded-lg border p-3"
								style={{
									borderColor: 'oklch(0.7 0.15 75 / 0.2)',
									backgroundColor: 'oklch(0.7 0.15 75 / 0.05)',
								}}
							>
								<div className="flex items-center gap-3" style={{ color: 'oklch(0.7 0.15 75)' }}>
									<Clock style={{ height: '1rem', width: '1rem' }} />
									<span className="text-sm font-medium">
										{pendingCount} fichier{pendingCount > 1 ? 's' : ''} en attente de traitement
									</span>
								</div>
							</div>
						)}

						<div
							style={{
								borderRadius: '0.5rem',
								padding: '1rem',
								backgroundColor: 'hsl(0 0% 100% / 0.5)',
							}}
						>
							<p className="font-medium" style={{ marginBottom: '0.5rem' }}>
								Comment ça marche ?
							</p>
							<ol
								className="text-sm text-muted-foreground"
								style={{
									listStyleType: 'decimal',
									paddingLeft: '1.25rem',
									display: 'flex',
									flexDirection: 'column',
									gap: '0.25rem',
								}}
							>
								<li>Sélectionnez la banque source</li>
								<li>Choisissez le compte cible</li>
								<li>Uploadez votre fichier CSV/Excel</li>
								<li>Le fichier brut est stocké dans le cloud</li>
								<li>Les transactions sont importées automatiquement</li>
							</ol>
						</div>
					</div>
				</GlassCard>
			</div>

			{/* Import History */}
			<GlassCard padding="lg">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<h3 className="text-base font-semibold tracking-tight">Historique des imports</h3>
						<p className="text-sm text-muted-foreground">
							Fichiers bruts stockés et leur statut de traitement
						</p>
					</div>
					<div className="flex flex-col gap-2">
						{isLoading ? (
							<div className="flex py-8" style={{ alignItems: 'center', justifyContent: 'center' }}>
								<Loader2
									style={{
										height: '1.5rem',
										width: '1.5rem',
										color: 'hsl(var(--muted-foreground))',
										animation: 'spin 1s linear infinite',
									}}
								/>
							</div>
						) : imports.length === 0 ? (
							<EmptyState
								icon={FileSpreadsheet}
								title="Aucun import"
								description="Uploadez votre premier fichier ci-dessus"
							/>
						) : (
							imports.map((imp) => (
								<ImportRow
									key={imp.id}
									imp={imp}
									getBankNameForImport={getBankNameForImport}
									onProcess={handleProcess}
									onReprocess={handleReprocess}
									onDelete={() => setDeleteImportId(imp.id)}
								/>
							))
						)}
					</div>
				</div>
			</GlassCard>

			<ConfirmDialog
				open={deleteImportId !== null}
				onOpenChange={(open) => !open && setDeleteImportId(null)}
				title="Supprimer l'import"
				description="Êtes-vous sûr de vouloir supprimer cet import ? Les transactions importées ne seront pas supprimées."
				confirmLabel="Supprimer"
				variant="destructive"
				onConfirm={confirmDeleteImport}
			/>
		</div>
	);
}

// Separate component for import row to keep code clean
interface ImportRowProps {
	imp: RawImport;
	getBankNameForImport: (bankKey: string) => string;
	onProcess: (importId: string, accountId?: string) => void;
	onReprocess: (importId: string, accountId?: string) => void;
	onDelete: () => void;
}

function ImportRow({ imp, getBankNameForImport, onProcess, onReprocess, onDelete }: ImportRowProps) {
	return (
		<div
			className="flex justify-between items-center p-4 rounded-xl transition-colors"
			style={{
				backgroundColor:
					imp.status === 'FAILED'
						? 'oklch(0.55 0.2 25 / 0.05)'
						: 'hsl(0 0% 100% / 0.5)',
				border: imp.status === 'FAILED' ? '1px solid oklch(0.55 0.2 25 / 0.2)' : 'none',
			}}
		>
			<div className="flex items-center gap-4">
				<div
					className="flex rounded-lg"
					style={{
						height: '2.5rem',
						width: '2.5rem',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor:
							imp.status === 'FAILED'
								? 'oklch(0.55 0.2 25 / 0.1)'
								: 'hsl(var(--background))',
					}}
				>
					<FileSpreadsheet
						style={{
							height: '1.25rem',
							width: '1.25rem',
							color:
								imp.status === 'FAILED'
									? 'oklch(0.55 0.2 25)'
									: 'hsl(var(--muted-foreground))',
						}}
					/>
				</div>
				<div className="flex flex-col">
					<div className="flex items-center gap-3">
						<span className="font-medium">{imp.filename}</span>
						<div
							className="flex rounded-full px-2 py-1"
							style={{
								alignItems: 'center',
								gap: '0.25rem',
								fontSize: '0.75rem',
								backgroundColor:
									imp.status === 'PROCESSED'
										? 'oklch(0.55 0.15 145 / 0.1)'
										: imp.status === 'PROCESSING'
											? 'hsl(var(--primary) / 0.1)'
											: imp.status === 'FAILED'
												? 'oklch(0.55 0.2 25 / 0.1)'
												: 'hsl(var(--muted))',
								color:
									imp.status === 'PROCESSED'
										? 'oklch(0.55 0.15 145)'
										: imp.status === 'PROCESSING'
											? 'hsl(var(--primary))'
											: imp.status === 'FAILED'
												? 'oklch(0.55 0.2 25)'
												: 'hsl(var(--muted-foreground))',
							}}
						>
							{getStatusIcon(imp.status)}
							<span>{getStatusLabel(imp.status)}</span>
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						{getBankNameForImport(imp.bankKey)}
						{imp.account && ` → ${imp.account.name}`} · {formatFileSize(imp.fileSize)} ·{' '}
						{formatDate(imp.createdAt)}
						{imp.recordsCount !== null && (
							<span style={{ color: 'oklch(0.55 0.15 145)' }}>
								{' '}
								· {imp.recordsCount} transactions
							</span>
						)}
						{imp.errorMessage && (
							<span style={{ color: 'oklch(0.55 0.2 25)' }}> · {imp.errorMessage}</span>
						)}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				{imp.status === 'PENDING' && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onProcess(imp.id, imp.account?.id)}
						iconLeft={<RefreshCw style={{ height: '1rem', width: '1rem' }} />}
					>
						Traiter
					</Button>
				)}
				{imp.status === 'PROCESSED' && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onReprocess(imp.id, imp.account?.id)}
						iconLeft={<RotateCcw style={{ height: '1rem', width: '1rem' }} />}
					>
						Retraiter
					</Button>
				)}
				{imp.status === 'FAILED' && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onProcess(imp.id, imp.account?.id)}
						iconLeft={<RefreshCw style={{ height: '1rem', width: '1rem' }} />}
					>
						Réessayer
					</Button>
				)}
				<Button
					variant="ghost"
					size="icon"
					onClick={onDelete}
					style={{
						height: '2rem',
						width: '2rem',
						color: 'hsl(var(--muted-foreground))',
					}}
				>
					<Trash2 style={{ height: '1rem', width: '1rem' }} />
				</Button>
			</div>
		</div>
	);
}
