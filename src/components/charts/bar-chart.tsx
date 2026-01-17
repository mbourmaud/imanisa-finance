'use client';

import { BarChart } from '@tremor/react';
import { formatMoneyCompact } from '@/shared/utils';

interface BarDataPoint {
	label: string;
	income: number;
	expenses: number;
}

interface IncomeExpenseBarChartProps {
	data: BarDataPoint[];
	className?: string;
}

export function IncomeExpenseBarChart({ data, className }: IncomeExpenseBarChartProps) {
	// Transform data for Tremor format
	const chartData = data.map((item) => ({
		name: item.label,
		Revenus: item.income,
		Dépenses: item.expenses,
	}));

	return (
		<BarChart
			data={chartData}
			index="name"
			categories={['Revenus', 'Dépenses']}
			colors={['emerald', 'rose']}
			valueFormatter={(value) => formatMoneyCompact(value)}
			yAxisWidth={80}
			className={className}
		/>
	);
}
