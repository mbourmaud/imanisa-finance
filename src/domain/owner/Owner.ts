import { Entity } from '@domain/shared/Entity';
import { UniqueId } from '@domain/shared/UniqueId';
import { Result } from '@domain/shared/Result';
import { OwnerType } from './OwnerType';

interface OwnerProps {
	name: string;
	type: OwnerType;
	createdAt: Date;
}

export class Owner extends Entity<OwnerProps> {
	private constructor(props: OwnerProps, id?: UniqueId) {
		super(props, id);
	}

	get name(): string {
		return this.props.name;
	}

	get type(): OwnerType {
		return this.props.type;
	}

	get isPerson(): boolean {
		return this.props.type === OwnerType.PERSON;
	}

	get isJoint(): boolean {
		return this.props.type === OwnerType.JOINT;
	}

	get isSci(): boolean {
		return this.props.type === OwnerType.SCI;
	}

	static create(
		props: { name: string; type: OwnerType },
		id?: UniqueId
	): Result<Owner> {
		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('Owner name is required');
		}

		return Result.ok(
			new Owner(
				{
					name: props.name.trim(),
					type: props.type,
					createdAt: new Date()
				},
				id
			)
		);
	}

	static reconstitute(
		props: { name: string; type: OwnerType; createdAt: Date },
		id: UniqueId
	): Result<Owner> {
		return Result.ok(new Owner(props, id));
	}
}
