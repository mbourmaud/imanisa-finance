import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportTransactionsUseCase } from './ImportTransactionsUseCase';
import type { DataSourceRepository } from '@domain/import/DataSourceRepository';
import type { TransactionRepository } from '@domain/transaction/TransactionRepository';
import { DataSource } from '@domain/import/DataSource';
import { DataSourceType } from '@domain/import/DataSourceType';
import { ParserKey } from '@domain/import/CSVParser';
import { Transaction, TransactionType } from '@domain/transaction';
import { UniqueId } from '@domain/shared/UniqueId';

// Mock repositories
const createMockDataSourceRepository = (): DataSourceRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByOwnerEntityId: vi.fn(),
	save: vi.fn(),
	delete: vi.fn()
});

const createMockTransactionRepository = (): TransactionRepository => ({
	findById: vi.fn(),
	findByAccountId: vi.fn().mockResolvedValue([]),
	findByAccountIdAndDateRange: vi.fn(),
	saveMany: vi.fn(),
	save: vi.fn(),
	delete: vi.fn(),
	deleteByAccountId: vi.fn()
});

// Helper to create test data source
const createTestDataSource = (overrides?: {
	linkedAccountId?: UniqueId | null;
	parserKey?: ParserKey;
}) => {
	// Determine linkedAccountId: use provided value, or default to a new ID
	const linkedAccountId =
		overrides?.linkedAccountId !== undefined ? overrides.linkedAccountId : UniqueId.create();

	const ds = DataSource.create({
		name: 'Test Source',
		type: DataSourceType.CHECKING,
		ownerEntityId: UniqueId.create(),
		linkedAccountId,
		url: 'https://example.com',
		format: 'csv',
		parserKey: overrides?.parserKey ?? ParserKey.CREDIT_MUTUEL
	});
	if (ds.isFailure) throw new Error(ds.error);

	return ds.value;
};

describe('ImportTransactionsUseCase', () => {
	let dataSourceRepo: DataSourceRepository;
	let transactionRepo: TransactionRepository;
	let useCase: ImportTransactionsUseCase;

	beforeEach(() => {
		dataSourceRepo = createMockDataSourceRepository();
		transactionRepo = createMockTransactionRepository();
		useCase = new ImportTransactionsUseCase(dataSourceRepo, transactionRepo);
	});

	describe('execute', () => {
		it('should return error when data source not found', async () => {
			vi.mocked(dataSourceRepo.findById).mockResolvedValue(null);

			const result = await useCase.execute(UniqueId.create(), 'some csv content');

			expect(result).toMatchInlineSnapshot(`
				{
				  "errors": [
				    "Data source not found",
				  ],
				  "imported": 0,
				  "skipped": 0,
				}
			`);
		});

		it('should return error when data source has no linked account', async () => {
			const dataSource = createTestDataSource({ linkedAccountId: null });
			vi.mocked(dataSourceRepo.findById).mockResolvedValue(dataSource);

			const result = await useCase.execute(dataSource.id, 'some csv content');

			expect(result.imported).toBe(0);
			expect(result.errors).toContain(
				'Data source has no linked account. Please configure the linked account first.'
			);
		});

		it('should parse and import transactions from CSV', async () => {
			const accountId = UniqueId.create();
			const dataSource = createTestDataSource({
				linkedAccountId: accountId,
				parserKey: ParserKey.CREDIT_MUTUEL
			});
			vi.mocked(dataSourceRepo.findById).mockResolvedValue(dataSource);
			vi.mocked(transactionRepo.findByAccountId).mockResolvedValue([]);

			// Credit Mutuel CSV format
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;;500,00;VIREMENT SALAIRE;1500,00
14/01/2024;14/01/2024;45,50;;CARREFOUR MARKET;1000,00`;

			const result = await useCase.execute(dataSource.id, csvContent);

			expect(result.imported).toBe(2);
			expect(result.skipped).toBe(0);
			expect(transactionRepo.saveMany).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({ description: 'VIREMENT SALAIRE' }),
					expect.objectContaining({ description: 'CARREFOUR MARKET' })
				])
			);
		});

		it('should deduplicate transactions based on date+amount+description', async () => {
			const accountId = UniqueId.create();
			const dataSource = createTestDataSource({
				linkedAccountId: accountId,
				parserKey: ParserKey.CREDIT_MUTUEL
			});
			vi.mocked(dataSourceRepo.findById).mockResolvedValue(dataSource);

			// Existing transaction in DB - use same date format as parser produces
			// Parser creates date with new Date(year, month, day) which is local timezone at midnight
			const existingDate = new Date(2024, 0, 14); // January 14, 2024 local time
			const existingTx = Transaction.create({
				accountId,
				type: TransactionType.EXPENSE,
				amount: 45.5,
				description: 'carrefour market', // lowercase to match normalization
				date: existingDate
			}).value;

			vi.mocked(transactionRepo.findByAccountId).mockResolvedValue([existingTx]);

			// CSV with same transaction + a new one
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;;500,00;VIREMENT SALAIRE;1500,00
14/01/2024;14/01/2024;45,50;;CARREFOUR MARKET;1000,00`;

			const result = await useCase.execute(dataSource.id, csvContent);

			expect(result.imported).toBe(1);
			expect(result.skipped).toBe(1);
		});

		it('should handle invalid CSV gracefully', async () => {
			const dataSource = createTestDataSource({ parserKey: ParserKey.CREDIT_MUTUEL });
			vi.mocked(dataSourceRepo.findById).mockResolvedValue(dataSource);

			// Invalid CSV that parser will return empty array for
			const csvContent = 'invalid csv without proper headers';

			const result = await useCase.execute(dataSource.id, csvContent);

			expect(result.imported).toBe(0);
			// Parser returns empty array for invalid input, so we get "no transactions" error
			expect(result.errors).toContain('No transactions found in CSV file');
		});

		it('should return error when CSV has no transactions', async () => {
			const dataSource = createTestDataSource({ parserKey: ParserKey.CREDIT_MUTUEL });
			vi.mocked(dataSourceRepo.findById).mockResolvedValue(dataSource);

			// CSV with only header
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde`;

			const result = await useCase.execute(dataSource.id, csvContent);

			expect(result.imported).toBe(0);
			expect(result.errors).toContain('No transactions found in CSV file');
		});

		it('should update data source lastSyncAt after successful import', async () => {
			const dataSource = createTestDataSource({ parserKey: ParserKey.CREDIT_MUTUEL });
			vi.mocked(dataSourceRepo.findById).mockResolvedValue(dataSource);
			vi.mocked(transactionRepo.findByAccountId).mockResolvedValue([]);

			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;;500,00;VIREMENT SALAIRE;1500,00`;

			await useCase.execute(dataSource.id, csvContent);

			expect(dataSourceRepo.save).toHaveBeenCalled();
		});

		it('should handle save errors gracefully', async () => {
			const dataSource = createTestDataSource({ parserKey: ParserKey.CREDIT_MUTUEL });
			vi.mocked(dataSourceRepo.findById).mockResolvedValue(dataSource);
			vi.mocked(transactionRepo.findByAccountId).mockResolvedValue([]);
			vi.mocked(transactionRepo.saveMany).mockRejectedValue(new Error('Database error'));

			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;;500,00;VIREMENT SALAIRE;1500,00`;

			const result = await useCase.execute(dataSource.id, csvContent);

			expect(result.imported).toBe(0);
			expect(result.errors.some((e) => e.includes('Failed to save transactions'))).toBe(true);
		});

		it('should deduplicate within same import batch', async () => {
			const dataSource = createTestDataSource({ parserKey: ParserKey.CREDIT_MUTUEL });
			vi.mocked(dataSourceRepo.findById).mockResolvedValue(dataSource);
			vi.mocked(transactionRepo.findByAccountId).mockResolvedValue([]);

			// CSV with duplicate entries
			const csvContent = `Date;Date de valeur;Débit;Crédit;Libellé;Solde
15/01/2024;15/01/2024;;500,00;VIREMENT SALAIRE;1500,00
15/01/2024;15/01/2024;;500,00;VIREMENT SALAIRE;1500,00`;

			const result = await useCase.execute(dataSource.id, csvContent);

			// Only one should be imported, the duplicate skipped
			expect(result.imported).toBe(1);
			expect(result.skipped).toBe(1);
		});
	});
});
