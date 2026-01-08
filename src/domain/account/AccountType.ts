export enum AccountType {
	CHECKING = 'CHECKING',
	SAVINGS = 'SAVINGS',
	PEA = 'PEA',
	CTO = 'CTO',
	ASSURANCE_VIE = 'ASSURANCE_VIE',
	CRYPTO = 'CRYPTO',
	REAL_ESTATE = 'REAL_ESTATE',
	LOAN = 'LOAN',
	CREDIT = 'CREDIT'
}

export const AccountTypeLabels: Record<AccountType, string> = {
	[AccountType.CHECKING]: 'Compte courant',
	[AccountType.SAVINGS]: 'Livret',
	[AccountType.PEA]: 'PEA',
	[AccountType.CTO]: 'CTO',
	[AccountType.ASSURANCE_VIE]: 'Assurance vie',
	[AccountType.CRYPTO]: 'Crypto',
	[AccountType.REAL_ESTATE]: 'Bien immobilier',
	[AccountType.LOAN]: 'Prêt immobilier',
	[AccountType.CREDIT]: 'Crédit conso'
};
