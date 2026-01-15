import { read, utils, type WorkBook, type WorkSheet } from 'xlsx';
import type { InvestmentParser } from '@domain/investment/InvestmentParser';
import type { ParsedPosition } from '@domain/investment/ParsedPosition';
import type { ParsedInvestmentTransaction } from '@domain/investment/ParsedInvestmentTransaction';

/**
 * XLSX Parser for Linxea Assurance-vie exports.
 *
 * Format: Placement,N° Contrat,Titulaire,Produit,Catégorie,Sous-catégorie,Nom du support,ISIN,Nbre de parts,Dernière cotation,Date,Somme en Compte,Plus ou Moins Value,Prix de Revient Moyen,Perf.%
 * Encoding: UTF-8
 * Amount format: French (comma as decimal separator, space as thousand separator)
 *
 * Source URL: https://espaceclient.linxea.com/epargne/contrat/{id}
 */

interface LinxeaRow {
	Placement: string;
	'N° Contrat': string | number;
	Titulaire: string;
	Produit: string;
	'Catégorie': string;
	'Sous-catégorie': string;
	'Nom du support': string;
	ISIN: string;
	'Nbre de parts': string | number;
	'Dernière cotation': string | number;
	Date: string | number;
	'Somme en Compte': string | number;
	'Plus ou Moins Value': string | number;
	'Prix de Revient Moyen': string | number;
	'Perf.%': string | number;
}

export class LinxeaParser implements InvestmentParser {
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
		const rows = utils.sheet_to_json<LinxeaRow>(sheet, { defval: '' });

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
	 * Linxea doesn't provide transaction history in the portfolio export.
	 * Returns empty array.
	 */
	parseTransactions(_content: ArrayBuffer | string): ParsedInvestmentTransaction[] {
		// Linxea portfolio export only contains positions, not transactions
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
	private parseRow(row: LinxeaRow): ParsedPosition | null {
		const supportName = this.getString(row['Nom du support']);
		const isin = this.getString(row.ISIN);

		// Skip rows without support name or ISIN (likely empty or header rows)
		if (!supportName && !isin) {
			return null;
		}

		const quantity = this.parseNumber(row['Nbre de parts']);
		const currentPrice = this.parseNumber(row['Dernière cotation']);
		const avgBuyPrice = this.parseNumber(row['Prix de Revient Moyen']);
		const currentValue = this.parseNumber(row['Somme en Compte']);
		const gainLoss = this.parseNumber(row['Plus ou Moins Value']);
		const gainLossPercent = this.parseNumber(row['Perf.%']);

		// Extract category info
		const category = this.getString(row['Catégorie']);
		const subCategory = this.getString(row['Sous-catégorie']);
		const rawCategory = [category, subCategory].filter(Boolean).join(' > ') || undefined;

		// Additional info
		const product = this.getString(row.Produit);
		const placement = this.getString(row.Placement);
		const contractNumber = this.getString(row['N° Contrat']);
		const holder = this.getString(row.Titulaire);

		// Skip positions with zero quantity
		if (quantity === 0) {
			return null;
		}

		return {
			symbol: supportName || isin,
			isin: isin || undefined,
			quantity,
			avgBuyPrice,
			currentPrice,
			currentValue,
			gainLoss,
			gainLossPercent,
			currency: 'EUR',
			name: supportName,
			rawCategory
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
