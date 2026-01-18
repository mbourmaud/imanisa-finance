'use client';

import { useCallback, useEffect, useState } from 'react';
import {
	AlertCircle,
	Button,
	CheckCircle2,
	Clock,
	EmptyState,
	FileSpreadsheet,
	GlassCard,
	Grid,
	Heading,
	Label,
	Loader2,
	PageHeader,
	RefreshCw,
	RotateCcw,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StatCard,
	StatCardGrid,
	Text,
	Trash2,
	Upload,
} from '@/components';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface RawImport {
	id: string;
	bankKey: string;
	filename: string;
	fileSize: number;
	mimeType: string;
	status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
	errorMessage: string | null;
	recordsCount: number | null;
	account: { id: string; name: string } | null;
	processedAt: string | null;
	createdAt: string;
}

interface Bank {
	id: string;
	name: string;
	template: string | null;
	accountCount: number;
}

interface Account {
	id: string;
	name: string;
	bankId: string;
	bankName: string;
	type: string;
	balance: number;
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
	const [imports, setImports] = useState<RawImport[]>([]);
	const [banks, setBanks] = useState<Bank[]>([]);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isUploading, setIsUploading] = useState(false);
	const [selectedBankId, setSelectedBankId] = useState<string>('');
	const [selectedAccountId, setSelectedAccountId] = useState<string>('');
	const [dragActive, setDragActive] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [deleteImportId, setDeleteImportId] = useState<string | null>(null);

	// Get accounts filtered by selected bank
	const filteredAccounts = selectedBankId
		? accounts.filter((acc) => acc.bankId === selectedBankId)
		: [];

	// Get selected bank info
	const selectedBank = banks.find((b) => b.id === selectedBankId);

	// Fetch data
	const fetchData = useCallback(async () => {
		try {
			const [importsRes, banksRes, accountsRes] = await Promise.all([
				fetch('/api/imports'),
				fetch('/api/banks'),
				fetch('/api/accounts'),
			]);

			if (importsRes.ok) {
				const data = await importsRes.json();
				setImports(data.items || []);
			}

			if (banksRes.ok) {
				const data = await banksRes.json();
				setBanks(data.banks || []);
			}

			if (accountsRes.ok) {
				const data = await accountsRes.json();
				setAccounts(data || []);
			}
		} catch (err) {
			console.error('Failed to fetch data:', err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Reset account selection when bank changes
	useEffect(() => {
		setSelectedAccountId('');
	}, []);

	// Handle file upload
	const handleUpload = async (file: File) => {
		if (!selectedBankId) {
			setError('Veuillez sélectionner une banque');
			return;
		}

		if (!selectedAccountId) {
			setError('Veuillez sélectionner un compte');
			return;
		}

		setIsUploading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('file', file);
			// Use bank template as bankKey, or bank name if no template
			formData.append('bankKey', selectedBank?.template || selectedBank?.name || 'other');
			formData.append('accountId', selectedAccountId);

			const response = await fetch('/api/imports/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Upload failed');
			}

			// Refresh imports list
			await fetchData();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed');
		} finally {
			setIsUploading(false);
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
		try {
			const response = await fetch(`/api/imports/${importId}/process`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ accountId }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Processing failed');
			}

			await fetchData();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Processing failed');
		}
	};

	// Reprocess import
	const handleReprocess = async (importId: string, accountId?: string) => {
		try {
			const response = await fetch(`/api/imports/${importId}/reprocess`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ accountId }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Reprocessing failed');
			}

			await fetchData();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Reprocessing failed');
		}
	};

	// Delete import
	const confirmDeleteImport = async () => {
		if (!deleteImportId) return;

		try {
			const response = await fetch(`/api/imports/${deleteImportId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Delete failed');
			}

			await fetchData();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Delete failed');
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

	return (
		<div className="flex flex-col gap-8">
			{/* Header */}
			<PageHeader
				title="Import"
				description="Importez vos relevés bancaires et conservez les fichiers bruts"
				actions={
					<Button
						variant="outline"
						onClick={fetchData}
						iconLeft={<RefreshCw style={{ height: '1rem', width: '1rem' }} />}
					>
						Actualiser
					</Button>
				}
			/>

			{/* Error message */}
			{error && (
				<div
					className="rounded-lg border p-4"
					style={{
						borderColor: 'oklch(0.55 0.2 25 / 0.2)',
						backgroundColor: 'oklch(0.55 0.2 25 / 0.05)',
					}}
				>
					<div className="flex items-center gap-3" style={{ color: 'oklch(0.55 0.2 25)' }}>
						<AlertCircle style={{ height: '1rem', width: '1rem' }} />
						<Text weight="medium">{error}</Text>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setError(null)}
							style={{ marginLeft: 'auto', height: '1.5rem', padding: '0 0.5rem' }}
						>
							Fermer
						</Button>
					</div>
				</div>
			)}

			{/* Upload Section */}
			<Grid cols={2} gap="lg">
				{/* CSV Import */}
				<GlassCard padding="lg">
					<div className="flex flex-col gap-4">
						{/* Bank selector */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="import-bank-select">
								1. Banque{' '}
								<Text as="span" color="muted">
									*
								</Text>
							</Label>
							<Select value={selectedBankId} onValueChange={setSelectedBankId}>
								<SelectTrigger id="import-bank-select" style={{ width: '100%' }}>
									<SelectValue placeholder="Sélectionner une banque..." />
								</SelectTrigger>
								<SelectContent>
									{banks.map((bank) => (
										<SelectItem key={bank.id} value={bank.id}>
											{bank.name}
											{bank.template && (
												<Text as="span" color="muted" style={{ marginLeft: '0.5rem' }}>
													({bank.template})
												</Text>
											)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{banks.length === 0 && !isLoading && (
								<Text size="xs" color="muted">
									Aucune banque configurée. Ajoutez d&apos;abord une banque dans les paramètres.
								</Text>
							)}
						</div>

						{/* Account selector */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="import-account-select">
								2. Compte{' '}
								<Text as="span" color="muted">
									*
								</Text>
							</Label>
							<Select
								value={selectedAccountId}
								onValueChange={setSelectedAccountId}
								disabled={!selectedBankId}
							>
								<SelectTrigger id="import-account-select" style={{ width: '100%' }}>
									<SelectValue
										placeholder={
											selectedBankId
												? 'Sélectionner un compte...'
												: "Sélectionnez d'abord une banque"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{filteredAccounts.map((account) => (
										<SelectItem key={account.id} value={account.id}>
											{account.name}
											<Text as="span" color="muted" style={{ marginLeft: '0.5rem' }}>
												({account.type})
											</Text>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{selectedBankId && filteredAccounts.length === 0 && (
								<Text size="xs" color="muted">
									Aucun compte pour cette banque. Ajoutez d&apos;abord un compte.
								</Text>
							)}
						</div>

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
								<Heading level={3} size="md" style={{ marginTop: '0.5rem' }}>
									{isUploading ? 'Upload en cours...' : 'Import CSV / Excel'}
								</Heading>
								<Text
									size="sm"
									color="muted"
									align="center"
									style={{ marginTop: '0.25rem', maxWidth: '20rem' }}
								>
									Glissez votre fichier ici ou cliquez pour sélectionner
								</Text>
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
								<Text size="xs" color="muted" style={{ marginTop: '0.5rem' }}>
									.csv, .xlsx · Max 10 MB
								</Text>
							</div>
						</div>
					</div>
				</GlassCard>

				{/* Stats */}
				<GlassCard padding="lg">
					<div className="flex flex-col gap-4">
						<Heading level={3} size="md">
							Statistiques d&apos;import
						</Heading>
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
									<Text size="sm" weight="medium">
										{pendingCount} fichier{pendingCount > 1 ? 's' : ''} en attente de traitement
									</Text>
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
							<Text weight="medium" style={{ marginBottom: '0.5rem' }}>
								Comment ça marche ?
							</Text>
							<ol
								style={{
									listStyleType: 'decimal',
									paddingLeft: '1.25rem',
									display: 'flex',
									flexDirection: 'column',
									gap: '0.25rem',
								}}
							>
								<li>
									<Text size="sm" color="muted">
										Sélectionnez la banque source
									</Text>
								</li>
								<li>
									<Text size="sm" color="muted">
										Choisissez le compte cible
									</Text>
								</li>
								<li>
									<Text size="sm" color="muted">
										Uploadez votre fichier CSV/Excel
									</Text>
								</li>
								<li>
									<Text size="sm" color="muted">
										Le fichier brut est stocké dans le cloud
									</Text>
								</li>
								<li>
									<Text size="sm" color="muted">
										Les transactions sont importées automatiquement
									</Text>
								</li>
							</ol>
						</div>
					</div>
				</GlassCard>
			</Grid>

			{/* Import History */}
			<GlassCard padding="lg">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Heading level={3} size="md">
							Historique des imports
						</Heading>
						<Text size="sm" color="muted">
							Fichiers bruts stockés et leur statut de traitement
						</Text>
					</div>
					<div className="flex flex-col gap-2">
						{isLoading ? (
							<div
								className="flex py-8"
								style={{ alignItems: 'center', justifyContent: 'center' }}
							>
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
								<div
									key={imp.id}
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
												<Text weight="medium">{imp.filename}</Text>
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
											<Text size="xs" color="muted">
												{getBankNameForImport(imp.bankKey)}
												{imp.account && ` → ${imp.account.name}`} · {formatFileSize(imp.fileSize)} ·{' '}
												{formatDate(imp.createdAt)}
												{imp.recordsCount !== null && (
													<Text as="span" style={{ color: 'oklch(0.55 0.15 145)' }}>
														{' '}
														· {imp.recordsCount} transactions
													</Text>
												)}
												{imp.errorMessage && (
													<Text as="span" style={{ color: 'oklch(0.55 0.2 25)' }}>
														{' '}
														· {imp.errorMessage}
													</Text>
												)}
											</Text>
										</div>
									</div>
									<div className="flex items-center gap-3">
										{imp.status === 'PENDING' && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleProcess(imp.id, imp.account?.id)}
												iconLeft={<RefreshCw style={{ height: '1rem', width: '1rem' }} />}
											>
												Traiter
											</Button>
										)}
										{imp.status === 'PROCESSED' && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleReprocess(imp.id, imp.account?.id)}
												iconLeft={<RotateCcw style={{ height: '1rem', width: '1rem' }} />}
											>
												Retraiter
											</Button>
										)}
										{imp.status === 'FAILED' && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleProcess(imp.id, imp.account?.id)}
												iconLeft={<RefreshCw style={{ height: '1rem', width: '1rem' }} />}
											>
												Réessayer
											</Button>
										)}
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setDeleteImportId(imp.id)}
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
