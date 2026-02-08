'use client'

import { useMemo } from 'react'
import { ArrowLeftRight, PiggyBank, Repeat, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney, formatMoneyCompact } from '@/shared/utils'
import {
	useRecurringPatternsQuery,
	useTransactionSummaryQuery,
} from '../hooks/use-transactions-query'
import type { RecurringPattern, TransactionFilters } from '../types'

const FREQUENCY_TO_MONTHLY: Record<RecurringPattern['frequency'], number> = {
	WEEKLY: 4.33,
	MONTHLY: 1,
	QUARTERLY: 1 / 3,
	ANNUAL: 1 / 12,
}

const FREQUENCY_MAX_DAYS_SINCE: Record<RecurringPattern['frequency'], number> = {
	WEEKLY: 14,
	MONTHLY: 45,
	QUARTERLY: 120,
	ANNUAL: 400,
}

function computeRecurringStats(patterns: RecurringPattern[] | undefined) {
	if (!patterns) return { activeCount: 0, totalMonthly: 0 }

	const now = Date.now()
	let activeCount = 0
	let totalMonthly = 0

	for (const pattern of patterns) {
		if (!pattern.isActive) continue
		if (pattern.lastSeenAt) {
			const daysSince = (now - new Date(pattern.lastSeenAt).getTime()) / (1000 * 60 * 60 * 24)
			if (daysSince > FREQUENCY_MAX_DAYS_SINCE[pattern.frequency]) continue
		}
		activeCount++
		totalMonthly += Math.abs(pattern.amount) * FREQUENCY_TO_MONTHLY[pattern.frequency]
	}

	return { activeCount, totalMonthly }
}

interface TransactionSummaryBannerProps {
	filters?: TransactionFilters
}

export function TransactionSummaryBanner({ filters }: TransactionSummaryBannerProps) {
	const { data: summary, isLoading: summaryLoading } = useTransactionSummaryQuery(filters)
	const { data: patterns, isLoading: patternsLoading } = useRecurringPatternsQuery()

	const isLoading = summaryLoading || patternsLoading

	const recurringStats = useMemo(() => computeRecurringStats(patterns), [patterns])

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="flex items-center gap-3 p-4">
							<Skeleton className="h-10 w-10 rounded-md" />
							<div className="flex flex-col gap-1">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-5 w-20" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (!summary) return null

	const cashFlow = summary.netFlow
	const savingsRate = summary.savingsRate
	const transfers = summary.internalTransfers

	const savingsRateColor =
		savingsRate >= 20
			? 'text-emerald-600'
			: savingsRate >= 10
				? 'text-orange-500'
				: 'text-red-600'

	const savingsRateIconBg =
		savingsRate >= 20
			? 'bg-emerald-500/10'
			: savingsRate >= 10
				? 'bg-orange-500/10'
				: 'bg-red-500/10'

	const savingsRateIconColor =
		savingsRate >= 20
			? 'text-emerald-500'
			: savingsRate >= 10
				? 'text-orange-500'
				: 'text-red-500'

	const transferDetails = [
		transfers.toSavings > 0 && `Épargne ${formatMoneyCompact(transfers.toSavings)}`,
		transfers.toInvestment > 0 && `Invest ${formatMoneyCompact(transfers.toInvestment)}`,
		transfers.toLoanRepayment > 0 &&
			`Crédit ${formatMoneyCompact(transfers.toLoanRepayment)}`,
	].filter(Boolean)

	const stats = [
		{
			label: 'Cash flow réel',
			value: formatMoney(cashFlow),
			subtitle: `${formatMoneyCompact(summary.totalIncome)} revenus − ${formatMoneyCompact(summary.totalExpenses)} dépenses`,
			icon: cashFlow >= 0 ? TrendingUp : TrendingDown,
			iconBg: cashFlow >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
			iconColor: cashFlow >= 0 ? 'text-emerald-500' : 'text-red-500',
			valueColor: cashFlow >= 0 ? 'text-emerald-600' : 'text-red-600',
		},
		{
			label: "Taux d'épargne",
			value: `${savingsRate.toFixed(1)}%`,
			subtitle: `${formatMoneyCompact(transfers.toSavings + transfers.toInvestment)} épargnés sur ${formatMoneyCompact(summary.totalIncome)}`,
			icon: PiggyBank,
			iconBg: savingsRateIconBg,
			iconColor: savingsRateIconColor,
			valueColor: savingsRateColor,
		},
		{
			label: 'Charges récurrentes',
			value: `${recurringStats.activeCount} actives`,
			subtitle: `${formatMoney(recurringStats.totalMonthly)}/mois`,
			icon: Repeat,
			iconBg: 'bg-blue-500/10',
			iconColor: 'text-blue-500',
			valueColor: '',
		},
		{
			label: 'Virements internes',
			value: formatMoney(transfers.total),
			subtitle: transferDetails.length > 0 ? transferDetails.join(' · ') : 'Aucun virement',
			icon: ArrowLeftRight,
			iconBg: 'bg-muted',
			iconColor: 'text-muted-foreground',
			valueColor: 'text-muted-foreground',
		},
	]

	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
			{stats.map((stat) => (
				<Card key={stat.label}>
					<CardContent className="flex items-center gap-3 p-4">
						<div
							className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${stat.iconBg}`}
						>
							<stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
						</div>
						<div className="flex min-w-0 flex-col">
							<span className="text-xs text-muted-foreground">{stat.label}</span>
							<span
								className={`text-sm font-semibold tabular-nums truncate ${stat.valueColor}`}
							>
								{stat.value}
							</span>
							<span className="text-xs text-muted-foreground truncate">
								{stat.subtitle}
							</span>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
