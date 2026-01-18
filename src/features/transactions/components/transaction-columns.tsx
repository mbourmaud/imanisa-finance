'use client';

/**
 * Transaction Table Columns
 *
 * Column definitions for the transactions data table using TanStack Table.
 */

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components';
import { Checkbox } from '@/components';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
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
export function createTransactionColumns(options?: TransactionColumnsOptions): ColumnDef<Transaction>[] {
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
					<div className="text-sm">
						<div className="font-medium">{formatRelativeDate(date)}</div>
						<div className="text-xs text-muted-foreground">{formatDate(date)}</div>
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
							className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
								isIncome ? 'bg-emerald-500/10' : 'bg-muted'
							}`}
						>
							{isIncome ? (
								<ArrowDownLeft className="h-4 w-4 text-emerald-500" />
							) : (
								<ArrowUpRight className="h-4 w-4 text-muted-foreground" />
							)}
						</div>
						<div className="min-w-0">
							<div className="truncate font-medium">{transaction.description}</div>
							<div className="text-xs text-muted-foreground">
								{transaction.category || 'Non catégorisé'}
							</div>
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
				return <div className="text-sm text-muted-foreground">{accountName}</div>;
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
					<div className={`text-right font-medium tabular-nums ${isIncome ? 'text-emerald-600' : ''}`}>
						{isIncome ? '+' : ''}
						{formatCurrency(displayAmount)}
					</div>
				);
			},
			sortingFn: (rowA, rowB) => {
				const amountA = rowA.original.type === 'income' ? rowA.original.amount : -rowA.original.amount;
				const amountB = rowB.original.type === 'income' ? rowB.original.amount : -rowB.original.amount;
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
							<Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
								<span className="sr-only">Ouvrir le menu</span>
								<MoreHorizontal className="h-4 w-4" />
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
									className="text-destructive focus:text-destructive"
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
				return <div className="text-sm text-muted-foreground">{formatRelativeDate(date)}</div>;
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
					<div className="min-w-0">
						<div className="truncate font-medium text-sm">{transaction.description}</div>
						{transaction.category && (
							<div className="text-xs text-muted-foreground">{transaction.category}</div>
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
					<div className={`text-right font-medium tabular-nums text-sm ${isIncome ? 'text-emerald-600' : ''}`}>
						{isIncome ? '+' : ''}
						{formatCurrency(displayAmount)}
					</div>
				);
			},
			size: 120,
		},
	];
}
