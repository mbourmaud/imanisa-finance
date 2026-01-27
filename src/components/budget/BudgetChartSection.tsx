import { Card, Flex } from '@/components'
import { ChartLegend, DonutChart } from '@/components/charts'

interface ChartDataItem {
	name: string
	value: number
	color: string
}

interface BudgetChartSectionProps {
	chartData: ChartDataItem[]
	totalSpent: number
}

/**
 * Budget chart section with donut chart and legend
 */
export function BudgetChartSection({ chartData, totalSpent }: BudgetChartSectionProps) {
	return (
		<Card padding="lg">
			<Flex direction="col" gap="md">
				<Flex direction="col" gap="xs">
					<h3 className="text-md font-semibold">Répartition des dépenses</h3>
					<span className="text-sm text-muted-foreground">Vue graphique par catégorie</span>
				</Flex>
				<div className="grid grid-cols-2 gap-6">
					<DonutChart data={chartData} height="lg" />
					<ChartLegend items={chartData} total={totalSpent} />
				</div>
			</Flex>
		</Card>
	)
}
