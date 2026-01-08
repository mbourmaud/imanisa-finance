import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getContainer } from '@infrastructure/container';
import { Bank } from '@domain/bank/Bank';
import { BankTemplate } from '@domain/bank/BankTemplate';
import { UniqueId } from '@domain/shared/UniqueId';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const template = formData.get('template')?.toString() ?? '';

		if (!name.trim()) {
			return fail(400, { error: 'Le nom est requis', name, template });
		}

		if (!template || !Object.values(BankTemplate).includes(template as BankTemplate)) {
			return fail(400, { error: 'Veuillez sélectionner un type de banque', name, template });
		}

		const bankResult = Bank.create({
			userId: UniqueId.fromString(locals.user.id),
			name: name.trim(),
			template: template as BankTemplate
		});

		if (bankResult.isFailure) {
			return fail(400, { error: bankResult.error, name, template });
		}

		const container = await getContainer();
		await container.bankRepository.save(bankResult.value);

		throw redirect(302, `/banks/${bankResult.value.id.toString()}`);
	}
};
