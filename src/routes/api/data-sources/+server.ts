import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DataSourceRepositoryImpl } from '@infrastructure/repositories/DataSourceRepository';

const dataSourceRepository = new DataSourceRepositoryImpl();

export const GET: RequestHandler = async () => {
	const dataSources = await dataSourceRepository.findAll();

	return json(
		dataSources.map((ds) => ({
			id: ds.id.toString(),
			name: ds.name,
			type: ds.type,
			owner_entity_id: ds.ownerEntityId.toString(),
			linked_account_id: ds.linkedAccountId?.toString() ?? null,
			url: ds.url,
			format: ds.format,
			parser_key: ds.parserKey,
			last_sync_at: ds.lastSyncAt?.toISOString() ?? null,
			created_at: ds.createdAt.toISOString()
		}))
	);
};
