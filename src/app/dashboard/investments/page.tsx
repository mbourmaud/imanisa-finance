'use client';

import {
	ArrowDownRight,
	ArrowUpRight,
	Bitcoin,
	Briefcase,
	Building,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	GlassCard,
	MoreHorizontal,
	PageHeader,
	Plus,
	RefreshCw,
	StatCard,
	StatCardGrid,
	TrendingUp,
	Wallet,
} from '@/components';
import { InvestmentPerformanceChart } from '@/components/charts';
import { demoInvestmentPerformance } from '@/lib/demo';

const sources = [
	{
		id: '1',
		name: 'PEA Bourse Direct',
		type: 'PEA',
		icon: TrendingUp,
		value: 45200.0,
		invested: 35000.0,
		performance: 29.14,
		positions: 8,
	},
	{
		id: '2',
		name: 'Assurance-vie Linxea',
		type: 'AV',
		icon: Building,
		value: 32100.0,
		invested: 28000.0,
		performance: 14.64,
		positions: 5,
	},
	{
		id: '3',
		name: 'CTO Trade Republic',
		type: 'CTO',
		icon: Briefcase,
		value: 12500.0,
		invested: 10000.0,
		performance: 25.0,
		positions: 3,
	},
	{
		id: '4',
		name: 'Crypto Binance',
		type: 'CRYPTO',
		icon: Bitcoin,
		value: 5800.0,
		invested: 4000.0,
		performance: 45.0,
		positions: 4,
	},
];

const positions = [
	{
		id: 'p1',
		ticker: 'MSFT',
		name: 'Microsoft',
		source: 'CTO Trade Republic',
		quantity: 5,
		avgPrice: 350.0,
		currentPrice: 420.0,
		value: 2100.0,
		gain: 350.0,
		gainPercent: 20.0,
	},
	{
		id: 'p2',
		ticker: 'AAPL',
		name: 'Apple',
		source: 'CTO Trade Republic',
		quantity: 10,
		avgPrice: 150.0,
		currentPrice: 185.0,
		value: 1850.0,
		gain: 350.0,
		gainPercent: 23.33,
	},
	{
		id: 'p3',
		ticker: 'CW8',
		name: 'Amundi MSCI World',
		source: 'PEA Bourse Direct',
		quantity: 50,
		avgPrice: 400.0,
		currentPrice: 485.0,
		value: 24250.0,
		gain: 4250.0,
		gainPercent: 21.25,
	},
	{
		id: 'p4',
		ticker: 'BTC',
		name: 'Bitcoin',
		source: 'Crypto Binance',
		quantity: 0.05,
		avgPrice: 40000.0,
		currentPrice: 95000.0,
		value: 4750.0,
		gain: 2750.0,
		gainPercent: 137.5,
	},
	{
		id: 'p5',
		ticker: 'ETH',
		name: 'Ethereum',
		source: 'Crypto Binance',
		quantity: 0.5,
		avgPrice: 1800.0,
		currentPrice: 2100.0,
		value: 1050.0,
		gain: 150.0,
		gainPercent: 16.67,
	},
];

const totalValue = sources.reduce((s, src) => s + src.value, 0);
const totalInvested = sources.reduce((s, src) => s + src.invested, 0);
const totalGain = totalValue - totalInvested;
const totalPerformance = ((totalValue - totalInvested) / totalInvested) * 100;

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
	}).format(amount);
}

export default function InvestmentsPage() {
	return (
		<div className="flex flex-col gap-8">
			{/* Header */}
			<PageHeader
				title="Investissements"
				description="PEA, CTO, Assurance-vie, Crypto"
				actions={
					<div className="flex gap-3">
						<Button
							variant="outline"
							iconLeft={<RefreshCw style={{ height: '1rem', width: '1rem' }} />}
						>
							Actualiser
						</Button>
						<Button iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}>
							Nouvelle source
						</Button>
					</div>
				}
			/>

			{/* Stats Overview */}
			<StatCardGrid columns={4}>
				<StatCard
					label="Valeur totale"
					value={formatCurrency(totalValue)}
					icon={Wallet}
					variant="default"
				/>

				<StatCard
					label="Total investi"
					value={formatCurrency(totalInvested)}
					icon={TrendingUp}
					variant="default"
				/>

				<StatCard
					label="Plus-value latente"
					value={`${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)}`}
					icon={totalGain >= 0 ? ArrowUpRight : ArrowDownRight}
					variant={totalGain >= 0 ? 'teal' : 'coral'}
				/>

				<StatCard
					label="Performance"
					value={`${totalPerformance >= 0 ? '+' : ''}${totalPerformance.toFixed(2)}%`}
					icon={TrendingUp}
					variant={totalPerformance >= 0 ? 'teal' : 'coral'}
				/>
			</StatCardGrid>

			{/* Sources Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{sources.map((source) => {
					const gain = source.value - source.invested;
					const isPositive = gain >= 0;

					return (
						<GlassCard
							key={source.id}
							padding="md"
							style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
						>
							<div className="flex justify-between items-start">
								<div
									className="flex items-center justify-center h-10 w-10 rounded-xl"
									style={{
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<source.icon style={{ height: '1.25rem', width: '1.25rem' }} />
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											style={{
												height: '2rem',
												width: '2rem',
												opacity: 0,
												transition: 'opacity 0.2s',
											}}
										>
											<MoreHorizontal style={{ height: '1rem', width: '1rem' }} />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem>Voir les positions</DropdownMenuItem>
										<DropdownMenuItem>Ajouter une transaction</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem style={{ color: 'hsl(var(--destructive))' }}>
											Supprimer
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col">
									<p className="font-medium">{source.name}</p>
									<p className="text-xs text-muted-foreground">
										{source.positions} position{source.positions > 1 ? 's' : ''} · {source.type}
									</p>
								</div>
								<div className="flex flex-col">
									<p
										className="text-2xl font-semibold"
										style={{ fontVariantNumeric: 'tabular-nums' }}
									>
										{formatCurrency(source.value)}
									</p>
									<p
										className="text-sm font-medium"
										style={{ color: isPositive ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.2 25)' }}
									>
										{isPositive ? '+' : ''}
										{formatCurrency(gain)} ({isPositive ? '+' : ''}
										{source.performance.toFixed(2)}%)
									</p>
								</div>
							</div>
						</GlassCard>
					);
				})}
			</div>

			{/* Positions Table */}
			<GlassCard padding="lg">
				<div className="flex justify-between items-center mb-4">
					<div className="flex flex-col">
						<h3 className="text-lg font-medium tracking-tight">Positions</h3>
						<p className="text-sm text-muted-foreground">
							Toutes vos positions d&apos;investissement
						</p>
					</div>
					<Button variant="outline" size="sm">
						Voir tout
					</Button>
				</div>
				<div className="flex flex-col gap-3">
					{positions.map((pos) => (
						<div
							key={pos.id}
							className="flex justify-between items-center p-4 rounded-xl transition-colors"
							style={{
								backgroundColor: 'hsl(var(--background) / 0.5)',
							}}
						>
							<div className="flex items-center gap-4">
								<div
									className="flex items-center justify-center h-10 w-10 rounded-lg font-mono text-sm font-semibold"
									style={{
										backgroundColor: 'hsl(var(--background))',
										color: 'hsl(var(--muted-foreground))',
									}}
								>
									{pos.ticker.slice(0, 3)}
								</div>
								<div className="flex flex-col">
									<p className="font-medium">{pos.name}</p>
									<p className="text-xs text-muted-foreground">
										{pos.ticker} · {pos.source}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-8">
								<div className="hidden text-right sm:block" data-show-sm>
									<p className="text-xs text-muted-foreground">Quantité</p>
									<p className="font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{pos.quantity}
									</p>
								</div>
								<div className="hidden text-right md:block" data-show-md>
									<p className="text-xs text-muted-foreground">PRU</p>
									<p className="font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{formatCurrency(pos.avgPrice)}
									</p>
								</div>
								<div className="text-right">
									<p className="text-xs text-muted-foreground">Valeur</p>
									<p className="font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{formatCurrency(pos.value)}
									</p>
								</div>
								<div className="min-w-[100px] text-right">
									<p
										className="font-medium"
										style={{
											fontVariantNumeric: 'tabular-nums',
											color: pos.gain >= 0 ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.2 25)',
										}}
									>
										{pos.gain >= 0 ? '+' : ''}
										{formatCurrency(pos.gain)}
									</p>
									<p
										className="text-xs"
										style={{
											color: pos.gainPercent >= 0 ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.2 25)',
										}}
									>
										{pos.gainPercent >= 0 ? '+' : ''}
										{pos.gainPercent.toFixed(2)}%
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</GlassCard>

			{/* Performance Chart */}
			<GlassCard padding="lg">
				<div className="flex justify-between items-center mb-4">
					<div className="flex flex-col">
						<h3 className="text-lg font-medium tracking-tight">Évolution du portefeuille</h3>
						<p className="text-sm text-muted-foreground">Performance sur 12 mois</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-3">
							<div
								className="h-2 w-4 rounded-sm"
								style={{ backgroundColor: 'oklch(0.55 0.18 270)' }}
							/>
							<span className="text-sm text-muted-foreground">Valeur</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-0.5 w-4" style={{ borderTop: '2px dashed oklch(0.5 0.01 280)' }} />
							<span className="text-sm text-muted-foreground">Investi</span>
						</div>
					</div>
				</div>
				<InvestmentPerformanceChart data={demoInvestmentPerformance} height="lg" />
			</GlassCard>
		</div>
	);
}
