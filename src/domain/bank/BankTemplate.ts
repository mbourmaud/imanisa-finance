export enum BankTemplate {
	CAISSE_EPARGNE = 'CAISSE_EPARGNE',
	CIC = 'CIC',
	CREDIT_MUTUEL = 'CREDIT_MUTUEL',
	REVOLUT = 'REVOLUT',
	BOURSE_DIRECT = 'BOURSE_DIRECT',
	LINXEA = 'LINXEA',
	BINANCE = 'BINANCE',
	OTHER = 'OTHER'
}

export const BankTemplateLabels: Record<BankTemplate, string> = {
	[BankTemplate.CAISSE_EPARGNE]: 'Caisse d\'Épargne',
	[BankTemplate.CIC]: 'CIC',
	[BankTemplate.CREDIT_MUTUEL]: 'Crédit Mutuel',
	[BankTemplate.REVOLUT]: 'Revolut',
	[BankTemplate.BOURSE_DIRECT]: 'Bourse Direct',
	[BankTemplate.LINXEA]: 'Linxea',
	[BankTemplate.BINANCE]: 'Binance',
	[BankTemplate.OTHER]: 'Autre'
};
