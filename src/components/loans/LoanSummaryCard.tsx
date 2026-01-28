import { Card, CardContent } from '@/components';
import { formatMoney } from '@/shared/utils';

interface LoanSummaryCardProps {
	totalMonthly: number;
	capitalPayment: number;
	insurancePayment: number;
}

/**
 * Summary card showing total monthly loan payments
 */
export function LoanSummaryCard({
	totalMonthly,
	capitalPayment,
	insurancePayment,
}: LoanSummaryCardProps) {
	return (
		<Card className="border-border/60 bg-muted/20">
			<CardContent className="pt-6">
				<div className="flex justify-between items-center">
					<div className="flex flex-col gap-1">
						<span className="font-medium">Total mensuel</span>
						<span className="text-sm text-muted-foreground">Tous crédits confondus</span>
					</div>
					<div className="flex flex-col gap-1 items-end">
						<span className="text-3xl font-semibold tabular-nums">{formatMoney(totalMonthly)}</span>
						<span className="text-sm text-muted-foreground">
							{formatMoney(capitalPayment)} capital + {formatMoney(insurancePayment)} assurance
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
