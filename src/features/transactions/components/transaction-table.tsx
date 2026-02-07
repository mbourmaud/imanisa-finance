'use client';

/**
 * Transaction Table Component
 *
 * A full-featured transaction table using TanStack Table and React Query.
 * Supports sorting, filtering, pagination, and row selection.
 */

import type {
	PaginationState,
	RowSelectionState,
	SortingState,
	Updater,
} from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import {
	Button,
	DataTable,
	Input,
	Search,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	X,
} from '@/components';
import { useAccountsQuery } from '@/features/accounts';
import { useMembersQuery } from '@/features/members';
import { useTransactionsQuery } from '../hooks/use-transactions-query';
import type { Transaction, TransactionFilters, TransactionType } from '../types';
import { createTransactionColumns } from './transaction-columns';

interface TransactionTableProps {
	/** Initial filters to apply */
	initialFilters?: TransactionFilters;
	/** Callback when a transaction is selected for editing */
	onEdit?: (transaction: Transaction) => void;
	/** Callback when a transaction should be deleted */
	onDelete?: (transaction: Transaction) => void;
	/** Callback when a transaction should be categorized */
	onCategorize?: (transaction: Transaction) => void;
	/** Callback when row selection changes */
	onSelectionChange?: (selectedIds: string[]) => void;
	/** Enable row selection */
	enableSelection?: boolean;
	/** Page size options */
	pageSizeOptions?: number[];
}

export function TransactionTable({
	initialFilters,
	onEdit,
	onDelete,
	onCategorize,
	onSelectionChange,
	enableSelection = false,
	pageSizeOptions = [10, 20, 50, 100],
}: TransactionTableProps) {
	// Filters state
	const [search, setSearch] = useState(initialFilters?.search ?? '');
	const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>(
		initialFilters?.type ?? 'all',
	);
	const [accountFilter, setAccountFilter] = useState<string>(
		initialFilters?.accountId ?? 'all',
	);
	const [memberFilter, setMemberFilter] = useState<string>(
		initialFilters?.memberId ?? 'all',
	);

	// Fetch accounts and members for filter dropdowns
	const { data: accounts } = useAccountsQuery();
	const { data: members } = useMembersQuery();

	// Table state
	const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: pageSizeOptions[0],
	});

	// Build filters for API
	const filters: TransactionFilters = useMemo(
		() => ({
			...initialFilters,
			search: search || undefined,
			type: typeFilter !== 'all' ? typeFilter : undefined,
			accountId: accountFilter !== 'all' ? accountFilter : undefined,
			memberId: memberFilter !== 'all' ? memberFilter : undefined,
		}),
		[initialFilters, search, typeFilter, accountFilter, memberFilter],
	);

	// Fetch transactions
	const { data, isLoading, isError } = useTransactionsQuery(filters, {
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
	});

	// Create columns with action handlers
	const columns = useMemo(
		() =>
			createTransactionColumns({
				onEdit,
				onDelete,
				onCategorize,
				enableSelection,
			}),
		[onEdit, onDelete, onCategorize, enableSelection],
	);

	// Handle row selection changes
	const handleRowSelectionChange = useCallback(
		(updaterOrValue: Updater<RowSelectionState>) => {
			const newSelection =
				typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;
			setRowSelection(newSelection);
			if (onSelectionChange && data?.items) {
				const selectedIds = Object.keys(newSelection)
					.filter((key) => newSelection[key])
					.map((key) => {
						const index = Number.parseInt(key, 10);
						return data.items[index]?.id;
					})
					.filter(Boolean) as string[];
				onSelectionChange(selectedIds);
			}
		},
		[rowSelection, onSelectionChange, data?.items],
	);

	// Handle pagination changes
	const handlePaginationChange = (newPagination: PaginationState) => {
		setPagination(newPagination);
		// Reset selection when changing pages
		setRowSelection({});
	};

	// Clear all filters
	const clearFilters = () => {
		setSearch('');
		setTypeFilter('all');
		setAccountFilter('all');
		setMemberFilter('all');
	};

	const hasActiveFilters =
		search || typeFilter !== 'all' || accountFilter !== 'all' || memberFilter !== 'all';

	if (isError) {
		return (
			<div className="flex items-center justify-center h-48">
				<span className="text-muted-foreground">Erreur lors du chargement des transactions</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Filters - single inline row */}
			<div className="flex items-center gap-2 flex-wrap">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Rechercher..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select
					value={typeFilter}
					onValueChange={(v) => setTypeFilter(v as TransactionType | 'all')}
				>
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tous types</SelectItem>
						<SelectItem value="income">Revenus</SelectItem>
						<SelectItem value="expense">Dépenses</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={accountFilter}
					onValueChange={(v) => setAccountFilter(v)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Compte" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tous les comptes</SelectItem>
						{accounts?.map((account) => (
							<SelectItem key={account.id} value={account.id}>
								{account.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={memberFilter}
					onValueChange={(v) => setMemberFilter(v)}
				>
					<SelectTrigger className="w-[160px]">
						<SelectValue placeholder="Personne" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Toutes les personnes</SelectItem>
						{members?.map((member) => (
							<SelectItem key={member.id} value={member.id}>
								{member.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						iconLeft={<X className="h-4 w-4" />}
					>
						Effacer
					</Button>
				)}
			</div>

			{/* Table */}
			<DataTable
				columns={columns}
				data={data?.items ?? []}
				isLoading={isLoading}
				// Pagination
				manualPagination
				pagination={pagination}
				onPaginationChange={handlePaginationChange}
				pageCount={data?.totalPages ?? 0}
				// Sorting
				sorting={sorting}
				onSortingChange={setSorting}
				// Selection
				enableRowSelection={enableSelection}
				rowSelection={rowSelection}
				onRowSelectionChange={handleRowSelectionChange}
				// Empty state
				emptyMessage="Aucune transaction trouvée"
			/>
		</div>
	);
}
