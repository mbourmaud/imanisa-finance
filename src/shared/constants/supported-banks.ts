/**
 * Supported Banks Constants
 * Defines all banks with functional parsers for import
 * Only add banks here when a parser is implemented!
 */

export type BankType = 'bank' | 'investment';

export interface SupportedBank {
	key: string;
	name: string;
	shortName: string;
	color: string;
	textColor?: string;
	type: BankType;
	parserKey: string;
	supportedFormats: string[];
	defaultExportUrl?: string;
}

export const SUPPORTED_BANKS: SupportedBank[] = [
	// ============================================
	// BANQUES (parsers transactions)
	// ============================================
	{
		key: 'credit_mutuel',
		name: 'Crédit Mutuel',
		shortName: 'CM',
		color: '#0066b3',
		type: 'bank',
		parserKey: 'credit_mutuel',
		supportedFormats: ['CSV'],
		defaultExportUrl: 'https://www.creditmutuel.fr/fr/banque/comptes/telechargement.html',
	},
	{
		key: 'cic',
		name: 'CIC',
		shortName: 'CIC',
		color: '#c8102e',
		type: 'bank',
		parserKey: 'credit_mutuel', // Same parser as Crédit Mutuel
		supportedFormats: ['CSV'],
		defaultExportUrl: 'https://www.cic.fr/fr/banque/comptes/telechargement.html',
	},
	{
		key: 'caisse_epargne',
		name: "Caisse d'Épargne",
		shortName: 'CE',
		color: '#e4002b',
		type: 'bank',
		parserKey: 'caisse_epargne',
		supportedFormats: ['CSV'],
		defaultExportUrl: 'https://www.caisse-epargne.fr/',
	},
	{
		key: 'caisse_epargne_entreprise',
		name: "Caisse d'Épargne Pro",
		shortName: 'CEP',
		color: '#c4001e',
		type: 'bank',
		parserKey: 'caisse_epargne_entreprise',
		supportedFormats: ['CSV'],
		defaultExportUrl: 'https://www.caisse-epargne.fr/entreprises/',
	},
	{
		key: 'boursorama',
		name: 'Boursorama',
		shortName: 'BRS',
		color: '#ff6600',
		type: 'bank',
		parserKey: 'boursorama',
		supportedFormats: ['CSV'],
		defaultExportUrl: 'https://clients.boursorama.com/',
	},

	// ============================================
	// INVESTISSEMENTS (parsers positions/transactions)
	// ============================================
	{
		key: 'bourse_direct',
		name: 'Bourse Direct',
		shortName: 'BD',
		color: '#1a5f2a',
		type: 'investment',
		parserKey: 'bourse_direct',
		supportedFormats: ['XLSX'],
		defaultExportUrl: 'https://www.boursedirect.fr/',
	},
	{
		key: 'linxea',
		name: 'Linxea',
		shortName: 'LX',
		color: '#0052cc',
		type: 'investment',
		parserKey: 'linxea',
		supportedFormats: ['XLSX'],
		defaultExportUrl: 'https://www.linxea.com/',
	},
	{
		key: 'binance',
		name: 'Binance',
		shortName: 'BN',
		color: '#f0b90b',
		textColor: '#000000',
		type: 'investment',
		parserKey: 'binance',
		supportedFormats: ['CSV'],
		defaultExportUrl: 'https://www.binance.com/fr/my/wallet/history',
	},
];

/**
 * Get a supported bank by its key
 */
export function getSupportedBank(key: string): SupportedBank | undefined {
	return SUPPORTED_BANKS.find((bank) => bank.key === key);
}

/**
 * Get all supported banks of a specific type
 */
export function getSupportedBanksByType(type: BankType): SupportedBank[] {
	return SUPPORTED_BANKS.filter((bank) => bank.type === type);
}

/**
 * Get all bank keys
 */
export function getSupportedBankKeys(): string[] {
	return SUPPORTED_BANKS.map((bank) => bank.key);
}

/**
 * Check if a bank key is supported
 */
export function isSupportedBank(key: string): boolean {
	return SUPPORTED_BANKS.some((bank) => bank.key === key);
}

/**
 * Map of supported bank keys for quick lookups
 */
export const SUPPORTED_BANK_KEYS = new Set(SUPPORTED_BANKS.map((b) => b.key));
