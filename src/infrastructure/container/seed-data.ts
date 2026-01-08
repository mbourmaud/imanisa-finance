import { User } from '@domain/user/User';
import { Bank } from '@domain/bank/Bank';
import { Account } from '@domain/account/Account';
import { BankTemplate } from '@domain/bank/BankTemplate';
import { AccountType } from '@domain/account/AccountType';
import { AssetCategory } from '@domain/account/AssetCategory';
import { UniqueId } from '@domain/shared/UniqueId';
import type { Container } from './types';

const USER_ID = UniqueId.fromString('mathieu-bourmaud');

export const OWNER_IDS = {
	MATHIEU: 'owner-mathieu',
	NINON: 'owner-ninon',
	JOINT: 'owner-joint',
	SCI_IMANISA: 'owner-sci-imanisa'
} as const;

export const BANK_IDS = {
	CE_MATHIEU: 'bank-ce-mathieu',
	CM_MATHIEU: 'bank-cm-mathieu',
	CE_JOINT: 'bank-ce-joint',
	CE_SCI: 'bank-ce-sci',
	BOURSE_DIRECT: 'bank-bourse-direct',
	LINXEA: 'bank-linxea',
	BINANCE: 'bank-binance'
} as const;

export const ACCOUNT_IDS = {
	CE_COURANT_MATHIEU: 'acc-ce-courant-mathieu',
	CE_LIVRET_A_MATHIEU: 'acc-ce-livreta-mathieu',
	CM_COURANT_MATHIEU: 'acc-cm-courant-mathieu',
	CE_JOINT: 'acc-ce-joint',
	CE_SCI: 'acc-ce-sci',
	PEA_BD: 'acc-pea-bd',
	AV_LINXEA: 'acc-av-linxea',
	CRYPTO_BINANCE: 'acc-crypto-binance'
} as const;

export async function seedInitialData(container: Container): Promise<void> {
	const userResult = User.create(
		{ email: 'mathieu.bourmaud@gmail.com', name: 'Mathieu Bourmaud', avatarUrl: null },
		USER_ID
	);
	if (userResult.isSuccess) {
		await container.userRepository.save(userResult.value);
	}

	const banksData = [
		{ id: BANK_IDS.CE_MATHIEU, name: 'Caisse d\'Épargne', template: BankTemplate.CAISSE_EPARGNE },
		{ id: BANK_IDS.CM_MATHIEU, name: 'Crédit Mutuel', template: BankTemplate.CREDIT_MUTUEL },
		{ id: BANK_IDS.CE_JOINT, name: 'Caisse d\'Épargne (Joint)', template: BankTemplate.CAISSE_EPARGNE },
		{ id: BANK_IDS.CE_SCI, name: 'Caisse d\'Épargne (SCI)', template: BankTemplate.CAISSE_EPARGNE },
		{ id: BANK_IDS.BOURSE_DIRECT, name: 'Bourse Direct', template: BankTemplate.BOURSE_DIRECT },
		{ id: BANK_IDS.LINXEA, name: 'Linxea', template: BankTemplate.LINXEA },
		{ id: BANK_IDS.BINANCE, name: 'Binance', template: BankTemplate.BINANCE }
	];

	const bankIds: Map<string, UniqueId> = new Map();
	for (const bankData of banksData) {
		const bankId = UniqueId.fromString(bankData.id);
		const bankResult = Bank.create({ userId: USER_ID, name: bankData.name, template: bankData.template }, bankId);
		if (bankResult.isSuccess) {
			await container.bankRepository.save(bankResult.value);
			bankIds.set(bankData.id, bankId);
		}
	}

	const accountsData = [
		{
			id: ACCOUNT_IDS.CE_COURANT_MATHIEU,
			bankId: BANK_IDS.CE_MATHIEU,
			name: 'Compte Courant',
			accountNumber: '04396923205',
			type: AccountType.CHECKING,
			category: AssetCategory.LIQUIDITY,
			balance: 5098.13
		},
		{
			id: ACCOUNT_IDS.CE_LIVRET_A_MATHIEU,
			bankId: BANK_IDS.CE_MATHIEU,
			name: 'Livret A',
			accountNumber: '00396923289',
			type: AccountType.SAVINGS,
			category: AssetCategory.LIQUIDITY,
			balance: 6525.03
		},
		{
			id: ACCOUNT_IDS.CM_COURANT_MATHIEU,
			bankId: BANK_IDS.CM_MATHIEU,
			name: 'Compte Courant',
			accountNumber: '00021665904',
			type: AccountType.CHECKING,
			category: AssetCategory.LIQUIDITY,
			balance: 458.18
		},
		{
			id: ACCOUNT_IDS.CE_JOINT,
			bankId: BANK_IDS.CE_JOINT,
			name: 'Compte Joint',
			accountNumber: '04402691469',
			type: AccountType.CHECKING,
			category: AssetCategory.LIQUIDITY,
			balance: 0
		},
		{
			id: ACCOUNT_IDS.CE_SCI,
			bankId: BANK_IDS.CE_SCI,
			name: 'Compte SCI IMANISA',
			accountNumber: null,
			type: AccountType.CHECKING,
			category: AssetCategory.LIQUIDITY,
			balance: 0
		},
		{
			id: ACCOUNT_IDS.PEA_BD,
			bankId: BANK_IDS.BOURSE_DIRECT,
			name: 'PEA',
			accountNumber: '508TI00083452745EUR',
			type: AccountType.PEA,
			category: AssetCategory.FINANCIAL,
			balance: 5604.77
		},
		{
			id: ACCOUNT_IDS.AV_LINXEA,
			bankId: BANK_IDS.LINXEA,
			name: 'Assurance Vie Linxea',
			accountNumber: 'P54215638',
			type: AccountType.ASSURANCE_VIE,
			category: AssetCategory.FINANCIAL,
			balance: 360.18
		},
		{
			id: ACCOUNT_IDS.CRYPTO_BINANCE,
			bankId: BANK_IDS.BINANCE,
			name: 'Crypto',
			accountNumber: '783955343',
			type: AccountType.CRYPTO,
			category: AssetCategory.FINANCIAL,
			balance: 0
		}
	];

	for (const accData of accountsData) {
		const accountId = UniqueId.fromString(accData.id);
		const bankId = bankIds.get(accData.bankId);
		if (!bankId) continue;

		const accountResult = Account.create(
			{
				bankId,
				name: accData.name,
				type: accData.type,
				assetCategory: accData.category,
				initialBalance: accData.balance
			},
			accountId
		);

		if (accountResult.isSuccess) {
			await container.accountRepository.save(accountResult.value);
		}
	}
}

export function getUserId(): string {
	return USER_ID.toString();
}
