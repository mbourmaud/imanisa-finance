import { Result } from '@domain/shared/Result';
import { ValueObject } from '@domain/shared/ValueObject';

interface EmailProps {
	value: string;
}

export class Email extends ValueObject<EmailProps> {
	private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	private constructor(props: EmailProps) {
		super(props);
	}

	get value(): string {
		return this.props.value;
	}

	static create(email: string): Result<Email> {
		const trimmed = email.trim().toLowerCase();

		if (!Email.EMAIL_REGEX.test(trimmed)) {
			return Result.fail('Invalid email format');
		}

		return Result.ok(new Email({ value: trimmed }));
	}
}
