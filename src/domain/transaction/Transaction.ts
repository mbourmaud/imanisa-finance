import { Entity } from '@domain/shared/Entity';
import { UniqueId } from '@domain/shared/UniqueId';
import { Result } from '@domain/shared/Result';
import { TransactionType } from './TransactionType';
import { TransactionCategory } from './TransactionCategory';
import { Money } from '@domain/account/Money';

interface TransactionProps {
	accountId: UniqueId;
	type: TransactionType;
	amount: Money;
	description: string;
	date: Date;
	category: TransactionCategory | null;
	importedAt: Date;
}

export class Transaction extends Entity<TransactionProps> {
	private constructor(props: TransactionProps, id?: UniqueId) {
		super(props, id);
	}

	get accountId(): UniqueId {
		return this.props.accountId;
	}

	get type(): TransactionType {
		return this.props.type;
	}

	get amount(): Money {
		return this.props.amount;
	}

	get description(): string {
		return this.props.description;
	}

	get date(): Date {
		return this.props.date;
	}

	get category(): TransactionCategory | null {
		return this.props.category;
	}

	get importedAt(): Date {
		return this.props.importedAt;
	}

	static create(
		props: {
			accountId: UniqueId;
			type: TransactionType;
			amount: number;
			description: string;
			date: Date;
			category?: TransactionCategory | null;
		},
		id?: UniqueId
	): Result<Transaction> {
		if (!props.description || props.description.trim().length === 0) {
			return Result.fail('Transaction description is required');
		}

		if (!Object.values(TransactionType).includes(props.type)) {
			return Result.fail('Invalid transaction type');
		}

		const amountResult = Money.create(Math.abs(props.amount));
		if (amountResult.isFailure) {
			return Result.fail(amountResult.error);
		}

		return Result.ok(
			new Transaction(
				{
					accountId: props.accountId,
					type: props.type,
					amount: amountResult.value,
					description: props.description.trim(),
					date: props.date,
					category: props.category ?? null,
					importedAt: new Date()
				},
				id
			)
		);
	}

	static reconstitute(
		props: {
			accountId: UniqueId;
			type: TransactionType;
			amount: number;
			currency: string;
			description: string;
			date: Date;
			category: TransactionCategory | null;
			importedAt: Date;
		},
		id: UniqueId
	): Result<Transaction> {
		const amountResult = Money.create(props.amount, props.currency);
		if (amountResult.isFailure) {
			return Result.fail(amountResult.error);
		}

		return Result.ok(
			new Transaction(
				{
					accountId: props.accountId,
					type: props.type,
					amount: amountResult.value,
					description: props.description,
					date: props.date,
					category: props.category,
					importedAt: props.importedAt
				},
				id
			)
		);
	}
}
