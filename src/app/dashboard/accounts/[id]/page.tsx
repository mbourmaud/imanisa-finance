'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
	AlertCircle,
	ArrowLeft,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Clock,
	ExternalLink,
	FileSpreadsheet,
	Link as LinkIcon,
	Loader2,
	Pencil,
	RefreshCw,
	RotateCcw,
	Search,
	Trash2,
	Upload,
	Users,
	X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatMoney, formatDate, formatRelativeTime } from '@/shared/utils';

interface AccountMember {
	id: string;
	memberId: string;
	ownerShare: number;
	member: {
		id: string;
		name: string;
		color: string | null;
	};
}

interface Bank {
	id: string;
	name: string;
	logo: string | null;
	color: string;
	description: string | null;
	type: 'BANK' | 'INVESTMENT';
	parserKey: string;
}

interface Account {
	id: string;
	name: string;
	description: string | null;
	bankId: string;
	type: string;
	accountNumber: string | null;
	balance: number;
	currency: string;
	exportUrl: string | null;
	bank: Bank;
	accountMembers: AccountMember[];
	_count: {
		transactions: number;
	};
}

interface RawImport {
	id: string;
	bankKey: string;
	filename: string;
	fileSize: number;
	mimeType: string;
	status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
	errorMessage: string | null;
	recordsCount: number | null;
	skippedCount: number | null;
	processedAt: string | null;
	createdAt: string;
}

interface Transaction {
	id: string;
	date: string;
	description: string;
	amount: number;
	type: string;
	transactionCategory: {
		categoryId: string;
		category: { id: string; name: string; icon: string; color: string };
	} | null;
}

interface PaginatedTransactions {
	items: Transaction[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
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
			return 'Traite';
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

function getAccountTypeLabel(type: string): string {
	const types: Record<string, string> = {
		CHECKING: 'Compte courant',
		SAVINGS: 'Epargne',
		INVESTMENT: 'Investissement',
		LOAN: 'Pret',
	};
	return types[type] || type;
}

// Get short name from bank name (first letters of each word)
function getBankShortName(name: string): string {
	return name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase()
		.slice(0, 3);
}

export default function AccountDetailPage() {
	const params = useParams();
	const router = useRouter();
	const accountId = params.id as string;

	const [account, setAccount] = useState<Account | null>(null);
	const [imports, setImports] = useState<RawImport[]>([]);
	const [transactions, setTransactions] = useState<PaginatedTransactions | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUploading, setIsUploading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [showImports, setShowImports] = useState(true);

	// Export URL editing
	const [isEditingExportUrl, setIsEditingExportUrl] = useState(false);
	const [exportUrlInput, setExportUrlInput] = useState('');
	const [isSavingExportUrl, setIsSavingExportUrl] = useState(false);

	// Confirmation dialogs
	const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
	const [deleteImportId, setDeleteImportId] = useState<string | null>(null);

	// Fetch account data
	const fetchAccount = useCallback(async () => {
		try {
			const response = await fetch(`/api/accounts/${accountId}`);
			if (!response.ok) {
				if (response.status === 404) {
					router.push('/dashboard/accounts');
					return;
				}
				throw new Error('Failed to fetch account');
			}
			const data = await response.json();
			setAccount(data);
		} catch (err) {
			console.error('Error fetching account:', err);
			setError('Impossible de charger le compte');
		}
	}, [accountId, router]);

	// Fetch imports for this account
	const fetchImports = useCallback(async () => {
		try {
			const response = await fetch(`/api/imports?accountId=${accountId}`);
			if (response.ok) {
				const data = await response.json();
				setImports(data.items || []);
			}
		} catch (err) {
			console.error('Error fetching imports:', err);
		}
	}, [accountId]);

	// Fetch transactions for this account
	const fetchTransactions = useCallback(
		async (page = 1, search = '') => {
			try {
				const params = new URLSearchParams({
					accountId,
					page: page.toString(),
					pageSize: '20',
				});
				if (search) params.append('search', search);

				const response = await fetch(`/api/transactions?${params}`);
				if (response.ok) {
					const data = await response.json();
					setTransactions(data);
				}
			} catch (err) {
				console.error('Error fetching transactions:', err);
			}
		},
		[accountId],
	);

	// Initial data fetch
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			await Promise.all([fetchAccount(), fetchImports(), fetchTransactions(1, '')]);
			setIsLoading(false);
		};
		loadData();
	}, [fetchAccount, fetchImports, fetchTransactions]);

	// Handle search
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchTransactions(1, searchQuery);
			setCurrentPage(1);
		}, 300);
		return () => clearTimeout(timeoutId);
	}, [searchQuery, fetchTransactions]);

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		fetchTransactions(page, searchQuery);
	};

	// Handle file upload
	const handleUpload = async (file: File) => {
		if (!account) return;

		setIsUploading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('bankKey', account.bank.parserKey);
			formData.append('accountId', account.id);

			const uploadResponse = await fetch('/api/imports/upload', {
				method: 'POST',
				body: formData,
			});

			if (!uploadResponse.ok) {
				const data = await uploadResponse.json();
				throw new Error(data.error || 'Upload failed');
			}

			const uploadData = await uploadResponse.json();

			// Auto-process the import
			const processResponse = await fetch(`/api/imports/${uploadData.id}/process`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ accountId: account.id }),
			});

			if (processResponse.ok) {
				const processData = await processResponse.json();
				if (processData.skippedCount > 0) {
					setError(
						`${processData.recordsCount} transactions importees, ${processData.skippedCount} doublons ignores`,
					);
				}
			}

			// Refresh data
			await Promise.all([fetchAccount(), fetchImports(), fetchTransactions(currentPage, searchQuery)]);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed');
		} finally {
			setIsUploading(false);
		}
	};

	// Handle file selection
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleUpload(file);
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
		if (file) handleUpload(file);
	};

	// Process pending import
	const handleProcess = async (importId: string) => {
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

			await Promise.all([fetchAccount(), fetchImports(), fetchTransactions(currentPage, searchQuery)]);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Processing failed');
		}
	};

	// Reprocess import
	const handleReprocess = async (importId: string) => {
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

			await Promise.all([fetchAccount(), fetchImports(), fetchTransactions(currentPage, searchQuery)]);
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

			await fetchImports();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Delete failed');
		} finally {
			setDeleteImportId(null);
		}
	};

	// Delete account
	const confirmDeleteAccount = async () => {
		if (!account) return;

		try {
			const response = await fetch(`/api/accounts/${accountId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Delete failed');
			}

			router.push('/dashboard/banks');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossible de supprimer le compte');
		}
	};

	// Save export URL
	const saveExportUrl = async () => {
		if (!account) return;

		setIsSavingExportUrl(true);
		try {
			const response = await fetch(`/api/accounts/${accountId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ exportUrl: exportUrlInput || null }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to save');
			}

			await fetchAccount();
			setIsEditingExportUrl(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossible de sauvegarder');
		} finally {
			setIsSavingExportUrl(false);
		}
	};

	// Start editing export URL
	const startEditingExportUrl = () => {
		setExportUrlInput(account?.exportUrl || '');
		setIsEditingExportUrl(true);
	};

	// Cancel editing export URL
	const cancelEditingExportUrl = () => {
		setIsEditingExportUrl(false);
		setExportUrlInput('');
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!account) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4">
				<AlertCircle className="h-12 w-12 text-muted-foreground" />
				<p className="text-muted-foreground">Compte non trouve</p>
				<Button variant="outline" asChild>
					<Link href="/dashboard/accounts">Retour aux comptes</Link>
				</Button>
			</div>
		);
	}

	const accountImports = imports.filter((imp) => imp.bankKey === account.bank.parserKey);
	const pendingImports = accountImports.filter((imp) => imp.status === 'PENDING');

	return (
		<div className="space-y-6">
			{/* Back link */}
			<Link
				href="/dashboard/banks"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
			>
				<ArrowLeft className="h-4 w-4" />
				Retour aux banques
			</Link>

			{/* Header with subtle bank color accent */}
			<div
				className="relative rounded-xl border border-border/60 bg-card p-6"
				style={{
					borderLeftWidth: '4px',
					borderLeftColor: account.bank.color,
				}}
			>
				<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
					<div className="flex items-start gap-4">
						<div
							className="flex h-14 w-14 items-center justify-center rounded-2xl text-white font-bold text-lg shrink-0"
							style={{ backgroundColor: account.bank.color }}
						>
							{getBankShortName(account.bank.name)}
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl font-semibold tracking-tight">{account.name}</h1>
							<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
								<span>{account.bank.name}</span>
								<span className="hidden sm:inline">•</span>
								<span>{getAccountTypeLabel(account.type)}</span>
								{account.accountNumber && (
									<>
										<span className="hidden sm:inline">•</span>
										<span className="font-mono">{account.accountNumber}</span>
									</>
								)}
							</div>
							{account.description && (
								<p className="mt-2 text-sm text-muted-foreground">{account.description}</p>
							)}
						</div>
					</div>
					<div className="flex items-start gap-4 sm:text-right">
						<div>
							<p className="text-3xl font-semibold number-display">
								{formatMoney(account.balance, account.currency as 'EUR')}
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								{account._count.transactions} transaction{account._count.transactions !== 1 ? 's' : ''}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.55_0.2_25)]/10 shrink-0"
							onClick={() => setDeleteAccountOpen(true)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Error message */}
			{error && (
				<div
					className={`rounded-lg border p-4 ${
						error.includes('importees')
							? 'border-[oklch(0.55_0.15_145)]/20 bg-[oklch(0.55_0.15_145)]/5'
							: 'border-[oklch(0.55_0.2_25)]/20 bg-[oklch(0.55_0.2_25)]/5'
					}`}
				>
					<div
						className={`flex items-center gap-2 ${
							error.includes('importees')
								? 'text-[oklch(0.55_0.15_145)]'
								: 'text-[oklch(0.55_0.2_25)]'
						}`}
					>
						{error.includes('importees') ? (
							<CheckCircle2 className="h-4 w-4" />
						) : (
							<AlertCircle className="h-4 w-4" />
						)}
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

			{/* Members */}
			{account.accountMembers.length > 0 && (
				<Card className="border-border/60">
					<CardHeader className="pb-3">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-muted-foreground" />
							<CardTitle className="text-base font-medium">Titulaires</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-3">
							{account.accountMembers.map((am) => (
								<div
									key={am.id}
									className="flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1.5"
								>
									<div
										className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
										style={{ backgroundColor: am.member.color || '#6b7280' }}
									>
										{am.member.name.charAt(0).toUpperCase()}
									</div>
									<span className="text-sm font-medium">{am.member.name}</span>
									<span className="text-xs text-muted-foreground">({am.ownerShare}%)</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Export URL Section */}
			<Card className="border-border/60">
				<CardHeader className="pb-3">
					<div className="flex items-center gap-2">
						<LinkIcon className="h-4 w-4 text-muted-foreground" />
						<CardTitle className="text-base font-medium">Lien d&apos;export</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					{isEditingExportUrl ? (
						<div className="flex items-center gap-2">
							<Input
								type="url"
								value={exportUrlInput}
								onChange={(e) => setExportUrlInput(e.target.value)}
								placeholder="https://www.banque.fr/espace-client/compte"
								className="flex-1"
								autoFocus
							/>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 text-muted-foreground hover:text-[oklch(0.55_0.15_145)] hover:bg-[oklch(0.55_0.15_145)]/10"
								onClick={saveExportUrl}
								disabled={isSavingExportUrl}
							>
								{isSavingExportUrl ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Check className="h-4 w-4" />
								)}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 text-muted-foreground hover:text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.55_0.2_25)]/10"
								onClick={cancelEditingExportUrl}
								disabled={isSavingExportUrl}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : account.exportUrl ? (
						<div className="flex items-center justify-between">
							<a
								href={account.exportUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-primary hover:underline transition-colors group"
							>
								<span className="break-all">{account.exportUrl}</span>
								<ExternalLink className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100" />
							</a>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 ml-2"
								onClick={startEditingExportUrl}
							>
								<Pencil className="h-3.5 w-3.5" />
							</Button>
						</div>
					) : (
						<button
							type="button"
							onClick={startEditingExportUrl}
							className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
						>
							<Pencil className="h-3.5 w-3.5" />
							<span>Ajouter un lien d&apos;export</span>
						</button>
					)}
				</CardContent>
			</Card>

			{/* Import Section */}
			<Card className="border-border/60">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Upload className="h-4 w-4 text-muted-foreground" />
							<CardTitle className="text-base font-medium">Import</CardTitle>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 gap-1"
							onClick={() => setShowImports(!showImports)}
						>
							{showImports ? (
								<>
									<ChevronUp className="h-4 w-4" />
									Masquer
								</>
							) : (
								<>
									<ChevronDown className="h-4 w-4" />
									{accountImports.length > 0 && `${accountImports.length} imports`}
								</>
							)}
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Drop zone */}
					<div
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}
						className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
							isUploading
								? 'border-primary bg-primary/5'
								: dragActive
									? 'border-primary bg-primary/5'
									: 'border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/30'
						}`}
					>
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
							{isUploading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								<FileSpreadsheet className="h-6 w-6" />
							)}
						</div>
						<p className="mt-3 text-sm text-center text-muted-foreground">
							{isUploading
								? 'Import en cours...'
								: 'Glissez votre fichier CSV ici ou cliquez pour selectionner'}
						</p>
						<label className="mt-3 cursor-pointer">
							<input
								type="file"
								accept=".csv,.xlsx,.xls"
								onChange={handleFileSelect}
								className="hidden"
								disabled={isUploading}
							/>
							<Button size="sm" className="gap-2" disabled={isUploading} asChild>
								<span>
									<Upload className="h-4 w-4" />
									Selectionner un fichier
								</span>
							</Button>
						</label>
					</div>

					{/* Import history */}
					{showImports && accountImports.length > 0 && (
						<div className="space-y-2 pt-2">
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Historique des imports
							</p>
							{accountImports.map((imp) => (
								<div
									key={imp.id}
									className={`flex items-center justify-between rounded-lg p-3 text-sm ${
										imp.status === 'FAILED'
											? 'bg-[oklch(0.55_0.2_25)]/5 border border-[oklch(0.55_0.2_25)]/20'
											: 'bg-muted/30'
									}`}
								>
									<div className="flex items-center gap-3">
										<div
											className={`flex h-8 w-8 items-center justify-center rounded-lg ${
												imp.status === 'FAILED'
													? 'bg-[oklch(0.55_0.2_25)]/10'
													: 'bg-background'
											}`}
										>
											<FileSpreadsheet
												className={`h-4 w-4 ${
													imp.status === 'FAILED'
														? 'text-[oklch(0.55_0.2_25)]'
														: 'text-muted-foreground'
												}`}
											/>
										</div>
										<div>
											<div className="flex items-center gap-2">
												<span className="font-medium">{imp.filename}</span>
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
												{formatFileSize(imp.fileSize)} •{' '}
												{formatRelativeTime(imp.createdAt)}
												{imp.recordsCount !== null && (
													<span className="text-[oklch(0.55_0.15_145)]">
														{' '}
														• {imp.recordsCount} transactions
													</span>
												)}
												{imp.skippedCount !== null && imp.skippedCount > 0 && (
													<span className="text-muted-foreground">
														{' '}
														({imp.skippedCount} doublons)
													</span>
												)}
												{imp.errorMessage && (
													<span className="text-[oklch(0.55_0.2_25)]">
														{' '}
														• {imp.errorMessage}
													</span>
												)}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-1">
										{imp.status === 'PENDING' && (
											<Button
												variant="ghost"
												size="sm"
												className="h-7 gap-1 text-xs"
												onClick={() => handleProcess(imp.id)}
											>
												<RefreshCw className="h-3 w-3" />
												Traiter
											</Button>
										)}
										{imp.status === 'PROCESSED' && (
											<Button
												variant="ghost"
												size="sm"
												className="h-7 gap-1 text-xs"
												onClick={() => handleReprocess(imp.id)}
											>
												<RotateCcw className="h-3 w-3" />
												Retraiter
											</Button>
										)}
										{imp.status === 'FAILED' && (
											<Button
												variant="ghost"
												size="sm"
												className="h-7 gap-1 text-xs"
												onClick={() => handleProcess(imp.id)}
											>
												<RefreshCw className="h-3 w-3" />
												Reessayer
											</Button>
										)}
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-muted-foreground hover:text-[oklch(0.55_0.2_25)]"
											onClick={() => setDeleteImportId(imp.id)}
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					{pendingImports.length > 0 && (
						<div className="rounded-lg border border-[oklch(0.7_0.15_75)]/20 bg-[oklch(0.7_0.15_75)]/5 p-3">
							<div className="flex items-center gap-2 text-[oklch(0.7_0.15_75)]">
								<Clock className="h-4 w-4" />
								<span className="text-sm font-medium">
									{pendingImports.length} fichier{pendingImports.length > 1 ? 's' : ''} en
									attente de traitement
								</span>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Transactions */}
			<Card className="border-border/60">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base font-medium">Transactions</CardTitle>
						<div className="flex items-center gap-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Rechercher..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9 h-9 w-64"
								/>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{!transactions || transactions.items.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
							<p>Aucune transaction</p>
							<p className="text-sm">Importez votre premier releve ci-dessus</p>
						</div>
					) : (
						<div className="space-y-1">
							{transactions.items.map((tx) => (
								<div
									key={tx.id}
									className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/30 transition-colors"
								>
									<div className="flex items-center gap-4">
										<div className="w-20 text-sm text-muted-foreground">
											{formatDate(tx.date, 'D MMM')}
										</div>
										<div>
											<p className="font-medium">{tx.description}</p>
											{tx.transactionCategory?.category && (
												<p className="text-xs text-muted-foreground">
													{tx.transactionCategory.category.icon} {tx.transactionCategory.category.name}
												</p>
											)}
										</div>
									</div>
									<p
										className={`font-medium number-display ${
											tx.amount >= 0
												? 'text-[oklch(0.55_0.15_145)]'
												: 'text-foreground'
										}`}
									>
										{tx.amount >= 0 ? '+' : ''}
										{formatMoney(tx.amount)}
									</p>
								</div>
							))}

							{/* Pagination */}
							{transactions.totalPages > 1 && (
								<div className="flex items-center justify-between pt-4 border-t">
									<p className="text-sm text-muted-foreground">
										Page {transactions.page} sur{' '}
										{transactions.totalPages} ({transactions.total}{' '}
										transactions)
									</p>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											disabled={currentPage === 1}
											onClick={() => handlePageChange(currentPage - 1)}
										>
											Precedent
										</Button>
										<Button
											variant="outline"
											size="sm"
											disabled={currentPage === transactions.totalPages}
											onClick={() => handlePageChange(currentPage + 1)}
										>
											Suivant
										</Button>
									</div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

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
		</div>
	);
}
