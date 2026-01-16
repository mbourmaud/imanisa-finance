import { Entity } from '@domain/shared/Entity';
import { Result } from '@domain/shared/Result';
import type { UniqueId } from '@domain/shared/UniqueId';
import { BankTemplate } from './BankTemplate';

interface BankProps {
	userId: UniqueId;
	name: string;
	template: BankTemplate;
	createdAt: Date;
}

export class Bank extends Entity<BankProps> {
	private constructor(props: BankProps, id?: UniqueId) {
		super(props, id);
	}

	get userId(): UniqueId {
		return this.props.userId;
	}

	get name(): string {
		return this.props.name;
	}

	get template(): BankTemplate {
		return this.props.template;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	static create(
		props: { userId: UniqueId; name: string; template: BankTemplate },
		id?: UniqueId,
	): Result<Bank> {
		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('Bank name is required');
		}

		if (!Object.values(BankTemplate).includes(props.template)) {
			return Result.fail('Invalid bank template');
		}

		return Result.ok(
			new Bank(
				{
					userId: props.userId,
					name: props.name.trim(),
					template: props.template,
					createdAt: new Date(),
				},
				id,
			),
		);
	}

	static reconstitute(
		props: { userId: UniqueId; name: string; template: BankTemplate; createdAt: Date },
		id: UniqueId,
	): Result<Bank> {
		return Result.ok(
			new Bank(
				{
					userId: props.userId,
					name: props.name,
					template: props.template,
					createdAt: props.createdAt,
				},
				id,
			),
		);
	}
}
