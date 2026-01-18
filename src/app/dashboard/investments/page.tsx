'use client';

import {
	ArrowDownRight,
	ArrowUpRight,
	Bitcoin,
	Briefcase,
	Building,
	MoreHorizontal,
	Plus,
	RefreshCw,
	TrendingUp,
	Wallet,
} from '@/components';
import { Button } from '@/components';
import { InvestmentPerformanceChart } from '@/components/charts';
import { PageHeader } from '@/components';
import { demoInvestmentPerformance } from '@/lib/demo';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components';

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
		<div className="space-y-8">
			{/* Header */}
			<PageHeader
				title="Investissements"
				description="PEA, CTO, Assurance-vie, Crypto"
				actions={
					<div className="flex gap-2">
						<Button variant="outline" className="gap-2">
							<RefreshCw className="h-4 w-4" />
							Actualiser
						</Button>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							Nouvelle source
						</Button>
					</div>
				}
			/>

			{/* Stats Overview */}
			<div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4 stagger-children">
				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Valeur totale</p>
							<p className="stat-card-value">{formatCurrency(totalValue)}</p>
						</div>
						<div className="stat-card-icon">
							<Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Total investi</p>
							<p className="stat-card-value">{formatCurrency(totalInvested)}</p>
						</div>
						<div className="stat-card-icon">
							<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Plus-value latente</p>
							<p className={`stat-card-value ${totalGain >= 0 ? 'value-positive' : 'value-negative'}`}>
								{totalGain >= 0 ? '+' : ''}
								{formatCurrency(totalGain)}
							</p>
						</div>
						<div
							className={`stat-card-icon ${
								totalGain >= 0
									? 'bg-[oklch(0.55_0.15_145)]/10 text-[oklch(0.55_0.15_145)]'
									: 'bg-[oklch(0.55_0.2_25)]/10 text-[oklch(0.55_0.2_25)]'
							}`}
						>
							{totalGain >= 0 ? (
								<ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
							) : (
								<ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5" />
							)}
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-card-content">
						<div className="stat-card-text">
							<p className="text-xs sm:text-sm font-medium text-muted-foreground">Performance</p>
							<p className={`stat-card-value ${totalPerformance >= 0 ? 'value-positive' : 'value-negative'}`}>
								{totalPerformance >= 0 ? '+' : ''}
								{totalPerformance.toFixed(2)}%
							</p>
						</div>
						<div className="stat-card-icon">
							<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
					</div>
				</div>
			</div>

			{/* Sources Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{sources.map((source) => {
					const gain = source.value - source.invested;
					const isPositive = gain >= 0;

					return (
						<div key={source.id} className="glass-card p-4 space-y-3 group">
							<div className="flex items-start justify-between">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<source.icon className="h-5 w-5" />
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem>Voir les positions</DropdownMenuItem>
										<DropdownMenuItem>Ajouter une transaction</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className="space-y-3">
								<div>
									<p className="font-medium">{source.name}</p>
									<p className="text-xs text-muted-foreground">
										{source.positions} position{source.positions > 1 ? 's' : ''} · {source.type}
									</p>
								</div>
								<div>
									<p className="text-2xl font-semibold number-display">
										{formatCurrency(source.value)}
									</p>
									<p
										className={`text-sm font-medium ${
											isPositive ? 'value-positive' : 'value-negative'
										}`}
									>
										{isPositive ? '+' : ''}
										{formatCurrency(gain)} ({isPositive ? '+' : ''}
										{source.performance.toFixed(2)}%)
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Positions Table */}
			<div className="glass-card p-6 space-y-4">
				<div className="flex items-center justify-between pb-2">
					<div>
						<h3 className="text-lg font-medium">Positions</h3>
						<p className="text-sm text-muted-foreground">
							Toutes vos positions d&apos;investissement
						</p>
					</div>
					<Button variant="outline" size="sm" className="text-sm">
						Voir tout
					</Button>
				</div>
				<div className="space-y-2">
					{positions.map((pos) => (
						<div
							key={pos.id}
							className="flex items-center justify-between rounded-xl bg-white/50 dark:bg-white/5 p-4 transition-colors hover:bg-white/80 dark:hover:bg-white/10"
						>
							<div className="flex items-center gap-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background font-mono text-sm font-semibold text-muted-foreground">
									{pos.ticker.slice(0, 3)}
								</div>
								<div>
									<p className="font-medium">{pos.name}</p>
									<p className="text-xs text-muted-foreground">
										{pos.ticker} · {pos.source}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-8">
								<div className="text-right hidden sm:block">
									<p className="text-xs text-muted-foreground">Quantité</p>
									<p className="font-medium number-display">{pos.quantity}</p>
								</div>
								<div className="text-right hidden md:block">
									<p className="text-xs text-muted-foreground">PRU</p>
									<p className="font-medium number-display">{formatCurrency(pos.avgPrice)}</p>
								</div>
								<div className="text-right">
									<p className="text-xs text-muted-foreground">Valeur</p>
									<p className="font-medium number-display">{formatCurrency(pos.value)}</p>
								</div>
								<div className="text-right min-w-[100px]">
									<p
										className={`font-medium number-display ${
											pos.gain >= 0 ? 'value-positive' : 'value-negative'
										}`}
									>
										{pos.gain >= 0 ? '+' : ''}
										{formatCurrency(pos.gain)}
									</p>
									<p
										className={`text-xs ${
											pos.gainPercent >= 0 ? 'value-positive' : 'value-negative'
										}`}
									>
										{pos.gainPercent >= 0 ? '+' : ''}
										{pos.gainPercent.toFixed(2)}%
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Performance Chart */}
			<div className="glass-card p-6 space-y-4">
				<div className="flex items-center justify-between pb-2">
					<div>
						<h3 className="text-lg font-medium">Évolution du portefeuille</h3>
						<p className="text-sm text-muted-foreground">Performance sur 12 mois</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<div className="h-2 w-4 rounded-sm bg-[oklch(0.55_0.18_270)]" />
							<span>Valeur</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<div className="h-0.5 w-4 border-t-2 border-dashed border-[oklch(0.5_0.01_280)]" />
							<span>Investi</span>
						</div>
					</div>
				</div>
				<InvestmentPerformanceChart data={demoInvestmentPerformance} className="h-72" />
			</div>
		</div>
	);
}
