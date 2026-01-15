import { Entity } from '@domain/shared/Entity';
import { UniqueId } from '@domain/shared/UniqueId';
import { Result } from '@domain/shared/Result';

export type InvestmentTransactionType = 'buy' | 'sell';

interface InvestmentTransactionProps {
	/** Reference to the investment source this transaction belongs to */
	sourceId: UniqueId;
	/** Transaction date */
	date: Date;
	/** Asset symbol/ticker (e.g., "BTC", "ETH") */
	symbol: string;
	/** Transaction type: buy or sell */
	type: InvestmentTransactionType;
	/** Number of units traded */
	quantity: number;
	/** Price per unit at transaction time */
	pricePerUnit: number;
	/** Total transaction amount (quantity * pricePerUnit) */
	totalAmount: number;
	/** Transaction fees */
	fee: number;
	/** Creation date in the system */
	createdAt: Date;
}

export class InvestmentTransaction extends Entity<InvestmentTransactionProps> {
	private constructor(props: InvestmentTransactionProps, id?: UniqueId) {
		super(props, id);
	}

	get sourceId(): UniqueId {
		return this.props.sourceId;
	}

	get date(): Date {
		return this.props.date;
	}

	get symbol(): string {
		return this.props.symbol;
	}

	get type(): InvestmentTransactionType {
		return this.props.type;
	}

	get quantity(): number {
		return this.props.quantity;
	}

	get pricePerUnit(): number {
		return this.props.pricePerUnit;
	}

	get totalAmount(): number {
		return this.props.totalAmount;
	}

	get fee(): number {
		return this.props.fee;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	/** Net amount including fees (totalAmount + fee for buys, totalAmount - fee for sells) */
	get netAmount(): number {
		return this.props.type === 'buy'
			? this.props.totalAmount + this.props.fee
			: this.props.totalAmount - this.props.fee;
	}

	static create(
		props: {
			sourceId: UniqueId;
			date: Date;
			symbol: string;
			type: InvestmentTransactionType;
			quantity: number;
			pricePerUnit: number;
			totalAmount: number;
			fee: number;
		},
		id?: UniqueId
	): Result<InvestmentTransaction> {
		if (!props.symbol || props.symbol.trim().length === 0) {
			return Result.fail('Transaction symbol is required');
		}
		if (props.quantity <= 0) {
			return Result.fail('Quantity must be positive');
		}
		if (props.pricePerUnit < 0) {
			return Result.fail('Price per unit cannot be negative');
		}
		if (props.totalAmount < 0) {
			return Result.fail('Total amount cannot be negative');
		}
		if (props.fee < 0) {
			return Result.fail('Fee cannot be negative');
		}
		if (!['buy', 'sell'].includes(props.type)) {
			return Result.fail('Transaction type must be buy or sell');
		}

		return Result.ok(
			new InvestmentTransaction(
				{
					sourceId: props.sourceId,
					date: props.date,
					symbol: props.symbol.trim().toUpperCase(),
					type: props.type,
					quantity: props.quantity,
					pricePerUnit: props.pricePerUnit,
					totalAmount: props.totalAmount,
					fee: props.fee,
					createdAt: new Date()
				},
				id
			)
		);
	}

	static reconstitute(
		props: {
			sourceId: UniqueId;
			date: Date;
			symbol: string;
			type: InvestmentTransactionType;
			quantity: number;
			pricePerUnit: number;
			totalAmount: number;
			fee: number;
			createdAt: Date;
		},
		id: UniqueId
	): Result<InvestmentTransaction> {
		return Result.ok(new InvestmentTransaction(props, id));
	}
}
