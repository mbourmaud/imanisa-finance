import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ImportTransactionsUseCase } from '@application/import/ImportTransactionsUseCase';
import { DataSourceRepositoryImpl } from '@infrastructure/repositories/DataSourceRepository';
import { TransactionRepositoryImpl } from '@infrastructure/database/repositories/TransactionRepository';
import { CategoryRepositoryImpl } from '@infrastructure/repositories/CategoryRepository';
import { UniqueId } from '@domain/shared/UniqueId';

const dataSourceRepository = new DataSourceRepositoryImpl();
const transactionRepository = new TransactionRepositoryImpl();
const categoryRepository = new CategoryRepositoryImpl();
const importUseCase = new ImportTransactionsUseCase(
	dataSourceRepository,
	transactionRepository,
	categoryRepository
);

export const POST: RequestHandler = async ({ request }) => {
	// Parse form data with file upload
	const formData = await request.formData();
	const file = formData.get('file');
	const dataSourceId = formData.get('dataSourceId');

	if (!dataSourceId || typeof dataSourceId !== 'string') {
		throw error(400, 'dataSourceId is required');
	}

	if (!file || !(file instanceof File)) {
		throw error(400, 'CSV file is required');
	}

	// Read file content
	const csvContent = await file.text();

	if (!csvContent || csvContent.trim().length === 0) {
		throw error(400, 'CSV file is empty');
	}

	// Execute import use case
	const result = await importUseCase.execute(UniqueId.fromString(dataSourceId), csvContent);

	return json({
		imported: result.imported,
		skipped: result.skipped,
		errors: result.errors,
		categorization: result.categorization
			? {
					by_bank: result.categorization.byBank,
					by_rule: result.categorization.byRule,
					uncategorized: result.categorization.uncategorized
				}
			: undefined
	});
};
