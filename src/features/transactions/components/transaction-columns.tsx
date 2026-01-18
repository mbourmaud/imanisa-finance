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
	MoreHorizontal,
	Button,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	VStack,
	HStack,
	Box,
	Flex,
	Text,
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
					<VStack gap="none">
						<Text size="sm" weight="medium">{formatRelativeDate(date)}</Text>
						<Text size="xs" color="muted">{formatDate(date)}</Text>
					</VStack>
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
					<HStack gap="md" align="center">
						<Flex
							align="center"
							justify="center"
							style={{
								borderRadius: '0.5rem',
								height: '2.25rem',
								width: '2.25rem',
								flexShrink: 0,
								backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.1)' : 'hsl(var(--muted))',
							}}
						>
							{isIncome ? (
								<ArrowDownLeft style={{ height: '1rem', width: '1rem', color: 'rgb(16, 185, 129)' }} />
							) : (
								<ArrowUpRight style={{ height: '1rem', width: '1rem', color: 'hsl(var(--muted-foreground))' }} />
							)}
						</Flex>
						<VStack gap="none" style={{ minWidth: 0 }}>
							<Text weight="medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{transaction.description}</Text>
							<Text size="xs" color="muted">
								{transaction.category || 'Non catégorisé'}
							</Text>
						</VStack>
					</HStack>
				);
			},
		},
		// Account column
		{
			accessorKey: 'accountName',
			header: 'Compte',
			cell: ({ row }) => {
				const accountName = row.getValue('accountName') as string;
				return <Text size="sm" color="muted">{accountName}</Text>;
			},
		},
		// Amount column
		{
			accessorKey: 'amount',
			header: () => <Box style={{ textAlign: 'right' }}>Montant</Box>,
			cell: ({ row }) => {
				const transaction = row.original;
				const amount = transaction.amount;
				const isIncome = transaction.type === 'income';
				const displayAmount = isIncome ? amount : -amount;

				return (
					<Text
						weight="medium"
						style={{
							textAlign: 'right',
							fontVariantNumeric: 'tabular-nums',
							color: isIncome ? 'rgb(5, 150, 105)' : undefined,
						}}
					>
						{isIncome ? '+' : ''}
						{formatCurrency(displayAmount)}
					</Text>
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
							<Button variant="ghost" size="icon" style={{ height: '2rem', width: '2rem' }} onClick={(e) => e.stopPropagation()}>
								<span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>Ouvrir le menu</span>
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
				return <Text size="sm" color="muted">{formatRelativeDate(date)}</Text>;
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
					<VStack gap="none" style={{ minWidth: 0 }}>
						<Text size="sm" weight="medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{transaction.description}</Text>
						{transaction.category && (
							<Text size="xs" color="muted">{transaction.category}</Text>
						)}
					</VStack>
				);
			},
		},
		// Amount column (compact)
		{
			accessorKey: 'amount',
			header: () => <Box style={{ textAlign: 'right' }}>Montant</Box>,
			cell: ({ row }) => {
				const transaction = row.original;
				const amount = transaction.amount;
				const isIncome = transaction.type === 'income';
				const displayAmount = isIncome ? amount : -amount;

				return (
					<Text
						size="sm"
						weight="medium"
						style={{
							textAlign: 'right',
							fontVariantNumeric: 'tabular-nums',
							color: isIncome ? 'rgb(5, 150, 105)' : undefined,
						}}
					>
						{isIncome ? '+' : ''}
						{formatCurrency(displayAmount)}
					</Text>
				);
			},
			size: 120,
		},
	];
}
