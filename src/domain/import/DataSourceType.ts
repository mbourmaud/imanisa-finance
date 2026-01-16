/**
 * Types of data sources for bank account imports
 */
export enum DataSourceType {
	CHECKING = 'CHECKING',
	SAVINGS = 'SAVINGS',
	LIVRET_A = 'LIVRET_A',
	LDDS = 'LDDS',
	PEL = 'PEL',
	CEL = 'CEL',
	LIVRET_JEUNE = 'LIVRET_JEUNE',
	PEA = 'PEA',
	CTO = 'CTO',
	ASSURANCE_VIE = 'ASSURANCE_VIE',
}

export const DataSourceTypeLabels: Record<DataSourceType, string> = {
	[DataSourceType.CHECKING]: 'Compte courant',
	[DataSourceType.SAVINGS]: 'Épargne',
	[DataSourceType.LIVRET_A]: 'Livret A',
	[DataSourceType.LDDS]: 'LDDS',
	[DataSourceType.PEL]: 'PEL',
	[DataSourceType.CEL]: 'CEL',
	[DataSourceType.LIVRET_JEUNE]: 'Livret Jeune',
	[DataSourceType.PEA]: 'PEA',
	[DataSourceType.CTO]: 'CTO',
	[DataSourceType.ASSURANCE_VIE]: 'Assurance Vie',
};
