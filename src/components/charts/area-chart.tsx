'use client';

import { AreaChart } from '@tremor/react';
import { formatMoneyCompact } from '@/shared/utils';

type ChartHeight = 'sm' | 'md' | 'lg' | 'xl';

const heightMap: Record<ChartHeight, string> = {
	sm: 'h-48',
	md: 'h-60',
	lg: 'h-72',
	xl: 'h-96',
};

interface DataPoint {
	date: string;
	value: number;
	label?: string;
}

interface PatrimonyAreaChartProps {
	data: DataPoint[];
	height?: ChartHeight;
}

export function PatrimonyAreaChart({ data, height = 'lg' }: PatrimonyAreaChartProps) {
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
			className={heightMap[height]}
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
	height?: ChartHeight;
}

export function InvestmentPerformanceChart({
	data,
	height = 'lg',
}: InvestmentPerformanceChartProps) {
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
			className={heightMap[height]}
		/>
	);
}
