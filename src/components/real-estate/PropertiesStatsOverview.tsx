'use client'

import { Building2, StatCard, StatCardGrid, StatsCardSkeleton, TrendingUp } from '@/components'
import type { PropertySummary } from '@/features/properties'

interface PropertiesStatsOverviewProps {
	summary: PropertySummary | null
	isLoading: boolean
	formatCurrency: (amount: number) => string
}

export function PropertiesStatsOverview({
	summary,
	isLoading,
	formatCurrency,
}: PropertiesStatsOverviewProps) {
	if (isLoading) {
		return (
			<StatCardGrid columns={4}>
				<StatsCardSkeleton />
				<StatsCardSkeleton />
				<StatsCardSkeleton />
				<StatsCardSkeleton />
			</StatCardGrid>
		)
	}

	if (!summary) {
		return null
	}

	return (
		<StatCardGrid columns={4}>
			<StatCard
				label="Valeur totale"
				value={formatCurrency(summary.totalValue)}
				description={`${summary.totalProperties} bien${summary.totalProperties > 1 ? 's' : ''}`}
				icon={Building2}
				variant="default"
			/>

			<StatCard
				label="Valeur nette"
				value={formatCurrency(summary.totalEquity)}
				description="Après crédits"
				icon={TrendingUp}
				variant="teal"
			/>

			<StatCard
				label="Crédits restants"
				value={formatCurrency(summary.totalLoansRemaining)}
				description={
					summary.totalValue > 0
						? `${((summary.totalLoansRemaining / summary.totalValue) * 100).toFixed(0)}% de la valeur`
						: '-'
				}
				icon={TrendingUp}
				variant="default"
			/>

			<StatCard
				label="Équité"
				value={
					summary.totalValue > 0
						? `${((summary.totalEquity / summary.totalValue) * 100).toFixed(0)}%`
						: '-'
				}
				description="Du patrimoine"
				icon={Building2}
				variant="default"
			/>
		</StatCardGrid>
	)
}
