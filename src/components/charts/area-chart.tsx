'use client';

import { AreaChart } from '@tremor/react';
import { formatMoneyCompact } from '@/shared/utils';

interface DataPoint {
	date: string;
	value: number;
	label?: string;
}

interface PatrimonyAreaChartProps {
	data: DataPoint[];
	className?: string;
}

export function PatrimonyAreaChart({ data, className }: PatrimonyAreaChartProps) {
	// Transform data for Tremor format
	const chartData = data.map((item) => ({
		date: item.label || item.date,
		Patrimoine: item.value,
	}));

	return (
		<AreaChart
			data={chartData}
			index="date"
			categories={['Patrimoine']}
			colors={['indigo']}
			valueFormatter={(value) => formatMoneyCompact(value)}
			yAxisWidth={80}
			className={className}
			showLegend={false}
		/>
	);
}

interface InvestmentDataPoint {
	date: string;
	value: number;
	invested: number;
	label?: string;
}

interface InvestmentPerformanceChartProps {
	data: InvestmentDataPoint[];
	className?: string;
}

export function InvestmentPerformanceChart({ data, className }: InvestmentPerformanceChartProps) {
	// Transform data for Tremor format
	const chartData = data.map((item) => ({
		date: item.label || item.date,
		Valeur: item.value,
		Investi: item.invested,
	}));

	return (
		<AreaChart
			data={chartData}
			index="date"
			categories={['Valeur', 'Investi']}
			colors={['rose', 'slate']}
			valueFormatter={(value) => formatMoneyCompact(value)}
			yAxisWidth={80}
			className={className}
		/>
	);
}
