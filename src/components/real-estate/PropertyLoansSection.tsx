'use client';

import { Button, Card, CreditCard, Plus, PropertyDetailLoanCard } from '@/components';
import type { Loan } from '@/features/properties';

interface PropertyLoansSectionProps {
	loans: Loan[];
	onAddLoan: () => void;
	onAddInsurance: (loanId: string) => void;
	onDeleteLoan: (loanId: string) => void;
	deletingLoanId: string | null;
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount);
}

function LoansEmptyState({ onAddClick }: { onAddClick: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center py-8 text-center">
			<div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted/50 mb-3">
				<CreditCard className="h-6 w-6 text-muted-foreground" />
			</div>
			<p className="font-medium mb-1">Aucun prêt</p>
			<p className="text-sm text-muted-foreground mb-4">
				Ajoutez les crédits immobiliers associés à ce bien.
			</p>
			<Button variant="outline" size="sm" onClick={onAddClick}>
				<Plus className="mr-1.5 h-4 w-4" />
				Ajouter un prêt
			</Button>
		</div>
	);
}

export function PropertyLoansSection({
	loans,
	onAddLoan,
	onAddInsurance,
	onDeleteLoan,
	deletingLoanId,
}: PropertyLoansSectionProps) {
	const totalLoansRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
	const totalMonthlyPayment = loans.reduce((sum, l) => sum + l.monthlyPayment, 0);
	const averageRate =
		loans.length > 0 ? loans.reduce((sum, l) => sum + l.rate, 0) / loans.length : 0;

	return (
		<Card padding="lg">
			<div className="flex justify-between items-center">
				<h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
					<CreditCard className="h-4 w-4 text-muted-foreground" />
					Prêts
				</h3>
				<Button variant="outline" size="sm" onClick={onAddLoan}>
					<Plus className="mr-1.5 h-4 w-4" />
					Ajouter un prêt
				</Button>
			</div>
			{loans.length === 0 ? (
				<LoansEmptyState onAddClick={onAddLoan} />
			) : (
				<div className="flex flex-col gap-4">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 p-4 rounded-xl bg-muted/30">
						<div className="text-center">
							<p className="text-xs text-muted-foreground">Capital restant</p>
							<p className="text-lg font-semibold tabular-nums">
								{formatCurrency(totalLoansRemaining)}
							</p>
						</div>
						<div className="text-center">
							<p className="text-xs text-muted-foreground">Mensualités</p>
							<p className="text-lg font-semibold tabular-nums">
								{formatCurrency(totalMonthlyPayment)}
							</p>
						</div>
						<div className="text-center">
							<p className="text-xs text-muted-foreground">Taux moyen</p>
							<p className="text-lg font-semibold tabular-nums">{averageRate.toFixed(2)}%</p>
						</div>
					</div>
					<div className="flex flex-col gap-3">
						{loans.map((loan) => (
							<PropertyDetailLoanCard
								key={loan.id}
								loan={loan}
								onAddInsurance={onAddInsurance}
								onDelete={onDeleteLoan}
								isDeleting={deletingLoanId === loan.id}
								formatCurrency={formatCurrency}
							/>
						))}
					</div>
				</div>
			)}
		</Card>
	);
}
