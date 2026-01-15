import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRealEstateSummary } from '@infrastructure/repositories/RealEstateRepository';

export const GET: RequestHandler = async () => {
	const summary = await getRealEstateSummary();

	return json({
		total_value: summary.totalValue,
		total_debt: summary.totalDebt,
		net_equity: summary.netEquity,
		property_count: summary.propertyCount
	});
};
