import { eq, and, desc } from 'drizzle-orm';
import { getDb, schema } from '@infrastructure/database/drizzle';
import {
	InvestmentSource,
	InvestmentSourceType,
	InvestmentParserKey,
	InvestmentPosition,
	InvestmentTransaction
} from '@domain/investment';
import type { InvestmentTransactionType } from '@domain/investment';
import { UniqueId } from '@domain/shared/UniqueId';

// =====================================================
// Type definitions
// =====================================================

type InvestmentSourceRow = typeof schema.investmentSources.$inferSelect;
type InvestmentPositionRow = typeof schema.investmentPositions.$inferSelect;
type InvestmentTransactionRow = typeof schema.investmentTransactions.$inferSelect;

// =====================================================
// InvestmentSource Mappers
// =====================================================

function sourceRowToDomain(row: InvestmentSourceRow): InvestmentSource {
	const result = InvestmentSource.reconstitute(
		{
			name: row.name,
			type: row.type as InvestmentSourceType,
			ownerEntityId: UniqueId.fromString(row.ownerEntityId),
			url: row.url,
			format: row.format,
			parserKey: row.parserKey as InvestmentParserKey,
			lastSyncAt: row.lastSyncAt ? new Date(row.lastSyncAt) : null,
			createdAt: row.createdAt ? new Date(row.createdAt) : new Date()
		},
		UniqueId.fromString(row.id)
	);

	if (result.isFailure) {
		throw new Error(`Failed to reconstitute InvestmentSource: ${result.error}`);
	}

	return result.value;
}

function sourceDomainToPersistence(
	source: InvestmentSource
): typeof schema.investmentSources.$inferInsert {
	return {
		id: source.id.toString(),
		name: source.name,
		type: source.type,
		ownerEntityId: source.ownerEntityId.toString(),
		url: source.url,
		format: source.format,
		parserKey: source.parserKey,
		lastSyncAt: source.lastSyncAt?.toISOString() ?? null,
		createdAt: source.createdAt.toISOString()
	};
}

// =====================================================
// InvestmentPosition Mappers
// =====================================================

function positionRowToDomain(row: InvestmentPositionRow): InvestmentPosition {
	const result = InvestmentPosition.reconstitute(
		{
			sourceId: UniqueId.fromString(row.sourceId),
			symbol: row.symbol,
			isin: row.isin,
			quantity: row.quantity,
			avgBuyPrice: row.avgBuyPrice,
			currentPrice: row.currentPrice,
			currentValue: row.currentValue,
			gainLoss: row.gainLoss,
			gainLossPercent: row.gainLossPercent,
			lastUpdated: new Date(row.lastUpdated),
			createdAt: row.createdAt ? new Date(row.createdAt) : new Date()
		},
		UniqueId.fromString(row.id)
	);

	if (result.isFailure) {
		throw new Error(`Failed to reconstitute InvestmentPosition: ${result.error}`);
	}

	return result.value;
}

function positionDomainToPersistence(
	position: InvestmentPosition
): typeof schema.investmentPositions.$inferInsert {
	return {
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
		lastUpdated: position.lastUpdated.toISOString(),
		createdAt: position.createdAt.toISOString()
	};
}

// =====================================================
// InvestmentTransaction Mappers
// =====================================================

function transactionRowToDomain(row: InvestmentTransactionRow): InvestmentTransaction {
	const result = InvestmentTransaction.reconstitute(
		{
			sourceId: UniqueId.fromString(row.sourceId),
			date: new Date(row.date),
			symbol: row.symbol,
			type: row.type as InvestmentTransactionType,
			quantity: row.quantity,
			pricePerUnit: row.pricePerUnit,
			totalAmount: row.totalAmount,
			fee: row.fee,
			createdAt: row.createdAt ? new Date(row.createdAt) : new Date()
		},
		UniqueId.fromString(row.id)
	);

	if (result.isFailure) {
		throw new Error(`Failed to reconstitute InvestmentTransaction: ${result.error}`);
	}

	return result.value;
}

function transactionDomainToPersistence(
	transaction: InvestmentTransaction
): typeof schema.investmentTransactions.$inferInsert {
	return {
		id: transaction.id.toString(),
		sourceId: transaction.sourceId.toString(),
		date: transaction.date.toISOString(),
		symbol: transaction.symbol,
		type: transaction.type,
		quantity: transaction.quantity,
		pricePerUnit: transaction.pricePerUnit,
		totalAmount: transaction.totalAmount,
		fee: transaction.fee,
		createdAt: transaction.createdAt.toISOString()
	};
}

// =====================================================
// Repository Implementation
// =====================================================

/**
 * Drizzle ORM implementation for Investment entities
 */
export class InvestmentRepositoryImpl {
	// =====================================================
	// InvestmentSource methods
	// =====================================================

	async findAllSources(): Promise<InvestmentSource[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentSources)
			.orderBy(schema.investmentSources.name);
		return rows.map(sourceRowToDomain);
	}

	async findSourceById(id: UniqueId): Promise<InvestmentSource | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentSources)
			.where(eq(schema.investmentSources.id, id.toString()))
			.limit(1);
		const row = rows[0];
		return row ? sourceRowToDomain(row) : null;
	}

	async findSourcesByOwnerEntityId(ownerEntityId: UniqueId): Promise<InvestmentSource[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentSources)
			.where(eq(schema.investmentSources.ownerEntityId, ownerEntityId.toString()))
			.orderBy(schema.investmentSources.name);
		return rows.map(sourceRowToDomain);
	}

	async saveSource(source: InvestmentSource): Promise<void> {
		const db = getDb();
		const data = sourceDomainToPersistence(source);

		const existing = await this.findSourceById(source.id);

		if (existing) {
			await db
				.update(schema.investmentSources)
				.set({
					name: data.name,
					type: data.type,
					ownerEntityId: data.ownerEntityId,
					url: data.url,
					format: data.format,
					parserKey: data.parserKey,
					lastSyncAt: data.lastSyncAt
				})
				.where(eq(schema.investmentSources.id, data.id));
		} else {
			await db.insert(schema.investmentSources).values(data);
		}
	}

	async deleteSource(id: UniqueId): Promise<void> {
		const db = getDb();
		await db
			.delete(schema.investmentSources)
			.where(eq(schema.investmentSources.id, id.toString()));
	}

	// =====================================================
	// InvestmentPosition methods
	// =====================================================

	async findAllPositions(): Promise<InvestmentPosition[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentPositions)
			.orderBy(schema.investmentPositions.symbol);
		return rows.map(positionRowToDomain);
	}

	async findPositionById(id: UniqueId): Promise<InvestmentPosition | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentPositions)
			.where(eq(schema.investmentPositions.id, id.toString()))
			.limit(1);
		const row = rows[0];
		return row ? positionRowToDomain(row) : null;
	}

	async findPositionsBySourceId(sourceId: UniqueId): Promise<InvestmentPosition[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentPositions)
			.where(eq(schema.investmentPositions.sourceId, sourceId.toString()))
			.orderBy(schema.investmentPositions.symbol);
		return rows.map(positionRowToDomain);
	}

	async findPositionBySourceAndSymbol(
		sourceId: UniqueId,
		symbol: string
	): Promise<InvestmentPosition | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentPositions)
			.where(
				and(
					eq(schema.investmentPositions.sourceId, sourceId.toString()),
					eq(schema.investmentPositions.symbol, symbol)
				)
			)
			.limit(1);
		const row = rows[0];
		return row ? positionRowToDomain(row) : null;
	}

	async savePosition(position: InvestmentPosition): Promise<void> {
		const db = getDb();
		const data = positionDomainToPersistence(position);

		const existing = await this.findPositionById(position.id);

		if (existing) {
			await db
				.update(schema.investmentPositions)
				.set({
					symbol: data.symbol,
					isin: data.isin,
					quantity: data.quantity,
					avgBuyPrice: data.avgBuyPrice,
					currentPrice: data.currentPrice,
					currentValue: data.currentValue,
					gainLoss: data.gainLoss,
					gainLossPercent: data.gainLossPercent,
					lastUpdated: data.lastUpdated
				})
				.where(eq(schema.investmentPositions.id, data.id));
		} else {
			await db.insert(schema.investmentPositions).values(data);
		}
	}

	async deletePosition(id: UniqueId): Promise<void> {
		const db = getDb();
		await db
			.delete(schema.investmentPositions)
			.where(eq(schema.investmentPositions.id, id.toString()));
	}

	async deletePositionsBySourceId(sourceId: UniqueId): Promise<void> {
		const db = getDb();
		await db
			.delete(schema.investmentPositions)
			.where(eq(schema.investmentPositions.sourceId, sourceId.toString()));
	}

	// =====================================================
	// InvestmentTransaction methods
	// =====================================================

	async findAllTransactions(): Promise<InvestmentTransaction[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentTransactions)
			.orderBy(desc(schema.investmentTransactions.date));
		return rows.map(transactionRowToDomain);
	}

	async findTransactionById(id: UniqueId): Promise<InvestmentTransaction | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentTransactions)
			.where(eq(schema.investmentTransactions.id, id.toString()))
			.limit(1);
		const row = rows[0];
		return row ? transactionRowToDomain(row) : null;
	}

	async findTransactionsBySourceId(sourceId: UniqueId): Promise<InvestmentTransaction[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentTransactions)
			.where(eq(schema.investmentTransactions.sourceId, sourceId.toString()))
			.orderBy(desc(schema.investmentTransactions.date));
		return rows.map(transactionRowToDomain);
	}

	async findTransactionsBySymbol(symbol: string): Promise<InvestmentTransaction[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.investmentTransactions)
			.where(eq(schema.investmentTransactions.symbol, symbol.toUpperCase()))
			.orderBy(desc(schema.investmentTransactions.date));
		return rows.map(transactionRowToDomain);
	}

	async saveTransaction(transaction: InvestmentTransaction): Promise<void> {
		const db = getDb();
		const data = transactionDomainToPersistence(transaction);

		const existing = await this.findTransactionById(transaction.id);

		if (existing) {
			await db
				.update(schema.investmentTransactions)
				.set({
					date: data.date,
					symbol: data.symbol,
					type: data.type,
					quantity: data.quantity,
					pricePerUnit: data.pricePerUnit,
					totalAmount: data.totalAmount,
					fee: data.fee
				})
				.where(eq(schema.investmentTransactions.id, data.id));
		} else {
			await db.insert(schema.investmentTransactions).values(data);
		}
	}

	async deleteTransaction(id: UniqueId): Promise<void> {
		const db = getDb();
		await db
			.delete(schema.investmentTransactions)
			.where(eq(schema.investmentTransactions.id, id.toString()));
	}

	async deleteTransactionsBySourceId(sourceId: UniqueId): Promise<void> {
		const db = getDb();
		await db
			.delete(schema.investmentTransactions)
			.where(eq(schema.investmentTransactions.sourceId, sourceId.toString()));
	}

	// =====================================================
	// Aggregate queries
	// =====================================================

	/**
	 * Get investment summary across all sources
	 */
	async getInvestmentSummary(): Promise<{
		totalInvested: number;
		currentValue: number;
		totalGainLoss: number;
		totalGainLossPercent: number;
	}> {
		const positions = await this.findAllPositions();

		const totalInvested = positions.reduce((sum, p) => sum + p.investedAmount, 0);
		const currentValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
		const totalGainLoss = currentValue - totalInvested;
		const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

		return {
			totalInvested: Math.round(totalInvested * 100) / 100,
			currentValue: Math.round(currentValue * 100) / 100,
			totalGainLoss: Math.round(totalGainLoss * 100) / 100,
			totalGainLossPercent: Math.round(totalGainLossPercent * 100) / 100
		};
	}

	/**
	 * Get positions grouped by source with source info
	 */
	async getPositionsGroupedBySource(): Promise<
		Array<{
			source: InvestmentSource;
			positions: InvestmentPosition[];
			subtotal: {
				invested: number;
				currentValue: number;
				gainLoss: number;
				gainLossPercent: number;
			};
		}>
	> {
		const sources = await this.findAllSources();
		const result: Array<{
			source: InvestmentSource;
			positions: InvestmentPosition[];
			subtotal: {
				invested: number;
				currentValue: number;
				gainLoss: number;
				gainLossPercent: number;
			};
		}> = [];

		for (const source of sources) {
			const positions = await this.findPositionsBySourceId(source.id);
			const invested = positions.reduce((sum, p) => sum + p.investedAmount, 0);
			const currentValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
			const gainLoss = currentValue - invested;
			const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

			result.push({
				source,
				positions,
				subtotal: {
					invested: Math.round(invested * 100) / 100,
					currentValue: Math.round(currentValue * 100) / 100,
					gainLoss: Math.round(gainLoss * 100) / 100,
					gainLossPercent: Math.round(gainLossPercent * 100) / 100
				}
			});
		}

		return result;
	}
}
