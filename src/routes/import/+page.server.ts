import type { PageServerLoad } from './$types';
import { DataSourceRepositoryImpl } from '@infrastructure/repositories/DataSourceRepository';
import { getAllEntities } from '@infrastructure/repositories/RealEstateRepository';

const dataSourceRepository = new DataSourceRepositoryImpl();

export interface DataSourceWithOwner {
	id: string;
	name: string;
	type: string;
	ownerEntityId: string;
	ownerName: string;
	ownerColor: string | null;
	url: string;
	format: string;
	parserKey: string;
	lastSyncAt: string | null;
}

export interface GroupedDataSources {
	ownerId: string;
	ownerName: string;
	ownerColor: string | null;
	sources: DataSourceWithOwner[];
}

export const load: PageServerLoad = async () => {
	const [dataSources, entities] = await Promise.all([
		dataSourceRepository.findAll(),
		getAllEntities()
	]);

	// Create entity lookup map
	const entityMap = new Map(entities.map((e) => [e.id, e]));

	// Map data sources with owner info
	const sourcesWithOwner: DataSourceWithOwner[] = dataSources.map((ds) => {
		const owner = entityMap.get(ds.ownerEntityId.toString());
		return {
			id: ds.id.toString(),
			name: ds.name,
			type: ds.type,
			ownerEntityId: ds.ownerEntityId.toString(),
			ownerName: owner?.name ?? 'Inconnu',
			ownerColor: owner?.color ?? null,
			url: ds.url,
			format: ds.format,
			parserKey: ds.parserKey,
			lastSyncAt: ds.lastSyncAt?.toISOString() ?? null
		};
	});

	// Group by owner
	const groupedMap = new Map<string, GroupedDataSources>();
	for (const source of sourcesWithOwner) {
		if (!groupedMap.has(source.ownerEntityId)) {
			groupedMap.set(source.ownerEntityId, {
				ownerId: source.ownerEntityId,
				ownerName: source.ownerName,
				ownerColor: source.ownerColor,
				sources: []
			});
		}
		groupedMap.get(source.ownerEntityId)!.sources.push(source);
	}

	const groupedSources = Array.from(groupedMap.values());

	return {
		groupedSources,
		totalSources: dataSources.length
	};
};
