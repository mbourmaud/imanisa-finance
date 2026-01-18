'use client';

/**
 * Transaction Table Columns
 *
 * Column definitions for the transactions data table using TanStack Table.
 */

import type { ColumnDef } from '@tanstack/react-table';
import {
	ArrowDownLeft,
	ArrowUpRight,
	Button,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	MoreHorizontal,
} from '@/components';
import type { Transaction } from '../types';

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
	}).format(amount);
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(d);
}

/**
 * Format relative date (today, yesterday, etc.)
 */
function formatRelativeDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (d.toDateString() === today.toDateString()) {
		return "Aujourd'hui";
	}
	if (d.toDateString() === yesterday.toDateString()) {
		return 'Hier';
	}
	return formatDate(d);
}

interface TransactionColumnsOptions {
	onEdit?: (transaction: Transaction) => void;
	onDelete?: (transaction: Transaction) => void;
	onCategorize?: (transaction: Transaction) => void;
}

/**
 * Create transaction table columns
 */
export function createTransactionColumns(
	options?: TransactionColumnsOptions,
): ColumnDef<Transaction>[] {
	return [
		// Selection column
		{
			id: 'select',
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && 'indeterminate')
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
			size: 40,
		},
		// Date column
		{
			accessorKey: 'date',
			header: 'Date',
			cell: ({ row }) => {
				const date = row.getValue('date') as Date;
				return (
					<div className="flex flex-col">
						<span className="text-sm font-medium">{formatRelativeDate(date)}</span>
						<span className="text-xs text-muted-foreground">{formatDate(date)}</span>
					</div>
				);
			},
			sortingFn: 'datetime',
		},
		// Description column
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => {
				const transaction = row.original;
				const isIncome = transaction.type === 'income';

				return (
					<div className="flex items-center gap-3">
						<div
							className={`flex items-center justify-center rounded-lg h-9 w-9 shrink-0 ${
								isIncome ? 'bg-emerald-500/10' : 'bg-muted'
							}`}
						>
							{isIncome ? (
								<ArrowDownLeft className="h-4 w-4 text-emerald-500" />
							) : (
								<ArrowUpRight className="h-4 w-4 text-muted-foreground" />
							)}
						</div>
						<div className="flex flex-col min-w-0">
							<span className="font-medium truncate">{transaction.description}</span>
							<span className="text-xs text-muted-foreground">
								{transaction.category || 'Non catégorisé'}
							</span>
						</div>
					</div>
				);
			},
		},
		// Account column
		{
			accessorKey: 'accountName',
			header: 'Compte',
			cell: ({ row }) => {
				const accountName = row.getValue('accountName') as string;
				return <span className="text-sm text-muted-foreground">{accountName}</span>;
			},
		},
		// Amount column
		{
			accessorKey: 'amount',
			header: () => <div className="text-right">Montant</div>,
			cell: ({ row }) => {
				const transaction = row.original;
				const amount = transaction.amount;
				const isIncome = transaction.type === 'income';
				const displayAmount = isIncome ? amount : -amount;

				return (
					<span
						className={`font-medium text-right tabular-nums ${isIncome ? 'text-emerald-600' : ''}`}
					>
						{isIncome ? '+' : ''}
						{formatCurrency(displayAmount)}
					</span>
				);
			},
			sortingFn: (rowA, rowB) => {
				const amountA =
					rowA.original.type === 'income' ? rowA.original.amount : -rowA.original.amount;
				const amountB =
					rowB.original.type === 'income' ? rowB.original.amount : -rowB.original.amount;
				return amountA - amountB;
			},
		},
		// Actions column
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) => {
				const transaction = row.original;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								style={{ height: '2rem', width: '2rem' }}
								onClick={(e) => e.stopPropagation()}
							>
								<span
									style={{
										position: 'absolute',
										width: '1px',
										height: '1px',
										padding: 0,
										margin: '-1px',
										overflow: 'hidden',
										clip: 'rect(0,0,0,0)',
										whiteSpace: 'nowrap',
										border: 0,
									}}
								>
									Ouvrir le menu
								</span>
								<MoreHorizontal style={{ height: '1rem', width: '1rem' }} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.id)}>
								Copier l&apos;ID
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{options?.onCategorize && (
								<DropdownMenuItem onClick={() => options.onCategorize?.(transaction)}>
									Catégoriser
								</DropdownMenuItem>
							)}
							{options?.onEdit && (
								<DropdownMenuItem onClick={() => options.onEdit?.(transaction)}>
									Modifier
								</DropdownMenuItem>
							)}
							{options?.onDelete && (
								<DropdownMenuItem
									onClick={() => options.onDelete?.(transaction)}
									style={{ color: 'hsl(var(--destructive))' }}
								>
									Supprimer
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];
}

/**
 * Compact columns for embedded views (e.g., account detail page)
 */
export function createCompactTransactionColumns(): ColumnDef<Transaction>[] {
	return [
		// Date column (compact)
		{
			accessorKey: 'date',
			header: 'Date',
			cell: ({ row }) => {
				const date = row.getValue('date') as Date;
				return <span className="text-sm text-muted-foreground">{formatRelativeDate(date)}</span>;
			},
			sortingFn: 'datetime',
			size: 100,
		},
		// Description column (compact)
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => {
				const transaction = row.original;
				return (
					<div className="flex flex-col min-w-0">
						<span className="text-sm font-medium truncate">{transaction.description}</span>
						{transaction.category && (
							<span className="text-xs text-muted-foreground">{transaction.category}</span>
						)}
					</div>
				);
			},
		},
		// Amount column (compact)
		{
			accessorKey: 'amount',
			header: () => <div className="text-right">Montant</div>,
			cell: ({ row }) => {
				const transaction = row.original;
				const amount = transaction.amount;
				const isIncome = transaction.type === 'income';
				const displayAmount = isIncome ? amount : -amount;

				return (
					<span
						className={`text-sm font-medium text-right tabular-nums ${
							isIncome ? 'text-emerald-600' : ''
						}`}
					>
						{isIncome ? '+' : ''}
						{formatCurrency(displayAmount)}
					</span>
				);
			},
			size: 120,
		},
	];
}
