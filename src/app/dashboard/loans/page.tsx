'use client'

/**
 * Loans Page
 *
 * Shows all loans with progress, payments, and summary.
 * Uses the new component library for consistent UI.
 */

import {
	Building2,
	Calendar,
	CreditCard,
	Euro,
	Flex,
	LoanCard,
	LoanCardSkeleton,
	LoanEmptyState,
	LoanErrorCard,
	LoanSummaryCard,
	PageHeader,
	Percent,
	StatCard,
	StatCardGrid,
	StatCardSkeleton,
	TrendingDown,
} from '@/components'
import { useLoansQuery } from '@/features/loans'
import type { PropertyType } from '@/lib/prisma'
import { formatMoney } from '@/shared/utils'

function getPropertyIcon(type: PropertyType) {
	switch (type) {
		case 'HOUSE':
		case 'APARTMENT':
			return Building2
		default:
			return CreditCard
	}
}

export default function LoansPage() {
	const { data, isLoading, isError, error, refetch } = useLoansQuery()

	const loans = data?.loans ?? []
	const summary = data?.summary ?? null

	const totalMonthly = summary ? summary.totalMonthlyPayment + summary.totalInsurance : 0

	return (
		<Flex direction="col" gap="xl">
			<PageHeader title="Crédits" description="Suivez vos emprunts et échéanciers" />

			{isLoading && (
				<>
					<StatCardGrid columns={4}>
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
					</StatCardGrid>
					<Flex direction="col" gap="md">
						<LoanCardSkeleton />
						<LoanCardSkeleton />
						<LoanCardSkeleton />
					</Flex>
				</>
			)}

			{isError && !isLoading && (
				<LoanErrorCard error={error instanceof Error ? error : null} onRetry={refetch} />
			)}

			{!isLoading &&
				!isError &&
				(loans.length === 0 ? (
					<LoanEmptyState />
				) : (
					<>
						{summary && (
							<StatCardGrid columns={4}>
								<StatCard
									label="Capital restant dû"
									value={formatMoney(summary.totalRemaining)}
									description={`${summary.totalLoans} crédit${summary.totalLoans > 1 ? 's' : ''} actif${summary.totalLoans > 1 ? 's' : ''}`}
									icon={TrendingDown}
									variant="coral"
								/>

								<StatCard
									label="Mensualités"
									value={formatMoney(totalMonthly)}
									description={`Dont ${formatMoney(summary.totalInsurance)} assurance`}
									icon={Euro}
									variant="default"
								/>

								<StatCard
									label="Taux moyen"
									value={`${summary.averageRate.toFixed(2)}%`}
									description="Sur capital restant"
									icon={Percent}
									variant="default"
								/>

								<StatCard
									label="Coût annuel"
									value={formatMoney(totalMonthly * 12)}
									description="Remboursements/an"
									icon={Calendar}
									variant="default"
								/>
							</StatCardGrid>
						)}

						<Flex direction="col" gap="md">
							{loans.map((loan) => (
								<LoanCard
									key={loan.id}
									loan={loan}
									icon={getPropertyIcon(loan.property.type)}
								/>
							))}
						</Flex>

						{summary && totalMonthly > 0 && (
							<LoanSummaryCard
								totalMonthly={totalMonthly}
								capitalPayment={summary.totalMonthlyPayment}
								insurancePayment={summary.totalInsurance}
							/>
						)}
					</>
				))}
		</Flex>
	)
}
