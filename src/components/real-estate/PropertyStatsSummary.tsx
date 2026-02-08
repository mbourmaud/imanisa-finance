'use client';

import { Building2, CreditCard, Landmark, StatCard, StatCardGrid, Wallet } from '@/components';
import { formatMoneyCompact } from '@/shared/utils';

interface PropertyStatsSummaryProps {
	currentValue: number;
	purchasePrice: number;
	equity: number;
	totalLoansRemaining: number;
	totalInvestment: number;
	loansCount: number;
}

export function PropertyStatsSummary({
	currentValue,
	purchasePrice,
	equity,
	totalLoansRemaining,
	totalInvestment,
	loansCount,
}: PropertyStatsSummaryProps) {
	const appreciation = ((currentValue - purchasePrice) / purchasePrice) * 100;

	return (
		<StatCardGrid columns={4}>
			<StatCard
				label="Valeur actuelle"
				value={formatMoneyCompact(currentValue)}
				icon={Building2}
				variant="default"
				description={`${appreciation >= 0 ? '+' : ''}${appreciation.toFixed(1)}% depuis l'achat`}
			/>
			<StatCard
				label="Équité"
				value={formatMoneyCompact(equity)}
				icon={Wallet}
				variant="teal"
				description={
					currentValue > 0 ? `${((equity / currentValue) * 100).toFixed(0)}% de la valeur` : '-'
				}
			/>
			<StatCard
				label="Crédits restants"
				value={formatMoneyCompact(totalLoansRemaining)}
				icon={CreditCard}
				variant="default"
				description={`${loansCount} prêt${loansCount !== 1 ? 's' : ''}`}
			/>
			<StatCard
				label="Investissement total"
				value={formatMoneyCompact(totalInvestment)}
				icon={Landmark}
				variant="default"
				description="Prix + frais"
			/>
		</StatCardGrid>
	);
}
