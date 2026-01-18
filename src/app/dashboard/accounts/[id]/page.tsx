'use client';

/**
 * Account Detail Page
 *
 * Uses TanStack Query for data fetching and mutations.
 * Supports infinite scroll for transactions, import management, and account settings.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
	AlertCircle,
	ArrowLeft,
	Check,
	CheckCircle2,
	Clock,
	ExternalLink,
	FileSpreadsheet,
	Loader2,
	Pencil,
	Plus,
	RefreshCw,
	RotateCcw,
	Search,
	Settings,
	Trash2,
	Upload,
	X,
} from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import { VStack, HStack } from '@/components/ui/stack';
import { Flex } from '@/components/ui/flex';
import { Text, Heading } from '@/components/ui/typography';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from '@/components/ui/sheet';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatDate, formatRelativeTime } from '@/shared/utils';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { MemberAvatarGroup } from '@/components/members/MemberAvatar';
import { AccountTypeBadge } from '@/components/accounts/AccountCard';
import { EmptyState } from '@/components/ui/empty-state';

// TanStack Query hooks
import {
	useAccountQuery,
	useUpdateAccountMutation,
	useDeleteAccountMutation,
	useSyncAccountMutation,
	useAddAccountMemberMutation,
	useRemoveAccountMemberMutation,
} from '@/features/accounts';
import {
	useImportsQuery,
	useUploadImportMutation,
	useProcessImportMutation,
	useReprocessImportMutation,
	useDeleteImportMutation,
} from '@/features/imports';
import { useMembersQuery } from '@/features/members';
import { useTransactionsQuery } from '@/features/transactions/hooks/use-transactions-query';

// Types for data returned by API (more complete than domain types)
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

interface AccountDetail {
	id: string;
	name: string;
	description: string | null;
	bankId: string;
	type: string;
	accountNumber: string | null;
	balance: number;
	initialBalance: number;
	initialBalanceDate: string | null;
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

	// ===== TanStack Query Hooks =====
	const {
		data: account,
		isLoading: isLoadingAccount,
		isError: isAccountError,
	} = useAccountQuery(accountId) as {
		data: AccountDetail | undefined;
		isLoading: boolean;
		isError: boolean;
	};

	const { data: imports = [] } = useImportsQuery({ accountId }) as {
		data: RawImport[] | undefined;
	};

	const { data: allMembers = [] } = useMembersQuery();

	// Transactions with pagination
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 30;

	const {
		data: transactionsData,
		isLoading: isLoadingTransactions,
		isFetching: isFetchingTransactions,
	} = useTransactionsQuery(
		{ accountId, search: searchQuery || undefined },
		{ page: currentPage, pageSize }
	);

	// ===== Mutations =====
	const updateAccountMutation = useUpdateAccountMutation();
	const deleteAccountMutation = useDeleteAccountMutation();
	const syncAccountMutation = useSyncAccountMutation();
	const addMemberMutation = useAddAccountMemberMutation();
	const removeMemberMutation = useRemoveAccountMemberMutation();
	const uploadImportMutation = useUploadImportMutation();
	const processImportMutation = useProcessImportMutation();
	const reprocessImportMutation = useReprocessImportMutation();
	const deleteImportMutation = useDeleteImportMutation();

	// ===== Local UI State =====
	const [showSettings, setShowSettings] = useState(false);
	const [showAllImports, setShowAllImports] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Edit states (inline editing in settings)
	const [editName, setEditName] = useState('');
	const [editDescription, setEditDescription] = useState('');
	const [editAccountNumber, setEditAccountNumber] = useState('');
	const [exportUrlInput, setExportUrlInput] = useState('');
	const [editInitialBalance, setEditInitialBalance] = useState('');
	const [editInitialBalanceDate, setEditInitialBalanceDate] = useState('');

	// Edit drawer
	const [isEditingAccount, setIsEditingAccount] = useState(false);

	// Confirmation dialogs
	const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
	const [deleteImportId, setDeleteImportId] = useState<string | null>(null);

	// Members dropdown
	const [showMemberDropdown, setShowMemberDropdown] = useState(false);

	// Infinite scroll refs
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	// Transaction type matching API response
	interface ApiTransaction {
		id: string;
		date: string;
		description: string;
		amount: number;
		type: string;
		transactionCategory?: {
			categoryId: string;
			category: { id: string; name: string; icon: string; color: string };
		} | null;
	}

	// Accumulated transactions for infinite scroll
	const [allTransactions, setAllTransactions] = useState<ApiTransaction[]>([]);

	// Track total and hasMore
	const totalTransactions = transactionsData?.total ?? 0;
	const hasMore = currentPage < (transactionsData?.totalPages ?? 0);

	// Update accumulated transactions when new data arrives
	useEffect(() => {
		if (transactionsData?.items) {
			// Cast items to ApiTransaction since the API returns them with transactionCategory
			const items = transactionsData.items as unknown as ApiTransaction[];
			if (currentPage === 1) {
				setAllTransactions(items);
			} else {
				setAllTransactions((prev) => {
					const existingIds = new Set(prev.map((t) => t.id));
					const newItems = items.filter((t) => !existingIds.has(t.id));
					return [...prev, ...newItems];
				});
			}
		}
	}, [transactionsData?.items, currentPage]);

	// Reset transactions when search changes
	useEffect(() => {
		setCurrentPage(1);
		setAllTransactions([]);
	}, []);

	// Infinite scroll observer
	const loadMore = useCallback(() => {
		if (!isFetchingTransactions && hasMore) {
			setCurrentPage((prev) => prev + 1);
		}
	}, [isFetchingTransactions, hasMore]);

	useEffect(() => {
		const currentRef = loadMoreRef.current;
		if (!currentRef || allTransactions.length === 0 || !hasMore) return;

		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		observerRef.current = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting && !isFetchingTransactions) {
					loadMore();
				}
			},
			{ threshold: 0.1, rootMargin: '100px' }
		);

		observerRef.current.observe(currentRef);

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [allTransactions.length, hasMore, isFetchingTransactions, loadMore]);

	// ===== Handlers =====
	const handleUpload = async (file: File) => {
		if (!account) return;

		setError(null);
		try {
			const result = await uploadImportMutation.mutateAsync({
				file,
				bankKey: account.bank.parserKey,
				accountId: account.id,
			});

			if (result.process.skippedCount > 0) {
				setError(
					`${result.process.recordsCount} transactions importées, ${result.process.skippedCount} doublons ignorés`
				);
			}

			// Reset transactions to reload
			setCurrentPage(1);
			setAllTransactions([]);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed');
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleUpload(file);
		e.target.value = '';
	};

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

	const handleProcess = async (importId: string) => {
		try {
			await processImportMutation.mutateAsync({ importId, accountId });
			setCurrentPage(1);
			setAllTransactions([]);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Processing failed');
		}
	};

	const handleReprocess = async (importId: string) => {
		try {
			await reprocessImportMutation.mutateAsync({ importId, accountId });
			setCurrentPage(1);
			setAllTransactions([]);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Reprocessing failed');
		}
	};

	const confirmDeleteImport = async () => {
		if (!deleteImportId) return;
		try {
			await deleteImportMutation.mutateAsync({ importId: deleteImportId, accountId });
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Delete failed');
		} finally {
			setDeleteImportId(null);
		}
	};

	const confirmDeleteAccount = async () => {
		if (!account) return;
		try {
			await deleteAccountMutation.mutateAsync(accountId);
			router.push('/dashboard/banks');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossible de supprimer le compte');
		}
	};

	const addMemberToAccount = async (memberId: string) => {
		setShowMemberDropdown(false);
		try {
			await addMemberMutation.mutateAsync({ accountId, memberId, ownerShare: 100 });
		} catch (err) {
			console.error('Error adding member:', err);
		}
	};

	const removeMemberFromAccount = async (memberId: string) => {
		try {
			await removeMemberMutation.mutateAsync({ accountId, memberId });
		} catch (err) {
			console.error('Error removing member:', err);
		}
	};

	// Save functions for inline editing
	const saveAccountDetails = async () => {
		if (!account) return;
		const name = editName || account.name;
		if (!name.trim()) return;

		try {
			await updateAccountMutation.mutateAsync({
				id: accountId,
				input: {
					name: name.trim(),
					description: (editDescription !== '' ? editDescription : account.description)?.trim() || undefined,
					accountNumber: (editAccountNumber !== '' ? editAccountNumber : account.accountNumber)?.trim() || undefined,
				},
			});
			setIsEditingAccount(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossible de sauvegarder');
		}
	};

	const saveExportUrl = async () => {
		if (!account) return;
		const urlValue = exportUrlInput !== '' ? exportUrlInput : account.exportUrl || '';
		if (urlValue === (account.exportUrl || '')) return;

		try {
			await updateAccountMutation.mutateAsync({
				id: accountId,
				input: { exportUrl: urlValue || undefined },
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossible de sauvegarder');
		}
	};

	const saveInitialBalance = async () => {
		if (!account) return;

		const balanceStr = editInitialBalance !== '' ? editInitialBalance : account.initialBalance?.toString() || '0';
		const balanceValue = parseFloat(balanceStr.replace(',', '.'));
		if (Number.isNaN(balanceValue)) {
			setError('Montant invalide');
			return;
		}

		const dateValue = editInitialBalanceDate || (account.initialBalanceDate ? new Date(account.initialBalanceDate).toISOString().split('T')[0] : '');

		try {
			await updateAccountMutation.mutateAsync({
				id: accountId,
				input: {
					initialBalance: balanceValue,
					initialBalanceDate: dateValue ? new Date(dateValue).toISOString() : undefined,
				},
			});
			// Sync balance
			await syncAccountMutation.mutateAsync(accountId);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossible de sauvegarder');
		}
	};

	const startEditingAccount = () => {
		if (!account) return;
		setEditName(account.name);
		setEditDescription(account.description || '');
		setEditAccountNumber(account.accountNumber || '');
		setIsEditingAccount(true);
	};

	const cancelEditingAccount = () => {
		setIsEditingAccount(false);
		setEditName('');
		setEditDescription('');
		setEditAccountNumber('');
	};

	// ===== Computed values =====
	const accountImports = imports ?? [];
	const isUploading = uploadImportMutation.isPending;
	const isLoadingMore = isFetchingTransactions && currentPage > 1;

	// Members not yet added to account
	const availableMembers = useMemo(() => {
		if (!account) return [];
		return (allMembers ?? []).filter(
			(m) => !account.accountMembers.some((am) => am.memberId === m.id)
		);
	}, [allMembers, account]);

	// ===== Render =====
	if (isLoadingAccount) {
		return (
			<EmptyState
				title="Chargement du compte..."
				iconElement={
					<div className="relative">
						<div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
						<Loader2 className="h-6 w-6 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
					</div>
				}
				size="md"
			/>
		);
	}

	if (isAccountError || !account) {
		return (
			<EmptyState
				icon={AlertCircle}
				title="Compte introuvable"
				description="Ce compte n'existe pas ou a été supprimé"
				size="md"
				action={
					<Button variant="outline" className="gap-2" asChild>
						<Link href="/dashboard/accounts">
							<ArrowLeft className="h-4 w-4" />
							Retour aux comptes
						</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Back link */}
			<Link
				href="/dashboard/banks"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 group"
			>
				<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
				Retour aux banques
			</Link>

			{/* Header - Glassmorphism card */}
			<div className="glass-card p-6 sm:p-8 hover-shine">
				{/* Gradient accent bar */}
				<div
					className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
					style={{
						background: `linear-gradient(90deg, ${account.bank.color}, ${account.bank.color}88, transparent)`
					}}
				/>

				<div className="flex items-start gap-5">
					{/* Bank logo with glow */}
					<div className="relative group/logo shrink-0">
						<div
							className="absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover/logo:opacity-60 transition-opacity"
							style={{ backgroundColor: account.bank.color }}
						/>
						<div
							className="relative flex h-16 w-16 items-center justify-center rounded-2xl text-white font-bold text-lg shadow-lg transition-transform hover:scale-105"
							style={{
								background: `linear-gradient(135deg, ${account.bank.color}, ${account.bank.color}dd)`
							}}
						>
							{getBankShortName(account.bank.name)}
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						{/* Top row: Name + Balance + Actions */}
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<div className="flex items-center gap-3">
									<h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{account.name}</h1>
									<Button
										variant="ghost"
										size="icon"
										className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10 shrink-0 transition-all"
										onClick={startEditingAccount}
									>
										<Pencil className="h-4 w-4" />
									</Button>
								</div>
							</div>

							{/* Balance + Actions */}
							<div className="flex items-center gap-4 shrink-0">
								<div className="text-right">
									<MoneyDisplay
										amount={account.balance}
										currency={account.currency as 'EUR'}
										size="2xl"
										weight="bold"
										className="tracking-tight sm:text-4xl"
									/>
									<p className="text-xs text-muted-foreground mt-1 font-medium">
										{account._count.transactions} transaction{account._count.transactions !== 1 ? 's' : ''}
									</p>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										className="h-10 w-10 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-white/20 shadow-sm transition-all hover:scale-105"
										onClick={() => setShowSettings(true)}
									>
										<Settings className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-10 w-10 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-[oklch(0.55_0.2_25)]/10 border border-white/20 shadow-sm text-muted-foreground hover:text-[oklch(0.55_0.2_25)] transition-all hover:scale-105"
										onClick={() => setDeleteAccountOpen(true)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>

						{/* Bottom row: Bank info + Members */}
						<div className="flex flex-wrap items-center gap-2 mt-3">
							<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/60 dark:bg-white/10 text-muted-foreground">
								{account.bank.name}
							</span>
							<AccountTypeBadge
								type={account.type as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN'}
								className="bg-white/60 dark:bg-white/10 rounded-full px-3 py-1"
							/>
							{account.accountNumber && (
								<span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/60 dark:bg-white/10 text-muted-foreground">
									{account.accountNumber}
								</span>
							)}
							{/* Members */}
							{account.accountMembers.length > 0 && (
								<>
									<span className="text-muted-foreground/40">•</span>
									<div className="flex items-center gap-2">
										<MemberAvatarGroup
											members={account.accountMembers.map((am) => ({
												id: am.memberId,
												name: am.member.name,
												color: am.member.color,
											}))}
											size="sm"
											max={5}
										/>
										<span className="text-xs text-muted-foreground hidden sm:inline font-medium">
											{account.accountMembers.map((am) => am.member.name).join(', ')}
										</span>
									</div>
								</>
							)}
						</div>
						{account.description && (
							<p className="text-sm text-muted-foreground mt-3 hidden sm:block">{account.description}</p>
						)}
					</div>
				</div>
			</div>

			{/* Account Edit Drawer */}
			<Sheet open={isEditingAccount} onOpenChange={setIsEditingAccount}>
				<SheetContent side="right" className="w-full sm:w-[420px] sm:max-w-[90vw] overflow-y-auto border-l border-white/20 bg-gradient-to-b from-background to-background/95">
					<SheetHeader className="pb-6">
						<SheetTitle className="text-xl font-bold">Modifier le compte</SheetTitle>
						<SheetDescription>
							Modifiez les informations du compte.
						</SheetDescription>
					</SheetHeader>

					<div className="space-y-6">
						{/* Bank logo centered with glow */}
						<div className="relative w-fit mx-auto">
							<div
								className="absolute inset-0 rounded-2xl blur-xl opacity-50"
								style={{ backgroundColor: account.bank.color }}
							/>
							<div
								className="relative flex h-16 w-16 items-center justify-center rounded-2xl text-white font-bold text-lg shadow-lg"
								style={{ background: `linear-gradient(135deg, ${account.bank.color}, ${account.bank.color}dd)` }}
							>
								{getBankShortName(account.bank.name)}
							</div>
						</div>

						<div className="space-y-5">
							<div className="space-y-2">
								<label htmlFor="edit-account-name" className="text-sm font-semibold text-foreground">
									Nom du compte
								</label>
								<Input
									id="edit-account-name"
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									placeholder="Ex: Compte Joint"
									className="h-12 text-base rounded-xl bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10 focus:border-primary/50"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="edit-account-number" className="text-sm font-semibold text-foreground">
									Numéro de compte
									<span className="text-muted-foreground font-normal ml-1">(optionnel)</span>
								</label>
								<Input
									id="edit-account-number"
									value={editAccountNumber}
									onChange={(e) => setEditAccountNumber(e.target.value)}
									placeholder="Ex: FR76 1234 5678 9012"
									className="h-12 font-mono rounded-xl bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10 focus:border-primary/50"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="edit-account-description" className="text-sm font-semibold text-foreground">
									Description
									<span className="text-muted-foreground font-normal ml-1">(optionnel)</span>
								</label>
								<Input
									id="edit-account-description"
									value={editDescription}
									onChange={(e) => setEditDescription(e.target.value)}
									placeholder="Ex: Compte pour les dépenses courantes"
									className="h-12 rounded-xl bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10 focus:border-primary/50"
								/>
							</div>
						</div>

						<div className="flex gap-3 pt-4">
							<Button
								variant="outline"
								className="flex-1 h-12 rounded-xl border-white/20 hover:bg-white/50 dark:hover:bg-white/5"
								onClick={cancelEditingAccount}
								disabled={updateAccountMutation.isPending}
							>
								Annuler
							</Button>
							<Button
								className="flex-1 h-12 rounded-xl shadow-md hover:shadow-lg transition-all"
								onClick={saveAccountDetails}
								disabled={updateAccountMutation.isPending || !editName.trim()}
							>
								{updateAccountMutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								) : (
									<Check className="h-4 w-4 mr-2" />
								)}
								Enregistrer
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* Error/Success message - floating toast style */}
			{error && (
				<div
					className={`fixed bottom-6 right-6 z-50 max-w-md animate-fade-in rounded-2xl p-4 shadow-xl ${
						error.includes('importées')
							? 'bg-[oklch(0.55_0.15_145)]/10 border border-[oklch(0.55_0.15_145)]/20'
							: 'bg-[oklch(0.55_0.2_25)]/10 border border-[oklch(0.55_0.2_25)]/20'
					}`}
					style={{
						backdropFilter: 'blur(16px)',
						WebkitBackdropFilter: 'blur(16px)'
					}}
				>
					<div className="flex items-start gap-3">
						<div className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${
							error.includes('importées')
								? 'bg-[oklch(0.55_0.15_145)]/20'
								: 'bg-[oklch(0.55_0.2_25)]/20'
						}`}>
							{error.includes('importées') ? (
								<CheckCircle2 className="h-4 w-4 text-[oklch(0.55_0.15_145)]" />
							) : (
								<AlertCircle className="h-4 w-4 text-[oklch(0.55_0.2_25)]" />
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className={`text-sm font-semibold ${
								error.includes('importées')
									? 'text-[oklch(0.55_0.15_145)]'
									: 'text-[oklch(0.55_0.2_25)]'
							}`}>
								{error.includes('importées') ? 'Import réussi' : 'Erreur'}
							</p>
							<p className="text-sm text-foreground/80 mt-0.5">{error}</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="shrink-0 h-8 w-8 rounded-lg hover:bg-white/20"
							onClick={() => setError(null)}
						>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<title>Fermer</title>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</Button>
					</div>
				</div>
			)}

			{/* Settings Drawer - 33% width on desktop */}
			<Sheet open={showSettings} onOpenChange={setShowSettings}>
				<SheetContent side="right" className="w-full sm:w-[33vw] sm:min-w-[400px] sm:max-w-[500px] overflow-y-auto bg-background border-l p-0">
					{/* Header */}
					<div className="px-5 py-4 border-b">
						<SheetHeader>
							<SheetTitle className="text-base font-semibold">Paramètres</SheetTitle>
							<SheetDescription className="text-xs">
								Informations et historique du compte
							</SheetDescription>
						</SheetHeader>
					</div>

					<div className="divide-y">
						{/* Section 1: Informations */}
						<div className="px-5 py-5 space-y-5">
							<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Informations</h3>

							{/* Account name */}
							<div className="space-y-1.5">
								<label htmlFor="settings-account-name" className="text-sm text-muted-foreground">Nom du compte</label>
								<Input
									id="settings-account-name"
									value={editName || account.name}
									onChange={(e) => setEditName(e.target.value)}
									onBlur={() => {
										if (editName && editName !== account.name) {
											saveAccountDetails();
										}
									}}
									onFocus={() => {
										if (!editName) setEditName(account.name);
									}}
									className="h-10 text-sm font-medium"
									placeholder="Nom du compte"
								/>
							</div>

							{/* Description */}
							<div className="space-y-1.5">
								<label htmlFor="settings-account-description" className="text-sm text-muted-foreground">Description</label>
								<Input
									id="settings-account-description"
									value={editDescription !== '' ? editDescription : (account.description || '')}
									onChange={(e) => setEditDescription(e.target.value)}
									onBlur={() => {
										if (editDescription !== (account.description || '')) {
											saveAccountDetails();
										}
									}}
									onFocus={() => {
										if (editDescription === '') setEditDescription(account.description || '');
									}}
									className="h-10 text-sm"
									placeholder="Description (optionnel)"
								/>
							</div>

							{/* Owners - Multi-select */}
							<div className="space-y-1.5">
								<span className="text-sm text-muted-foreground">Titulaires</span>
								<div className="min-h-[42px] p-2 rounded-md border bg-background flex flex-wrap gap-2 items-center">
									{account.accountMembers.map((am) => (
										<div
											key={am.id}
											className={`inline-flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-md bg-muted text-sm transition-opacity ${
												removeMemberMutation.isPending && removeMemberMutation.variables?.memberId === am.memberId ? 'opacity-50' : ''
											}`}
										>
											<div
												className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-medium"
												style={{ backgroundColor: am.member.color || '#6b7280' }}
											>
												{removeMemberMutation.isPending && removeMemberMutation.variables?.memberId === am.memberId ? (
													<Loader2 className="h-3 w-3 animate-spin" />
												) : (
													am.member.name.charAt(0).toUpperCase()
												)}
											</div>
											<span className="font-medium">{am.member.name}</span>
											<button
												type="button"
												onClick={() => removeMemberFromAccount(am.memberId)}
												disabled={removeMemberMutation.isPending || addMemberMutation.isPending}
												className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted-foreground/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<X className="h-3 w-3" />
											</button>
										</div>
									))}
									{/* Loading indicator when adding */}
									{addMemberMutation.isPending && addMemberMutation.variables && (
										<div className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-md bg-muted/50 text-sm animate-pulse">
											<div
												className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-medium"
												style={{ backgroundColor: allMembers?.find(m => m.id === addMemberMutation.variables?.memberId)?.color || '#6b7280' }}
											>
												<Loader2 className="h-3 w-3 animate-spin" />
											</div>
											<span className="font-medium text-muted-foreground">
												{allMembers?.find(m => m.id === addMemberMutation.variables?.memberId)?.name}
											</span>
										</div>
									)}
									{/* Add member button */}
									<div className="relative">
										<button
											type="button"
											onClick={() => setShowMemberDropdown(!showMemberDropdown)}
											disabled={addMemberMutation.isPending || removeMemberMutation.isPending}
											className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<Plus className="h-4 w-4" />
											Ajouter
										</button>
										{showMemberDropdown && (
											<div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] rounded-md border bg-popover p-1 shadow-md">
												{availableMembers.map((member) => (
													<button
														key={member.id}
														type="button"
														onClick={() => addMemberToAccount(member.id)}
														className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm hover:bg-muted transition-colors text-left"
													>
														<div
															className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-medium"
															style={{ backgroundColor: member.color || '#6b7280' }}
														>
															{member.name.charAt(0).toUpperCase()}
														</div>
														<span>{member.name}</span>
													</button>
												))}
												{availableMembers.length === 0 && (
													<p className="px-2 py-1.5 text-sm text-muted-foreground">Tous les membres sont ajoutés</p>
												)}
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Export URL */}
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<label htmlFor="settings-export-url" className="text-sm text-muted-foreground">Lien d&apos;export banque</label>
									{account.exportUrl && (
										<a
											href={account.exportUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-primary hover:underline inline-flex items-center gap-1"
										>
											Ouvrir <ExternalLink className="h-3 w-3" />
										</a>
									)}
								</div>
								<Input
									id="settings-export-url"
									type="url"
									value={exportUrlInput !== '' ? exportUrlInput : (account.exportUrl || '')}
									onChange={(e) => setExportUrlInput(e.target.value)}
									onBlur={() => {
										const currentValue = exportUrlInput !== '' ? exportUrlInput : (account.exportUrl || '');
										if (currentValue !== (account.exportUrl || '')) {
											saveExportUrl();
										}
									}}
									onFocus={() => {
										if (exportUrlInput === '') setExportUrlInput(account.exportUrl || '');
									}}
									placeholder="https://www.banque.fr/espace-client"
									className="h-10 text-sm"
								/>
							</div>

							{/* Initial Balance */}
							<div className="space-y-1.5">
								<span className="text-sm text-muted-foreground">Solde initial</span>
								<div className="grid grid-cols-2 gap-2">
									<div className="relative">
										<Input
											type="text"
											value={editInitialBalance !== '' ? editInitialBalance : (account.initialBalance?.toString() || '0')}
											onChange={(e) => setEditInitialBalance(e.target.value)}
											onBlur={() => {
												const currentValue = editInitialBalance !== '' ? editInitialBalance : (account.initialBalance?.toString() || '0');
												if (currentValue !== (account.initialBalance?.toString() || '0') ||
													editInitialBalanceDate !== (account.initialBalanceDate ? new Date(account.initialBalanceDate).toISOString().split('T')[0] : '')) {
													saveInitialBalance();
												}
											}}
											onFocus={() => {
												if (editInitialBalance === '') {
													setEditInitialBalance(account.initialBalance?.toString() || '0');
													if (account.initialBalanceDate) {
														setEditInitialBalanceDate(new Date(account.initialBalanceDate).toISOString().split('T')[0]);
													}
												}
											}}
											placeholder="0,00"
											className="h-10 text-sm font-mono pr-12"
										/>
										<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">EUR</span>
									</div>
									<Input
										type="date"
										value={editInitialBalanceDate !== '' ? editInitialBalanceDate : (account.initialBalanceDate ? new Date(account.initialBalanceDate).toISOString().split('T')[0] : '')}
										onChange={(e) => setEditInitialBalanceDate(e.target.value)}
										onBlur={() => {
											const currentBalanceDate = editInitialBalanceDate !== '' ? editInitialBalanceDate : (account.initialBalanceDate ? new Date(account.initialBalanceDate).toISOString().split('T')[0] : '');
											const currentBalance = editInitialBalance !== '' ? editInitialBalance : (account.initialBalance?.toString() || '0');
											if (currentBalanceDate !== (account.initialBalanceDate ? new Date(account.initialBalanceDate).toISOString().split('T')[0] : '') ||
												currentBalance !== (account.initialBalance?.toString() || '0')) {
												saveInitialBalance();
											}
										}}
										onFocus={() => {
											if (editInitialBalanceDate === '') {
												setEditInitialBalance(account.initialBalance?.toString() || '0');
												if (account.initialBalanceDate) {
													setEditInitialBalanceDate(new Date(account.initialBalanceDate).toISOString().split('T')[0]);
												}
											}
										}}
										className="h-10 text-sm"
									/>
								</div>
							</div>
						</div>

						{/* Section 2: Imports */}
						<div className="px-5 py-5 space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									Imports
									{accountImports.length > 0 && (
										<span className="ml-1 text-muted-foreground/60">({accountImports.length})</span>
									)}
								</h3>
								{accountImports.length > 5 && (
									<Button
										variant="ghost"
										size="sm"
										className="h-6 px-2 text-xs"
										onClick={() => setShowAllImports(!showAllImports)}
									>
										{showAllImports ? 'Réduire' : 'Tout voir'}
									</Button>
								)}
							</div>

							{accountImports.length === 0 ? (
								<div className="text-center py-6 rounded-lg bg-muted/20 border border-dashed">
									<FileSpreadsheet className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
									<p className="text-xs text-muted-foreground">Aucun import</p>
								</div>
							) : (
								<div className="space-y-2">
									{(showAllImports ? accountImports : accountImports.slice(0, 5)).map((imp) => (
										<div
											key={imp.id}
											className={`flex items-center gap-2 rounded-lg p-2.5 border text-sm ${
												imp.status === 'FAILED'
													? 'bg-destructive/5 border-destructive/20'
													: 'bg-muted/20 border-transparent'
											}`}
										>
											<div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 ${
												imp.status === 'PROCESSED' ? 'bg-[oklch(0.55_0.15_145)]/10' :
												imp.status === 'FAILED' ? 'bg-destructive/10' :
												imp.status === 'PROCESSING' ? 'bg-primary/10' :
												'bg-muted'
											}`}>
												{getStatusIcon(imp.status)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-xs font-medium truncate">{imp.filename}</p>
												<p className="text-[11px] text-muted-foreground">
													{formatRelativeTime(imp.createdAt)}
													{imp.recordsCount !== null && (
														<span className="text-[oklch(0.5_0.15_145)]"> • {imp.recordsCount} tx</span>
													)}
												</p>
											</div>
											<div className="flex items-center shrink-0">
												{imp.status === 'PENDING' && (
													<Button
														variant="outline"
														size="sm"
														className="h-6 px-2 text-xs"
														onClick={() => handleProcess(imp.id)}
														disabled={processImportMutation.isPending}
													>
														{processImportMutation.isPending && processImportMutation.variables?.importId === imp.id ? (
															<Loader2 className="h-3 w-3 animate-spin" />
														) : (
															'Traiter'
														)}
													</Button>
												)}
												{imp.status === 'PROCESSED' && (
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6"
														onClick={() => handleReprocess(imp.id)}
														title="Retraiter"
														disabled={reprocessImportMutation.isPending}
													>
														{reprocessImportMutation.isPending && reprocessImportMutation.variables?.importId === imp.id ? (
															<Loader2 className="h-3 w-3 animate-spin" />
														) : (
															<RotateCcw className="h-3 w-3" />
														)}
													</Button>
												)}
												{imp.status === 'FAILED' && (
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6"
														onClick={() => handleProcess(imp.id)}
														title="Réessayer"
														disabled={processImportMutation.isPending}
													>
														{processImportMutation.isPending && processImportMutation.variables?.importId === imp.id ? (
															<Loader2 className="h-3 w-3 animate-spin" />
														) : (
															<RefreshCw className="h-3 w-3" />
														)}
													</Button>
												)}
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6 text-muted-foreground hover:text-destructive"
													onClick={() => setDeleteImportId(imp.id)}
													disabled={deleteImportMutation.isPending}
												>
													{deleteImportMutation.isPending && deleteImportId === imp.id ? (
														<Loader2 className="h-3 w-3 animate-spin" />
													) : (
														<Trash2 className="h-3 w-3" />
													)}
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Section 3: Gestion du compte */}
						<div className="px-5 py-4 space-y-3">
							<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gestion du compte</h3>
							<Button
								variant="outline"
								size="sm"
								className="w-full h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
								onClick={() => {
									setShowSettings(false);
									setDeleteAccountOpen(true);
								}}
							>
								<Trash2 className="h-3 w-3 mr-1.5" />
								Supprimer le compte
							</Button>
							{account._count.transactions > 0 && (
								<p className="text-[11px] text-muted-foreground text-center">
									{account._count.transactions} transaction{account._count.transactions > 1 ? 's' : ''} sera{account._count.transactions > 1 ? 'ont' : ''} également supprimée{account._count.transactions > 1 ? 's' : ''}
								</p>
							)}
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* Transactions - Glassmorphism Section with Infinite Scroll */}
			<div className="glass-card">
				{/* Header */}
				<div className="p-6 pb-4">
					<div className="flex flex-col gap-5">
						{/* Title row */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<h2 className="text-xl font-bold tracking-tight">Transactions</h2>
								{totalTransactions > 0 && (
									<span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
										{totalTransactions}
									</span>
								)}
							</div>
							<label htmlFor="transaction-import-file" className="cursor-pointer">
								<input
									id="transaction-import-file"
									type="file"
									accept=".csv,.xlsx,.xls"
									onChange={handleFileSelect}
									className="hidden"
									disabled={isUploading}
								/>
								<Button
									className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
									disabled={isUploading}
									asChild
								>
									<span>
										{isUploading ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Upload className="h-4 w-4" />
										)}
										Importer
									</span>
								</Button>
							</label>
						</div>
						{/* Search row */}
						<div className="relative group">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
							<Input
								placeholder="Rechercher une transaction..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-12 h-12 text-base rounded-xl bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:border-primary/50 transition-all shadow-sm"
							/>
						</div>
					</div>
				</div>

				{/* Content */}
				<div
					role="presentation"
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
					className={`px-6 pb-6 relative ${dragActive ? 'bg-primary/5' : ''}`}
				>
					{/* Drag overlay */}
					{dragActive && (
						<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/50 rounded-2xl z-10 m-2">
							<div className="text-center">
								<div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
									<Upload className="h-8 w-8 text-primary" />
								</div>
								<p className="text-sm font-semibold text-primary">Déposez votre fichier ici</p>
								<p className="text-xs text-primary/70 mt-1">CSV, XLSX ou XLS</p>
							</div>
						</div>
					)}

					{allTransactions.length === 0 && !isLoadingTransactions ? (
						<EmptyState
							icon={FileSpreadsheet}
							title="Aucune transaction"
							description="Glissez un fichier CSV ou cliquez sur Importer pour ajouter vos transactions"
							size="md"
						/>
					) : (
						<div className="space-y-1">
							{allTransactions.map((tx, index) => (
								<div
									key={tx.id}
									className="group flex items-center justify-between rounded-xl px-4 py-3.5 hover:bg-white/60 dark:hover:bg-white/5 transition-all duration-200 cursor-default"
									style={{ animationDelay: `${Math.min(index, 10) * 20}ms` }}
								>
									<div className="flex items-center gap-4 min-w-0">
										{/* Date badge */}
										<div className="w-16 shrink-0">
											<div className="inline-flex flex-col items-center px-2.5 py-1.5 rounded-lg bg-muted/40 dark:bg-white/5 group-hover:bg-muted/60 dark:group-hover:bg-white/10 transition-colors">
												<span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
													{formatDate(tx.date, 'MMM')}
												</span>
												<span className="text-sm font-bold text-foreground -mt-0.5">
													{formatDate(tx.date, 'D')}
												</span>
											</div>
										</div>
										<div className="min-w-0">
											<p className="font-medium truncate text-foreground group-hover:text-foreground transition-colors">
												{tx.description}
											</p>
											{tx.transactionCategory?.category && (
												<p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
													<span>{tx.transactionCategory.category.icon}</span>
													<span>{tx.transactionCategory.category.name}</span>
												</p>
											)}
										</div>
									</div>
									<MoneyDisplay
										amount={tx.type === 'INCOME' ? tx.amount : -tx.amount}
										format="withSign"
										size="md"
										weight="bold"
										variant={tx.type === 'INCOME' ? 'positive' : 'default'}
										className="shrink-0 ml-4"
									/>
								</div>
							))}

							{/* Infinite scroll trigger & loading indicator */}
							<div ref={loadMoreRef} className="py-8">
								{isLoadingMore ? (
									<div className="flex items-center justify-center gap-3">
										<div className="relative">
											<div className="h-8 w-8 rounded-full bg-primary/10 animate-pulse" />
											<Loader2 className="h-5 w-5 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
										</div>
										<span className="text-sm text-muted-foreground font-medium">Chargement...</span>
									</div>
								) : hasMore ? (
									<div className="flex flex-col items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={loadMore}
											className="text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/60 dark:hover:bg-white/5"
										>
											Charger plus de transactions
										</Button>
									</div>
								) : allTransactions.length > 0 ? (
									<div className="flex items-center justify-center gap-2 pt-4 border-t border-border/30">
										<CheckCircle2 className="h-4 w-4 text-muted-foreground/50" />
										<span className="text-sm text-muted-foreground">
											{allTransactions.length} transactions affichées
										</span>
									</div>
								) : null}
							</div>
						</div>
					)}
				</div>
			</div>

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
