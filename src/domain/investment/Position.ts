import { Entity } from '@domain/shared/Entity';
import { Result } from '@domain/shared/Result';
import type { UniqueId } from '@domain/shared/UniqueId';
import type { AssetType } from './AssetType';

interface PositionProps {
	accountId: UniqueId;
	name: string;
	isin: string | null;
	ticker: string | null;
	assetType: AssetType;
	quantity: number;
	pru: number;
	currentPrice: number | null;
	feesTotal: number;
	createdAt: Date;
	updatedAt: Date;
}

export class Position extends Entity<PositionProps> {
	private constructor(props: PositionProps, id?: UniqueId) {
		super(props, id);
	}

	get accountId(): UniqueId {
		return this.props.accountId;
	}

	get name(): string {
		return this.props.name;
	}

	get isin(): string | null {
		return this.props.isin;
	}

	get ticker(): string | null {
		return this.props.ticker;
	}

	get assetType(): AssetType {
		return this.props.assetType;
	}

	get quantity(): number {
		return this.props.quantity;
	}

	get pru(): number {
		return this.props.pru;
	}

	get currentPrice(): number | null {
		return this.props.currentPrice;
	}

	get feesTotal(): number {
		return this.props.feesTotal;
	}

	get investedAmount(): number {
		return this.props.quantity * this.props.pru;
	}

	get currentValue(): number | null {
		if (this.props.currentPrice === null) return null;
		return this.props.quantity * this.props.currentPrice;
	}

	get unrealizedGain(): number | null {
		const currentValue = this.currentValue;
		if (currentValue === null) return null;
		return currentValue - this.investedAmount;
	}

	get unrealizedGainPercent(): number | null {
		const gain = this.unrealizedGain;
		if (gain === null || this.investedAmount === 0) return null;
		return (gain / this.investedAmount) * 100;
	}

	get netGain(): number | null {
		const gain = this.unrealizedGain;
		if (gain === null) return null;
		return gain - this.props.feesTotal;
	}

	updatePrice(price: number): void {
		this.props.currentPrice = price;
		this.props.updatedAt = new Date();
	}

	addQuantity(quantity: number, price: number, fees: number = 0): void {
		const totalCost = this.props.quantity * this.props.pru + quantity * price;
		const newQuantity = this.props.quantity + quantity;
		this.props.pru = totalCost / newQuantity;
		this.props.quantity = newQuantity;
		this.props.feesTotal += fees;
		this.props.updatedAt = new Date();
	}

	static create(
		props: {
			accountId: UniqueId;
			name: string;
			isin?: string | null;
			ticker?: string | null;
			assetType: AssetType;
			quantity: number;
			pru: number;
			currentPrice?: number | null;
			feesTotal?: number;
		},
		id?: UniqueId,
	): Result<Position> {
		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('Position name is required');
		}
		if (props.quantity < 0) {
			return Result.fail('Quantity cannot be negative');
		}
		if (props.pru < 0) {
			return Result.fail('PRU cannot be negative');
		}

		const now = new Date();
		return Result.ok(
			new Position(
				{
					accountId: props.accountId,
					name: props.name.trim(),
					isin: props.isin ?? null,
					ticker: props.ticker ?? null,
					assetType: props.assetType,
					quantity: props.quantity,
					pru: props.pru,
					currentPrice: props.currentPrice ?? null,
					feesTotal: props.feesTotal ?? 0,
					createdAt: now,
					updatedAt: now,
				},
				id,
			),
		);
	}

	static reconstitute(
		props: {
			accountId: UniqueId;
			name: string;
			isin: string | null;
			ticker: string | null;
			assetType: AssetType;
			quantity: number;
			pru: number;
			currentPrice: number | null;
			feesTotal: number;
			createdAt: Date;
			updatedAt: Date;
		},
		id: UniqueId,
	): Result<Position> {
		return Result.ok(new Position(props, id));
	}
}
