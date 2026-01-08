import { ValueObject } from '@domain/shared/ValueObject';
import { Result } from '@domain/shared/Result';

interface MoneyProps {
	amount: number;
	currency: string;
}

export class Money extends ValueObject<MoneyProps> {
	private constructor(props: MoneyProps) {
		super(props);
	}

	get amount(): number {
		return this.props.amount;
	}

	get currency(): string {
		return this.props.currency;
	}

	static create(amount: number, currency: string = 'EUR'): Result<Money> {
		if (typeof amount !== 'number' || isNaN(amount)) {
			return Result.fail('Amount must be a valid number');
		}

		const normalizedCurrency = currency.toUpperCase().trim();
		if (normalizedCurrency.length !== 3) {
			return Result.fail('Currency must be a 3-letter code');
		}

		return Result.ok(new Money({ amount, currency: normalizedCurrency }));
	}

	add(other: Money): Result<Money> {
		if (this.currency !== other.currency) {
			return Result.fail('Cannot add money with different currencies');
		}
		return Money.create(this.amount + other.amount, this.currency);
	}

	subtract(other: Money): Result<Money> {
		if (this.currency !== other.currency) {
			return Result.fail('Cannot subtract money with different currencies');
		}
		return Money.create(this.amount - other.amount, this.currency);
	}

	multiply(factor: number): Result<Money> {
		return Money.create(this.amount * factor, this.currency);
	}

	format(): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: this.currency
		}).format(this.amount);
	}
}
