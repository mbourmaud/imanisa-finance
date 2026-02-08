'use client';

/**
 * Transaction Table Component
 *
 * A full-featured transaction table with infinite scroll.
 * Supports sorting, filtering, row selection, and bulk actions.
 */

import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type RowSelectionState,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronUp, Download, Loader2, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import {
	Button,
	Input,
	Search,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	X,
} from '@/components';
import { MemberAvatar } from '@/components/members/MemberAvatar';
import { MemberAvatarGroup } from '@/components/members/MemberAvatarGroup';
import { CategoryBadge } from '@/components/transactions/CategoryBadge';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAccountsQuery } from '@/features/accounts';
import {
	useCategoriesQuery,
	useCategorizeTransactionMutation,
	useRecurringPatternsQuery,
} from '@/features/categories';
import { useMembersQuery } from '@/features/members';
import { SUPPORTED_BANKS } from '@/shared/constants/supported-banks';
import { useDebounce, useSelectedMemberId } from '@/shared/hooks';
import { useInfiniteTransactionsQuery } from '../hooks/use-transactions-query';
import { transactionService } from '../services/transaction-service';
import type { Transaction, TransactionFilters, TransactionType } from '../types';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { DeleteTransactionDialog } from './DeleteTransactionDialog';
import { EditTransactionSheet } from './EditTransactionSheet';
import { createTransactionColumns, type RecurringInfo } from './transaction-columns';

interface TransactionTableProps {
	/** Initial filters to apply */
	initialFilters?: TransactionFilters;
	/** Callback to open the create transaction sheet */
	onAddClick?: () => void;
}

export function TransactionTable({ initialFilters, onAddClick }: TransactionTableProps) {
	// Global entity selector → member filter
	const globalMemberId = useSelectedMemberId()

	// Filters state
	const [search, setSearch] = useState(initialFilters?.search ?? '');
	const debouncedSearch = useDebounce(search, 300);
	const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>(
		initialFilters?.type ?? 'all',
	);
	const [accountFilter, setAccountFilter] = useState<string>(initialFilters?.accountId ?? 'all');
	const [memberFilter, setMemberFilter] = useState<string>(initialFilters?.memberId ?? 'all');
	const [categoryFilter, setCategoryFilter] = useState<string>(initialFilters?.categoryId ?? 'all');
	const [excludeInternal, setExcludeInternal] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(
		initialFilters?.startDate || initialFilters?.endDate
			? { from: initialFilters?.startDate, to: initialFilters?.endDate }
			: undefined,
	);

	// Edit/Delete state
	const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
	const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

	// Fetch accounts, members, categories, and recurring patterns
	const { data: accounts } = useAccountsQuery();
	const { data: members } = useMembersQuery();
	const { data: categories } = useCategoriesQuery();
	const { data: recurringPatterns } = useRecurringPatternsQuery();

	// Bank name → color lookup from supported banks
	const bankColorMap = useMemo(() => {
		const map = new Map<string, string>();
		for (const bank of SUPPORTED_BANKS) {
			map.set(bank.name, bank.color);
		}
		return map;
	}, []);

	// Table state
	const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	// Build filters for API
	// Local memberFilter overrides global entity selector if set
	const effectiveMemberId = memberFilter !== 'all' ? memberFilter : globalMemberId
	const filters: TransactionFilters = useMemo(
		() => ({
			...initialFilters,
			search: debouncedSearch || undefined,
			type: typeFilter !== 'all' ? typeFilter : undefined,
			accountId: accountFilter !== 'all' ? accountFilter : undefined,
			memberId: effectiveMemberId,
			categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
			excludeInternal: excludeInternal || undefined,
			startDate: dateRange?.from,
			endDate: dateRange?.to,
		}),
		[
			initialFilters,
			debouncedSearch,
			typeFilter,
			accountFilter,
			effectiveMemberId,
			categoryFilter,
			excludeInternal,
			dateRange,
		],
	);

	// Fetch transactions with infinite scroll
	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteTransactionsQuery(filters);

	// Flatten pages into a single array
	const transactions = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

	const totalCount = data?.pages[0]?.total ?? 0;

	// Build account → members map from transaction data
	const accountMembersMap = useMemo(() => {
		const map = new Map<
			string,
			Array<{ id: string; name: string; color: string | null; avatarUrl: string | null }>
		>();
		for (const tx of transactions) {
			if (!map.has(tx.account.id) && tx.account.accountMembers.length > 0) {
				map.set(
					tx.account.id,
					tx.account.accountMembers.map((am) => ({
						id: am.member.id,
						name: am.member.name,
						color: am.member.color,
						avatarUrl: am.member.avatarUrl,
					})),
				);
			}
		}
		return map;
	}, [transactions]);

	// Build recurring patterns lookup by normalized description
	const recurringMap = useMemo(() => {
		const map = new Map<string, RecurringInfo>();
		if (!recurringPatterns) return map;
		for (const p of recurringPatterns) {
			map.set(p.normalizedDescription, {
				id: p.id,
				description: p.description,
				amount: p.amount,
				frequency: p.frequency,
				occurrenceCount: p.occurrenceCount,
				categoryName: p.category?.name,
			});
		}
		return map;
	}, [recurringPatterns]);

	// Categorize mutation
	const categorizeMutation = useCategorizeTransactionMutation();

	const handleCategorize = useCallback(
		async (transactionId: string, categoryId: string) => {
			try {
				await categorizeMutation.mutateAsync({
					transactionId,
					input: { categoryId },
				});
				const cat = categories?.find((c) => c.id === categoryId);
				toast.success(`Catégorie "${cat?.name ?? ''}" appliquée`);
			} catch {
				toast.error('Impossible de catégoriser la transaction');
			}
		},
		[categorizeMutation, categories],
	);

	// Create columns with action handlers
	const columns = useMemo(
		() =>
			createTransactionColumns({
				onEdit: setTransactionToEdit,
				onDelete: setTransactionToDelete,
				onCategorize: handleCategorize,
				categories: categories ?? [],
				recurringMap,
				enableSelection: true,
			}),
		[handleCategorize, categories, recurringMap],
	);

	// Track selected transaction IDs
	const selectedIds = useMemo(() => {
		return Object.keys(rowSelection)
			.filter((key) => rowSelection[key])
			.map((key) => {
				const index = Number.parseInt(key, 10);
				return transactions[index]?.id;
			})
			.filter(Boolean) as string[];
	}, [rowSelection, transactions]);

	// Table instance
	const table = useReactTable({
		data: transactions,
		columns,
		state: {
			sorting,
			rowSelection,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	// Infinite scroll: IntersectionObserver on sentinel element
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Clear all filters
	const clearFilters = () => {
		setSearch('');
		setTypeFilter('all');
		setAccountFilter('all');
		setMemberFilter('all');
		setCategoryFilter('all');
		setExcludeInternal(false);
		setDateRange(undefined);
	};

	const hasActiveFilters =
		search ||
		typeFilter !== 'all' ||
		accountFilter !== 'all' ||
		memberFilter !== 'all' ||
		categoryFilter !== 'all' ||
		excludeInternal ||
		dateRange?.from;

	if (isError) {
		return (
			<div className="flex items-center justify-center h-48">
				<span className="text-muted-foreground">Erreur lors du chargement des transactions</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Top bar: search + actions */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Rechercher une transaction..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						asChild
					>
						<a href={transactionService.getExportUrl(filters)} download>
							<Download className="h-4 w-4" />
							Exporter
						</a>
					</Button>
					{onAddClick && (
						<Button size="sm" onClick={onAddClick}>
							<Plus className="h-4 w-4" />
							Ajouter
						</Button>
					)}
				</div>
			</div>

			{/* Filters row */}
			<div className="flex items-center gap-3 flex-wrap">
				<Select
					value={typeFilter}
					onValueChange={(v) => setTypeFilter(v as TransactionType | 'all')}
				>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tous types</SelectItem>
						<SelectItem value="INCOME">
							<span className="flex items-center gap-2">
								<span className="flex items-center justify-center rounded-md h-5 w-5 bg-emerald-500/10">
									<ArrowDownLeft className="h-3 w-3 text-emerald-500" />
								</span>
								Revenus
							</span>
						</SelectItem>
						<SelectItem value="EXPENSE">
							<span className="flex items-center gap-2">
								<span className="flex items-center justify-center rounded-md h-5 w-5 bg-muted">
									<ArrowUpRight className="h-3 w-3 text-muted-foreground" />
								</span>
								Dépenses
							</span>
						</SelectItem>
					</SelectContent>
				</Select>
				<Select value={accountFilter} onValueChange={(v) => setAccountFilter(v)}>
					<SelectTrigger className="w-[220px]">
						<SelectValue placeholder="Compte" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tous les comptes</SelectItem>
						{accounts?.map((account) => {
							const bankColor = bankColorMap.get(account.bankName) ?? '#888';
							const accountMembers = accountMembersMap.get(account.id) ?? [];
							return (
								<SelectItem key={account.id} value={account.id}>
									<span className="flex items-center gap-2 w-full">
										<span
											className="size-2.5 shrink-0 rounded-full"
											style={{ backgroundColor: bankColor }}
										/>
										<span className="flex flex-col min-w-0 flex-1">
											<span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground truncate">
												{account.bankName}
											</span>
											<span className="text-sm truncate">{account.name}</span>
										</span>
										{accountMembers.length > 0 && (
											<MemberAvatarGroup members={accountMembers} size="xs" />
										)}
									</span>
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
				<Select value={memberFilter} onValueChange={(v) => setMemberFilter(v)}>
					<SelectTrigger className="w-[170px]">
						<SelectValue placeholder="Personne" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Toutes les personnes</SelectItem>
						{members?.map((member, index) => (
							<SelectItem key={member.id} value={member.id}>
								<span className="flex items-center gap-2">
									<MemberAvatar
										member={{
											id: member.id,
											name: member.name,
											color: member.color,
											avatarUrl: member.avatarUrl,
										}}
										size="xs"
										colorIndex={index}
									/>
									{member.name}
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
					<SelectTrigger className="w-[190px]">
						<SelectValue placeholder="Catégorie" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Toutes catégories</SelectItem>
						<SelectItem value="uncategorized">Non catégorisé</SelectItem>
						{categories?.map((cat) => (
							<SelectItem key={cat.id} value={cat.id}>
								<CategoryBadge
									category={{ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color }}
								/>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<DateRangePicker value={dateRange} onChange={setDateRange} />

				<div className="h-5 w-px bg-border" />

				<div className="flex items-center gap-2">
					<Switch
						id="exclude-internal"
						size="sm"
						checked={excludeInternal}
						onCheckedChange={setExcludeInternal}
					/>
					<Label htmlFor="exclude-internal" className="text-sm whitespace-nowrap">
						Masquer virements
					</Label>
				</div>
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						iconLeft={<X className="h-4 w-4" />}
					>
						Effacer les filtres
					</Button>
				)}
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<table className="w-full">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="border-b bg-muted/50">
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										colSpan={header.colSpan}
										style={
											header.column.columnDef.size
												? { width: header.column.columnDef.size }
												: undefined
										}
										className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
									>
										{header.isPlaceholder ? null : header.column.getCanSort() ? (
											<div
												role="button"
												tabIndex={0}
												className="flex cursor-pointer select-none items-center gap-1"
												onClick={header.column.getToggleSortingHandler()}
												onKeyDown={(e) => {
													if (e.key === 'Enter' || e.key === ' ') {
														e.preventDefault();
														header.column.getToggleSortingHandler()?.(e);
													}
												}}
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
												<span className="ml-1">
													{{
														asc: <ChevronUp className="h-4 w-4" />,
														desc: <ChevronDown className="h-4 w-4" />,
													}[header.column.getIsSorted() as string] ?? (
														<ChevronDown className="h-4 w-4 opacity-30" />
													)}
												</span>
											</div>
										) : (
											flexRender(header.column.columnDef.header, header.getContext())
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={columns.length} className="h-24 text-center">
									<div className="flex items-center justify-center">
										<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
									</div>
								</td>
							</tr>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
									className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="p-4 align-middle">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
									Aucune transaction trouvée
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Infinite scroll sentinel + status */}
			<div ref={sentinelRef} className="flex items-center justify-center py-4">
				{isFetchingNextPage ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Chargement...
					</div>
				) : !isLoading && transactions.length > 0 ? (
					<span className="text-sm text-muted-foreground">
						{transactions.length} sur {totalCount} transactions
					</span>
				) : null}
			</div>

			{/* Bulk actions toolbar */}
			<BulkActionsToolbar selectedIds={selectedIds} onClearSelection={() => setRowSelection({})} />

			{/* Edit sheet */}
			<EditTransactionSheet
				transaction={transactionToEdit}
				onOpenChange={(open) => {
					if (!open) setTransactionToEdit(null);
				}}
			/>

			{/* Delete dialog */}
			<DeleteTransactionDialog
				transaction={transactionToDelete}
				onOpenChange={(open) => {
					if (!open) setTransactionToDelete(null);
				}}
			/>
		</div>
	);
}
