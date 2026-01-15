import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ImportInvestmentsUseCase } from '@application/investment/ImportInvestmentsUseCase';
import { InvestmentRepositoryImpl } from '@infrastructure/repositories/InvestmentRepository';
import { UniqueId } from '@domain/shared/UniqueId';

const investmentRepository = new InvestmentRepositoryImpl();
const importUseCase = new ImportInvestmentsUseCase(investmentRepository);

export const POST: RequestHandler = async ({ request }) => {
	// Parse form data with file upload
	const formData = await request.formData();
	const file = formData.get('file');
	const sourceId = formData.get('sourceId');

	if (!sourceId || typeof sourceId !== 'string') {
		throw error(400, 'sourceId is required');
	}

	if (!file || !(file instanceof File)) {
		throw error(400, 'XLSX file is required');
	}

	// Read file content as ArrayBuffer (for XLSX parsing)
	const content = await file.arrayBuffer();

	if (content.byteLength === 0) {
		throw error(400, 'File is empty');
	}

	// Execute import use case
	const result = await importUseCase.execute(UniqueId.fromString(sourceId), content);

	return json({
		positions: result.positions,
		transactions: result.transactions,
		errors: result.errors
	});
};
