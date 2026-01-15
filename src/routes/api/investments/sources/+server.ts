import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InvestmentRepositoryImpl } from '@infrastructure/repositories/InvestmentRepository';

const investmentRepository = new InvestmentRepositoryImpl();

export const GET: RequestHandler = async () => {
	const sources = await investmentRepository.findAllSources();

	return json(
		sources.map((source) => ({
			id: source.id.toString(),
			name: source.name,
			type: source.type,
			owner_entity_id: source.ownerEntityId.toString(),
			url: source.url,
			format: source.format,
			parser_key: source.parserKey,
			last_sync_at: source.lastSyncAt?.toISOString() ?? null,
			created_at: source.createdAt.toISOString()
		}))
	);
};
