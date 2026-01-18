'use client';

/**
 * Account Detail Page
 *
 * Uses TanStack Query for data fetching and mutations.
 * Supports infinite scroll for transactions, import management, and account settings.
 */

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	// Icons
	AlertCircle,
	ArrowLeft,
	// Form elements
	Button,
	Check,
	CheckCircle2,
	Clock,
	// Feedback
	EmptyState,
	ExternalLink,
	FileSpreadsheet,
	// Cards
	GlassCard,
	IconWrapper,
	Input,
	Loader2,
	Pencil,
	Plus,
	RefreshCw,
	RotateCcw,
	Search,
	Settings,
	// Sheet
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	Trash2,
	Upload,
	X,
} from '@/components';
import { AccountTypeBadge } from '@/components/accounts/AccountCard';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { MemberAvatarGroup } from '@/components/members/MemberAvatar';
// TanStack Query hooks
import {
	useAccountQuery,
	useAddAccountMemberMutation,
	useDeleteAccountMutation,
	useRemoveAccountMemberMutation,
	useSyncAccountMutation,
	useUpdateAccountMutation,
} from '@/features/accounts';
import {
	useDeleteImportMutation,
	useImportsQuery,
	useProcessImportMutation,
	useReprocessImportMutation,
	useUploadImportMutation,
} from '@/features/imports';
import { useMembersQuery } from '@/features/members';
import { useTransactionsQuery } from '@/features/transactions/hooks/use-transactions-query';
import { formatDate, formatRelativeTime } from '@/shared/utils';

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
			return (
				<AlertCircle style={{ height: '1rem', width: '1rem', color: 'hsl(var(--destructive))' }} />
			);
		default:
			return (
				<Clock style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }} />
			);
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
		{ page: currentPage, pageSize },
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
			{ threshold: 0.1, rootMargin: '100px' },
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
					`${result.process.recordsCount} transactions importées, ${result.process.skippedCount} doublons ignorés`,
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
					description:
						(editDescription !== '' ? editDescription : account.description)?.trim() || undefined,
					accountNumber:
						(editAccountNumber !== '' ? editAccountNumber : account.accountNumber)?.trim() ||
						undefined,
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

		const balanceStr =
			editInitialBalance !== '' ? editInitialBalance : account.initialBalance?.toString() || '0';
		const balanceValue = parseFloat(balanceStr.replace(',', '.'));
		if (Number.isNaN(balanceValue)) {
			setError('Montant invalide');
			return;
		}

		const dateValue =
			editInitialBalanceDate ||
			(account.initialBalanceDate
				? new Date(account.initialBalanceDate).toISOString().split('T')[0]
				: '');

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
			(m) => !account.accountMembers.some((am) => am.memberId === m.id),
		);
	}, [allMembers, account]);

	// ===== Render =====
	if (isLoadingAccount) {
		return (
			<EmptyState
				title="Chargement du compte..."
				iconElement={
					<div className="relative">
						<div
							className="h-12 w-12 rounded-full"
							style={{
								background:
									'linear-gradient(to bottom right, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))',
								animation: 'pulse 2s ease-in-out infinite',
							}}
						/>
						<Loader2
							style={{
								height: '1.5rem',
								width: '1.5rem',
								color: 'hsl(var(--primary))',
								animation: 'spin 1s linear infinite',
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
							}}
						/>
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
					<Button variant="outline" iconLeft={<IconWrapper icon={ArrowLeft} size="sm" />} asChild>
						<Link href="/dashboard/accounts">Retour aux comptes</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Back link */}
			<Link
				href="/dashboard/banks"
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: '0.5rem',
					fontSize: '0.875rem',
					color: 'hsl(var(--muted-foreground))',
					transition: 'all 0.2s',
					textDecoration: 'none',
				}}
			>
				<ArrowLeft style={{ height: '1rem', width: '1rem', transition: 'transform 0.2s' }} />
				<span>Retour aux banques</span>
			</Link>

			{/* Header - Glassmorphism card */}
			<GlassCard padding="lg" style={{ position: 'relative' }}>
				{/* Gradient accent bar */}
				<div
					className="absolute top-0 left-0 right-0 rounded-t-2xl"
					style={{
						height: '0.25rem',
						background: `linear-gradient(90deg, ${account.bank.color}, ${account.bank.color}88, transparent)`,
					}}
				/>

				<div className="flex gap-6 items-start">
					{/* Bank logo with glow */}
					<div className="relative shrink-0">
						<div
							className="absolute inset-0 rounded-2xl"
							style={{
								filter: 'blur(16px)',
								opacity: 0.4,
								backgroundColor: account.bank.color,
							}}
						/>
						<div
							className="flex items-center justify-center relative h-16 w-16 rounded-2xl"
							style={{
								boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
								color: 'white',
								fontWeight: 700,
								fontSize: '1.125rem',
								transition: 'transform 0.2s',
								background: `linear-gradient(135deg, ${account.bank.color}, ${account.bank.color}dd)`,
							}}
						>
							{getBankShortName(account.bank.name)}
						</div>
					</div>

					{/* Content */}
					<div className="flex flex-col grow min-w-0">
						{/* Top row: Name + Balance + Actions */}
						<div className="flex justify-between items-start gap-4">
							<div className="min-w-0">
								<div className="flex items-center gap-3">
									<h1 className="text-2xl font-bold tracking-tight">
										{account.name}
									</h1>
									<Button
										variant="ghost"
										size="icon"
										onClick={startEditingAccount}
										style={{
											height: '2.25rem',
											width: '2.25rem',
											borderRadius: '0.75rem',
											color: 'hsl(var(--muted-foreground))',
											flexShrink: 0,
											transition: 'all 0.2s',
										}}
									>
										<Pencil style={{ height: '1rem', width: '1rem' }} />
									</Button>
								</div>
							</div>

							{/* Balance + Actions */}
							<div className="flex items-center gap-4 shrink-0">
								<div className="flex flex-col items-end">
									<MoneyDisplay
										amount={account.balance}
										currency={account.currency as 'EUR'}
										size="2xl"
										weight="bold"
										style={{ letterSpacing: '-0.025em' }}
									/>
									<p className="text-xs text-muted-foreground font-medium" style={{ marginTop: '0.25rem' }}>
										{account._count.transactions} transaction
										{account._count.transactions !== 1 ? 's' : ''}
									</p>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-3">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setShowSettings(true)}
										style={{
											height: '2.5rem',
											width: '2.5rem',
											borderRadius: '0.75rem',
											backgroundColor: 'hsl(var(--background) / 0.5)',
											border: '1px solid hsl(var(--border) / 0.2)',
											boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
											transition: 'all 0.2s',
										}}
									>
										<Settings style={{ height: '1rem', width: '1rem' }} />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setDeleteAccountOpen(true)}
										style={{
											height: '2.5rem',
											width: '2.5rem',
											borderRadius: '0.75rem',
											backgroundColor: 'hsl(var(--background) / 0.5)',
											border: '1px solid hsl(var(--border) / 0.2)',
											boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
											color: 'hsl(var(--muted-foreground))',
											transition: 'all 0.2s',
										}}
									>
										<Trash2 style={{ height: '1rem', width: '1rem' }} />
									</Button>
								</div>
							</div>
						</div>

						{/* Bottom row: Bank info + Members */}
						<div className="flex flex-wrap items-center gap-3 mt-3">
							<span
								className="text-xs font-medium"
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: '0.375rem',
									padding: '0.25rem 0.75rem',
									borderRadius: '9999px',
									backgroundColor: 'hsl(var(--background) / 0.6)',
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								{account.bank.name}
							</span>
							<AccountTypeBadge
								type={account.type as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN'}
								style={{
									backgroundColor: 'hsl(var(--background) / 0.6)',
									borderRadius: '9999px',
									padding: '0.25rem 0.75rem',
								}}
							/>
							{account.accountNumber && (
								<span
									className="text-xs"
									style={{
										display: 'none',
										padding: '0.25rem 0.75rem',
										borderRadius: '9999px',
										fontFamily: 'monospace',
										backgroundColor: 'hsl(var(--background) / 0.6)',
										color: 'hsl(var(--muted-foreground))',
									}}
								>
									{account.accountNumber}
								</span>
							)}
							{/* Members */}
							{account.accountMembers.length > 0 && (
								<>
									<span style={{ color: 'hsl(var(--muted-foreground) / 0.4)' }}>
										•
									</span>
									<div className="flex items-center gap-3">
										<MemberAvatarGroup
											members={account.accountMembers.map((am) => ({
												id: am.memberId,
												name: am.member.name,
												color: am.member.color,
											}))}
											size="sm"
											max={5}
										/>
										<p className="text-xs text-muted-foreground font-medium">
											{account.accountMembers.map((am) => am.member.name).join(', ')}
										</p>
									</div>
								</>
							)}
						</div>
						{account.description && (
							<p className="text-sm text-muted-foreground" style={{ marginTop: '0.75rem' }}>
								{account.description}
							</p>
						)}
					</div>
				</div>
			</GlassCard>

			{/* Account Edit Drawer */}
			<Sheet open={isEditingAccount} onOpenChange={setIsEditingAccount}>
				<SheetContent
					side="right"
					style={{
						width: '100%',
						maxWidth: '420px',
						overflowY: 'auto',
						borderLeft: '1px solid hsl(var(--border) / 0.2)',
						background:
							'linear-gradient(to bottom, hsl(var(--background)), hsl(var(--background) / 0.95))',
					}}
				>
					<SheetHeader style={{ paddingBottom: '1.5rem' }}>
						<SheetTitle style={{ fontSize: '1.25rem', fontWeight: 700 }}>
							Modifier le compte
						</SheetTitle>
						<SheetDescription>Modifiez les informations du compte.</SheetDescription>
					</SheetHeader>

					<div className="flex flex-col gap-6">
						{/* Bank logo centered with glow */}
						<div
							className="relative mx-auto w-fit"
						>
							<div
								className="absolute inset-0 rounded-2xl"
								style={{
									filter: 'blur(16px)',
									opacity: 0.5,
									backgroundColor: account.bank.color,
								}}
							/>
							<div
								className="flex items-center justify-center relative h-16 w-16 rounded-2xl"
								style={{
									boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
									color: 'white',
									fontWeight: 700,
									fontSize: '1.125rem',
									background: `linear-gradient(135deg, ${account.bank.color}, ${account.bank.color}dd)`,
								}}
							>
								{getBankShortName(account.bank.name)}
							</div>
						</div>

						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-3">
								<label
									htmlFor="edit-account-name"
									style={{ fontSize: '0.875rem', fontWeight: 600 }}
								>
									Nom du compte
								</label>
								<Input
									id="edit-account-name"
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									placeholder="Ex: Compte Joint"
									style={{
										height: '3rem',
										fontSize: '1rem',
										borderRadius: '0.75rem',
										backgroundColor: 'hsl(var(--background) / 0.6)',
										borderColor: 'hsl(var(--border) / 0.3)',
									}}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<label
									htmlFor="edit-account-number"
									style={{ fontSize: '0.875rem', fontWeight: 600 }}
								>
									Numéro de compte
									<span
										style={{
											marginLeft: '0.25rem',
											fontSize: '0.75rem',
											fontWeight: 400,
											color: 'hsl(var(--muted-foreground))',
										}}
									>
										(optionnel)
									</span>
								</label>
								<Input
									id="edit-account-number"
									value={editAccountNumber}
									onChange={(e) => setEditAccountNumber(e.target.value)}
									placeholder="Ex: FR76 1234 5678 9012"
									style={{
										height: '3rem',
										fontFamily: 'monospace',
										borderRadius: '0.75rem',
										backgroundColor: 'hsl(var(--background) / 0.6)',
										borderColor: 'hsl(var(--border) / 0.3)',
									}}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<label
									htmlFor="edit-account-description"
									style={{ fontSize: '0.875rem', fontWeight: 600 }}
								>
									Description
									<span
										style={{
											marginLeft: '0.25rem',
											fontSize: '0.75rem',
											fontWeight: 400,
											color: 'hsl(var(--muted-foreground))',
										}}
									>
										(optionnel)
									</span>
								</label>
								<Input
									id="edit-account-description"
									value={editDescription}
									onChange={(e) => setEditDescription(e.target.value)}
									placeholder="Ex: Compte pour les dépenses courantes"
									style={{
										height: '3rem',
										borderRadius: '0.75rem',
										backgroundColor: 'hsl(var(--background) / 0.6)',
										borderColor: 'hsl(var(--border) / 0.3)',
									}}
								/>
							</div>
						</div>

						<div className="flex gap-3 pt-4">
							<Button
								variant="outline"
								onClick={cancelEditingAccount}
								disabled={updateAccountMutation.isPending}
								style={{
									flex: 1,
									height: '3rem',
									borderRadius: '0.75rem',
									borderColor: 'hsl(var(--border) / 0.2)',
								}}
							>
								Annuler
							</Button>
							<Button
								onClick={saveAccountDetails}
								disabled={updateAccountMutation.isPending || !editName.trim()}
								style={{
									flex: 1,
									height: '3rem',
									borderRadius: '0.75rem',
									boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
									transition: 'all 0.2s',
								}}
							>
								{updateAccountMutation.isPending ? (
									<Loader2
										style={{
											height: '1rem',
											width: '1rem',
											animation: 'spin 1s linear infinite',
											marginRight: '0.5rem',
										}}
									/>
								) : (
									<Check style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
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
					className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-xl"
					style={{
						animation: 'fadeIn 0.3s ease-out',
						backdropFilter: 'blur(16px)',
						WebkitBackdropFilter: 'blur(16px)',
						backgroundColor: error.includes('importées')
							? 'oklch(0.55 0.15 145 / 0.1)'
							: 'oklch(0.55 0.2 25 / 0.1)',
						border: error.includes('importées')
							? '1px solid oklch(0.55 0.15 145 / 0.2)'
							: '1px solid oklch(0.55 0.2 25 / 0.2)',
					}}
				>
					<div className="flex items-start gap-3">
						<div
							className="flex items-center justify-center shrink-0 h-8 w-8 rounded-xl"
							style={{
								backgroundColor: error.includes('importées')
									? 'oklch(0.55 0.15 145 / 0.2)'
									: 'oklch(0.55 0.2 25 / 0.2)',
							}}
						>
							{error.includes('importées') ? (
								<CheckCircle2
									style={{ height: '1rem', width: '1rem', color: 'oklch(0.55 0.15 145)' }}
								/>
							) : (
								<AlertCircle
									style={{ height: '1rem', width: '1rem', color: 'oklch(0.55 0.2 25)' }}
								/>
							)}
						</div>
						<div className="flex flex-col grow min-w-0">
							<p
								className="text-sm font-semibold"
								style={{
									color: error.includes('importées')
										? 'oklch(0.55 0.15 145)'
										: 'oklch(0.55 0.2 25)',
								}}
							>
								{error.includes('importées') ? 'Import réussi' : 'Erreur'}
							</p>
							<p
								className="text-sm"
								style={{ color: 'hsl(var(--foreground) / 0.8)', marginTop: '0.125rem' }}
							>
								{error}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setError(null)}
							style={{ flexShrink: 0, height: '2rem', width: '2rem', borderRadius: '0.5rem' }}
						>
							<X style={{ height: '1rem', width: '1rem' }} />
						</Button>
					</div>
				</div>
			)}

			{/* Settings Drawer - 33% width on desktop */}
			<Sheet open={showSettings} onOpenChange={setShowSettings}>
				<SheetContent
					side="right"
					style={{
						width: '100%',
						minWidth: '400px',
						maxWidth: '500px',
						overflowY: 'auto',
						backgroundColor: 'hsl(var(--background))',
						borderLeft: '1px solid hsl(var(--border))',
						padding: 0,
					}}
				>
					{/* Header */}
					<div className="px-4 py-2 border-b border-border">
						<SheetHeader>
							<SheetTitle style={{ fontSize: '1rem', fontWeight: 600 }}>Paramètres</SheetTitle>
							<SheetDescription style={{ fontSize: '0.75rem' }}>
								Informations et historique du compte
							</SheetDescription>
						</SheetHeader>
					</div>

					<div className="flex flex-col">
						{/* Section 1: Informations */}
						<div
							className="flex flex-col gap-4 px-4 py-4"
							style={{ borderBottom: '1px solid hsl(var(--border))' }}
						>
							<p
								className="text-xs font-semibold text-muted-foreground"
								style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
							>
								Informations
							</p>

							{/* Account name */}
							<div className="flex flex-col gap-2">
								<label
									htmlFor="settings-account-name"
									style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}
								>
									Nom du compte
								</label>
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
									style={{ height: '2.5rem', fontSize: '0.875rem', fontWeight: 500 }}
									placeholder="Nom du compte"
								/>
							</div>

							{/* Description */}
							<div className="flex flex-col gap-2">
								<label
									htmlFor="settings-account-description"
									style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}
								>
									Description
								</label>
								<Input
									id="settings-account-description"
									value={editDescription !== '' ? editDescription : account.description || ''}
									onChange={(e) => setEditDescription(e.target.value)}
									onBlur={() => {
										if (editDescription !== (account.description || '')) {
											saveAccountDetails();
										}
									}}
									onFocus={() => {
										if (editDescription === '') setEditDescription(account.description || '');
									}}
									style={{ height: '2.5rem', fontSize: '0.875rem' }}
									placeholder="Description (optionnel)"
								/>
							</div>

							{/* Owners - Multi-select */}
							<div className="flex flex-col gap-2">
								<p className="text-sm text-muted-foreground">
									Titulaires
								</p>
								<div
									className="flex flex-wrap items-center gap-3 p-2 rounded-md border"
									style={{
										borderColor: 'hsl(var(--border))',
										backgroundColor: 'hsl(var(--background))',
										minHeight: '42px',
									}}
								>
									{account.accountMembers.map((am) => (
										<div
											key={am.id}
											className="inline-flex items-center gap-1"
											style={{
												paddingLeft: '0.375rem',
												paddingRight: '0.25rem',
												paddingTop: '0.25rem',
												paddingBottom: '0.25rem',
												fontSize: '0.875rem',
												borderRadius: '0.375rem',
												backgroundColor: 'hsl(var(--muted))',
												transition: 'opacity 0.2s',
												opacity:
													removeMemberMutation.isPending &&
													removeMemberMutation.variables?.memberId === am.memberId
														? 0.5
														: 1,
											}}
										>
											<div
												className="flex items-center justify-center h-5 w-5 rounded-full text-white text-xs font-medium"
												style={{ backgroundColor: am.member.color || '#6b7280' }}
											>
												{removeMemberMutation.isPending &&
												removeMemberMutation.variables?.memberId === am.memberId ? (
													<Loader2
														style={{
															height: '0.75rem',
															width: '0.75rem',
															animation: 'spin 1s linear infinite',
														}}
													/>
												) : (
													am.member.name.charAt(0).toUpperCase()
												)}
											</div>
											<span className="font-medium">
												{am.member.name}
											</span>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => removeMemberFromAccount(am.memberId)}
												disabled={removeMemberMutation.isPending || addMemberMutation.isPending}
												style={{
													height: '1.25rem',
													width: '1.25rem',
													borderRadius: '0.25rem',
													color: 'hsl(var(--muted-foreground))',
													transition: 'all 0.2s',
												}}
											>
												<X style={{ height: '0.75rem', width: '0.75rem' }} />
											</Button>
										</div>
									))}
									{/* Loading indicator when adding */}
									{addMemberMutation.isPending && addMemberMutation.variables && (
										<div
											className="inline-flex items-center gap-1"
											style={{
												paddingLeft: '0.375rem',
												paddingRight: '0.5rem',
												paddingTop: '0.25rem',
												paddingBottom: '0.25rem',
												fontSize: '0.875rem',
												borderRadius: '0.375rem',
												backgroundColor: 'hsl(var(--muted) / 0.5)',
												animation: 'pulse 2s ease-in-out infinite',
											}}
										>
											<div
												className="flex items-center justify-center h-5 w-5 rounded-full text-white text-xs font-medium"
												style={{
													backgroundColor:
														allMembers?.find((m) => m.id === addMemberMutation.variables?.memberId)
															?.color || '#6b7280',
												}}
											>
												<Loader2
													style={{
														height: '0.75rem',
														width: '0.75rem',
														animation: 'spin 1s linear infinite',
													}}
												/>
											</div>
											<span className="font-medium text-muted-foreground">
												{
													allMembers?.find((m) => m.id === addMemberMutation.variables?.memberId)
														?.name
												}
											</span>
										</div>
									)}
									{/* Add member button */}
									<div className="relative">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setShowMemberDropdown(!showMemberDropdown)}
											disabled={addMemberMutation.isPending || removeMemberMutation.isPending}
											style={{
												display: 'inline-flex',
												alignItems: 'center',
												gap: '0.25rem',
												padding: '0.25rem 0.5rem',
												borderRadius: '0.375rem',
												fontSize: '0.875rem',
												color: 'hsl(var(--muted-foreground))',
												transition: 'all 0.2s',
											}}
										>
											<Plus style={{ height: '1rem', width: '1rem' }} />
											Ajouter
										</Button>
										{showMemberDropdown && (
											<div
												className="absolute top-full left-0 z-50 min-w-[180px] p-1 rounded-md border border-border shadow-md bg-popover"
												style={{
													marginTop: '0.25rem',
												}}
											>
												{availableMembers.map((member) => (
													<Button
														key={member.id}
														variant="ghost"
														onClick={() => addMemberToAccount(member.id)}
														fullWidth
														style={{
															display: 'flex',
															alignItems: 'center',
															gap: '0.5rem',
															padding: '0.375rem 0.5rem',
															borderRadius: '0.25rem',
															fontSize: '0.875rem',
															justifyContent: 'flex-start',
															textAlign: 'left',
															transition: 'all 0.2s',
														}}
													>
														<div
															className="flex items-center justify-center h-5 w-5 rounded-full text-white text-xs font-medium"
															style={{ backgroundColor: member.color || '#6b7280' }}
														>
															{member.name.charAt(0).toUpperCase()}
														</div>
														<span>{member.name}</span>
													</Button>
												))}
												{availableMembers.length === 0 && (
													<p className="text-sm text-muted-foreground" style={{ padding: '0.25rem 0.5rem' }}>
														Tous les membres sont ajoutés
													</p>
												)}
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Export URL */}
							<div className="flex flex-col gap-2">
								<div className="flex justify-between items-center">
									<label
										htmlFor="settings-export-url"
										style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}
									>
										Lien d&apos;export banque
									</label>
									{account.exportUrl && (
										<a
											href={account.exportUrl}
											target="_blank"
											rel="noopener noreferrer"
											style={{
												display: 'inline-flex',
												alignItems: 'center',
												gap: '0.25rem',
												fontSize: '0.75rem',
												color: 'hsl(var(--primary))',
												textDecoration: 'none',
											}}
										>
											<span>Ouvrir</span>
											<ExternalLink style={{ height: '0.75rem', width: '0.75rem' }} />
										</a>
									)}
								</div>
								<Input
									id="settings-export-url"
									type="url"
									value={exportUrlInput !== '' ? exportUrlInput : account.exportUrl || ''}
									onChange={(e) => setExportUrlInput(e.target.value)}
									onBlur={() => {
										const currentValue =
											exportUrlInput !== '' ? exportUrlInput : account.exportUrl || '';
										if (currentValue !== (account.exportUrl || '')) {
											saveExportUrl();
										}
									}}
									onFocus={() => {
										if (exportUrlInput === '') setExportUrlInput(account.exportUrl || '');
									}}
									placeholder="https://www.banque.fr/espace-client"
									style={{ height: '2.5rem', fontSize: '0.875rem' }}
								/>
							</div>

							{/* Initial Balance */}
							<div className="flex flex-col gap-2">
								<p className="text-sm text-muted-foreground">
									Solde initial
								</p>
								<div className="flex gap-3">
									<div className="relative grow">
										<Input
											type="text"
											value={
												editInitialBalance !== ''
													? editInitialBalance
													: account.initialBalance?.toString() || '0'
											}
											onChange={(e) => setEditInitialBalance(e.target.value)}
											onBlur={() => {
												const currentValue =
													editInitialBalance !== ''
														? editInitialBalance
														: account.initialBalance?.toString() || '0';
												if (
													currentValue !== (account.initialBalance?.toString() || '0') ||
													editInitialBalanceDate !==
														(account.initialBalanceDate
															? new Date(account.initialBalanceDate).toISOString().split('T')[0]
															: '')
												) {
													saveInitialBalance();
												}
											}}
											onFocus={() => {
												if (editInitialBalance === '') {
													setEditInitialBalance(account.initialBalance?.toString() || '0');
													if (account.initialBalanceDate) {
														setEditInitialBalanceDate(
															new Date(account.initialBalanceDate).toISOString().split('T')[0],
														);
													}
												}
											}}
											placeholder="0,00"
											style={{
												height: '2.5rem',
												fontSize: '0.875rem',
												fontFamily: 'monospace',
												paddingRight: '3rem',
											}}
										/>
										<span
											style={{
												position: 'absolute',
												right: '0.75rem',
												top: '50%',
												transform: 'translateY(-50%)',
												fontSize: '0.875rem',
												color: 'hsl(var(--muted-foreground))',
											}}
										>
											EUR
										</span>
									</div>
									<Input
										type="date"
										value={
											editInitialBalanceDate !== ''
												? editInitialBalanceDate
												: account.initialBalanceDate
													? new Date(account.initialBalanceDate).toISOString().split('T')[0]
													: ''
										}
										onChange={(e) => setEditInitialBalanceDate(e.target.value)}
										onBlur={() => {
											const currentBalanceDate =
												editInitialBalanceDate !== ''
													? editInitialBalanceDate
													: account.initialBalanceDate
														? new Date(account.initialBalanceDate).toISOString().split('T')[0]
														: '';
											const currentBalance =
												editInitialBalance !== ''
													? editInitialBalance
													: account.initialBalance?.toString() || '0';
											if (
												currentBalanceDate !==
													(account.initialBalanceDate
														? new Date(account.initialBalanceDate).toISOString().split('T')[0]
														: '') ||
												currentBalance !== (account.initialBalance?.toString() || '0')
											) {
												saveInitialBalance();
											}
										}}
										onFocus={() => {
											if (editInitialBalanceDate === '') {
												setEditInitialBalance(account.initialBalance?.toString() || '0');
												if (account.initialBalanceDate) {
													setEditInitialBalanceDate(
														new Date(account.initialBalanceDate).toISOString().split('T')[0],
													);
												}
											}
										}}
										style={{ height: '2.5rem', fontSize: '0.875rem', flex: 1 }}
									/>
								</div>
							</div>
						</div>

						{/* Section 2: Imports */}
						<div
							className="flex flex-col gap-3 px-4 py-4"
							style={{ borderBottom: '1px solid hsl(var(--border))' }}
						>
							<div className="flex justify-between items-center">
								<Text
									size="xs"
									weight="semibold"
									color="muted"
									style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
								>
									Imports
									{accountImports.length > 0 && (
										<span
											style={{ marginLeft: '0.25rem', color: 'hsl(var(--muted-foreground) / 0.6)' }}
										>
											({accountImports.length})
										</span>
									)}
								</Text>
								{accountImports.length > 5 && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowAllImports(!showAllImports)}
										style={{ height: '1.5rem', padding: '0 0.5rem', fontSize: '0.75rem' }}
									>
										{showAllImports ? 'Réduire' : 'Tout voir'}
									</Button>
								)}
							</div>

							{accountImports.length === 0 ? (
								<div
									className="text-center py-6 rounded-lg border border-dashed border-border bg-muted/20"
								>
									<FileSpreadsheet
										style={{
											height: '1.5rem',
											width: '1.5rem',
											marginLeft: 'auto',
											marginRight: 'auto',
											color: 'hsl(var(--muted-foreground) / 0.4)',
											marginBottom: '0.5rem',
										}}
									/>
									<Text size="xs" color="muted">
										Aucun import
									</Text>
								</div>
							) : (
								<div className="flex flex-col gap-3">
									{(showAllImports ? accountImports : accountImports.slice(0, 5)).map((imp) => (
										<div
											key={imp.id}
											className="flex items-center gap-3 p-3"
											style={{
												fontSize: '0.875rem',
												borderRadius: '0.5rem',
												border: '1px solid',
												backgroundColor:
													imp.status === 'FAILED'
														? 'hsl(var(--destructive) / 0.05)'
														: 'hsl(var(--muted) / 0.2)',
												borderColor:
													imp.status === 'FAILED' ? 'hsl(var(--destructive) / 0.2)' : 'transparent',
											}}
										>
											<div
												className="flex items-center justify-center h-6 w-6 shrink-0 rounded-md"
												style={{
													backgroundColor:
														imp.status === 'PROCESSED'
															? 'oklch(0.55 0.15 145 / 0.1)'
															: imp.status === 'FAILED'
																? 'hsl(var(--destructive) / 0.1)'
																: imp.status === 'PROCESSING'
																	? 'hsl(var(--primary) / 0.1)'
																	: 'hsl(var(--muted))',
												}}
											>
												{getStatusIcon(imp.status)}
											</div>
											<div className="flex flex-col grow min-w-0">
												<Text
													size="xs"
													weight="medium"
													style={{
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap',
													}}
												>
													{imp.filename}
												</Text>
												<Text style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
													{formatRelativeTime(imp.createdAt)}
													{imp.recordsCount !== null && (
														<Text as="span" style={{ color: 'oklch(0.5 0.15 145)' }}>
															{' '}
															• {imp.recordsCount} tx
														</Text>
													)}
												</Text>
											</div>
											<div className="flex items-center shrink-0">
												{imp.status === 'PENDING' && (
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleProcess(imp.id)}
														disabled={processImportMutation.isPending}
														style={{ height: '1.5rem', padding: '0 0.5rem', fontSize: '0.75rem' }}
													>
														{processImportMutation.isPending &&
														processImportMutation.variables?.importId === imp.id ? (
															<Loader2
																style={{
																	height: '0.75rem',
																	width: '0.75rem',
																	animation: 'spin 1s linear infinite',
																}}
															/>
														) : (
															'Traiter'
														)}
													</Button>
												)}
												{imp.status === 'PROCESSED' && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleReprocess(imp.id)}
														title="Retraiter"
														disabled={reprocessImportMutation.isPending}
														style={{ height: '1.5rem', width: '1.5rem' }}
													>
														{reprocessImportMutation.isPending &&
														reprocessImportMutation.variables?.importId === imp.id ? (
															<Loader2
																style={{
																	height: '0.75rem',
																	width: '0.75rem',
																	animation: 'spin 1s linear infinite',
																}}
															/>
														) : (
															<RotateCcw style={{ height: '0.75rem', width: '0.75rem' }} />
														)}
													</Button>
												)}
												{imp.status === 'FAILED' && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleProcess(imp.id)}
														title="Réessayer"
														disabled={processImportMutation.isPending}
														style={{ height: '1.5rem', width: '1.5rem' }}
													>
														{processImportMutation.isPending &&
														processImportMutation.variables?.importId === imp.id ? (
															<Loader2
																style={{
																	height: '0.75rem',
																	width: '0.75rem',
																	animation: 'spin 1s linear infinite',
																}}
															/>
														) : (
															<RefreshCw style={{ height: '0.75rem', width: '0.75rem' }} />
														)}
													</Button>
												)}
												<Button
													variant="ghost"
													size="icon"
													onClick={() => setDeleteImportId(imp.id)}
													disabled={deleteImportMutation.isPending}
													style={{
														height: '1.5rem',
														width: '1.5rem',
														color: 'hsl(var(--muted-foreground))',
													}}
												>
													{deleteImportMutation.isPending && deleteImportId === imp.id ? (
														<Loader2
															style={{
																height: '0.75rem',
																width: '0.75rem',
																animation: 'spin 1s linear infinite',
															}}
														/>
													) : (
														<Trash2 style={{ height: '0.75rem', width: '0.75rem' }} />
													)}
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Section 3: Gestion du compte */}
						<div className="flex flex-col gap-3 px-4 py-2">
							<Text
								size="xs"
								weight="semibold"
								color="muted"
								style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
							>
								Gestion du compte
							</Text>
							<Button
								variant="outline"
								size="sm"
								fullWidth
								onClick={() => {
									setShowSettings(false);
									setDeleteAccountOpen(true);
								}}
								style={{
									height: '2rem',
									fontSize: '0.75rem',
									color: 'hsl(var(--destructive))',
									borderColor: 'hsl(var(--destructive) / 0.3)',
								}}
							>
								<Trash2 style={{ height: '0.75rem', width: '0.75rem', marginRight: '0.375rem' }} />
								Supprimer le compte
							</Button>
							{account._count.transactions > 0 && (
								<Text
									style={{
										fontSize: '11px',
										color: 'hsl(var(--muted-foreground))',
										textAlign: 'center',
									}}
								>
									{account._count.transactions} transaction
									{account._count.transactions > 1 ? 's' : ''} sera
									{account._count.transactions > 1 ? 'ont' : ''} également supprimée
									{account._count.transactions > 1 ? 's' : ''}
								</Text>
							)}
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* Transactions - Glassmorphism Section with Infinite Scroll */}
			<GlassCard style={{ padding: 0 }}>
				{/* Header */}
				<div className="p-6 pb-4">
					<div className="flex flex-col gap-4">
						{/* Title row */}
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-3">
								<Heading level={2} size="xl" weight="bold" style={{ letterSpacing: '-0.025em' }}>
									Transactions
								</Heading>
								{totalTransactions > 0 && (
									<Text
										as="span"
										size="xs"
										weight="semibold"
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											padding: '0.125rem 0.625rem',
											borderRadius: '9999px',
											backgroundColor: 'hsl(var(--primary) / 0.1)',
											color: 'hsl(var(--primary))',
										}}
									>
										{totalTransactions}
									</Text>
								)}
							</div>
							<label htmlFor="transaction-import-file" style={{ cursor: 'pointer' }}>
								<input
									id="transaction-import-file"
									type="file"
									accept=".csv,.xlsx,.xls"
									onChange={handleFileSelect}
									style={{ display: 'none' }}
									disabled={isUploading}
								/>
								<Button
									disabled={isUploading}
									asChild
									style={{
										gap: '0.5rem',
										borderRadius: '0.75rem',
										boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
										transition: 'all 0.2s',
									}}
								>
									<span>
										{isUploading ? (
											<Loader2
												style={{
													height: '1rem',
													width: '1rem',
													animation: 'spin 1s linear infinite',
												}}
											/>
										) : (
											<Upload style={{ height: '1rem', width: '1rem' }} />
										)}
										Importer
									</span>
								</Button>
							</label>
						</div>
						{/* Search row */}
						<div className="relative">
							<Search
								style={{
									position: 'absolute',
									left: '1rem',
									top: '50%',
									transform: 'translateY(-50%)',
									height: '1.25rem',
									width: '1.25rem',
									color: 'hsl(var(--muted-foreground))',
									transition: 'color 0.2s',
								}}
							/>
							<Input
								placeholder="Rechercher une transaction..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								style={{
									paddingLeft: '3rem',
									height: '3rem',
									fontSize: '1rem',
									borderRadius: '0.75rem',
									backgroundColor: 'hsl(var(--background) / 0.6)',
									borderColor: 'hsl(var(--border) / 0.3)',
									transition: 'all 0.2s',
									boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
								}}
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
					className="relative px-6 pb-6"
					style={{
						backgroundColor: dragActive ? 'hsl(var(--primary) / 0.05)' : 'transparent',
					}}
				>
					{/* Drag overlay */}
					{dragActive && (
						<div
							className="flex items-center justify-center absolute inset-0 m-2 rounded-2xl z-10"
							style={{
								background:
									'linear-gradient(to bottom right, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05))',
								border: '2px dashed hsl(var(--primary) / 0.5)',
							}}
						>
							<div className="flex flex-col items-center gap-3">
								<div
									className="flex items-center justify-center h-16 w-16 rounded-2xl"
									style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
								>
									<Upload style={{ height: '2rem', width: '2rem', color: 'hsl(var(--primary))' }} />
								</div>
								<Text size="sm" weight="semibold" style={{ color: 'hsl(var(--primary))' }}>
									Déposez votre fichier ici
								</Text>
								<Text size="xs" style={{ color: 'hsl(var(--primary) / 0.7)' }}>
									CSV, XLSX ou XLS
								</Text>
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
						<div className="flex flex-col gap-2">
							{allTransactions.map((tx, index) => (
								<div
									key={tx.id}
									className="flex justify-between items-center px-4 py-3.5 rounded-xl"
									style={{
										transition: 'all 0.2s',
										cursor: 'default',
										animationDelay: `${Math.min(index, 10) * 20}ms`,
									}}
								>
									<div className="flex items-center gap-4 min-w-0">
										{/* Date badge */}
										<div className="w-16 shrink-0">
											<div
												className="flex flex-col items-center px-2 py-1.5 rounded-lg"
												style={{
													backgroundColor: 'hsl(var(--muted) / 0.4)',
													display: 'inline-flex',
													transition: 'background-color 0.2s',
												}}
											>
												<Text
													style={{
														fontSize: '10px',
														fontWeight: 600,
														color: 'hsl(var(--muted-foreground))',
														textTransform: 'uppercase',
														letterSpacing: '0.05em',
													}}
												>
													{formatDate(tx.date, 'MMM')}
												</Text>
												<Text size="sm" weight="bold" style={{ marginTop: '-0.125rem' }}>
													{formatDate(tx.date, 'D')}
												</Text>
											</div>
										</div>
										<div className="flex flex-col min-w-0">
											<Text
												weight="medium"
												style={{
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
													transition: 'color 0.2s',
												}}
											>
												{tx.description}
											</Text>
											{tx.transactionCategory?.category && (
												<div className="flex items-center gap-1 mt-0.5">
													<Text as="span" size="xs" color="muted">
														{tx.transactionCategory.category.icon}
													</Text>
													<Text as="span" size="xs" color="muted">
														{tx.transactionCategory.category.name}
													</Text>
												</div>
											)}
										</div>
									</div>
									<MoneyDisplay
										amount={tx.type === 'INCOME' ? tx.amount : -tx.amount}
										format="withSign"
										size="md"
										weight="bold"
										variant={tx.type === 'INCOME' ? 'positive' : 'default'}
										style={{ flexShrink: 0, marginLeft: '1rem' }}
									/>
								</div>
							))}

							{/* Infinite scroll trigger & loading indicator */}
							<div ref={loadMoreRef} className="py-8">
								{isLoadingMore ? (
									<div className="flex items-center justify-center gap-3">
										<div className="relative">
											<div
												className="h-8 w-8 rounded-full"
												style={{
													backgroundColor: 'hsl(var(--primary) / 0.1)',
													animation: 'pulse 2s ease-in-out infinite',
												}}
											/>
											<Loader2
												style={{
													height: '1.25rem',
													width: '1.25rem',
													animation: 'spin 1s linear infinite',
													color: 'hsl(var(--primary))',
													position: 'absolute',
													top: '50%',
													left: '50%',
													transform: 'translate(-50%, -50%)',
												}}
											/>
										</div>
										<Text size="sm" color="muted" weight="medium">
											Chargement...
										</Text>
									</div>
								) : hasMore ? (
									<div className="flex flex-col items-center gap-3">
										<Button
											variant="ghost"
											size="sm"
											onClick={loadMore}
											style={{
												color: 'hsl(var(--muted-foreground))',
												borderRadius: '0.75rem',
												transition: 'all 0.2s',
											}}
										>
											Charger plus de transactions
										</Button>
									</div>
								) : allTransactions.length > 0 ? (
									<div
										className="flex items-center justify-center gap-3 pt-4"
										style={{ borderTop: '1px solid hsl(var(--border) / 0.3)' }}
									>
										<CheckCircle2
											style={{
												height: '1rem',
												width: '1rem',
												color: 'hsl(var(--muted-foreground) / 0.5)',
											}}
										/>
										<Text size="sm" color="muted">
											{allTransactions.length} transactions affichées
										</Text>
									</div>
								) : null}
							</div>
						</div>
					)}
				</div>
			</GlassCard>

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
