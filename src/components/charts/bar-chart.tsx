'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMoneyCompact } from '@/shared/utils';

interface BarDataPoint {
	label: string;
	income: number;
	expenses: number;
}

interface IncomeExpenseBarChartProps {
	data: BarDataPoint[];
	height?: number;
}

export function IncomeExpenseBarChart({ data, height = 280 }: IncomeExpenseBarChartProps) {
	const incomeColor = 'oklch(0.65 0.15 145)'; // Mint green
	const expenseColor = 'oklch(0.65 0.2 25)'; // Coral

	return (
		<ResponsiveContainer width="100%" height={height}>
			<BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
				<CartesianGrid
					strokeDasharray="3 3"
					stroke="oklch(0.9 0.015 80)"
					className="dark:stroke-[oklch(0.28_0.02_280)]"
					vertical={false}
				/>
				<XAxis
					dataKey="label"
					axisLine={false}
					tickLine={false}
					tick={{ fontSize: 12, fill: 'oklch(0.45 0.02 260)' }}
					dy={10}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					tick={{ fontSize: 12, fill: 'oklch(0.45 0.02 260)' }}
					tickFormatter={(value) => formatMoneyCompact(value)}
					width={70}
				/>
				<Tooltip
					content={({ active, payload, label }) => {
						if (active && payload && payload.length) {
							return (
								<div className="rounded-xl border border-border/60 bg-card p-3 shadow-lg">
									<p className="text-xs text-muted-foreground mb-2 font-medium">{label}</p>
									<div className="space-y-1.5">
										<div className="flex items-center gap-2">
											<div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: incomeColor }} />
											<span className="text-sm">Revenus:</span>
											<span className="text-sm font-bold number-display">
												{formatMoneyCompact(payload[0]?.value as number)}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: expenseColor }} />
											<span className="text-sm">Dépenses:</span>
											<span className="text-sm font-bold number-display">
												{formatMoneyCompact(payload[1]?.value as number)}
											</span>
										</div>
									</div>
								</div>
							);
						}
						return null;
					}}
				/>
				<Bar dataKey="income" fill={incomeColor} radius={[8, 8, 0, 0]} />
				<Bar dataKey="expenses" fill={expenseColor} radius={[8, 8, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}
