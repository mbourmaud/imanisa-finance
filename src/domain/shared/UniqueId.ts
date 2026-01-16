export class UniqueId {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create(): UniqueId {
		return new UniqueId(crypto.randomUUID());
	}

	static fromString(value: string): UniqueId {
		return new UniqueId(value);
	}

	toString(): string {
		return this.value;
	}

	equals(other: UniqueId): boolean {
		return this.value === other.value;
	}
}
