import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPropertyWithDetails } from '@infrastructure/repositories/RealEstateRepository';

export const load: PageServerLoad = async ({ params }) => {
	const property = await getPropertyWithDetails(params.id);

	if (!property) {
		throw error(404, 'Bien immobilier non trouvé');
	}

	return {
		property
	};
};
