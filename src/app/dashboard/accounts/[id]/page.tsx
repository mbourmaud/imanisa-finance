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
	Flex,
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
					<div style={{ position: 'relative' }}>
						<div
							style={{
								height: '3rem',
								width: '3rem',
								borderRadius: '9999px',
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
		<Flex direction="col" gap="lg">
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
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: '0.25rem',
						borderRadius: '1rem 1rem 0 0',
						background: `linear-gradient(90deg, ${account.bank.color}, ${account.bank.color}88, transparent)`,
					}}
				/>

				<Flex direction="row" gap="lg" align="start">
					{/* Bank logo with glow */}
					<div style={{ position: 'relative', flexShrink: 0 }}>
						<div
							style={{
								position: 'absolute',
								inset: 0,
								borderRadius: '1rem',
								filter: 'blur(16px)',
								opacity: 0.4,
								backgroundColor: account.bank.color,
							}}
						/>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								position: 'relative',
								height: '4rem',
								width: '4rem',
								borderRadius: '1rem',
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
					<Flex direction="col" gap="sm" style={{ flexGrow: 1, minWidth: 0 }}>
						{/* Top row: Name + Balance + Actions */}
						<Flex direction="row" justify="between" align="start" gap="md">
							<div style={{ minWidth: 0 }}>
								<Flex direction="row" gap="sm" align="center">
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
								</Flex>
							</div>

							{/* Balance + Actions */}
							<Flex direction="row" gap="md" style={{ flexShrink: 0 }}>
								<Flex direction="col" gap="xs" align="end">
									<MoneyDisplay
										amount={account.balance}
										currency={account.currency as 'EUR'}
										size="2xl"
										weight="bold"
										style={{ letterSpacing: '-0.025em' }}
									/>
									<span className="text-xs text-muted-foreground font-medium">
										{account._count.transactions} transaction
										{account._count.transactions !== 1 ? 's' : ''}
									</span>
								</Flex>

								{/* Actions */}
								<Flex direction="row" gap="sm">
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
								</Flex>
							</Flex>
						</Flex>

						{/* Bottom row: Bank info + Members */}
						<Flex direction="row" gap="sm" style={{ flexWrap: 'wrap', marginTop: '0.75rem' }}>
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
									<span style={{ color: 'hsl(var(--muted-foreground) / 0.4)' }}>•</span>
									<Flex direction="row" gap="sm" align="center">
										<MemberAvatarGroup
											members={account.accountMembers.map((am) => ({
												id: am.memberId,
												name: am.member.name,
												color: am.member.color,
											}))}
											size="sm"
											max={5}
										/>
										<span className="text-xs text-muted-foreground font-medium">
											{account.accountMembers.map((am) => am.member.name).join(', ')}
										</span>
									</Flex>
								</>
							)}
						</Flex>
						{account.description && (
							<p className="text-sm text-muted-foreground" style={{ marginTop: '0.75rem' }}>
								{account.description}
							</p>
						)}
					</Flex>
				</Flex>
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

					<Flex direction="col" gap="lg">
						{/* Bank logo centered with glow */}
						<div style={{ position: 'relative', marginLeft: 'auto', marginRight: 'auto', width: 'fit-content' }}>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									borderRadius: '1rem',
									filter: 'blur(16px)',
									opacity: 0.5,
									backgroundColor: account.bank.color,
								}}
							/>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									position: 'relative',
									height: '4rem',
									width: '4rem',
									borderRadius: '1rem',
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

						<Flex direction="col" gap="md">
							<Flex direction="col" gap="sm">
								<label
									htmlFor="edit-account-name"
									className="text-sm font-semibold"
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
							</Flex>
							<Flex direction="col" gap="sm">
								<label
									htmlFor="edit-account-number"
									className="text-sm font-semibold"
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
							</Flex>
							<Flex direction="col" gap="sm">
								<label
									htmlFor="edit-account-description"
									className="text-sm font-semibold"
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
							</Flex>
						</Flex>

						<Flex direction="row" gap="sm" style={{ paddingTop: '1rem' }}>
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
						</Flex>
					</Flex>
				</SheetContent>
			</Sheet>

			{/* Error/Success message - floating toast style */}
			{error && (
				<div
					style={{
						position: 'fixed',
						bottom: '1.5rem',
						right: '1.5rem',
						zIndex: 50,
						maxWidth: '28rem',
						padding: '1rem',
						borderRadius: '1rem',
						boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
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
					<Flex direction="row" gap="sm" align="start">
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								flexShrink: 0,
								height: '2rem',
								width: '2rem',
								borderRadius: '0.75rem',
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
						<Flex direction="col" gap="xs" style={{ flexGrow: 1, minWidth: 0 }}>
							<span
								className="text-sm font-semibold"
								style={{
									color: error.includes('importées')
										? 'oklch(0.55 0.15 145)'
										: 'oklch(0.55 0.2 25)',
								}}
							>
								{error.includes('importées') ? 'Import réussi' : 'Erreur'}
							</span>
							<span
								className="text-sm"
								style={{ color: 'hsl(var(--foreground) / 0.8)' }}
							>
								{error}
							</span>
						</Flex>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setError(null)}
							style={{ flexShrink: 0, height: '2rem', width: '2rem', borderRadius: '0.5rem' }}
						>
							<X style={{ height: '1rem', width: '1rem' }} />
						</Button>
					</Flex>
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
					<div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid hsl(var(--border))' }}>
						<SheetHeader>
							<SheetTitle style={{ fontSize: '1rem', fontWeight: 600 }}>Paramètres</SheetTitle>
							<SheetDescription style={{ fontSize: '0.75rem' }}>
								Informations et historique du compte
							</SheetDescription>
						</SheetHeader>
					</div>

					<Flex direction="col" gap="none">
						{/* Section 1: Informations */}
						<Flex direction="col" gap="md" style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))' }}>
							<span
								className="text-xs font-semibold text-muted-foreground"
								style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
							>
								Informations
							</span>

							{/* Account name */}
							<Flex direction="col" gap="sm">
								<label
									htmlFor="settings-account-name"
									className="text-sm text-muted-foreground"
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
							</Flex>

							{/* Description */}
							<Flex direction="col" gap="sm">
								<label
									htmlFor="settings-account-description"
									className="text-sm text-muted-foreground"
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
							</Flex>

							{/* Owners - Multi-select */}
							<Flex direction="col" gap="sm">
								<span className="text-sm text-muted-foreground">Titulaires</span>
								<Flex
									direction="row"
									gap="sm"
									style={{
										flexWrap: 'wrap',
										padding: '0.5rem',
										borderRadius: '0.375rem',
										border: '1px solid hsl(var(--border))',
										backgroundColor: 'hsl(var(--background))',
										minHeight: '42px',
									}}
								>
									{account.accountMembers.map((am) => (
										<Flex
											key={am.id}
											direction="row"
											gap="xs"
											align="center"
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
												style={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													height: '1.25rem',
													width: '1.25rem',
													borderRadius: '9999px',
													color: 'white',
													fontSize: '0.75rem',
													fontWeight: 500,
													backgroundColor: am.member.color || '#6b7280',
												}}
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
											<span className="font-medium">{am.member.name}</span>
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
										</Flex>
									))}
									{/* Loading indicator when adding */}
									{addMemberMutation.isPending && addMemberMutation.variables && (
										<Flex
											direction="row"
											gap="xs"
											align="center"
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
												style={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													height: '1.25rem',
													width: '1.25rem',
													borderRadius: '9999px',
													color: 'white',
													fontSize: '0.75rem',
													fontWeight: 500,
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
										</Flex>
									)}
									{/* Add member button */}
									<div style={{ position: 'relative' }}>
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
												style={{
													position: 'absolute',
													top: '100%',
													left: 0,
													zIndex: 50,
													minWidth: '180px',
													padding: '0.25rem',
													borderRadius: '0.375rem',
													border: '1px solid hsl(var(--border))',
													boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
													backgroundColor: 'hsl(var(--popover))',
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
															style={{
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																height: '1.25rem',
																width: '1.25rem',
																borderRadius: '9999px',
																color: 'white',
																fontSize: '0.75rem',
																fontWeight: 500,
																backgroundColor: member.color || '#6b7280',
															}}
														>
															{member.name.charAt(0).toUpperCase()}
														</div>
														<span>{member.name}</span>
													</Button>
												))}
												{availableMembers.length === 0 && (
													<span
														className="text-sm text-muted-foreground"
														style={{ padding: '0.25rem 0.5rem' }}
													>
														Tous les membres sont ajoutés
													</span>
												)}
											</div>
										)}
									</div>
								</Flex>
							</Flex>

							{/* Export URL */}
							<Flex direction="col" gap="sm">
								<Flex direction="row" justify="between" align="center">
									<label
										htmlFor="settings-export-url"
										className="text-sm text-muted-foreground"
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
								</Flex>
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
							</Flex>

							{/* Initial Balance */}
							<Flex direction="col" gap="sm">
								<span className="text-sm text-muted-foreground">Solde initial</span>
								<Flex direction="row" gap="sm">
									<div style={{ position: 'relative', flexGrow: 1 }}>
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
								</Flex>
							</Flex>
						</Flex>

						{/* Section 2: Imports */}
						<Flex direction="col" gap="sm" style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))' }}>
							<Flex direction="row" justify="between" align="center">
								<span
									className="text-xs font-semibold text-muted-foreground"
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
								</span>
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
							</Flex>

							{accountImports.length === 0 ? (
								<Flex
									direction="col"
									gap="sm"
									align="center"
									style={{
										padding: '1.5rem',
										borderRadius: '0.5rem',
										border: '1px dashed hsl(var(--border))',
										backgroundColor: 'hsl(var(--muted) / 0.2)',
									}}
								>
									<FileSpreadsheet
										style={{
											height: '1.5rem',
											width: '1.5rem',
											color: 'hsl(var(--muted-foreground) / 0.4)',
										}}
									/>
									<span className="text-xs text-muted-foreground">Aucun import</span>
								</Flex>
							) : (
								<Flex direction="col" gap="sm">
									{(showAllImports ? accountImports : accountImports.slice(0, 5)).map((imp) => (
										<Flex
											key={imp.id}
											direction="row"
											gap="sm"
											align="center"
											style={{
												padding: '0.75rem',
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
												style={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													height: '1.5rem',
													width: '1.5rem',
													flexShrink: 0,
													borderRadius: '0.375rem',
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
											<Flex direction="col" gap="xs" style={{ flexGrow: 1, minWidth: 0 }}>
												<span
													className="text-xs font-medium"
													style={{
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap',
													}}
												>
													{imp.filename}
												</span>
												<span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
													{formatRelativeTime(imp.createdAt)}
													{imp.recordsCount !== null && (
														<span style={{ color: 'oklch(0.5 0.15 145)' }}>
															{' '}
															• {imp.recordsCount} tx
														</span>
													)}
												</span>
											</Flex>
											<Flex direction="row" gap="xs" style={{ flexShrink: 0 }}>
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
											</Flex>
										</Flex>
									))}
								</Flex>
							)}
						</Flex>

						{/* Section 3: Gestion du compte */}
						<Flex direction="col" gap="sm" style={{ padding: '0.5rem 1rem' }}>
							<span
								className="text-xs font-semibold text-muted-foreground"
								style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
							>
								Gestion du compte
							</span>
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
								<span
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
								</span>
							)}
						</Flex>
					</Flex>
				</SheetContent>
			</Sheet>

			{/* Transactions - Glassmorphism Section with Infinite Scroll */}
			<GlassCard style={{ padding: 0 }}>
				{/* Header */}
				<div style={{ padding: '1.5rem', paddingBottom: '1rem' }}>
					<Flex direction="col" gap="md">
						{/* Title row */}
						<Flex direction="row" justify="between" align="center">
							<Flex direction="row" gap="sm" align="center">
								<h2 className="text-xl font-bold tracking-tight">
									Transactions
								</h2>
								{totalTransactions > 0 && (
									<span
										className="text-xs font-semibold"
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
									</span>
								)}
							</Flex>
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
						</Flex>
						{/* Search row */}
						<div style={{ position: 'relative' }}>
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
					</Flex>
				</div>

				{/* Content */}
				<div
					role="presentation"
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
					style={{
						position: 'relative',
						padding: '0 1.5rem 1.5rem',
						backgroundColor: dragActive ? 'hsl(var(--primary) / 0.05)' : 'transparent',
					}}
				>
					{/* Drag overlay */}
					{dragActive && (
						<Flex
							direction="col"
							gap="sm"
							align="center"
							justify="center"
							style={{
								position: 'absolute',
								inset: '0.5rem',
								borderRadius: '1rem',
								zIndex: 10,
								background:
									'linear-gradient(to bottom right, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05))',
								border: '2px dashed hsl(var(--primary) / 0.5)',
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									height: '4rem',
									width: '4rem',
									borderRadius: '1rem',
									backgroundColor: 'hsl(var(--primary) / 0.1)',
								}}
							>
								<Upload style={{ height: '2rem', width: '2rem', color: 'hsl(var(--primary))' }} />
							</div>
							<span className="text-sm font-semibold" style={{ color: 'hsl(var(--primary))' }}>
								Déposez votre fichier ici
							</span>
							<span className="text-xs" style={{ color: 'hsl(var(--primary) / 0.7)' }}>
								CSV, XLSX ou XLS
							</span>
						</Flex>
					)}

					{allTransactions.length === 0 && !isLoadingTransactions ? (
						<EmptyState
							icon={FileSpreadsheet}
							title="Aucune transaction"
							description="Glissez un fichier CSV ou cliquez sur Importer pour ajouter vos transactions"
							size="md"
						/>
					) : (
						<Flex direction="col" gap="sm">
							{allTransactions.map((tx, index) => (
								<Flex
									key={tx.id}
									direction="row"
									justify="between"
									align="center"
									style={{
										padding: '0.875rem 1rem',
										borderRadius: '0.75rem',
										transition: 'all 0.2s',
										cursor: 'default',
										animationDelay: `${Math.min(index, 10) * 20}ms`,
									}}
								>
									<Flex direction="row" gap="md" align="center" style={{ minWidth: 0 }}>
										{/* Date badge */}
										<div style={{ width: '4rem', flexShrink: 0 }}>
											<Flex
												direction="col"
												gap="none"
												align="center"
												style={{
													padding: '0.375rem 0.5rem',
													borderRadius: '0.5rem',
													backgroundColor: 'hsl(var(--muted) / 0.4)',
													display: 'inline-flex',
													transition: 'background-color 0.2s',
												}}
											>
												<span
													style={{
														fontSize: '10px',
														fontWeight: 600,
														color: 'hsl(var(--muted-foreground))',
														textTransform: 'uppercase',
														letterSpacing: '0.05em',
													}}
												>
													{formatDate(tx.date, 'MMM')}
												</span>
												<span className="text-sm font-bold" style={{ marginTop: '-0.125rem' }}>
													{formatDate(tx.date, 'D')}
												</span>
											</Flex>
										</div>
										<Flex direction="col" gap="xs" style={{ minWidth: 0 }}>
											<span
												className="font-medium"
												style={{
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
													transition: 'color 0.2s',
												}}
											>
												{tx.description}
											</span>
											{tx.transactionCategory?.category && (
												<Flex direction="row" gap="xs" style={{ marginTop: '0.125rem' }}>
													<span className="text-xs text-muted-foreground">
														{tx.transactionCategory.category.icon}
													</span>
													<span className="text-xs text-muted-foreground">
														{tx.transactionCategory.category.name}
													</span>
												</Flex>
											)}
										</Flex>
									</Flex>
									<MoneyDisplay
										amount={tx.type === 'INCOME' ? tx.amount : -tx.amount}
										format="withSign"
										size="md"
										weight="bold"
										variant={tx.type === 'INCOME' ? 'positive' : 'default'}
										style={{ flexShrink: 0, marginLeft: '1rem' }}
									/>
								</Flex>
							))}

							{/* Infinite scroll trigger & loading indicator */}
							<div ref={loadMoreRef} style={{ padding: '2rem 0' }}>
								{isLoadingMore ? (
									<Flex direction="row" gap="sm" justify="center" align="center">
										<div style={{ position: 'relative' }}>
											<div
												style={{
													height: '2rem',
													width: '2rem',
													borderRadius: '9999px',
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
										<span className="text-sm text-muted-foreground font-medium">Chargement...</span>
									</Flex>
								) : hasMore ? (
									<Flex direction="col" gap="sm" align="center">
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
									</Flex>
								) : allTransactions.length > 0 ? (
									<Flex
										direction="row"
										gap="sm"
										justify="center"
										align="center"
										style={{ paddingTop: '1rem', borderTop: '1px solid hsl(var(--border) / 0.3)' }}
									>
										<CheckCircle2
											style={{
												height: '1rem',
												width: '1rem',
												color: 'hsl(var(--muted-foreground) / 0.5)',
											}}
										/>
										<span className="text-sm text-muted-foreground">
											{allTransactions.length} transactions affichées
										</span>
									</Flex>
								) : null}
							</div>
						</Flex>
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
		</Flex>
	);
}
