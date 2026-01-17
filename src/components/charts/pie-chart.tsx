'use client';

import { DonutChart as TremorDonutChart } from '@tremor/react';
import { formatMoneyCompact } from '@/shared/utils';

interface PieDataPoint {
	name: string;
	value: number;
	color: string;
}

interface DonutChartProps {
	data: PieDataPoint[];
	showLabel?: boolean;
	className?: string;
}

export function DonutChart({ data, showLabel = true, className }: DonutChartProps) {
	const total = data.reduce((sum, item) => sum + item.value, 0);

	return (
		<TremorDonutChart
			data={data}
			category="value"
			index="name"
			colors={data.map((d) => d.color)}
			showLabel={showLabel}
			label={formatMoneyCompact(total)}
			valueFormatter={(value) => formatMoneyCompact(value)}
			className={className}
		/>
	);
}

interface LegendItem {
	name: string;
	value: number;
	color: string;
}

export function ChartLegend({ items, total }: { items: LegendItem[]; total: number }) {
	return (
		<div className="space-y-2">
			{items.map((item, index) => {
				const percentage = ((item.value / total) * 100).toFixed(1);
				return (
					<div key={index} className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div
								className="h-3 w-3 rounded-full"
								style={{ backgroundColor: item.color }}
							/>
							<span className="text-sm">{item.name}</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium number-display">
								{formatMoneyCompact(item.value)}
							</span>
							<span className="text-xs text-muted-foreground w-12 text-right">
								{percentage}%
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
