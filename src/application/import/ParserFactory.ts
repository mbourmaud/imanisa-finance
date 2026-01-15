import type { CSVParser } from '@domain/import/CSVParser';
import { ParserKey } from '@domain/import/CSVParser';
import { CreditMutuelParser } from '@infrastructure/parsers/CreditMutuelParser';
import { CaisseEpargneParser } from '@infrastructure/parsers/CaisseEpargneParser';
import { CaisseEpargneEntrepriseParser } from '@infrastructure/parsers/CaisseEpargneEntrepriseParser';
import { BoursoramaParser } from '@infrastructure/parsers/BoursoramaParser';

/**
 * Factory for creating CSV parser instances based on parser key.
 * Each bank has its own CSV format and requires a specific parser.
 */
export class ParserFactory {
	/**
	 * Create a parser instance for the given parser key
	 * @param parserKey The key identifying which parser to use
	 * @returns The appropriate CSVParser instance
	 * @throws Error if the parser key is not supported
	 */
	static createParser(parserKey: ParserKey): CSVParser {
		switch (parserKey) {
			case ParserKey.CREDIT_MUTUEL:
				return new CreditMutuelParser();

			case ParserKey.CAISSE_EPARGNE:
				return new CaisseEpargneParser();

			case ParserKey.CAISSE_EPARGNE_ENTREPRISE:
				return new CaisseEpargneEntrepriseParser();

			case ParserKey.BOURSORAMA:
				return new BoursoramaParser();

			default:
				throw new Error(`Unsupported parser key: ${parserKey}`);
		}
	}

	/**
	 * Check if a parser key is supported
	 * @param parserKey The parser key to check
	 * @returns true if the parser key is supported
	 */
	static isSupported(parserKey: ParserKey): boolean {
		return Object.values(ParserKey).includes(parserKey);
	}
}
