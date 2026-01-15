import type { InvestmentParser } from '@domain/investment/InvestmentParser';
import { InvestmentParserKey } from '@domain/investment/InvestmentParser';
import { BourseDirectParser } from '@infrastructure/parsers/BourseDirectParser';
import { LinxeaParser } from '@infrastructure/parsers/LinxeaParser';
import { BinanceParser } from '@infrastructure/parsers/BinanceParser';

/**
 * Factory for creating investment data parsers based on parser key.
 * Each investment source has a parserKey that identifies which parser to use.
 */
export class InvestmentParserFactory {
	/**
	 * Create the appropriate parser instance for the given parser key.
	 *
	 * @param parserKey The parser key identifying which parser to use
	 * @returns An InvestmentParser instance
	 * @throws Error if the parser key is not supported
	 */
	static createParser(parserKey: InvestmentParserKey): InvestmentParser {
		switch (parserKey) {
			case InvestmentParserKey.BOURSE_DIRECT:
				return new BourseDirectParser();
			case InvestmentParserKey.LINXEA:
				return new LinxeaParser();
			case InvestmentParserKey.BINANCE:
				return new BinanceParser();
			default:
				throw new Error(`Unsupported investment parser key: ${parserKey}`);
		}
	}

	/**
	 * Check if a parser key is supported.
	 *
	 * @param parserKey The parser key to check
	 * @returns true if the parser is supported
	 */
	static isSupported(parserKey: string): parserKey is InvestmentParserKey {
		return Object.values(InvestmentParserKey).includes(parserKey as InvestmentParserKey);
	}
}
