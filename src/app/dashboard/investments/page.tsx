'use client';

import {
	ArrowDownRight,
	ArrowUpRight,
	Bitcoin,
	Box,
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
	Grid,
	Heading,
	HStack,
	MoreHorizontal,
	PageHeader,
	Plus,
	RefreshCw,
	StatCard,
	StatCardGrid,
	Text,
	TrendingUp,
	VStack,
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
		<VStack gap="xl">
			{/* Header */}
			<PageHeader
				title="Investissements"
				description="PEA, CTO, Assurance-vie, Crypto"
				actions={
					<HStack gap="sm">
						<Button
							variant="outline"
							iconLeft={<RefreshCw style={{ height: '1rem', width: '1rem' }} />}
						>
							Actualiser
						</Button>
						<Button iconLeft={<Plus style={{ height: '1rem', width: '1rem' }} />}>
							Nouvelle source
						</Button>
					</HStack>
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
			<Grid cols={1} colsSm={2} colsLg={4} gap="md">
				{sources.map((source) => {
					const gain = source.value - source.invested;
					const isPositive = gain >= 0;

					return (
						<GlassCard
							key={source.id}
							padding="md"
							style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
						>
							<HStack justify="between" align="start">
								<Flex
									align="center"
									justify="center"
									style={{
										height: '2.5rem',
										width: '2.5rem',
										borderRadius: '0.75rem',
										backgroundColor: 'hsl(var(--primary) / 0.1)',
										color: 'hsl(var(--primary))',
									}}
								>
									<source.icon style={{ height: '1.25rem', width: '1.25rem' }} />
								</Flex>
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
							</HStack>
							<VStack gap="md">
								<VStack gap="none">
									<Text weight="medium">{source.name}</Text>
									<Text size="xs" color="muted">
										{source.positions} position{source.positions > 1 ? 's' : ''} · {source.type}
									</Text>
								</VStack>
								<VStack gap="none">
									<Text size="2xl" weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{formatCurrency(source.value)}
									</Text>
									<Text
										size="sm"
										weight="medium"
										style={{ color: isPositive ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.2 25)' }}
									>
										{isPositive ? '+' : ''}
										{formatCurrency(gain)} ({isPositive ? '+' : ''}
										{source.performance.toFixed(2)}%)
									</Text>
								</VStack>
							</VStack>
						</GlassCard>
					);
				})}
			</Grid>

			{/* Positions Table */}
			<GlassCard padding="lg">
				<HStack justify="between" align="center" style={{ marginBottom: '1rem' }}>
					<VStack gap="none">
						<Heading level={3} size="lg" weight="medium">
							Positions
						</Heading>
						<Text size="sm" color="muted">
							Toutes vos positions d&apos;investissement
						</Text>
					</VStack>
					<Button variant="outline" size="sm">
						Voir tout
					</Button>
				</HStack>
				<VStack gap="sm">
					{positions.map((pos) => (
						<HStack
							key={pos.id}
							justify="between"
							align="center"
							p="md"
							style={{
								borderRadius: '0.75rem',
								backgroundColor: 'hsl(var(--background) / 0.5)',
								transition: 'background-color 0.2s',
							}}
						>
							<HStack gap="md" align="center">
								<Flex
									align="center"
									justify="center"
									style={{
										height: '2.5rem',
										width: '2.5rem',
										borderRadius: '0.5rem',
										backgroundColor: 'hsl(var(--background))',
										fontFamily: 'monospace',
										fontSize: '0.875rem',
										fontWeight: 600,
										color: 'hsl(var(--muted-foreground))',
									}}
								>
									{pos.ticker.slice(0, 3)}
								</Flex>
								<VStack gap="none">
									<Text weight="medium">{pos.name}</Text>
									<Text size="xs" color="muted">
										{pos.ticker} · {pos.source}
									</Text>
								</VStack>
							</HStack>
							<HStack gap="xl" align="center">
								<Box style={{ display: 'none', textAlign: 'right' }} data-show-sm>
									<Text size="xs" color="muted">
										Quantité
									</Text>
									<Text weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{pos.quantity}
									</Text>
								</Box>
								<Box style={{ display: 'none', textAlign: 'right' }} data-show-md>
									<Text size="xs" color="muted">
										PRU
									</Text>
									<Text weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{formatCurrency(pos.avgPrice)}
									</Text>
								</Box>
								<Box style={{ textAlign: 'right' }}>
									<Text size="xs" color="muted">
										Valeur
									</Text>
									<Text weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{formatCurrency(pos.value)}
									</Text>
								</Box>
								<Box style={{ textAlign: 'right', minWidth: '100px' }}>
									<Text
										weight="medium"
										style={{
											fontVariantNumeric: 'tabular-nums',
											color: pos.gain >= 0 ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.2 25)',
										}}
									>
										{pos.gain >= 0 ? '+' : ''}
										{formatCurrency(pos.gain)}
									</Text>
									<Text
										size="xs"
										style={{
											color: pos.gainPercent >= 0 ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.2 25)',
										}}
									>
										{pos.gainPercent >= 0 ? '+' : ''}
										{pos.gainPercent.toFixed(2)}%
									</Text>
								</Box>
							</HStack>
						</HStack>
					))}
				</VStack>
			</GlassCard>

			{/* Performance Chart */}
			<GlassCard padding="lg">
				<HStack justify="between" align="center" style={{ marginBottom: '1rem' }}>
					<VStack gap="none">
						<Heading level={3} size="lg" weight="medium">
							Évolution du portefeuille
						</Heading>
						<Text size="sm" color="muted">
							Performance sur 12 mois
						</Text>
					</VStack>
					<HStack gap="md" align="center">
						<HStack gap="sm" align="center">
							<Box
								style={{
									height: '0.5rem',
									width: '1rem',
									borderRadius: '0.125rem',
									backgroundColor: 'oklch(0.55 0.18 270)',
								}}
							/>
							<Text size="sm" color="muted">
								Valeur
							</Text>
						</HStack>
						<HStack gap="sm" align="center">
							<Box
								style={{
									height: '2px',
									width: '1rem',
									borderTop: '2px dashed oklch(0.5 0.01 280)',
								}}
							/>
							<Text size="sm" color="muted">
								Investi
							</Text>
						</HStack>
					</HStack>
				</HStack>
				<InvestmentPerformanceChart data={demoInvestmentPerformance} height="lg" />
			</GlassCard>
		</VStack>
	);
}
