import { Card } from '@/components';
import { ChartLegend, DonutChart } from '@/components/charts';

interface ChartDataItem {
	name: string;
	value: number;
	color: string;
}

interface BudgetChartSectionProps {
	chartData: ChartDataItem[];
	totalSpent: number;
}

/**
 * Budget chart section with donut chart and legend
 */
export function BudgetChartSection({ chartData, totalSpent }: BudgetChartSectionProps) {
	return (
		<Card padding="lg">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<h3 className="text-md font-semibold">Répartition des dépenses</h3>
					<span className="text-sm text-muted-foreground">Vue graphique par catégorie</span>
				</div>
				<div className="grid grid-cols-2 gap-6">
					<DonutChart data={chartData} height="lg" />
					<ChartLegend items={chartData} total={totalSpent} />
				</div>
			</div>
		</Card>
	);
}
