import { ValueObject } from '@domain/shared/ValueObject';
import { Result } from '@domain/shared/Result';

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
		
		if (!this.EMAIL_REGEX.test(trimmed)) {
			return Result.fail('Invalid email format');
		}

		return Result.ok(new Email({ value: trimmed }));
	}
}
