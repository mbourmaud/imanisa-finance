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
	Box,
	Button,
	DataTable,
	Flex,
	HStack,
	Input,
	Search,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Text,
	VStack,
	X,
} from '@/components';
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
			<Flex align="center" justify="center" style={{ height: '12rem' }}>
				<Text color="muted">Erreur lors du chargement des transactions</Text>
			</Flex>
		);
	}

	return (
		<VStack gap="md">
			{/* Filters */}
			<Flex gap="md" style={{ flexDirection: 'column' }}>
				<Box position="relative" style={{ flex: 1 }}>
					<Search
						style={{
							position: 'absolute',
							left: '0.75rem',
							top: '50%',
							height: '1rem',
							width: '1rem',
							transform: 'translateY(-50%)',
							color: 'hsl(var(--muted-foreground))',
						}}
					/>
					<Input
						placeholder="Rechercher une transaction..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						style={{ paddingLeft: '2.5rem' }}
					/>
				</Box>
				<HStack gap="md">
					<Select
						value={typeFilter}
						onValueChange={(v) => setTypeFilter(v as TransactionType | 'all')}
					>
						<SelectTrigger style={{ width: '150px' }}>
							<SelectValue placeholder="Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tous</SelectItem>
							<SelectItem value="income">Revenus</SelectItem>
							<SelectItem value="expense">Dépenses</SelectItem>
						</SelectContent>
					</Select>
					{hasActiveFilters && (
						<Button
							variant="ghost"
							onClick={clearFilters}
							iconLeft={<X style={{ height: '1rem', width: '1rem' }} />}
						>
							Effacer
						</Button>
					)}
				</HStack>
			</Flex>

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
		</VStack>
	);
}
