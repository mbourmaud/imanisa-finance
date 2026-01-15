import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InvestmentRepositoryImpl } from '@infrastructure/repositories/InvestmentRepository';

const investmentRepository = new InvestmentRepositoryImpl();

export const GET: RequestHandler = async () => {
	const groupedPositions = await investmentRepository.getPositionsGroupedBySource();

	return json(
		groupedPositions.map((group) => ({
			source: {
				id: group.source.id.toString(),
				name: group.source.name,
				type: group.source.type,
				owner_entity_id: group.source.ownerEntityId.toString(),
				url: group.source.url,
				format: group.source.format,
				parser_key: group.source.parserKey,
				last_sync_at: group.source.lastSyncAt?.toISOString() ?? null
			},
			positions: group.positions.map((pos) => ({
				id: pos.id.toString(),
				source_id: pos.sourceId.toString(),
				symbol: pos.symbol,
				isin: pos.isin,
				quantity: pos.quantity,
				avg_buy_price: pos.avgBuyPrice,
				current_price: pos.currentPrice,
				current_value: pos.currentValue,
				invested_amount: pos.investedAmount,
				gain_loss: pos.gainLoss,
				gain_loss_percent: pos.gainLossPercent,
				last_updated: pos.lastUpdated.toISOString()
			})),
			subtotal: {
				invested: group.subtotal.invested,
				current_value: group.subtotal.currentValue,
				gain_loss: group.subtotal.gainLoss,
				gain_loss_percent: group.subtotal.gainLossPercent
			}
		}))
	);
};
