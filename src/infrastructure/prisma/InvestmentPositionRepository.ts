import { InvestmentPosition } from '@domain/investment/InvestmentPosition';
import { UniqueId } from '@domain/shared/UniqueId';
import { prisma } from '@/lib/prisma';

export class InvestmentPositionRepository {
	async findBySourceId(sourceId: UniqueId): Promise<InvestmentPosition[]> {
		const records = await prisma.investmentPosition.findMany({
			where: { sourceId: sourceId.toString() },
		});

		return records.map((record) => this.reconstituteDomainEntity(record));
	}

	async findBySourceIdAndSymbol(
		sourceId: UniqueId,
		symbol: string,
	): Promise<InvestmentPosition | null> {
		const record = await prisma.investmentPosition.findUnique({
			where: {
				sourceId_symbol: {
					sourceId: sourceId.toString(),
					symbol,
				},
			},
		});

		if (!record) {
			return null;
		}

		return this.reconstituteDomainEntity(record);
	}

	async save(position: InvestmentPosition): Promise<void> {
		await prisma.investmentPosition.upsert({
			where: { id: position.id.toString() },
			update: {
				symbol: position.symbol,
				isin: position.isin,
				quantity: position.quantity,
				avgBuyPrice: position.avgBuyPrice,
				currentPrice: position.currentPrice,
				currentValue: position.currentValue,
				gainLoss: position.gainLoss,
				gainLossPercent: position.gainLossPercent,
				lastUpdated: position.lastUpdated,
			},
			create: {
				id: position.id.toString(),
				sourceId: position.sourceId.toString(),
				symbol: position.symbol,
				isin: position.isin,
				quantity: position.quantity,
				avgBuyPrice: position.avgBuyPrice,
				currentPrice: position.currentPrice,
				currentValue: position.currentValue,
				gainLoss: position.gainLoss,
				gainLossPercent: position.gainLossPercent,
				lastUpdated: position.lastUpdated,
				createdAt: position.createdAt,
			},
		});
	}

	async delete(id: UniqueId): Promise<void> {
		await prisma.investmentPosition.delete({
			where: { id: id.toString() },
		});
	}

	async upsert(position: InvestmentPosition): Promise<void> {
		const existing = await this.findBySourceIdAndSymbol(position.sourceId, position.symbol);

		if (existing) {
			// Update existing position with new data
			await prisma.investmentPosition.update({
				where: { id: existing.id.toString() },
				data: {
					quantity: position.quantity,
					avgBuyPrice: position.avgBuyPrice,
					currentPrice: position.currentPrice,
					currentValue: position.currentValue,
					gainLoss: position.gainLoss,
					gainLossPercent: position.gainLossPercent,
					lastUpdated: position.lastUpdated,
					isin: position.isin,
				},
			});
		} else {
			// Create new position
			await prisma.investmentPosition.create({
				data: {
					id: position.id.toString(),
					sourceId: position.sourceId.toString(),
					symbol: position.symbol,
					isin: position.isin,
					quantity: position.quantity,
					avgBuyPrice: position.avgBuyPrice,
					currentPrice: position.currentPrice,
					currentValue: position.currentValue,
					gainLoss: position.gainLoss,
					gainLossPercent: position.gainLossPercent,
					lastUpdated: position.lastUpdated,
					createdAt: position.createdAt,
				},
			});
		}
	}

	private reconstituteDomainEntity(record: {
		id: string;
		sourceId: string;
		symbol: string;
		isin: string | null;
		quantity: number;
		avgBuyPrice: number;
		currentPrice: number;
		currentValue: number;
		gainLoss: number;
		gainLossPercent: number;
		lastUpdated: Date;
		createdAt: Date;
	}): InvestmentPosition {
		const result = InvestmentPosition.reconstitute(
			{
				sourceId: UniqueId.fromString(record.sourceId),
				symbol: record.symbol,
				isin: record.isin,
				quantity: record.quantity,
				avgBuyPrice: record.avgBuyPrice,
				currentPrice: record.currentPrice,
				currentValue: record.currentValue,
				gainLoss: record.gainLoss,
				gainLossPercent: record.gainLossPercent,
				lastUpdated: record.lastUpdated,
				createdAt: record.createdAt,
			},
			UniqueId.fromString(record.id),
		);

		if (result.isFailure) {
			throw new Error(`Failed to reconstitute InvestmentPosition: ${result.error}`);
		}

		return result.value;
	}
}
