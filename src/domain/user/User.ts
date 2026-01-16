import { Entity } from '@domain/shared/Entity';
import { Result } from '@domain/shared/Result';
import type { UniqueId } from '@domain/shared/UniqueId';
import { Email } from './Email';

interface UserProps {
	email: Email;
	name: string;
	avatarUrl: string | null;
	createdAt: Date;
}

export class User extends Entity<UserProps> {
	private constructor(props: UserProps, id?: UniqueId) {
		super(props, id);
	}

	get email(): Email {
		return this.props.email;
	}

	get name(): string {
		return this.props.name;
	}

	get avatarUrl(): string | null {
		return this.props.avatarUrl;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	static create(
		props: { email: string; name: string; avatarUrl?: string | null },
		id?: UniqueId,
	): Result<User> {
		const emailResult = Email.create(props.email);
		if (emailResult.isFailure) {
			return Result.fail(emailResult.error);
		}

		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('Name is required');
		}

		return Result.ok(
			new User(
				{
					email: emailResult.value,
					name: props.name.trim(),
					avatarUrl: props.avatarUrl ?? null,
					createdAt: new Date(),
				},
				id,
			),
		);
	}

	static reconstitute(
		props: { email: string; name: string; avatarUrl: string | null; createdAt: Date },
		id: UniqueId,
	): Result<User> {
		const emailResult = Email.create(props.email);
		if (emailResult.isFailure) {
			return Result.fail(emailResult.error);
		}

		return Result.ok(
			new User(
				{
					email: emailResult.value,
					name: props.name,
					avatarUrl: props.avatarUrl,
					createdAt: props.createdAt,
				},
				id,
			),
		);
	}
}
