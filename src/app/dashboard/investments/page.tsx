'use client'

/**
 * Investments Page
 *
 * Shows investment portfolios (PEA, CTO, AV, Crypto) with positions and performance.
 * Uses the new component library for consistent UI.
 */

import {
	ArrowDownRight,
	ArrowUpRight,
	Bitcoin,
	Briefcase,
	Building,
	Flex,
	InvestmentActions,
	InvestmentSourceCard,
	InvestmentSourceGrid,
	PageHeader,
	PortfolioChartSection,
	PositionListItem,
	PositionsSection,
	StatCard,
	StatCardGrid,
	TrendingUp,
	Wallet,
	type InvestmentSource,
	type Position,
} from '@/components'
import { InvestmentPerformanceChart } from '@/components/charts'
import { demoInvestmentPerformance } from '@/lib/demo'
import { formatMoney } from '@/shared/utils'

const sources: InvestmentSource[] = [
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
]

const positions: Position[] = [
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
]

const totalValue = sources.reduce((s, src) => s + src.value, 0)
const totalInvested = sources.reduce((s, src) => s + src.invested, 0)
const totalGain = totalValue - totalInvested
const totalPerformance = ((totalValue - totalInvested) / totalInvested) * 100

export default function InvestmentsPage() {
	return (
		<Flex direction="col" gap="xl">
			<PageHeader
				title="Investissements"
				description="PEA, CTO, Assurance-vie, Crypto"
				actions={<InvestmentActions />}
			/>

			<StatCardGrid columns={4}>
				<StatCard
					label="Valeur totale"
					value={formatMoney(totalValue)}
					icon={Wallet}
					variant="default"
				/>

				<StatCard
					label="Total investi"
					value={formatMoney(totalInvested)}
					icon={TrendingUp}
					variant="default"
				/>

				<StatCard
					label="Plus-value latente"
					value={`${totalGain >= 0 ? '+' : ''}${formatMoney(totalGain)}`}
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

			<InvestmentSourceGrid>
				{sources.map((source) => (
					<InvestmentSourceCard key={source.id} source={source} />
				))}
			</InvestmentSourceGrid>

			<PositionsSection>
				{positions.map((pos) => (
					<PositionListItem key={pos.id} position={pos} />
				))}
			</PositionsSection>

			<PortfolioChartSection>
				<InvestmentPerformanceChart data={demoInvestmentPerformance} height="lg" />
			</PortfolioChartSection>
		</Flex>
	)
}
