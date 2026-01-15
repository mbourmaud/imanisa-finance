import { eq } from 'drizzle-orm';
import { getDb, schema } from '@infrastructure/database/drizzle';
import { DataSource, DataSourceType, ParserKey } from '@domain/import';
import type { DataSourceRepository } from '@domain/import';
import { UniqueId } from '@domain/shared/UniqueId';

type DataSourceRow = typeof schema.dataSources.$inferSelect;

/**
 * Map database row to domain entity
 */
function toDomain(row: DataSourceRow): DataSource {
	const result = DataSource.reconstitute(
		{
			name: row.name,
			type: row.type as DataSourceType,
			ownerEntityId: UniqueId.fromString(row.ownerEntityId),
			linkedAccountId: row.linkedAccountId ? UniqueId.fromString(row.linkedAccountId) : null,
			url: row.url,
			format: row.format,
			parserKey: row.parserKey as ParserKey,
			lastSyncAt: row.lastSyncAt ? new Date(row.lastSyncAt) : null,
			createdAt: row.createdAt ? new Date(row.createdAt) : new Date()
		},
		UniqueId.fromString(row.id)
	);

	if (result.isFailure) {
		throw new Error(`Failed to reconstitute DataSource: ${result.error}`);
	}

	return result.value;
}

/**
 * Map domain entity to database row for persistence
 */
function toPersistence(dataSource: DataSource): typeof schema.dataSources.$inferInsert {
	return {
		id: dataSource.id.toString(),
		name: dataSource.name,
		type: dataSource.type,
		ownerEntityId: dataSource.ownerEntityId.toString(),
		linkedAccountId: dataSource.linkedAccountId?.toString() ?? null,
		url: dataSource.url,
		format: dataSource.format,
		parserKey: dataSource.parserKey,
		lastSyncAt: dataSource.lastSyncAt?.toISOString() ?? null,
		createdAt: dataSource.createdAt.toISOString()
	};
}

/**
 * Drizzle ORM implementation of DataSourceRepository
 */
export class DataSourceRepositoryImpl implements DataSourceRepository {
	async findAll(): Promise<DataSource[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.dataSources)
			.orderBy(schema.dataSources.name);
		return rows.map(toDomain);
	}

	async findById(id: UniqueId): Promise<DataSource | null> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.dataSources)
			.where(eq(schema.dataSources.id, id.toString()))
			.limit(1);
		const row = rows[0];
		return row ? toDomain(row) : null;
	}

	async findByOwnerEntityId(ownerEntityId: UniqueId): Promise<DataSource[]> {
		const db = getDb();
		const rows = await db
			.select()
			.from(schema.dataSources)
			.where(eq(schema.dataSources.ownerEntityId, ownerEntityId.toString()))
			.orderBy(schema.dataSources.name);
		return rows.map(toDomain);
	}

	async save(dataSource: DataSource): Promise<void> {
		const db = getDb();
		const data = toPersistence(dataSource);

		// Check if exists
		const existing = await this.findById(dataSource.id);

		if (existing) {
			// Update
			await db
				.update(schema.dataSources)
				.set({
					name: data.name,
					type: data.type,
					ownerEntityId: data.ownerEntityId,
					linkedAccountId: data.linkedAccountId,
					url: data.url,
					format: data.format,
					parserKey: data.parserKey,
					lastSyncAt: data.lastSyncAt
				})
				.where(eq(schema.dataSources.id, data.id));
		} else {
			// Insert
			await db.insert(schema.dataSources).values(data);
		}
	}

	async delete(id: UniqueId): Promise<void> {
		const db = getDb();
		await db
			.delete(schema.dataSources)
			.where(eq(schema.dataSources.id, id.toString()));
	}
}
