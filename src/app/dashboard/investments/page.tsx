'use client';

import {
	ArrowDownRight,
	ArrowUpRight,
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
} from '@/components';
import { InvestmentPerformanceChart } from '@/components/charts';
import {
	demoPositions,
	demoSources,
	totalGain,
	totalInvested,
	totalPerformance,
	totalValue,
} from '@/features/investments';
import { demoInvestmentPerformance } from '@/lib/demo';
import { formatMoney } from '@/shared/utils';

export default function InvestmentsPage() {
	return (
		<div className="flex flex-col gap-8">
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
				{demoSources.map((source) => (
					<InvestmentSourceCard key={source.id} source={source} />
				))}
			</InvestmentSourceGrid>

			<PositionsSection>
				{demoPositions.map((pos) => (
					<PositionListItem key={pos.id} position={pos} />
				))}
			</PositionsSection>

			<PortfolioChartSection>
				<InvestmentPerformanceChart data={demoInvestmentPerformance} height="lg" />
			</PortfolioChartSection>
		</div>
	);
}
