import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllUsers } from '@infrastructure/auth/users';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/');
	}
	return {
		users: getAllUsers()
	};
};
