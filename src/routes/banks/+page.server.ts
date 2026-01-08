import type { PageServerLoad } from './$types';
import { getContainer } from '@infrastructure/container';
import { UniqueId } from '@domain/shared/UniqueId';
import { BankTemplateLabels } from '@domain/bank/BankTemplate';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { banks: [] };
	}

	const container = await getContainer();
	const { bankRepository, accountRepository } = container;

	const userId = UniqueId.fromString(locals.user.id);
	const banks = await bankRepository.findByUserId(userId);

	const banksWithAccounts = await Promise.all(
		banks.map(async (bank) => {
			const accounts = await accountRepository.findByBankId(bank.id);
			const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance.amount, 0);

			return {
				id: bank.id.toString(),
				name: bank.name,
				template: bank.template,
				templateLabel: BankTemplateLabels[bank.template],
				accountsCount: accounts.length,
				totalBalance
			};
		})
	);

	return { banks: banksWithAccounts };
};
