'use client';

/**
 * Transaction Table Component
 *
 * A full-featured transaction table using TanStack Table and React Query.
 * Supports sorting, filtering, pagination, and row selection.
 */

import { useMemo, useState, useCallback } from 'react';
import type { PaginationState, RowSelectionState, SortingState, Updater } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { DataTable } from '@/components';
import { Input } from '@/components';
import { Button } from '@/components';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components';
import { useTransactionsQuery } from '../hooks/use-transactions-query';
import { createTransactionColumns } from './transaction-columns';
import type { Transaction, TransactionFilters, TransactionType } from '../types';

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
	enableSelection = true,
	pageSizeOptions = [10, 20, 50, 100],
}: TransactionTableProps) {
	// Filters state
	const [search, setSearch] = useState(initialFilters?.search ?? '');
	const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>(
		initialFilters?.type ?? 'all',
	);
	const [accountFilter, setAccountFilter] = useState<string>(initialFilters?.accountId ?? 'all');

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
		}),
		[initialFilters, search, typeFilter, accountFilter],
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
			}),
		[onEdit, onDelete, onCategorize],
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
	};

	const hasActiveFilters = search || typeFilter !== 'all' || accountFilter !== 'all';

	if (isError) {
		return (
			<div className="flex h-48 items-center justify-center text-muted-foreground">
				Erreur lors du chargement des transactions
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Rechercher une transaction..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType | 'all')}>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tous</SelectItem>
						<SelectItem value="income">Revenus</SelectItem>
						<SelectItem value="expense">Dépenses</SelectItem>
					</SelectContent>
				</Select>
				{hasActiveFilters && (
					<Button variant="ghost" onClick={clearFilters} className="gap-2">
						<X className="h-4 w-4" />
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
