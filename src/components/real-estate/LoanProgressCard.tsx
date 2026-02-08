import { Card, Progress } from '@/components';

interface LoanProgressCardProps {
	loansRemaining: number;
	totalValue: number;
	equity: number;
	formatCurrency: (amount: number) => string;
}

/**
 * Card showing loan progress and equity
 */
export function LoanProgressCard({
	loansRemaining,
	totalValue,
	equity,
	formatCurrency,
}: LoanProgressCardProps) {
	const equityPercentage = totalValue > 0 ? (equity / totalValue) * 100 : 0;

	return (
		<Card padding="lg">
			<div className="flex justify-between mb-4">
				<div className="flex flex-col gap-1">
					<span className="font-medium">Progression du remboursement</span>
					<span className="text-sm text-muted-foreground">
						{formatCurrency(equity)} d'équité sur {formatCurrency(totalValue)}
					</span>
				</div>
				<span className="text-lg font-semibold tabular-nums">{equityPercentage.toFixed(1)}%</span>
			</div>
			<Progress value={equityPercentage} className="h-3" />
			<span className="mt-2 block text-xs text-muted-foreground">
				Reste à rembourser : {formatCurrency(loansRemaining)}
			</span>
		</Card>
	);
}
