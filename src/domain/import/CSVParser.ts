import type { ParsedTransaction } from './ParsedTransaction';

/**
 * Abstract interface for CSV parsers.
 * Each bank has its own CSV format and requires a specific parser implementation.
 */
export interface CSVParser {
	/**
	 * Parse CSV content and extract transactions
	 * @param content Raw CSV file content as string
	 * @returns Array of parsed transactions
	 * @throws Error if parsing fails
	 */
	parse(content: string): ParsedTransaction[];
}

/**
 * Parser key used to identify which parser to use for a data source.
 * Maps to parser implementations in the infrastructure layer.
 */
export enum ParserKey {
	CREDIT_MUTUEL = 'credit_mutuel',
	CAISSE_EPARGNE = 'caisse_epargne',
	CAISSE_EPARGNE_ENTREPRISE = 'caisse_epargne_entreprise',
	BOURSORAMA = 'boursorama',
}

export const ParserKeyLabels: Record<ParserKey, string> = {
	[ParserKey.CREDIT_MUTUEL]: 'Crédit Mutuel',
	[ParserKey.CAISSE_EPARGNE]: "Caisse d'Épargne (Particulier)",
	[ParserKey.CAISSE_EPARGNE_ENTREPRISE]: "Caisse d'Épargne (Entreprise)",
	[ParserKey.BOURSORAMA]: 'Boursorama',
};
