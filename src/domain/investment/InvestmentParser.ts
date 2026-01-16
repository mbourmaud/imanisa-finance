import type { ParsedInvestmentTransaction } from './ParsedInvestmentTransaction';
import type { ParsedPosition } from './ParsedPosition';

/**
 * Abstract interface for investment data parsers.
 * Each broker has its own format (XLSX/CSV) and requires a specific parser implementation.
 */
export interface InvestmentParser {
	/**
	 * Parse file content and extract positions (portfolio snapshot)
	 * @param content Raw file content (could be XLSX buffer or CSV string)
	 * @returns Array of parsed positions
	 * @throws Error if parsing fails
	 */
	parsePositions(content: ArrayBuffer | string): ParsedPosition[];

	/**
	 * Parse file content and extract transactions (buy/sell history)
	 * @param content Raw file content (could be XLSX buffer or CSV string)
	 * @returns Array of parsed transactions
	 * @throws Error if parsing fails
	 */
	parseTransactions(content: ArrayBuffer | string): ParsedInvestmentTransaction[];
}

/**
 * Parser key used to identify which parser to use for an investment source.
 * Maps to parser implementations in the infrastructure layer.
 */
export enum InvestmentParserKey {
	BOURSE_DIRECT = 'bourse_direct',
	LINXEA = 'linxea',
	BINANCE = 'binance',
}

export const InvestmentParserKeyLabels: Record<InvestmentParserKey, string> = {
	[InvestmentParserKey.BOURSE_DIRECT]: 'Bourse Direct',
	[InvestmentParserKey.LINXEA]: 'Linxea',
	[InvestmentParserKey.BINANCE]: 'Binance',
};
