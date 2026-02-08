'use client'

import { useMemo, useState } from 'react'
import {
	Button,
	ChevronDown,
	ChevronUp,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components'
import { formatMoney } from '@/shared/utils'

interface AmortizationRow {
	month: number
	date: Date
	payment: number
	principal: number
	interest: number
	remaining: number
}

interface LoanAmortizationTableProps {
	initialAmount: number
	rate: number
	monthlyPayment: number
	startDate: string
}

const PAGE_SIZE = 12

function formatMonth(date: Date): string {
	return date.toLocaleDateString('fr-FR', {
		month: 'short',
		year: 'numeric',
	})
}

function computeAmortizationSchedule(
	initialAmount: number,
	annualRate: number,
	monthlyPayment: number,
	startDate: string,
): AmortizationRow[] {
	const rows: AmortizationRow[] = []
	const monthlyRate = annualRate / 100 / 12
	let remaining = initialAmount
	const start = new Date(startDate)

	for (let month = 1; remaining > 0.01; month++) {
		const interest = remaining * monthlyRate
		const payment = Math.min(monthlyPayment, remaining + interest)
		const principal = payment - interest
		remaining = Math.max(0, remaining - principal)

		const date = new Date(start.getFullYear(), start.getMonth() + month, 1)

		rows.push({
			month,
			date,
			payment: Math.round(payment * 100) / 100,
			principal: Math.round(principal * 100) / 100,
			interest: Math.round(interest * 100) / 100,
			remaining: Math.round(remaining * 100) / 100,
		})

		// Safety: max 600 months (50 years)
		if (month >= 600) break
	}

	return rows
}

function findCurrentPage(schedule: AmortizationRow[]): number {
	const now = new Date()
	const idx = schedule.findIndex(
		(row) => row.date.getFullYear() === now.getFullYear() && row.date.getMonth() === now.getMonth(),
	)
	return idx >= 0 ? Math.floor(idx / PAGE_SIZE) : 0
}

export function LoanAmortizationTable({
	initialAmount,
	rate,
	monthlyPayment,
	startDate,
}: LoanAmortizationTableProps) {
	const schedule = useMemo(
		() => computeAmortizationSchedule(initialAmount, rate, monthlyPayment, startDate),
		[initialAmount, rate, monthlyPayment, startDate],
	)

	const [page, setPage] = useState(() => findCurrentPage(schedule))

	const totalPages = Math.ceil(schedule.length / PAGE_SIZE)
	const currentRows = schedule.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

	const totalInterest = useMemo(
		() => schedule.reduce((sum, row) => sum + row.interest, 0),
		[schedule],
	)

	const now = new Date()

	const yearLabel = currentRows.length > 0
		? `${formatMonth(currentRows[0].date)} — ${formatMonth(currentRows[currentRows.length - 1].date)}`
		: ''

	return (
		<div className="flex flex-col gap-3">
			{/* Summary */}
			<div className="flex items-center justify-between text-xs text-muted-foreground">
				<span>{schedule.length} échéances · Coût total intérêts : {formatMoney(totalInterest)}</span>
			</div>

			{/* Table */}
			<div className="rounded-lg border border-border/60 overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/30">
							<TableHead className="text-xs w-[80px]">Mois</TableHead>
							<TableHead className="text-xs text-right">Échéance</TableHead>
							<TableHead className="text-xs text-right">Capital</TableHead>
							<TableHead className="text-xs text-right">Intérêts</TableHead>
							<TableHead className="text-xs text-right">Restant dû</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentRows.map((row) => {
							const isCurrent =
								row.date.getFullYear() === now.getFullYear() &&
								row.date.getMonth() === now.getMonth()
							return (
								<TableRow
									key={row.month}
									className={
										isCurrent
											? 'bg-primary/5 font-medium'
											: row.date < now
												? 'text-muted-foreground'
												: ''
									}
								>
									<TableCell className="text-xs py-2">
										{formatMonth(row.date)}
									</TableCell>
									<TableCell className="text-xs text-right tabular-nums py-2">
										{formatMoney(row.payment)}
									</TableCell>
									<TableCell className="text-xs text-right tabular-nums py-2">
										{formatMoney(row.principal)}
									</TableCell>
									<TableCell className="text-xs text-right tabular-nums py-2">
										{formatMoney(row.interest)}
									</TableCell>
									<TableCell className="text-xs text-right tabular-nums py-2">
										{formatMoney(row.remaining)}
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						disabled={page === 0}
					>
						<ChevronUp className="h-3.5 w-3.5 mr-1" />
						Précédent
					</Button>
					<span className="text-xs text-muted-foreground">
						{yearLabel}
					</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
						disabled={page === totalPages - 1}
					>
						Suivant
						<ChevronDown className="h-3.5 w-3.5 ml-1" />
					</Button>
				</div>
			)}
		</div>
	)
}
