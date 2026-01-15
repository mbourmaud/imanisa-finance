import type { PageServerLoad } from './$types';
import {
	getRealEstateSummary,
	getPropertiesWithLoans
} from '@infrastructure/repositories/RealEstateRepository';

export const load: PageServerLoad = async () => {
	const [summary, properties] = await Promise.all([
		getRealEstateSummary(),
		getPropertiesWithLoans()
	]);

	return {
		summary,
		properties
	};
};
