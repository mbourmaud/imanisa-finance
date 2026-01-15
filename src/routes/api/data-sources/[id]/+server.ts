import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DataSourceRepositoryImpl } from '@infrastructure/repositories/DataSourceRepository';
import { UniqueId } from '@domain/shared/UniqueId';

const dataSourceRepository = new DataSourceRepositoryImpl();

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	const dataSource = await dataSourceRepository.findById(UniqueId.fromString(id));

	if (!dataSource) {
		throw error(404, 'Data source not found');
	}

	return json({
		id: dataSource.id.toString(),
		name: dataSource.name,
		type: dataSource.type,
		owner_entity_id: dataSource.ownerEntityId.toString(),
		linked_account_id: dataSource.linkedAccountId?.toString() ?? null,
		url: dataSource.url,
		format: dataSource.format,
		parser_key: dataSource.parserKey,
		last_sync_at: dataSource.lastSyncAt?.toISOString() ?? null,
		created_at: dataSource.createdAt.toISOString()
	});
};
