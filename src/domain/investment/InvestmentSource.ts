import { Entity } from '@domain/shared/Entity';
import { Result } from '@domain/shared/Result';
import type { UniqueId } from '@domain/shared/UniqueId';
import { InvestmentSourceType } from './InvestmentSourceType';

interface InvestmentSourceProps {
	/** Human-readable name (e.g., "PEA Bourse Direct") */
	name: string;
	/** Type of investment source */
	type: InvestmentSourceType;
	/** Owner ID */
	ownerId: UniqueId;
	/** Bank/Broker name */
	bank: string | null;
	/** Additional notes */
	notes: string | null;
	/** Creation date */
	createdAt: Date;
	/** Last update date */
	updatedAt: Date;
}

export class InvestmentSource extends Entity<InvestmentSourceProps> {
	private constructor(props: InvestmentSourceProps, id?: UniqueId) {
		super(props, id);
	}

	get name(): string {
		return this.props.name;
	}

	get type(): InvestmentSourceType {
		return this.props.type;
	}

	get ownerId(): UniqueId {
		return this.props.ownerId;
	}

	get bank(): string | null {
		return this.props.bank;
	}

	get notes(): string | null {
		return this.props.notes;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	static create(
		props: {
			name: string;
			type: InvestmentSourceType;
			ownerId: UniqueId;
			bank?: string | null;
			notes?: string | null;
		},
		id?: UniqueId,
	): Result<InvestmentSource> {
		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('InvestmentSource name is required');
		}

		if (!Object.values(InvestmentSourceType).includes(props.type)) {
			return Result.fail('Invalid investment source type');
		}

		const now = new Date();
		return Result.ok(
			new InvestmentSource(
				{
					name: props.name.trim(),
					type: props.type,
					ownerId: props.ownerId,
					bank: props.bank ?? null,
					notes: props.notes ?? null,
					createdAt: now,
					updatedAt: now,
				},
				id,
			),
		);
	}

	static reconstitute(
		props: {
			name: string;
			type: InvestmentSourceType;
			ownerId: UniqueId;
			bank: string | null;
			notes: string | null;
			createdAt: Date;
			updatedAt: Date;
		},
		id: UniqueId,
	): Result<InvestmentSource> {
		return Result.ok(
			new InvestmentSource(
				{
					name: props.name,
					type: props.type,
					ownerId: props.ownerId,
					bank: props.bank,
					notes: props.notes,
					createdAt: props.createdAt,
					updatedAt: props.updatedAt,
				},
				id,
			),
		);
	}
}
