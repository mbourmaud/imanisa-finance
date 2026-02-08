'use client';

/**
 * Loans Page
 *
 * Shows all loans with progress, payments, and summary.
 * Uses the new component library for consistent UI.
 */

import { useMemo } from 'react';
import {
	Building2,
	Calendar,
	CreditCard,
	Euro,
	LoanCard,
	LoanCardSkeleton,
	LoanEmptyState,
	LoanErrorCard,
	LoanSummaryCard,
	PageHeader,
	Percent,
	Shield,
	StatCard,
	StatCardGrid,
	StatCardSkeleton,
	TrendingDown,
} from '@/components';
import { useLoansQuery } from '@/features/loans';
import type { LoanWithDetails } from '@/features/loans';
import type { PropertyType } from '@/lib/prisma';
import { useSelectedMemberId } from '@/shared/hooks';
import { formatMoney } from '@/shared/utils';

function getPropertyIcon(type: PropertyType) {
	switch (type) {
		case 'HOUSE':
		case 'APARTMENT':
			return Building2;
		default:
			return CreditCard;
	}
}

/**
 * Compute total interest and insurance costs across all loans.
 * For each loan: totalInterest = (monthlyPayment × totalMonths) - initialAmount
 * For each loan: totalInsurance = insuranceMonthly × totalMonths
 */
function computeLoanCosts(loans: LoanWithDetails[]) {
	let totalInterestCost = 0
	let totalInsuranceCost = 0
	let totalInitialAmount = 0
	let weightedInsuranceRateSum = 0

	for (const loan of loans) {
		if (!loan.endDate || !loan.startDate || loan.monthlyPayment === 0) continue

		const start = new Date(loan.startDate)
		const end = new Date(loan.endDate)
		const totalMonths = Math.max(
			0,
			(end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
		)

		// Total interest = total payments - initial capital
		const totalPayments = loan.monthlyPayment * totalMonths
		const interestCost = totalPayments - loan.initialAmount
		if (interestCost > 0) totalInterestCost += interestCost

		// Total insurance cost
		const loanInsuranceMonthly = loan.loanInsurances.reduce(
			(sum, ins) => sum + ins.monthlyPremium,
			0,
		)
		const insuranceCost = loanInsuranceMonthly * totalMonths
		totalInsuranceCost += insuranceCost

		// Weighted insurance rate (TAEA) per loan: annualInsurance / initialAmount × 100
		if (loan.initialAmount > 0 && loanInsuranceMonthly > 0) {
			const annualInsurance = loanInsuranceMonthly * 12
			const insuranceRate = (annualInsurance / loan.initialAmount) * 100
			weightedInsuranceRateSum += insuranceRate * loan.initialAmount
			totalInitialAmount += loan.initialAmount
		}
	}

	const averageInsuranceRate =
		totalInitialAmount > 0 ? weightedInsuranceRateSum / totalInitialAmount : 0

	return { totalInterestCost, totalInsuranceCost, averageInsuranceRate }
}

export default function LoansPage() {
	const memberId = useSelectedMemberId();
	const { data, isLoading, isError, error, refetch } = useLoansQuery(memberId ? { memberId } : undefined);

	const loans = data?.loans ?? [];
	const summary = data?.summary ?? null;

	const totalMonthly = summary ? summary.totalMonthlyPayment + summary.totalInsurance : 0;
	const totalBorrowed = useMemo(() => loans.reduce((sum, l) => sum + l.initialAmount, 0), [loans])

	const costs = useMemo(() => computeLoanCosts(loans), [loans])

	return (
		<div className="flex flex-col gap-8">
			<PageHeader title="Prêts" />

			{isLoading && (
				<>
					<StatCardGrid columns={3}>
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
					</StatCardGrid>
					<StatCardGrid columns={3}>
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
					</StatCardGrid>
					<div className="flex flex-col gap-4">
						<LoanCardSkeleton />
						<LoanCardSkeleton />
						<LoanCardSkeleton />
					</div>
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
							<>
								<StatCardGrid columns={3}>
									<StatCard
										label="Capital remboursé"
										value={formatMoney(totalBorrowed - summary.totalRemaining)}
										description={`${summary.totalLoans} crédit${summary.totalLoans > 1 ? 's' : ''} actif${summary.totalLoans > 1 ? 's' : ''}`}
										icon={TrendingDown}
										variant="default"
									/>

									<StatCard
										label="Mensualités"
										value={formatMoney(totalMonthly)}
										description={`${formatMoney(summary.totalMonthlyPayment)} capital + ${formatMoney(summary.totalInsurance)} assurance`}
										icon={Euro}
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

								<StatCardGrid columns={3}>
									<StatCard
										label="Taux moyen crédit"
										value={`${summary.averageRate.toFixed(2)}%`}
										description={`Coût total intérêts : ${formatMoney(costs.totalInterestCost)}`}
										icon={Percent}
										variant="default"
									/>

									<StatCard
										label="Taux assurance"
										value={`${costs.averageInsuranceRate.toFixed(2)}%`}
										description={`Coût total assurance : ${formatMoney(costs.totalInsuranceCost)}`}
										icon={Shield}
										variant="default"
									/>

									<StatCard
										label="Coût total des crédits"
										value={formatMoney(costs.totalInterestCost + costs.totalInsuranceCost)}
										description="Intérêts + assurance"
										icon={Euro}
										variant="coral"
									/>
								</StatCardGrid>
							</>
						)}

						<div className="flex flex-col gap-4">
							{loans.map((loan) => (
								<LoanCard key={loan.id} loan={loan} icon={getPropertyIcon(loan.property.type)} />
							))}
						</div>

						{summary && totalMonthly > 0 && (
							<LoanSummaryCard
								totalMonthly={totalMonthly}
								capitalPayment={summary.totalMonthlyPayment}
								insurancePayment={summary.totalInsurance}
							/>
						)}
					</>
				))}
		</div>
	);
}
