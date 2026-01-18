'use client';

import { DonutChart as TremorDonutChart } from '@tremor/react';
import { formatMoneyCompact } from '@/shared/utils';

interface PieDataPoint {
	name: string;
	value: number;
	color: string;
}

type ChartHeight = 'sm' | 'md' | 'lg' | 'xl';

const heightMap: Record<ChartHeight, string> = {
	sm: 'h-48',
	md: 'h-60',
	lg: 'h-72',
	xl: 'h-96',
};

interface DonutChartProps {
	data: PieDataPoint[];
	showLabel?: boolean;
	height?: ChartHeight;
}

export function DonutChart({ data, showLabel = true, height = 'lg' }: DonutChartProps) {
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
			className={heightMap[height]}
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
			{items.map((item) => {
				const percentage = ((item.value / total) * 100).toFixed(1);
				const colorStyle = { '--legend-color': item.color } as React.CSSProperties;
				return (
					<div key={item.name} className="flex items-center justify-between" style={colorStyle}>
						<div className="flex items-center gap-2">
							<div className="h-3 w-3 rounded-full bg-[var(--legend-color)]" />
							<span className="text-sm">{item.name}</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium number-display">
								{formatMoneyCompact(item.value)}
							</span>
							<span className="text-xs text-muted-foreground w-12 text-right">{percentage}%</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
