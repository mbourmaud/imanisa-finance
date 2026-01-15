import { Entity } from '@domain/shared/Entity';
import { UniqueId } from '@domain/shared/UniqueId';
import { Result } from '@domain/shared/Result';
import { DataSourceType } from './DataSourceType';
import { ParserKey } from './CSVParser';

interface DataSourceProps {
	/** Human-readable name (e.g., "Compte courant CM Challans") */
	name: string;
	/** Type of account */
	type: DataSourceType;
	/** Owner entity ID (references entities table - person, SCI, joint) */
	ownerEntityId: UniqueId;
	/** URL to access the bank's export page */
	url: string;
	/** CSV format identifier */
	format: string;
	/** Parser key to use for this source */
	parserKey: ParserKey;
	/** Last successful sync date */
	lastSyncAt: Date | null;
	/** Creation date */
	createdAt: Date;
}

export class DataSource extends Entity<DataSourceProps> {
	private constructor(props: DataSourceProps, id?: UniqueId) {
		super(props, id);
	}

	get name(): string {
		return this.props.name;
	}

	get type(): DataSourceType {
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

	get parserKey(): ParserKey {
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
			type: DataSourceType;
			ownerEntityId: UniqueId;
			url: string;
			format: string;
			parserKey: ParserKey;
		},
		id?: UniqueId
	): Result<DataSource> {
		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('DataSource name is required');
		}

		if (!Object.values(DataSourceType).includes(props.type)) {
			return Result.fail('Invalid data source type');
		}

		if (!Object.values(ParserKey).includes(props.parserKey)) {
			return Result.fail('Invalid parser key');
		}

		if (!props.url || props.url.trim().length === 0) {
			return Result.fail('DataSource URL is required');
		}

		return Result.ok(
			new DataSource(
				{
					name: props.name.trim(),
					type: props.type,
					ownerEntityId: props.ownerEntityId,
					url: props.url.trim(),
					format: props.format,
					parserKey: props.parserKey,
					lastSyncAt: null,
					createdAt: new Date()
				},
				id
			)
		);
	}

	static reconstitute(
		props: {
			name: string;
			type: DataSourceType;
			ownerEntityId: UniqueId;
			url: string;
			format: string;
			parserKey: ParserKey;
			lastSyncAt: Date | null;
			createdAt: Date;
		},
		id: UniqueId
	): Result<DataSource> {
		return Result.ok(
			new DataSource(
				{
					name: props.name,
					type: props.type,
					ownerEntityId: props.ownerEntityId,
					url: props.url,
					format: props.format,
					parserKey: props.parserKey,
					lastSyncAt: props.lastSyncAt,
					createdAt: props.createdAt
				},
				id
			)
		);
	}
}
