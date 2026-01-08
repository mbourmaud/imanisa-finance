import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getContainer } from '@infrastructure/container';
import { Transaction } from '@domain/transaction/Transaction';
import { AccountTypeLabels } from '@domain/account/AccountType';
import { BankTemplateLabels } from '@domain/bank/BankTemplate';
import { UniqueId } from '@domain/shared/UniqueId';
import { CsvParserFactory } from '@infrastructure/csv/CsvParserFactory';
import { Money } from '@domain/account/Money';

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

	const account = await accountRepository.findById(UniqueId.fromString(params.accountId));
	if (!account || account.bankId.toString() !== bank.id.toString()) {
		throw error(404, 'Compte non trouvé');
	}

	const transactions = await transactionRepository.findByAccountId(account.id);

	return {
		bank: {
			id: bank.id.toString(),
			name: bank.name,
			template: bank.template,
			templateLabel: BankTemplateLabels[bank.template]
		},
		account: {
			id: account.id.toString(),
			name: account.name,
			type: account.type,
			typeLabel: AccountTypeLabels[account.type],
			balance: account.balance.amount
		},
		transactions: transactions.map((tx) => ({
			id: tx.id.toString(),
			type: tx.type,
			amount: tx.amount.amount,
			description: tx.description,
			date: tx.date.toISOString(),
			category: tx.category
		}))
	};
};

export const actions: Actions = {
	deleteAccount: async ({ params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const container = await getContainer();
		const { bankRepository, accountRepository } = container;

		const bank = await bankRepository.findById(UniqueId.fromString(params.bankId));
		if (!bank || bank.userId.toString() !== locals.user.id) {
			throw error(404, 'Banque non trouvée');
		}

		const account = await accountRepository.findById(UniqueId.fromString(params.accountId));
		if (!account || account.bankId.toString() !== bank.id.toString()) {
			throw error(404, 'Compte non trouvé');
		}

		await accountRepository.delete(account.id);
		throw redirect(302, `/banks/${params.bankId}`);
	},

	importCsv: async ({ request, params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file || file.size === 0) {
			return fail(400, { importError: 'Veuillez sélectionner un fichier' });
		}

		const container = await getContainer();
		const { bankRepository, accountRepository, transactionRepository } = container;

		const bank = await bankRepository.findById(UniqueId.fromString(params.bankId));
		if (!bank || bank.userId.toString() !== locals.user.id) {
			throw error(404, 'Banque non trouvée');
		}

		const account = await accountRepository.findById(UniqueId.fromString(params.accountId));
		if (!account || account.bankId.toString() !== bank.id.toString()) {
			throw error(404, 'Compte non trouvé');
		}

		try {
			const content = await file.text();
			const parser = CsvParserFactory.create(bank.template);
			const parsedTransactions = parser.parse(content);

			if (parsedTransactions.length === 0) {
				return fail(400, { importError: 'Aucune transaction trouvée dans le fichier' });
			}

			const transactions: Transaction[] = [];
			let balanceChange = 0;

			for (const parsed of parsedTransactions) {
				const txResult = Transaction.create({
					accountId: account.id,
					type: parsed.type,
					amount: parsed.amount,
					description: parsed.description,
					date: parsed.date,
					category: parsed.category
				});

				if (txResult.isSuccess) {
					transactions.push(txResult.value);
					balanceChange += parsed.type === 'INCOME' ? parsed.amount : -parsed.amount;
				}
			}

			if (transactions.length > 0) {
				await transactionRepository.saveMany(transactions);

				const newBalanceResult = Money.create(account.balance.amount + balanceChange);
				if (newBalanceResult.isSuccess) {
					account.updateBalance(newBalanceResult.value);
					await accountRepository.save(account);
				}
			}

			return { importSuccess: `${transactions.length} transactions importées avec succès` };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Erreur lors de l\'import';
			return fail(400, { importError: message });
		}
	}
};
