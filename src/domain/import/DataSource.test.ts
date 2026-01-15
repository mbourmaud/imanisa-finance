import { describe, it, expect, beforeEach } from 'vitest';
import { DataSource } from './DataSource';
import { DataSourceType } from './DataSourceType';
import { ParserKey } from './CSVParser';
import { UniqueId } from '@domain/shared/UniqueId';

describe('DataSource', () => {
	let ownerEntityId: UniqueId;

	beforeEach(() => {
		ownerEntityId = UniqueId.fromString('owner-123');
	});

	describe('create', () => {
		it('should create a valid data source', () => {
			const result = DataSource.create({
				name: 'Compte courant CM',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: 'https://bank.example.com/export',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.name).toBe('Compte courant CM');
			expect(result.value.type).toBe(DataSourceType.CHECKING);
			expect(result.value.parserKey).toBe(ParserKey.CREDIT_MUTUEL);
		});

		it('should create data source with linked account', () => {
			const linkedAccountId = UniqueId.fromString('account-456');
			const result = DataSource.create({
				name: 'CE Perso',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				linkedAccountId,
				url: 'https://ce.fr/export',
				format: 'csv',
				parserKey: ParserKey.CAISSE_EPARGNE
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.linkedAccountId?.toString()).toBe('account-456');
		});

		it('should create data source without linked account', () => {
			const result = DataSource.create({
				name: 'Source',
				type: DataSourceType.SAVINGS,
				ownerEntityId,
				url: 'https://bank.example.com',
				format: 'csv',
				parserKey: ParserKey.BOURSORAMA
			});

			expect(result.isSuccess).toBe(true);
			expect(result.value.linkedAccountId).toBeNull();
		});

		it('should trim name', () => {
			const result = DataSource.create({
				name: '  Trimmed Name  ',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: 'https://bank.example.com',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			});

			expect(result.value.name).toBe('Trimmed Name');
		});

		it('should trim URL', () => {
			const result = DataSource.create({
				name: 'Test',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: '  https://bank.example.com/export  ',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			});

			expect(result.value.url).toBe('https://bank.example.com/export');
		});

		it('should set lastSyncAt to null initially', () => {
			const result = DataSource.create({
				name: 'Test',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: 'https://bank.example.com',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			});

			expect(result.value.lastSyncAt).toBeNull();
		});

		it('should set createdAt date', () => {
			const result = DataSource.create({
				name: 'Test',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: 'https://bank.example.com',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			});

			expect(result.value.createdAt).toBeInstanceOf(Date);
		});

		it('should use provided id', () => {
			const customId = UniqueId.fromString('ds-custom');
			const result = DataSource.create(
				{
					name: 'Test',
					type: DataSourceType.CHECKING,
					ownerEntityId,
					url: 'https://bank.example.com',
					format: 'csv',
					parserKey: ParserKey.CREDIT_MUTUEL
				},
				customId
			);

			expect(result.value.id.toString()).toBe('ds-custom');
		});

		it('should fail with empty name', () => {
			const result = DataSource.create({
				name: '',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: 'https://bank.example.com',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('DataSource name is required');
		});

		it('should fail with whitespace-only name', () => {
			const result = DataSource.create({
				name: '   ',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: 'https://bank.example.com',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('DataSource name is required');
		});

		it('should fail with invalid data source type', () => {
			const result = DataSource.create({
				name: 'Test',
				type: 'INVALID' as DataSourceType,
				ownerEntityId,
				url: 'https://bank.example.com',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid data source type');
		});

		it('should fail with invalid parser key', () => {
			const result = DataSource.create({
				name: 'Test',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: 'https://bank.example.com',
				format: 'csv',
				parserKey: 'invalid_parser' as ParserKey
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('Invalid parser key');
		});

		it('should fail with empty URL', () => {
			const result = DataSource.create({
				name: 'Test',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: '',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('DataSource URL is required');
		});

		it('should fail with whitespace-only URL', () => {
			const result = DataSource.create({
				name: 'Test',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: '   ',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			});

			expect(result.isFailure).toBe(true);
			expect(result.error).toBe('DataSource URL is required');
		});
	});

	describe('markSynced', () => {
		it('should update lastSyncAt to current date', () => {
			const dataSource = DataSource.create({
				name: 'Test',
				type: DataSourceType.CHECKING,
				ownerEntityId,
				url: 'https://bank.example.com',
				format: 'csv',
				parserKey: ParserKey.CREDIT_MUTUEL
			}).value;

			expect(dataSource.lastSyncAt).toBeNull();

			dataSource.markSynced();

			expect(dataSource.lastSyncAt).toBeInstanceOf(Date);
		});
	});

	describe('reconstitute', () => {
		it('should reconstitute data source from persistence data', () => {
			const id = UniqueId.fromString('ds-456');
			const linkedAccountId = UniqueId.fromString('account-789');
			const lastSyncAt = new Date('2024-06-01');
			const createdAt = new Date('2024-01-01');

			const result = DataSource.reconstitute(
				{
					name: 'Restored Source',
					type: DataSourceType.LIVRET_A,
					ownerEntityId,
					linkedAccountId,
					url: 'https://restored.bank.com',
					format: 'csv',
					parserKey: ParserKey.CAISSE_EPARGNE,
					lastSyncAt,
					createdAt
				},
				id
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.id.toString()).toBe('ds-456');
			expect(result.value.name).toBe('Restored Source');
			expect(result.value.type).toBe(DataSourceType.LIVRET_A);
			expect(result.value.linkedAccountId?.toString()).toBe('account-789');
			expect(result.value.lastSyncAt).toBe(lastSyncAt);
			expect(result.value.createdAt).toBe(createdAt);
		});

		it('should reconstitute with null linked account and last sync', () => {
			const result = DataSource.reconstitute(
				{
					name: 'Test',
					type: DataSourceType.CHECKING,
					ownerEntityId,
					linkedAccountId: null,
					url: 'https://bank.example.com',
					format: 'csv',
					parserKey: ParserKey.BOURSORAMA,
					lastSyncAt: null,
					createdAt: new Date()
				},
				UniqueId.fromString('test')
			);

			expect(result.isSuccess).toBe(true);
			expect(result.value.linkedAccountId).toBeNull();
			expect(result.value.lastSyncAt).toBeNull();
		});
	});

	describe('getters', () => {
		it('should return all properties', () => {
			const linkedAccountId = UniqueId.fromString('account-123');
			const dataSource = DataSource.create({
				name: 'Full Test',
				type: DataSourceType.PEA,
				ownerEntityId,
				linkedAccountId,
				url: 'https://bank.example.com/pea',
				format: 'csv',
				parserKey: ParserKey.BOURSORAMA
			}).value;

			expect(dataSource.name).toBe('Full Test');
			expect(dataSource.type).toBe(DataSourceType.PEA);
			expect(dataSource.ownerEntityId.toString()).toBe('owner-123');
			expect(dataSource.linkedAccountId?.toString()).toBe('account-123');
			expect(dataSource.url).toBe('https://bank.example.com/pea');
			expect(dataSource.format).toBe('csv');
			expect(dataSource.parserKey).toBe(ParserKey.BOURSORAMA);
			expect(dataSource.lastSyncAt).toBeNull();
			expect(dataSource.createdAt).toBeInstanceOf(Date);
		});
	});

	describe('entity equality', () => {
		it('should be equal if same id', () => {
			const id = UniqueId.fromString('same-id');
			const ds1 = DataSource.create(
				{
					name: 'DS 1',
					type: DataSourceType.CHECKING,
					ownerEntityId,
					url: 'https://bank1.com',
					format: 'csv',
					parserKey: ParserKey.CREDIT_MUTUEL
				},
				id
			).value;
			const ds2 = DataSource.create(
				{
					name: 'DS 2',
					type: DataSourceType.SAVINGS,
					ownerEntityId,
					url: 'https://bank2.com',
					format: 'csv',
					parserKey: ParserKey.BOURSORAMA
				},
				id
			).value;

			expect(ds1.equals(ds2)).toBe(true);
		});

		it('should not be equal if different ids', () => {
			const ds1 = DataSource.create(
				{
					name: 'DS',
					type: DataSourceType.CHECKING,
					ownerEntityId,
					url: 'https://bank.com',
					format: 'csv',
					parserKey: ParserKey.CREDIT_MUTUEL
				},
				UniqueId.fromString('id-1')
			).value;
			const ds2 = DataSource.create(
				{
					name: 'DS',
					type: DataSourceType.CHECKING,
					ownerEntityId,
					url: 'https://bank.com',
					format: 'csv',
					parserKey: ParserKey.CREDIT_MUTUEL
				},
				UniqueId.fromString('id-2')
			).value;

			expect(ds1.equals(ds2)).toBe(false);
		});
	});
});
