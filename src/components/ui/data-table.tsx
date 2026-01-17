'use client';

/**
 * DataTable Component
 *
 * A reusable data table component built with TanStack Table.
 * Supports sorting, filtering, pagination, and row selection.
 */

import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type OnChangeFn,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	type Table as TableType,
} from '@tanstack/react-table';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './select';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	// Pagination
	pageCount?: number;
	pagination?: PaginationState;
	onPaginationChange?: (pagination: PaginationState) => void;
	manualPagination?: boolean;
	// Selection
	enableRowSelection?: boolean;
	rowSelection?: RowSelectionState;
	onRowSelectionChange?: OnChangeFn<RowSelectionState>;
	// Sorting
	sorting?: SortingState;
	onSortingChange?: OnChangeFn<SortingState>;
	manualSorting?: boolean;
	// Filtering
	columnFilters?: ColumnFiltersState;
	onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
	globalFilter?: string;
	onGlobalFilterChange?: (filter: string) => void;
	// Styling
	className?: string;
	// Loading
	isLoading?: boolean;
	// Empty state
	emptyMessage?: string;
	// Row click
	onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pageCount,
	pagination: externalPagination,
	onPaginationChange,
	manualPagination = false,
	enableRowSelection = false,
	rowSelection: externalRowSelection,
	onRowSelectionChange,
	sorting: externalSorting,
	onSortingChange,
	manualSorting = false,
	columnFilters: externalColumnFilters,
	onColumnFiltersChange,
	globalFilter: externalGlobalFilter,
	onGlobalFilterChange,
	className,
	isLoading,
	emptyMessage = 'Aucun résultat.',
	onRowClick,
}: DataTableProps<TData, TValue>) {
	// Internal state (used when external state is not provided)
	const [internalSorting, setInternalSorting] = useState<SortingState>([]);
	const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([]);
	const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
	const [internalPagination, setInternalPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	// Use external state if provided, otherwise use internal
	const sorting = externalSorting ?? internalSorting;
	const columnFilters = externalColumnFilters ?? internalColumnFilters;
	const rowSelection = externalRowSelection ?? internalRowSelection;
	const pagination = externalPagination ?? internalPagination;

	const table = useReactTable({
		data,
		columns,
		pageCount: manualPagination ? pageCount : undefined,
		state: {
			sorting,
			columnFilters,
			rowSelection,
			pagination,
			globalFilter: externalGlobalFilter,
		},
		enableRowSelection,
		onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
		onSortingChange: onSortingChange ?? setInternalSorting,
		onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
		onPaginationChange: (updater) => {
			const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
			if (onPaginationChange) {
				onPaginationChange(newPagination);
			} else {
				setInternalPagination(newPagination);
			}
		},
		onGlobalFilterChange: onGlobalFilterChange,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: manualSorting ? undefined : getFilteredRowModel(),
		getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
		getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
		manualPagination,
		manualSorting,
	});

	return (
		<div className={className}>
			<div className="rounded-md border">
				<table className="w-full">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="border-b bg-muted/50">
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										colSpan={header.colSpan}
										className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
									>
										{header.isPlaceholder ? null : (
											<div
												className={
													header.column.getCanSort()
														? 'flex cursor-pointer select-none items-center gap-1'
														: ''
												}
												onClick={header.column.getToggleSortingHandler()}
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
												{header.column.getCanSort() && (
													<span className="ml-1">
														{{
															asc: <ChevronUp className="h-4 w-4" />,
															desc: <ChevronDown className="h-4 w-4" />,
														}[header.column.getIsSorted() as string] ?? (
															<ChevronDown className="h-4 w-4 opacity-30" />
														)}
													</span>
												)}
											</div>
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
									className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${
										onRowClick ? 'cursor-pointer' : ''
									}`}
									onClick={() => onRowClick?.(row.original)}
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
									{emptyMessage}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<DataTablePagination table={table} />
		</div>
	);
}

/**
 * Pagination component for DataTable
 */
interface DataTablePaginationProps<TData> {
	table: TableType<TData>;
}

function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
	const selectedCount = table.getFilteredSelectedRowModel().rows.length;
	const totalCount = table.getFilteredRowModel().rows.length;

	return (
		<div className="flex items-center justify-between px-2 py-4">
			<div className="flex-1 text-sm text-muted-foreground">
				{selectedCount > 0 ? (
					<span>
						{selectedCount} sur {totalCount} ligne(s) sélectionnée(s).
					</span>
				) : (
					<span>{totalCount} ligne(s)</span>
				)}
			</div>
			<div className="flex items-center space-x-6 lg:space-x-8">
				<div className="flex items-center space-x-2">
					<p className="text-sm font-medium">Lignes par page</p>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 50, 100].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex w-[100px] items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Première page</span>
						<ChevronsLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Page précédente</span>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Page suivante</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Dernière page</span>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

/**
 * Helper: Create a selection column for the table
 */
export function createSelectionColumn<TData>(): ColumnDef<TData> {
	return {
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Tout sélectionner"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Sélectionner la ligne"
				onClick={(e) => e.stopPropagation()}
			/>
		),
		enableSorting: false,
		enableHiding: false,
	};
}
