'use client';

import { useCallback, useEffect, useState } from 'react';
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	FileSpreadsheet,
	Loader2,
	RefreshCw,
	RotateCcw,
	Trash2,
	Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
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
			return <CheckCircle2 className="h-4 w-4 text-[oklch(0.55_0.15_145)]" />;
		case 'PROCESSING':
			return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
		case 'FAILED':
			return <AlertCircle className="h-4 w-4 text-[oklch(0.55_0.2_25)]" />;
		default:
			return <Clock className="h-4 w-4 text-muted-foreground" />;
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
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Import</h1>
					<p className="mt-1 text-muted-foreground">
						Importez vos relevés bancaires et conservez les fichiers bruts
					</p>
				</div>
				<Button variant="outline" className="gap-2" onClick={fetchData}>
					<RefreshCw className="h-4 w-4" />
					Actualiser
				</Button>
			</div>

			{/* Error message */}
			{error && (
				<div className="rounded-lg border border-[oklch(0.55_0.2_25)]/20 bg-[oklch(0.55_0.2_25)]/5 p-4">
					<div className="flex items-center gap-2 text-[oklch(0.55_0.2_25)]">
						<AlertCircle className="h-4 w-4" />
						<span className="font-medium">{error}</span>
						<Button
							variant="ghost"
							size="sm"
							className="ml-auto h-6 px-2"
							onClick={() => setError(null)}
						>
							Fermer
						</Button>
					</div>
				</div>
			)}

			{/* Upload Section */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* CSV Import */}
				<Card className="border-border/60 overflow-hidden">
					<CardContent className="pt-6">
						<div className="space-y-4">
							{/* Bank selector */}
							<div className="space-y-2">
								<label htmlFor="import-bank-select" className="text-sm font-medium">
									1. Banque <span className="text-muted-foreground">*</span>
								</label>
								<Select value={selectedBankId} onValueChange={setSelectedBankId}>
									<SelectTrigger id="import-bank-select" className="w-full">
										<SelectValue placeholder="Sélectionner une banque..." />
									</SelectTrigger>
									<SelectContent>
										{banks.map((bank) => (
											<SelectItem key={bank.id} value={bank.id}>
												{bank.name}
												{bank.template && (
													<span className="text-muted-foreground ml-2">
														({bank.template})
													</span>
												)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{banks.length === 0 && !isLoading && (
									<p className="text-xs text-muted-foreground">
										Aucune banque configurée. Ajoutez d&apos;abord une banque dans les
										paramètres.
									</p>
								)}
							</div>

							{/* Account selector */}
							<div className="space-y-2">
								<label htmlFor="import-account-select" className="text-sm font-medium">
									2. Compte <span className="text-muted-foreground">*</span>
								</label>
								<Select
									value={selectedAccountId}
									onValueChange={setSelectedAccountId}
									disabled={!selectedBankId}
								>
									<SelectTrigger id="import-account-select" className="w-full">
										<SelectValue
											placeholder={
												selectedBankId
													? 'Sélectionner un compte...'
													: 'Sélectionnez d\'abord une banque'
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{filteredAccounts.map((account) => (
											<SelectItem key={account.id} value={account.id}>
												{account.name}
												<span className="text-muted-foreground ml-2">
													({account.type})
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{selectedBankId && filteredAccounts.length === 0 && (
									<p className="text-xs text-muted-foreground">
										Aucun compte pour cette banque. Ajoutez d&apos;abord un compte.
									</p>
								)}
							</div>

							{/* Drop zone */}
							<div className="space-y-2">
								<label htmlFor="import-file-input" className="text-sm font-medium">3. Fichier</label>
								<div
									onDragEnter={handleDrag}
									onDragLeave={handleDrag}
									onDragOver={handleDrag}
									onDrop={handleDrop}
									className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
										!canUpload
											? 'border-border/40 bg-muted/10 opacity-60'
											: dragActive
												? 'border-primary bg-primary/5'
												: 'border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/30'
									}`}
								>
									<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
										{isUploading ? (
											<Loader2 className="h-7 w-7 animate-spin" />
										) : (
											<FileSpreadsheet className="h-7 w-7" />
										)}
									</div>
									<h3 className="mt-3 text-base font-medium">
										{isUploading ? 'Upload en cours...' : 'Import CSV / Excel'}
									</h3>
									<p className="mt-1 text-center text-sm text-muted-foreground max-w-xs">
										Glissez votre fichier ici ou cliquez pour sélectionner
									</p>
									<label htmlFor="import-file-input" className="mt-4">
										<input
											id="import-file-input"
											type="file"
											accept=".csv,.xlsx,.xls"
											onChange={handleFileSelect}
											className="hidden"
											disabled={!canUpload}
										/>
										<Button className="gap-2" disabled={!canUpload} asChild>
											<span>
												<Upload className="h-4 w-4" />
												Sélectionner un fichier
											</span>
										</Button>
									</label>
									<p className="mt-2 text-xs text-muted-foreground">
										.csv, .xlsx · Max 10 MB
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Stats */}
				<Card className="border-border/60">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg font-medium">Statistiques d&apos;import</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-3 gap-3">
							<div className="text-center rounded-lg bg-muted/30 p-3">
								<p className="text-2xl font-semibold">{imports.length}</p>
								<p className="text-xs text-muted-foreground">Fichiers</p>
							</div>
							<div className="text-center rounded-lg bg-muted/30 p-3">
								<p className="text-2xl font-semibold">{processedCount}</p>
								<p className="text-xs text-muted-foreground">Traités</p>
							</div>
							<div className="text-center rounded-lg bg-muted/30 p-3">
								<p className="text-2xl font-semibold">{totalRecords}</p>
								<p className="text-xs text-muted-foreground">Transactions</p>
							</div>
						</div>

						{pendingCount > 0 && (
							<div className="rounded-lg border border-[oklch(0.7_0.15_75)]/20 bg-[oklch(0.7_0.15_75)]/5 p-3">
								<div className="flex items-center gap-2 text-[oklch(0.7_0.15_75)]">
									<Clock className="h-4 w-4" />
									<span className="text-sm font-medium">
										{pendingCount} fichier{pendingCount > 1 ? 's' : ''} en attente de
										traitement
									</span>
								</div>
							</div>
						)}

						<div className="rounded-lg bg-muted/30 p-4">
							<h4 className="font-medium mb-2">Comment ça marche ?</h4>
							<ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
								<li>Sélectionnez la banque source</li>
								<li>Choisissez le compte cible</li>
								<li>Uploadez votre fichier CSV/Excel</li>
								<li>Le fichier brut est stocké dans le cloud</li>
								<li>Les transactions sont importées automatiquement</li>
							</ol>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Import History */}
			<Card className="border-border/60">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg font-medium">Historique des imports</CardTitle>
							<p className="mt-1 text-sm text-muted-foreground">
								Fichiers bruts stockés et leur statut de traitement
							</p>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-2">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : imports.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
							<p>Aucun import pour le moment</p>
							<p className="text-sm">Uploadez votre premier fichier ci-dessus</p>
						</div>
					) : (
						imports.map((imp) => (
							<div
								key={imp.id}
								className={`flex items-center justify-between rounded-xl p-4 transition-colors ${
									imp.status === 'FAILED'
										? 'bg-[oklch(0.55_0.2_25)]/5 border border-[oklch(0.55_0.2_25)]/20'
										: 'bg-muted/30 hover:bg-muted/50'
								}`}
							>
								<div className="flex items-center gap-4">
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-lg ${
											imp.status === 'FAILED'
												? 'bg-[oklch(0.55_0.2_25)]/10'
												: 'bg-background'
										}`}
									>
										<FileSpreadsheet
											className={`h-5 w-5 ${
												imp.status === 'FAILED'
													? 'text-[oklch(0.55_0.2_25)]'
													: 'text-muted-foreground'
											}`}
										/>
									</div>
									<div>
										<div className="flex items-center gap-2">
											<p className="font-medium">{imp.filename}</p>
											<div
												className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
													imp.status === 'PROCESSED'
														? 'bg-[oklch(0.55_0.15_145)]/10 text-[oklch(0.55_0.15_145)]'
														: imp.status === 'PROCESSING'
															? 'bg-primary/10 text-primary'
															: imp.status === 'FAILED'
																? 'bg-[oklch(0.55_0.2_25)]/10 text-[oklch(0.55_0.2_25)]'
																: 'bg-muted text-muted-foreground'
												}`}
											>
												{getStatusIcon(imp.status)}
												<span>{getStatusLabel(imp.status)}</span>
											</div>
										</div>
										<p className="text-xs text-muted-foreground">
											{getBankNameForImport(imp.bankKey)}
											{imp.account && ` → ${imp.account.name}`} ·{' '}
											{formatFileSize(imp.fileSize)} · {formatDate(imp.createdAt)}
											{imp.recordsCount !== null && (
												<span className="text-[oklch(0.55_0.15_145)]">
													{' '}
													· {imp.recordsCount} transactions
												</span>
											)}
											{imp.errorMessage && (
												<span className="text-[oklch(0.55_0.2_25)]">
													{' '}
													· {imp.errorMessage}
												</span>
											)}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{imp.status === 'PENDING' && (
										<Button
											variant="outline"
											size="sm"
											className="gap-1"
											onClick={() => handleProcess(imp.id, imp.account?.id)}
										>
											<RefreshCw className="h-4 w-4" />
											Traiter
										</Button>
									)}
									{imp.status === 'PROCESSED' && (
										<Button
											variant="ghost"
											size="sm"
											className="gap-1"
											onClick={() => handleReprocess(imp.id, imp.account?.id)}
										>
											<RotateCcw className="h-4 w-4" />
											Retraiter
										</Button>
									)}
									{imp.status === 'FAILED' && (
										<Button
											variant="ghost"
											size="sm"
											className="gap-1"
											onClick={() => handleProcess(imp.id, imp.account?.id)}
										>
											<RefreshCw className="h-4 w-4" />
											Réessayer
										</Button>
									)}
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-muted-foreground hover:text-[oklch(0.55_0.2_25)]"
										onClick={() => setDeleteImportId(imp.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>

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
