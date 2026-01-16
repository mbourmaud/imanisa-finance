import { Entity } from '@domain/shared/Entity';
import { Result } from '@domain/shared/Result';
import type { UniqueId } from '@domain/shared/UniqueId';

interface InvestmentPositionProps {
	/** Reference to the investment source this position belongs to */
	sourceId: UniqueId;
	/** Asset symbol/ticker (e.g., "MSCI WORLD", "CW8", "BTC") */
	symbol: string;
	/** ISIN code if available */
	isin: string | null;
	/** Number of units/shares held */
	quantity: number;
	/** Average buy price (Prix de Revient Unitaire) */
	avgBuyPrice: number;
	/** Current market price per unit */
	currentPrice: number;
	/** Total current value (quantity * currentPrice) */
	currentValue: number;
	/** Gain/loss in currency (currentValue - invested) */
	gainLoss: number;
	/** Gain/loss as percentage */
	gainLossPercent: number;
	/** Last price update timestamp */
	lastUpdated: Date;
	/** Creation date */
	createdAt: Date;
}

export class InvestmentPosition extends Entity<InvestmentPositionProps> {
	private constructor(props: InvestmentPositionProps, id?: UniqueId) {
		super(props, id);
	}

	get sourceId(): UniqueId {
		return this.props.sourceId;
	}

	get symbol(): string {
		return this.props.symbol;
	}

	get isin(): string | null {
		return this.props.isin;
	}

	get quantity(): number {
		return this.props.quantity;
	}

	get avgBuyPrice(): number {
		return this.props.avgBuyPrice;
	}

	get currentPrice(): number {
		return this.props.currentPrice;
	}

	get currentValue(): number {
		return this.props.currentValue;
	}

	get gainLoss(): number {
		return this.props.gainLoss;
	}

	get gainLossPercent(): number {
		return this.props.gainLossPercent;
	}

	get lastUpdated(): Date {
		return this.props.lastUpdated;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	/** Total invested amount (quantity * avgBuyPrice) */
	get investedAmount(): number {
		return this.props.quantity * this.props.avgBuyPrice;
	}

	/**
	 * Update position with new market price and recalculate values
	 */
	updatePrice(newPrice: number): void {
		this.props.currentPrice = newPrice;
		this.props.currentValue = this.props.quantity * newPrice;
		this.props.gainLoss = this.props.currentValue - this.investedAmount;
		this.props.gainLossPercent =
			this.investedAmount > 0 ? (this.props.gainLoss / this.investedAmount) * 100 : 0;
		this.props.lastUpdated = new Date();
	}

	/**
	 * Update position with full data (typically from parser)
	 */
	updateFromParsed(data: {
		quantity: number;
		avgBuyPrice: number;
		currentPrice: number;
		currentValue: number;
		gainLoss: number;
		gainLossPercent: number;
	}): void {
		this.props.quantity = data.quantity;
		this.props.avgBuyPrice = data.avgBuyPrice;
		this.props.currentPrice = data.currentPrice;
		this.props.currentValue = data.currentValue;
		this.props.gainLoss = data.gainLoss;
		this.props.gainLossPercent = data.gainLossPercent;
		this.props.lastUpdated = new Date();
	}

	static create(
		props: {
			sourceId: UniqueId;
			symbol: string;
			isin?: string | null;
			quantity: number;
			avgBuyPrice: number;
			currentPrice: number;
			currentValue: number;
			gainLoss: number;
			gainLossPercent: number;
		},
		id?: UniqueId,
	): Result<InvestmentPosition> {
		if (!props.symbol || props.symbol.trim().length === 0) {
			return Result.fail('Position symbol is required');
		}
		if (props.quantity < 0) {
			return Result.fail('Quantity cannot be negative');
		}
		if (props.avgBuyPrice < 0) {
			return Result.fail('Average buy price cannot be negative');
		}
		if (props.currentPrice < 0) {
			return Result.fail('Current price cannot be negative');
		}

		const now = new Date();
		return Result.ok(
			new InvestmentPosition(
				{
					sourceId: props.sourceId,
					symbol: props.symbol.trim(),
					isin: props.isin ?? null,
					quantity: props.quantity,
					avgBuyPrice: props.avgBuyPrice,
					currentPrice: props.currentPrice,
					currentValue: props.currentValue,
					gainLoss: props.gainLoss,
					gainLossPercent: props.gainLossPercent,
					lastUpdated: now,
					createdAt: now,
				},
				id,
			),
		);
	}

	static reconstitute(
		props: {
			sourceId: UniqueId;
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
		},
		id: UniqueId,
	): Result<InvestmentPosition> {
		return Result.ok(new InvestmentPosition(props, id));
	}
}
