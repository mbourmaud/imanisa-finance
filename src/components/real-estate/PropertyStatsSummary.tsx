'use client'

import { Building2, CreditCard, Landmark, StatCard, StatCardGrid, Wallet } from '@/components'

interface PropertyStatsSummaryProps {
	currentValue: number
	purchasePrice: number
	equity: number
	totalLoansRemaining: number
	totalInvestment: number
	loansCount: number
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount)
}

export function PropertyStatsSummary({
	currentValue,
	purchasePrice,
	equity,
	totalLoansRemaining,
	totalInvestment,
	loansCount,
}: PropertyStatsSummaryProps) {
	const appreciation = ((currentValue - purchasePrice) / purchasePrice) * 100

	return (
		<StatCardGrid columns={4}>
			<StatCard
				label="Valeur actuelle"
				value={formatCurrency(currentValue)}
				icon={Building2}
				variant="default"
				description={`${appreciation >= 0 ? '+' : ''}${appreciation.toFixed(1)}% depuis l'achat`}
				trend={appreciation >= 0 ? 'up' : 'down'}
			/>
			<StatCard
				label="Équité"
				value={formatCurrency(equity)}
				icon={Wallet}
				variant="teal"
				description={
					currentValue > 0 ? `${((equity / currentValue) * 100).toFixed(0)}% de la valeur` : '-'
				}
			/>
			<StatCard
				label="Crédits restants"
				value={formatCurrency(totalLoansRemaining)}
				icon={CreditCard}
				variant="default"
				description={`${loansCount} prêt${loansCount !== 1 ? 's' : ''}`}
			/>
			<StatCard
				label="Investissement total"
				value={formatCurrency(totalInvestment)}
				icon={Landmark}
				variant="default"
				description="Prix + frais"
			/>
		</StatCardGrid>
	)
}
