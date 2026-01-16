/**
 * Type of investment source/account.
 */
export enum InvestmentSourceType {
	/** Plan d'Épargne en Actions */
	PEA = 'pea',
	/** Compte-Titres Ordinaire */
	CTO = 'cto',
	/** Assurance-vie */
	ASSURANCE_VIE = 'assurance_vie',
	/** Plan d'Épargne Retraite */
	PER = 'per',
	/** Crypto wallet/exchange */
	CRYPTO = 'crypto',
	/** Crowdfunding */
	CROWDFUNDING = 'crowdfunding',
	/** Other */
	OTHER = 'other',
}

export const InvestmentSourceTypeLabels: Record<InvestmentSourceType, string> = {
	[InvestmentSourceType.PEA]: 'PEA',
	[InvestmentSourceType.CTO]: 'Compte-Titres',
	[InvestmentSourceType.ASSURANCE_VIE]: 'Assurance-vie',
	[InvestmentSourceType.PER]: 'PER',
	[InvestmentSourceType.CRYPTO]: 'Crypto',
	[InvestmentSourceType.CROWDFUNDING]: 'Crowdfunding',
	[InvestmentSourceType.OTHER]: 'Autre',
};
