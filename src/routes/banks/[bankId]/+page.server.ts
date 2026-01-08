import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getContainer } from '@infrastructure/container';
import { Account } from '@domain/account/Account';
import { AccountType, AccountTypeLabels } from '@domain/account/AccountType';
import { BankTemplateLabels } from '@domain/bank/BankTemplate';
import { UniqueId } from '@domain/shared/UniqueId';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const container = await getContainer();
	const { bankRepository, accountRepository, transactionRepository } = container;

	const bank = await bankRepository.findById(UniqueId.fromString(params.bankId));

	if (!bank || bank.userId.toString() !== locals.user.id) {
		throw error(404, 'Banque non trouvée');
	}

	const accounts = await accountRepository.findByBankId(bank.id);

	const accountsWithTransactions = await Promise.all(
		accounts.map(async (account) => {
			const transactions = await transactionRepository.findByAccountId(account.id);
			return {
				id: account.id.toString(),
				name: account.name,
				type: account.type,
				typeLabel: AccountTypeLabels[account.type],
				balance: account.balance.amount,
				transactionsCount: transactions.length
			};
		})
	);

	const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance.amount, 0);

	const accountTypes = Object.entries(AccountTypeLabels).map(([value, label]) => ({
		value,
		label
	}));

	return {
		bank: {
			id: bank.id.toString(),
			name: bank.name,
			template: bank.template,
			templateLabel: BankTemplateLabels[bank.template],
			totalBalance
		},
		accounts: accountsWithTransactions,
		accountTypes
	};
};

export const actions: Actions = {
	deleteBank: async ({ params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const container = await getContainer();
		const { bankRepository } = container;
		
		const bank = await bankRepository.findById(UniqueId.fromString(params.bankId));

		if (!bank || bank.userId.toString() !== locals.user.id) {
			throw error(404, 'Banque non trouvée');
		}

		await bankRepository.delete(bank.id);
		throw redirect(302, '/banks');
	},

	addAccount: async ({ request, params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const type = formData.get('type')?.toString() ?? '';
		const initialBalance = parseFloat(formData.get('initialBalance')?.toString() ?? '0') || 0;

		if (!name.trim()) {
			return fail(400, { accountError: 'Le nom est requis' });
		}

		if (!type || !Object.values(AccountType).includes(type as AccountType)) {
			return fail(400, { accountError: 'Veuillez sélectionner un type de compte' });
		}

		const container = await getContainer();
		const { bankRepository, accountRepository } = container;
		
		const bank = await bankRepository.findById(UniqueId.fromString(params.bankId));

		if (!bank || bank.userId.toString() !== locals.user.id) {
			throw error(404, 'Banque non trouvée');
		}

		const accountResult = Account.create({
			bankId: bank.id,
			name: name.trim(),
			type: type as AccountType,
			initialBalance
		});

		if (accountResult.isFailure) {
			return fail(400, { accountError: accountResult.error });
		}

		await accountRepository.save(accountResult.value);

		return { success: true };
	}
};
