'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMoneyCompact } from '@/shared/utils';

interface DataPoint {
	date: string;
	value: number;
	label?: string;
}

interface AreaChartProps {
	data: DataPoint[];
	color?: string;
	gradientFrom?: string;
	gradientTo?: string;
	showGrid?: boolean;
	height?: number;
}

export function PatrimonyAreaChart({
	data,
	color = 'oklch(0.55 0.18 270)',
	showGrid = true,
	height = 280,
}: AreaChartProps) {
	return (
		<ResponsiveContainer width="100%" height={height}>
			<AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={color} stopOpacity={0.3} />
						<stop offset="95%" stopColor={color} stopOpacity={0.05} />
					</linearGradient>
				</defs>
				{showGrid && (
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="oklch(0.9 0.005 280)"
						className="dark:stroke-[oklch(0.25_0.01_280)]"
						vertical={false}
					/>
				)}
				<XAxis
					dataKey="label"
					axisLine={false}
					tickLine={false}
					tick={{ fontSize: 12, fill: 'oklch(0.5 0.01 280)' }}
					dy={10}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					tick={{ fontSize: 12, fill: 'oklch(0.5 0.01 280)' }}
					tickFormatter={(value) => formatMoneyCompact(value)}
					width={80}
				/>
				<Tooltip
					content={({ active, payload, label }) => {
						if (active && payload && payload.length) {
							return (
								<div className="rounded-lg border border-border/60 bg-card p-3 shadow-lg">
									<p className="text-xs text-muted-foreground">{label}</p>
									<p className="text-lg font-semibold number-display">
										{formatMoneyCompact(payload[0].value as number)}
									</p>
								</div>
							);
						}
						return null;
					}}
				/>
				<Area
					type="monotone"
					dataKey="value"
					stroke={color}
					strokeWidth={2}
					fill="url(#colorValue)"
					dot={false}
					activeDot={{ r: 6, strokeWidth: 2, fill: 'white', stroke: color }}
				/>
			</AreaChart>
		</ResponsiveContainer>
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
	height?: number;
}

export function InvestmentPerformanceChart({ data, height = 280 }: InvestmentPerformanceChartProps) {
	const valueColor = 'oklch(0.65 0.2 25)'; // Coral
	const investedColor = 'oklch(0.5 0.05 260)'; // Muted gray

	return (
		<ResponsiveContainer width="100%" height={height}>
			<AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id="colorValueInvest" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={valueColor} stopOpacity={0.3} />
						<stop offset="95%" stopColor={valueColor} stopOpacity={0.05} />
					</linearGradient>
				</defs>
				<CartesianGrid
					strokeDasharray="3 3"
					stroke="oklch(0.9 0.005 280)"
					className="dark:stroke-[oklch(0.25_0.01_280)]"
					vertical={false}
				/>
				<XAxis
					dataKey="label"
					axisLine={false}
					tickLine={false}
					tick={{ fontSize: 12, fill: 'oklch(0.5 0.01 280)' }}
					dy={10}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					tick={{ fontSize: 12, fill: 'oklch(0.5 0.01 280)' }}
					tickFormatter={(value) => formatMoneyCompact(value)}
					width={80}
				/>
				<Tooltip
					content={({ active, payload, label }) => {
						if (active && payload && payload.length >= 2) {
							const value = payload[0]?.value as number;
							const invested = payload[1]?.value as number;
							const gain = value - invested;
							const percent = invested > 0 ? ((gain / invested) * 100).toFixed(1) : '0';
							return (
								<div className="rounded-lg border border-border/60 bg-card p-3 shadow-lg">
									<p className="text-xs text-muted-foreground mb-2">{label}</p>
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 rounded-full" style={{ backgroundColor: valueColor }} />
											<span className="text-sm">Valeur:</span>
											<span className="text-sm font-semibold number-display">
												{formatMoneyCompact(value)}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 rounded-full" style={{ backgroundColor: investedColor }} />
											<span className="text-sm">Investi:</span>
											<span className="text-sm font-semibold number-display">
												{formatMoneyCompact(invested)}
											</span>
										</div>
										<div className="pt-1 border-t border-border/40 mt-1">
											<span className={`text-sm font-medium ${gain >= 0 ? 'value-positive' : 'value-negative'}`}>
												{gain >= 0 ? '+' : ''}{formatMoneyCompact(gain)} ({gain >= 0 ? '+' : ''}{percent}%)
											</span>
										</div>
									</div>
								</div>
							);
						}
						return null;
					}}
				/>
				<Area
					type="monotone"
					dataKey="value"
					stroke={valueColor}
					strokeWidth={2}
					fill="url(#colorValueInvest)"
					dot={false}
					activeDot={{ r: 6, strokeWidth: 2, fill: 'white', stroke: valueColor }}
				/>
				<Area
					type="monotone"
					dataKey="invested"
					stroke={investedColor}
					strokeWidth={2}
					strokeDasharray="4 4"
					fill="none"
					dot={false}
					activeDot={{ r: 5, strokeWidth: 2, fill: 'white', stroke: investedColor }}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
