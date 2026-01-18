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
	Flex,
	GlassCard,
	IconBox,
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
		<Flex direction="col" gap="xl">
			{/* Header */}
			<PageHeader
				title="Investissements"
				description="PEA, CTO, Assurance-vie, Crypto"
				actions={
					<Flex direction="row" gap="sm">
						<Button
							variant="outline"
							iconLeft={<RefreshCw style={{ height: '1rem', width: '1rem' }} />}
						>
							Actualiser
						</Button>
						<Button iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}>
							Nouvelle source
						</Button>
					</Flex>
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
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
					gap: '1rem',
				}}
			>
				{sources.map((source) => {
					const gain = source.value - source.invested;
					const isPositive = gain >= 0;

					return (
						<GlassCard
							key={source.id}
							padding="md"
							style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
						>
							<Flex direction="row" justify="between">
								<IconBox
									icon={source.icon}
									size="md"
									variant="primary"
									rounded="xl"
								/>
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
							</Flex>
							<Flex direction="col" gap="md">
								<Flex direction="col" gap="xs">
									<span className="font-medium">{source.name}</span>
									<span className="text-xs text-muted-foreground">
										{source.positions} position{source.positions > 1 ? 's' : ''} · {source.type}
									</span>
								</Flex>
								<Flex direction="col" gap="xs">
									<span
										className="text-2xl font-semibold"
										style={{ fontVariantNumeric: 'tabular-nums' }}
									>
										{formatCurrency(source.value)}
									</span>
									<span
										className="text-sm font-medium"
										style={{ color: isPositive ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.2 25)' }}
									>
										{isPositive ? '+' : ''}
										{formatCurrency(gain)} ({isPositive ? '+' : ''}
										{source.performance.toFixed(2)}%)
									</span>
								</Flex>
							</Flex>
						</GlassCard>
					);
				})}
			</div>

			{/* Positions Table */}
			<GlassCard padding="lg">
				<Flex direction="row" justify="between" style={{ marginBottom: '1rem' }}>
					<Flex direction="col" gap="xs">
						<h3 className="text-lg font-bold tracking-tight">
							Positions
						</h3>
						<span className="text-sm text-muted-foreground">
							Toutes vos positions d&apos;investissement
						</span>
					</Flex>
					<Button variant="outline" size="sm">
						Voir tout
					</Button>
				</Flex>
				<Flex direction="col" gap="sm">
					{positions.map((pos) => (
						<Flex
							key={pos.id}
							direction="row"
							justify="between"
							style={{
								padding: '1rem',
								borderRadius: '0.75rem',
								transition: 'background-color 0.2s',
								backgroundColor: 'hsl(var(--background) / 0.5)',
							}}
						>
							<Flex direction="row" gap="md">
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										height: '2.5rem',
										width: '2.5rem',
										borderRadius: '0.5rem',
										fontFamily: 'monospace',
										fontSize: '0.875rem',
										fontWeight: 600,
										backgroundColor: 'hsl(var(--background))',
										color: 'hsl(var(--muted-foreground))',
									}}
								>
									{pos.ticker.slice(0, 3)}
								</div>
								<Flex direction="col" gap="xs">
									<span className="font-medium">{pos.name}</span>
									<span className="text-xs text-muted-foreground">
										{pos.ticker} · {pos.source}
									</span>
								</Flex>
							</Flex>
							<Flex direction="row" gap="xl">
								<Flex direction="col" gap="xs" align="end" data-show-sm style={{ display: 'none' }}>
									<span className="text-xs text-muted-foreground">
										Quantité
									</span>
									<span className="font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{pos.quantity}
									</span>
								</Flex>
								<Flex direction="col" gap="xs" align="end" data-show-md style={{ display: 'none' }}>
									<span className="text-xs text-muted-foreground">
										PRU
									</span>
									<span className="font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{formatCurrency(pos.avgPrice)}
									</span>
								</Flex>
								<Flex direction="col" gap="xs" align="end">
									<span className="text-xs text-muted-foreground">
										Valeur
									</span>
									<span className="font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{formatCurrency(pos.value)}
									</span>
								</Flex>
								<Flex direction="col" gap="xs" align="end" style={{ minWidth: '100px' }}>
									<span
										className="font-medium"
										style={{
											fontVariantNumeric: 'tabular-nums',
											color: pos.gain >= 0 ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.2 25)',
										}}
									>
										{pos.gain >= 0 ? '+' : ''}
										{formatCurrency(pos.gain)}
									</span>
									<span
										className="text-xs"
										style={{
											color: pos.gainPercent >= 0 ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.2 25)',
										}}
									>
										{pos.gainPercent >= 0 ? '+' : ''}
										{pos.gainPercent.toFixed(2)}%
									</span>
								</Flex>
							</Flex>
						</Flex>
					))}
				</Flex>
			</GlassCard>

			{/* Performance Chart */}
			<GlassCard padding="lg">
				<Flex direction="row" justify="between" style={{ marginBottom: '1rem' }}>
					<Flex direction="col" gap="xs">
						<h3 className="text-lg font-bold tracking-tight">
							Évolution du portefeuille
						</h3>
						<span className="text-sm text-muted-foreground">
							Performance sur 12 mois
						</span>
					</Flex>
					<Flex direction="row" gap="md">
						<Flex direction="row" gap="sm">
							<div
								style={{
									height: '0.5rem',
									width: '1rem',
									borderRadius: '0.125rem',
									backgroundColor: 'oklch(0.55 0.18 270)',
								}}
							/>
							<span className="text-sm text-muted-foreground">
								Valeur
							</span>
						</Flex>
						<Flex direction="row" gap="sm">
							<div
								style={{
									height: '0',
									width: '1rem',
									borderTop: '2px dashed oklch(0.5 0.01 280)',
								}}
							/>
							<span className="text-sm text-muted-foreground">
								Investi
							</span>
						</Flex>
					</Flex>
				</Flex>
				<InvestmentPerformanceChart data={demoInvestmentPerformance} height="lg" />
			</GlassCard>
		</Flex>
	);
}
