import { Entity } from '@domain/shared/Entity';
import { UniqueId } from '@domain/shared/UniqueId';
import { Result } from '@domain/shared/Result';

interface PropertyProps {
	ownerId: UniqueId;
	name: string;
	address: string | null;
	city: string | null;
	postalCode: string | null;
	surfaceM2: number | null;
	purchasePrice: number | null;
	purchaseDate: Date | null;
	notaryFees: number | null;
	currentValue: number | null;
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export class Property extends Entity<PropertyProps> {
	private constructor(props: PropertyProps, id?: UniqueId) {
		super(props, id);
	}

	get ownerId(): UniqueId {
		return this.props.ownerId;
	}

	get name(): string {
		return this.props.name;
	}

	get address(): string | null {
		return this.props.address;
	}

	get city(): string | null {
		return this.props.city;
	}

	get postalCode(): string | null {
		return this.props.postalCode;
	}

	get fullAddress(): string {
		const parts = [this.props.address, this.props.postalCode, this.props.city].filter(Boolean);
		return parts.join(', ');
	}

	get surfaceM2(): number | null {
		return this.props.surfaceM2;
	}

	get purchasePrice(): number | null {
		return this.props.purchasePrice;
	}

	get purchaseDate(): Date | null {
		return this.props.purchaseDate;
	}

	get notaryFees(): number | null {
		return this.props.notaryFees;
	}

	get totalCost(): number | null {
		if (this.props.purchasePrice === null) return null;
		return this.props.purchasePrice + (this.props.notaryFees ?? 0);
	}

	get currentValue(): number | null {
		return this.props.currentValue;
	}

	get notes(): string | null {
		return this.props.notes;
	}

	updateValue(newValue: number): void {
		this.props.currentValue = newValue;
		this.props.updatedAt = new Date();
	}

	static create(
		props: {
			ownerId: UniqueId;
			name: string;
			address?: string | null;
			city?: string | null;
			postalCode?: string | null;
			surfaceM2?: number | null;
			purchasePrice?: number | null;
			purchaseDate?: Date | null;
			notaryFees?: number | null;
			currentValue?: number | null;
			notes?: string | null;
		},
		id?: UniqueId
	): Result<Property> {
		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('Property name is required');
		}

		const now = new Date();
		return Result.ok(
			new Property(
				{
					ownerId: props.ownerId,
					name: props.name.trim(),
					address: props.address ?? null,
					city: props.city ?? null,
					postalCode: props.postalCode ?? null,
					surfaceM2: props.surfaceM2 ?? null,
					purchasePrice: props.purchasePrice ?? null,
					purchaseDate: props.purchaseDate ?? null,
					notaryFees: props.notaryFees ?? null,
					currentValue: props.currentValue ?? props.purchasePrice ?? null,
					notes: props.notes ?? null,
					createdAt: now,
					updatedAt: now
				},
				id
			)
		);
	}

	static reconstitute(
		props: {
			ownerId: UniqueId;
			name: string;
			address: string | null;
			city: string | null;
			postalCode: string | null;
			surfaceM2: number | null;
			purchasePrice: number | null;
			purchaseDate: Date | null;
			notaryFees: number | null;
			currentValue: number | null;
			notes: string | null;
			createdAt: Date;
			updatedAt: Date;
		},
		id: UniqueId
	): Result<Property> {
		return Result.ok(new Property(props, id));
	}
}
