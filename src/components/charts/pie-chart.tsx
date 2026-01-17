'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoneyCompact } from '@/shared/utils';

interface PieDataPoint {
	name: string;
	value: number;
	color: string;
}

interface DonutChartProps {
	data: PieDataPoint[];
	height?: number;
	innerRadius?: number;
	outerRadius?: number;
	showLabels?: boolean;
}

export function DonutChart({
	data,
	height = 280,
	innerRadius = 60,
	outerRadius = 100,
}: DonutChartProps) {
	const total = data.reduce((sum, item) => sum + item.value, 0);

	return (
		<ResponsiveContainer width="100%" height={height}>
			<PieChart>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					innerRadius={innerRadius}
					outerRadius={outerRadius}
					paddingAngle={2}
					dataKey="value"
					stroke="none"
				>
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.color} />
					))}
				</Pie>
				<Tooltip
					content={({ active, payload }) => {
						if (active && payload && payload.length) {
							const item = payload[0].payload as PieDataPoint;
							const percentage = ((item.value / total) * 100).toFixed(1);
							return (
								<div className="rounded-lg border border-border/60 bg-card p-3 shadow-lg">
									<div className="flex items-center gap-2">
										<div
											className="h-3 w-3 rounded-full"
											style={{ backgroundColor: item.color }}
										/>
										<p className="text-sm font-medium">{item.name}</p>
									</div>
									<p className="mt-1 text-lg font-semibold number-display">
										{formatMoneyCompact(item.value)}
									</p>
									<p className="text-xs text-muted-foreground">{percentage}%</p>
								</div>
							);
						}
						return null;
					}}
				/>
			</PieChart>
		</ResponsiveContainer>
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
