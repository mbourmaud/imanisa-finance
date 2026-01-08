import { User } from '@domain/user/User';
import { Bank } from '@domain/bank/Bank';
import { Account } from '@domain/account/Account';
import { Transaction } from '@domain/transaction/Transaction';
import { BankTemplate } from '@domain/bank/BankTemplate';
import { AccountType } from '@domain/account/AccountType';
import { AssetCategory } from '@domain/account/AssetCategory';
import { TransactionType } from '@domain/transaction/TransactionType';
import { TransactionCategory } from '@domain/transaction/TransactionCategory';
import { UniqueId } from '@domain/shared/UniqueId';
import type { Container } from './types';

const DEMO_USER_ID = UniqueId.fromString('demo-user-001');

export async function seedDemoData(container: Container): Promise<void> {
	const userResult = User.create(
		{ email: 'mathieu.bourmaud@gmail.com', name: 'Mathieu', avatarUrl: null },
		DEMO_USER_ID
	);
	if (userResult.isSuccess) {
		await container.userRepository.save(userResult.value);
	}

	const banksData = [
		{ id: 'bank-ce', name: 'Caisse d\'Épargne', template: BankTemplate.CAISSE_EPARGNE },
		{ id: 'bank-cic', name: 'CIC Pro', template: BankTemplate.CIC },
		{ id: 'bank-revolut', name: 'Revolut', template: BankTemplate.REVOLUT },
		{ id: 'bank-bd', name: 'Bourse Direct', template: BankTemplate.BOURSE_DIRECT },
		{ id: 'bank-linxea', name: 'Linxea', template: BankTemplate.LINXEA },
		{ id: 'bank-immo', name: 'Immobilier', template: BankTemplate.CAISSE_EPARGNE }
	];

	const bankIds: Map<string, UniqueId> = new Map();
	for (const bankData of banksData) {
		const bankId = UniqueId.fromString(bankData.id);
		const bankResult = Bank.create({ userId: DEMO_USER_ID, name: bankData.name, template: bankData.template }, bankId);
		if (bankResult.isSuccess) {
			await container.bankRepository.save(bankResult.value);
			bankIds.set(bankData.id, bankId);
		}
	}

	const accountsData = [
		{ id: 'acc-courant', bankId: 'bank-ce', name: 'Compte courant', type: AccountType.CHECKING, category: AssetCategory.LIQUIDITY, balance: 3847.32 },
		{ id: 'acc-livreta', bankId: 'bank-ce', name: 'Livret A', type: AccountType.SAVINGS, category: AssetCategory.LIQUIDITY, balance: 22950 },
		{ id: 'acc-ldd', bankId: 'bank-ce', name: 'LDD', type: AccountType.SAVINGS, category: AssetCategory.LIQUIDITY, balance: 12000 },
		{ id: 'acc-pro', bankId: 'bank-cic', name: 'Compte Pro', type: AccountType.CHECKING, category: AssetCategory.LIQUIDITY, balance: 15678.45 },
		{ id: 'acc-rev-eur', bankId: 'bank-revolut', name: 'EUR', type: AccountType.CHECKING, category: AssetCategory.LIQUIDITY, balance: 856.23 },
		{ id: 'acc-rev-usd', bankId: 'bank-revolut', name: 'USD', type: AccountType.CHECKING, category: AssetCategory.LIQUIDITY, balance: 2150.00 },
		{ id: 'acc-pea', bankId: 'bank-bd', name: 'PEA', type: AccountType.PEA, category: AssetCategory.FINANCIAL, balance: 67890.45 },
		{ id: 'acc-cto', bankId: 'bank-bd', name: 'CTO', type: AccountType.CTO, category: AssetCategory.FINANCIAL, balance: 23456.78 },
		{ id: 'acc-av', bankId: 'bank-linxea', name: 'Assurance Vie Spirit', type: AccountType.ASSURANCE_VIE, category: AssetCategory.FINANCIAL, balance: 45000 },
		{ id: 'acc-rp', bankId: 'bank-immo', name: 'Résidence principale', type: AccountType.REAL_ESTATE, category: AssetCategory.REAL_ESTATE, balance: 320000 },
		{ id: 'acc-pret', bankId: 'bank-immo', name: 'Prêt immobilier', type: AccountType.LOAN, category: AssetCategory.DEBT, balance: -185000 }
	];

	const accountIds: Map<string, UniqueId> = new Map();
	for (const accData of accountsData) {
		const accountId = UniqueId.fromString(accData.id);
		const bankId = bankIds.get(accData.bankId);
		if (!bankId) continue;

		const accountResult = Account.create({
			bankId,
			name: accData.name,
			type: accData.type,
			assetCategory: accData.category,
			initialBalance: accData.balance
		}, accountId);

		if (accountResult.isSuccess) {
			await container.accountRepository.save(accountResult.value);
			accountIds.set(accData.id, accountId);
		}
	}

	const today = new Date();
	const transactions = generateTransactionHistory(accountIds, today);

	for (const tx of transactions) {
		await container.transactionRepository.save(tx);
	}
}

function generateTransactionHistory(accountIds: Map<string, UniqueId>, today: Date): Transaction[] {
	const transactions: Transaction[] = [];

	const courantId = accountIds.get('acc-courant')!;
	const proId = accountIds.get('acc-pro')!;
	const revolutId = accountIds.get('acc-rev-eur')!;
	const peaId = accountIds.get('acc-pea')!;
	const avId = accountIds.get('acc-av')!;
	const pretId = accountIds.get('acc-pret')!;

	for (let month = 0; month < 6; month++) {
		const monthDate = new Date(today.getFullYear(), today.getMonth() - month, 1);

		addTx(transactions, courantId, TransactionType.INCOME, 3200, 'Salaire', TransactionCategory.SALARY, monthDate, 5);
		addTx(transactions, courantId, TransactionType.EXPENSE, 950, 'Loyer', TransactionCategory.HOUSING, monthDate, 3);
		addTx(transactions, courantId, TransactionType.EXPENSE, 65, 'EDF', TransactionCategory.UTILITIES, monthDate, 10);
		addTx(transactions, courantId, TransactionType.EXPENSE, 35, 'Eau', TransactionCategory.UTILITIES, monthDate, 12);
		addTx(transactions, courantId, TransactionType.EXPENSE, 29.99, 'Internet Free', TransactionCategory.SUBSCRIPTIONS, monthDate, 8);
		addTx(transactions, courantId, TransactionType.EXPENSE, 14.99, 'Netflix', TransactionCategory.SUBSCRIPTIONS, monthDate, 15);
		addTx(transactions, courantId, TransactionType.EXPENSE, 9.99, 'Spotify', TransactionCategory.SUBSCRIPTIONS, monthDate, 15);
		addTx(transactions, courantId, TransactionType.EXPENSE, 45, 'Assurance auto', TransactionCategory.INSURANCE, monthDate, 20);
		addTx(transactions, courantId, TransactionType.EXPENSE, 850 + month * 12, 'Prêt immobilier', TransactionCategory.LOAN_PAYMENT, monthDate, 5);

		for (let week = 0; week < 4; week++) {
			const weekOffset = week * 7;
			addTx(transactions, courantId, TransactionType.EXPENSE, 85 + Math.random() * 60, 'Courses Carrefour', TransactionCategory.GROCERIES, monthDate, weekOffset + 2);
			addTx(transactions, courantId, TransactionType.EXPENSE, 45 + Math.random() * 30, 'Restaurant', TransactionCategory.RESTAURANTS, monthDate, weekOffset + 5);
		}

		addTx(transactions, courantId, TransactionType.EXPENSE, 55 + Math.random() * 25, 'Essence', TransactionCategory.TRANSPORT, monthDate, 7);
		addTx(transactions, courantId, TransactionType.EXPENSE, 55 + Math.random() * 25, 'Essence', TransactionCategory.TRANSPORT, monthDate, 21);

		if (month % 2 === 0) {
			addTx(transactions, courantId, TransactionType.EXPENSE, 35 + Math.random() * 50, 'Amazon', TransactionCategory.SHOPPING, monthDate, 14);
		}

		addTx(transactions, proId, TransactionType.INCOME, 4500 + Math.random() * 2000, 'Facture client', TransactionCategory.FREELANCE, monthDate, 10);
		if (month % 2 === 0) {
			addTx(transactions, proId, TransactionType.INCOME, 2800 + Math.random() * 1500, 'Facture client', TransactionCategory.FREELANCE, monthDate, 22);
		}
		addTx(transactions, proId, TransactionType.EXPENSE, 650 + Math.random() * 200, 'URSSAF', TransactionCategory.TAXES, monthDate, 15);
		addTx(transactions, proId, TransactionType.EXPENSE, 150, 'Logiciels', TransactionCategory.SUBSCRIPTIONS, monthDate, 1);

		addTx(transactions, revolutId, TransactionType.EXPENSE, 15 + Math.random() * 30, 'Uber Eats', TransactionCategory.RESTAURANTS, monthDate, 8);
		addTx(transactions, revolutId, TransactionType.EXPENSE, 20 + Math.random() * 40, 'Amazon', TransactionCategory.SHOPPING, monthDate, 18);

		if (month % 3 === 0) {
			addTx(transactions, peaId, TransactionType.INCOME, 450 + Math.random() * 300, 'Dividendes', TransactionCategory.DIVIDENDS, monthDate, 25);
		}

		if (month === 0 || month === 3) {
			addTx(transactions, avId, TransactionType.INCOME, 200 + Math.random() * 100, 'Intérêts', TransactionCategory.DIVIDENDS, monthDate, 28);
		}

		addTx(transactions, courantId, TransactionType.EXPENSE, 500, 'Virement épargne', TransactionCategory.SAVINGS, monthDate, 6);
	}

	if (today.getMonth() >= 6) {
		const julyDate = new Date(today.getFullYear(), 6, 1);
		addTx(transactions, courantId, TransactionType.EXPENSE, 1200, 'Vacances été', TransactionCategory.TRAVEL, julyDate, 15);
	}

	return transactions;
}

function addTx(
	list: Transaction[],
	accountId: UniqueId,
	type: TransactionType,
	amount: number,
	desc: string,
	category: TransactionCategory,
	monthDate: Date,
	dayOffset: number
): void {
	const date = new Date(monthDate);
	date.setDate(dayOffset);

	const txResult = Transaction.create({
		accountId,
		type,
		amount: Math.round(amount * 100) / 100,
		description: desc,
		date,
		category
	});

	if (txResult.isSuccess) {
		list.push(txResult.value);
	}
}

export function getDemoUserId(): string {
	return DEMO_USER_ID.toString();
}
