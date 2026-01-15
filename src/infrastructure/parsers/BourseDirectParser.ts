import { read, utils, type WorkBook, type WorkSheet } from 'xlsx';
import type { InvestmentParser } from '@domain/investment/InvestmentParser';
import type { ParsedPosition } from '@domain/investment/ParsedPosition';
import type { ParsedInvestmentTransaction } from '@domain/investment/ParsedInvestmentTransaction';

/**
 * XLSX Parser for Bourse Direct PEA exports.
 *
 * Format: Nom,ISIN,Cours,Devise,Variation Veille %,Quantité,PRU (EUR),+/- value (EUR),+/- value %,Valorisation (EUR),Réglement,MIC,Marché
 * Encoding: UTF-8
 * Separator: comma (,)
 * Amount format: French (comma as decimal separator, e.g., "1234,56")
 *
 * Source URL: https://www.boursedirect.fr/fr/mon-compte/portefeuilles
 */

interface BourseDirectRow {
	Nom: string;
	ISIN: string;
	Cours: string | number;
	Devise: string;
	'Variation Veille %': string | number;
	'Quantité': string | number;
	'PRU (EUR)': string | number;
	'+/- value (EUR)': string | number;
	'+/- value %': string | number;
	'Valorisation (EUR)': string | number;
	'Réglement': string;
	MIC: string;
	'Marché': string;
}

export class BourseDirectParser implements InvestmentParser {
	/**
	 * Parse XLSX content and extract positions (portfolio snapshot)
	 */
	parsePositions(content: ArrayBuffer | string): ParsedPosition[] {
		const workbook = this.readWorkbook(content);

		// Get the first sheet
		const sheetName = workbook.SheetNames[0];
		if (!sheetName) {
			return [];
		}

		const sheet: WorkSheet = workbook.Sheets[sheetName];
		if (!sheet) {
			return [];
		}

		// Convert sheet to JSON with header row
		const rows = utils.sheet_to_json<BourseDirectRow>(sheet, { defval: '' });

		const positions: ParsedPosition[] = [];

		for (const row of rows) {
			const position = this.parseRow(row);
			if (position) {
				positions.push(position);
			}
		}

		return positions;
	}

	/**
	 * Bourse Direct doesn't provide transaction history in the portfolio export.
	 * Returns empty array - use a separate transaction history export if available.
	 */
	parseTransactions(_content: ArrayBuffer | string): ParsedInvestmentTransaction[] {
		// Bourse Direct portfolio export only contains positions, not transactions
		// Transaction history would need to be exported separately
		return [];
	}

	/**
	 * Read workbook from ArrayBuffer or string content
	 */
	private readWorkbook(content: ArrayBuffer | string): WorkBook {
		if (typeof content === 'string') {
			// If string, it might be base64 encoded
			return read(content, { type: 'string' });
		}
		return read(content, { type: 'array' });
	}

	/**
	 * Parse a single row from the XLSX file
	 */
	private parseRow(row: BourseDirectRow): ParsedPosition | null {
		const name = this.getString(row.Nom);
		const isin = this.getString(row.ISIN);

		// Skip rows without name or ISIN (likely empty or header rows)
		if (!name && !isin) {
			return null;
		}

		const quantity = this.parseNumber(row['Quantité']);
		const currentPrice = this.parseNumber(row.Cours);
		const avgBuyPrice = this.parseNumber(row['PRU (EUR)']);
		const currentValue = this.parseNumber(row['Valorisation (EUR)']);
		const gainLoss = this.parseNumber(row['+/- value (EUR)']);
		const gainLossPercent = this.parseNumber(row['+/- value %']);
		const currency = this.getString(row.Devise) || 'EUR';
		const mic = this.getString(row.MIC);
		const market = this.getString(row['Marché']);

		// Skip positions with zero quantity (sold positions still shown)
		if (quantity === 0) {
			return null;
		}

		return {
			symbol: name,
			isin: isin || undefined,
			quantity,
			avgBuyPrice,
			currentPrice,
			currentValue,
			gainLoss,
			gainLossPercent,
			currency,
			mic: mic || undefined,
			name: name,
			rawCategory: market || undefined
		};
	}

	/**
	 * Safely get string value from cell
	 */
	private getString(value: string | number | undefined | null): string {
		if (value === undefined || value === null) {
			return '';
		}
		return String(value).trim();
	}

	/**
	 * Parse number from cell value (handles French format with comma)
	 * The xlsx library might already parse numbers, or they might be strings
	 */
	private parseNumber(value: string | number | undefined | null): number {
		if (value === undefined || value === null) {
			return 0;
		}

		// If already a number, return it directly
		if (typeof value === 'number') {
			return isNaN(value) ? 0 : value;
		}

		const trimmed = value.trim();
		if (!trimmed) {
			return 0;
		}

		// Replace comma with dot for French number format
		// Also remove spaces (thousand separators)
		const normalized = trimmed
			.replace(/\s/g, '')
			.replace(',', '.');

		const parsed = parseFloat(normalized);
		return isNaN(parsed) ? 0 : parsed;
	}
}
