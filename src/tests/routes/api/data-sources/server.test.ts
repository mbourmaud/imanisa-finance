import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSource } from '@domain/import/DataSource';
import { DataSourceType } from '@domain/import/DataSourceType';
import { ParserKey } from '@domain/import/CSVParser';
import { UniqueId } from '@domain/shared/UniqueId';

// Create mock inside the factory using vi.hoisted for proper hoisting
const { mockFindAll } = vi.hoisted(() => {
	return { mockFindAll: vi.fn() };
});

// Mock the repository with a class
vi.mock('@infrastructure/repositories/DataSourceRepository', () => {
	return {
		DataSourceRepositoryImpl: class {
			findAll = mockFindAll;
		}
	};
});

// Import after mock is defined
import { GET } from '@routes/api/data-sources/+server';

describe('GET /api/data-sources', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return empty array when no data sources exist', async () => {
		mockFindAll.mockResolvedValue([]);

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data).toMatchInlineSnapshot(`[]`);
	});

	it('should return data sources with correct structure', async () => {
		const ownerId = UniqueId.create();
		const accountId = UniqueId.create();
		const dataSource = DataSource.reconstitute(
			{
				name: 'Compte Courant CM',
				type: DataSourceType.CHECKING,
				ownerEntityId: ownerId,
				linkedAccountId: accountId,
				url: 'https://www.creditmutuel.fr',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL,
				lastSyncAt: new Date('2024-01-15T10:00:00Z'),
				createdAt: new Date('2024-01-01T00:00:00Z')
			},
			UniqueId.create()
		).value;

		mockFindAll.mockResolvedValue([dataSource]);

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data).toHaveLength(1);
		expect(data[0]).toMatchObject({
			name: 'Compte Courant CM',
			type: 'CHECKING',
			url: 'https://www.creditmutuel.fr',
			format: 'csv',
			parser_key: 'credit_mutuel'
		});
		expect(data[0].id).toBeDefined();
		expect(data[0].owner_entity_id).toBeDefined();
		expect(data[0].linked_account_id).toBeDefined();
	});

	it('should handle null linked_account_id', async () => {
		const dataSource = DataSource.reconstitute(
			{
				name: 'Unlinked Source',
				type: DataSourceType.SAVINGS,
				ownerEntityId: UniqueId.create(),
				linkedAccountId: null,
				url: 'https://example.com',
				format: 'csv',
				parserKey: ParserKey.BOURSORAMA,
				lastSyncAt: null,
				createdAt: new Date('2024-01-01T00:00:00Z')
			},
			UniqueId.create()
		).value;

		mockFindAll.mockResolvedValue([dataSource]);

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data[0].linked_account_id).toBeNull();
		expect(data[0].last_sync_at).toBeNull();
	});

	it('should return multiple data sources', async () => {
		const dataSources = [
			DataSource.reconstitute(
				{
					name: 'Source 1',
					type: DataSourceType.CHECKING,
					ownerEntityId: UniqueId.create(),
					linkedAccountId: null,
					url: 'https://example1.com',
					format: 'csv',
					parserKey: ParserKey.CREDIT_MUTUEL,
					lastSyncAt: null,
					createdAt: new Date()
				},
				UniqueId.create()
			).value,
			DataSource.reconstitute(
				{
					name: 'Source 2',
					type: DataSourceType.SAVINGS,
					ownerEntityId: UniqueId.create(),
					linkedAccountId: null,
					url: 'https://example2.com',
					format: 'csv',
					parserKey: ParserKey.CAISSE_EPARGNE,
					lastSyncAt: null,
					createdAt: new Date()
				},
				UniqueId.create()
			).value
		];

		mockFindAll.mockResolvedValue(dataSources);

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data).toHaveLength(2);
		expect(data[0].name).toBe('Source 1');
		expect(data[1].name).toBe('Source 2');
	});
});
