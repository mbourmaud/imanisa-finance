'use client'

/**
 * Transaction Table Columns
 *
 * Column definitions for the transactions data table using TanStack Table.
 */

import type { ColumnDef } from '@tanstack/react-table'
import {
	Button,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
	MoreHorizontal,
} from '@/components'
import { Repeat } from 'lucide-react'
import { formatMoneyCompact } from '@/shared/utils'
import { CategoryBadge } from '@/components/transactions/CategoryBadge'
import { MemberAvatarGroup } from '@/components/members/MemberAvatarGroup'
import { BankLogo } from '@/components/banks/BankLogo'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Transaction } from '../types'

interface CategoryOption {
	id: string
	name: string
	icon: string
	color: string
}

export interface RecurringInfo {
	id: string
	description: string
	amount: number
	frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
	occurrenceCount: number
	categoryName?: string
}

const FREQUENCY_LABELS: Record<string, string> = {
	WEEKLY: 'Hebdomadaire',
	MONTHLY: 'Mensuel',
	QUARTERLY: 'Trimestriel',
	ANNUAL: 'Annuel',
}

/** Client-side normalization matching server-side normalizeDescription */
function normalizeDescription(description: string): string {
	return description
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toUpperCase()
		.trim()
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'short',
	}).format(d)
}

/**
 * Format relative date (today, yesterday, etc.)
 */
function formatRelativeDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)

	if (d.toDateString() === today.toDateString()) {
		return "Aujourd'hui"
	}
	if (d.toDateString() === yesterday.toDateString()) {
		return 'Hier'
	}
	return formatDate(d)
}

interface TransactionColumnsOptions {
	onEdit?: (transaction: Transaction) => void
	onDelete?: (transaction: Transaction) => void
	onCategorize?: (transactionId: string, categoryId: string) => void
	categories?: CategoryOption[]
	/** Map of normalized description → recurring pattern info */
	recurringMap?: Map<string, RecurringInfo>
	enableSelection?: boolean
}

/**
 * Create transaction table columns
 */
export function createTransactionColumns(
	options?: TransactionColumnsOptions,
): ColumnDef<Transaction>[] {
	const columns: ColumnDef<Transaction>[] = []

	// Selection column (only when enabled)
	if (options?.enableSelection) {
		columns.push({
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
		})
	}

	columns.push(
		// Date column
		{
			accessorKey: 'date',
			header: 'Date',
			cell: ({ row }) => {
				const date = row.getValue('date') as Date
				return (
					<span className="text-sm whitespace-nowrap">{formatRelativeDate(date)}</span>
				)
			},
			sortingFn: 'datetime',
			size: 110,
		},
		// Description + Category column
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => {
				const transaction = row.original
				const cat = transaction.transactionCategory?.category
				const recurring = options?.recurringMap?.get(
					normalizeDescription(transaction.description),
				)

				return (
					<div className="flex flex-col min-w-0 gap-0.5">
						<div className="flex items-center gap-1.5 min-w-0">
							<span className="text-sm font-medium truncate">{transaction.description}</span>
							{recurring && (
								<Tooltip>
									<TooltipTrigger asChild>
										<span className="shrink-0 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary h-4 w-4">
											<Repeat className="h-2.5 w-2.5 stroke-[2.5]" />
										</span>
									</TooltipTrigger>
									<TooltipContent>
										{FREQUENCY_LABELS[recurring.frequency]} · {recurring.occurrenceCount} occurrences
									</TooltipContent>
								</Tooltip>
							)}
						</div>
						{cat ? (
							<CategoryBadge
								category={{ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color }}
							/>
						) : (
							<span className="text-xs text-muted-foreground">Non catégorisé</span>
						)}
					</div>
				)
			},
		},
		// Account column (bank logo + name)
		{
			id: 'account',
			header: 'Compte',
			cell: ({ row }) => {
				const { account } = row.original

				return (
					<div className="flex items-center gap-2">
						<BankLogo
							bankId={account.bank.id}
							bankName={account.bank.name}
							bankColor={account.bank.color}
							logo={account.bank.logo}
							size="sm"
							disabled
						/>
						<div className="flex flex-col min-w-0 gap-0.5">
							<span className="text-sm font-medium truncate">{account.name}</span>
							<span className="text-xs text-muted-foreground truncate">{account.bank.name}</span>
						</div>
					</div>
				)
			},
			size: 220,
		},
		// Members column
		{
			id: 'members',
			header: '',
			cell: ({ row }) => {
				const members = row.original.account.accountMembers
				const memberData = members.map((m) => ({
					id: m.member.id,
					name: m.member.name,
					color: m.member.color,
					avatarUrl: m.member.avatarUrl,
				}))

				if (memberData.length === 0) return null

				return <MemberAvatarGroup members={memberData} size="sm" />
			},
			enableSorting: false,
			size: 80,
		},
		// Amount column
		{
			accessorKey: 'amount',
			header: () => <div className="text-right">Montant</div>,
			cell: ({ row }) => {
				const transaction = row.original
				const amount = transaction.amount
				const isIncome = transaction.type === 'INCOME'
				const displayAmount = isIncome ? amount : -amount

				return (
					<span
						className={`text-sm font-medium text-right tabular-nums whitespace-nowrap ${isIncome ? 'text-emerald-600' : ''}`}
					>
						{isIncome ? '+' : ''}
						{formatMoneyCompact(displayAmount)}
					</span>
				)
			},
			sortingFn: (rowA, rowB) => {
				const amountA =
					rowA.original.type === 'INCOME' ? rowA.original.amount : -rowA.original.amount
				const amountB =
					rowB.original.type === 'INCOME' ? rowB.original.amount : -rowB.original.amount
				return amountA - amountB
			},
			size: 120,
		},
		// Actions column
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) => {
				const transaction = row.original
				const categories = options?.categories ?? []

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={(e) => e.stopPropagation()}
							>
								<span className="sr-only">Ouvrir le menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{categories.length > 0 && options?.onCategorize && (
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>Catégoriser</DropdownMenuSubTrigger>
									<DropdownMenuSubContent className="max-h-80 overflow-y-auto">
										{categories.map((cat) => (
											<DropdownMenuItem
												key={cat.id}
												onClick={() => options.onCategorize?.(transaction.id, cat.id)}
											>
												<CategoryBadge category={cat} size="sm" />
											</DropdownMenuItem>
										))}
									</DropdownMenuSubContent>
								</DropdownMenuSub>
							)}
							{options?.onEdit && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => options.onEdit?.(transaction)}>
										Modifier
									</DropdownMenuItem>
								</>
							)}
							{options?.onDelete && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => options.onDelete?.(transaction)}
										className="text-destructive"
									>
										Supprimer
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)
			},
			size: 50,
		},
	)

	return columns
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
				const date = row.getValue('date') as Date
				return <span className="text-sm text-muted-foreground">{formatRelativeDate(date)}</span>
			},
			sortingFn: 'datetime',
			size: 100,
		},
		// Description column (compact)
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => {
				const transaction = row.original
				const cat = transaction.transactionCategory?.category
				return (
					<div className="flex flex-col min-w-0">
						<span className="text-sm font-medium truncate">{transaction.description}</span>
						{cat && (
							<CategoryBadge
								category={{ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color }}
							/>
						)}
					</div>
				)
			},
		},
		// Amount column (compact)
		{
			accessorKey: 'amount',
			header: () => <div className="text-right">Montant</div>,
			cell: ({ row }) => {
				const transaction = row.original
				const amount = transaction.amount
				const isIncome = transaction.type === 'INCOME'
				const displayAmount = isIncome ? amount : -amount

				return (
					<span
						className={`text-sm font-medium text-right tabular-nums ${
							isIncome ? 'text-emerald-600' : ''
						}`}
					>
						{isIncome ? '+' : ''}
						{formatMoneyCompact(displayAmount)}
					</span>
				)
			},
			size: 120,
		},
	]
}
