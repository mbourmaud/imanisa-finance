/**
 * Type of investment source/account.
 */
export enum InvestmentSourceType {
	/** Plan d'Épargne en Actions */
	PEA = 'pea',
	/** Assurance-vie */
	ASSURANCE_VIE = 'assurance_vie',
	/** Crypto wallet/exchange */
	CRYPTO = 'crypto',
	/** Compte-Titres Ordinaire */
	CTO = 'cto'
}

export const InvestmentSourceTypeLabels: Record<InvestmentSourceType, string> = {
	[InvestmentSourceType.PEA]: 'PEA',
	[InvestmentSourceType.ASSURANCE_VIE]: 'Assurance-vie',
	[InvestmentSourceType.CRYPTO]: 'Crypto',
	[InvestmentSourceType.CTO]: 'Compte-Titres'
};
