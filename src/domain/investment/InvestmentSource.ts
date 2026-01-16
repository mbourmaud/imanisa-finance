import { Entity } from '@domain/shared/Entity';
import { Result } from '@domain/shared/Result';
import type { UniqueId } from '@domain/shared/UniqueId';
import { InvestmentParserKey } from './InvestmentParser';
import { InvestmentSourceType } from './InvestmentSourceType';

interface InvestmentSourceProps {
	/** Human-readable name (e.g., "PEA Bourse Direct") */
	name: string;
	/** Type of investment source */
	type: InvestmentSourceType;
	/** Owner entity ID (references entities table - person, SCI, joint) */
	ownerEntityId: UniqueId;
	/** URL to access the broker's export page */
	url: string;
	/** File format (xlsx, csv, etc.) */
	format: string;
	/** Parser key to use for this source */
	parserKey: InvestmentParserKey;
	/** Last successful sync date */
	lastSyncAt: Date | null;
	/** Creation date */
	createdAt: Date;
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

	get ownerEntityId(): UniqueId {
		return this.props.ownerEntityId;
	}

	get url(): string {
		return this.props.url;
	}

	get format(): string {
		return this.props.format;
	}

	get parserKey(): InvestmentParserKey {
		return this.props.parserKey;
	}

	get lastSyncAt(): Date | null {
		return this.props.lastSyncAt;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	/**
	 * Update the last sync timestamp
	 */
	markSynced(): void {
		this.props.lastSyncAt = new Date();
	}

	static create(
		props: {
			name: string;
			type: InvestmentSourceType;
			ownerEntityId: UniqueId;
			url: string;
			format: string;
			parserKey: InvestmentParserKey;
		},
		id?: UniqueId,
	): Result<InvestmentSource> {
		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('InvestmentSource name is required');
		}

		if (!Object.values(InvestmentSourceType).includes(props.type)) {
			return Result.fail('Invalid investment source type');
		}

		if (!Object.values(InvestmentParserKey).includes(props.parserKey)) {
			return Result.fail('Invalid parser key');
		}

		if (!props.url || props.url.trim().length === 0) {
			return Result.fail('InvestmentSource URL is required');
		}

		return Result.ok(
			new InvestmentSource(
				{
					name: props.name.trim(),
					type: props.type,
					ownerEntityId: props.ownerEntityId,
					url: props.url.trim(),
					format: props.format,
					parserKey: props.parserKey,
					lastSyncAt: null,
					createdAt: new Date(),
				},
				id,
			),
		);
	}

	static reconstitute(
		props: {
			name: string;
			type: InvestmentSourceType;
			ownerEntityId: UniqueId;
			url: string;
			format: string;
			parserKey: InvestmentParserKey;
			lastSyncAt: Date | null;
			createdAt: Date;
		},
		id: UniqueId,
	): Result<InvestmentSource> {
		return Result.ok(
			new InvestmentSource(
				{
					name: props.name,
					type: props.type,
					ownerEntityId: props.ownerEntityId,
					url: props.url,
					format: props.format,
					parserKey: props.parserKey,
					lastSyncAt: props.lastSyncAt,
					createdAt: props.createdAt,
				},
				id,
			),
		);
	}
}
