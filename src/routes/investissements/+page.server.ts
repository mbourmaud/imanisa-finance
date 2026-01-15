import type { PageServerLoad } from './$types';
import { InvestmentRepositoryImpl } from '@infrastructure/repositories/InvestmentRepository';
import { getAllEntities } from '@infrastructure/repositories/RealEstateRepository';

const investmentRepository = new InvestmentRepositoryImpl();

export interface InvestmentSourceWithOwner {
	id: string;
	name: string;
	type: string;
	ownerEntityId: string;
	ownerName: string;
	ownerColor: string | null;
	url: string;
	format: string;
	parserKey: string;
	lastSyncAt: string | null;
}

export interface PositionData {
	id: string;
	sourceId: string;
	symbol: string;
	isin: string | null;
	quantity: number;
	avgBuyPrice: number;
	currentPrice: number;
	currentValue: number;
	investedAmount: number;
	gainLoss: number;
	gainLossPercent: number;
	lastUpdated: string;
}

export interface GroupedPositions {
	source: InvestmentSourceWithOwner;
	positions: PositionData[];
	subtotal: {
		invested: number;
		currentValue: number;
		gainLoss: number;
		gainLossPercent: number;
	};
}

export interface InvestmentSummary {
	totalInvested: number;
	currentValue: number;
	totalGainLoss: number;
	totalGainLossPercent: number;
}

export const load: PageServerLoad = async () => {
	const [groupedPositions, summary, entities] = await Promise.all([
		investmentRepository.getPositionsGroupedBySource(),
		investmentRepository.getInvestmentSummary(),
		getAllEntities()
	]);

	// Create entity lookup map
	const entityMap = new Map(entities.map((e) => [e.id, e]));

	// Map grouped positions with owner info
	const groupedData: GroupedPositions[] = groupedPositions.map((group) => {
		const owner = entityMap.get(group.source.ownerEntityId.toString());
		return {
			source: {
				id: group.source.id.toString(),
				name: group.source.name,
				type: group.source.type,
				ownerEntityId: group.source.ownerEntityId.toString(),
				ownerName: owner?.name ?? 'Inconnu',
				ownerColor: owner?.color ?? null,
				url: group.source.url,
				format: group.source.format,
				parserKey: group.source.parserKey,
				lastSyncAt: group.source.lastSyncAt?.toISOString() ?? null
			},
			positions: group.positions.map((pos) => ({
				id: pos.id.toString(),
				sourceId: pos.sourceId.toString(),
				symbol: pos.symbol,
				isin: pos.isin,
				quantity: pos.quantity,
				avgBuyPrice: pos.avgBuyPrice,
				currentPrice: pos.currentPrice,
				currentValue: pos.currentValue,
				investedAmount: pos.investedAmount,
				gainLoss: pos.gainLoss,
				gainLossPercent: pos.gainLossPercent,
				lastUpdated: pos.lastUpdated.toISOString()
			})),
			subtotal: group.subtotal
		};
	});

	return {
		groupedPositions: groupedData,
		summary: {
			totalInvested: summary.totalInvested,
			currentValue: summary.currentValue,
			totalGainLoss: summary.totalGainLoss,
			totalGainLossPercent: summary.totalGainLossPercent
		} satisfies InvestmentSummary
	};
};
