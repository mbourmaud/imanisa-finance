import { read, utils, type WorkBook, type WorkSheet } from 'xlsx';
import type { InvestmentParser } from '@domain/investment/InvestmentParser';
import type { ParsedPosition } from '@domain/investment/ParsedPosition';
import type { ParsedInvestmentTransaction } from '@domain/investment/ParsedInvestmentTransaction';

/**
 * XLSX Parser for Binance buy history exports (crypto transactions).
 *
 * Format: Date(UTC+1),Method,Spend Amount,Receive Amount,Fee,Price,Status,Transaction ID
 * Encoding: UTF-8
 * Amount format: English (dot as decimal separator)
 *
 * Example "Receive Amount": "0.00132001 BTC" → symbol='BTC', quantity=0.00132001
 *
 * Source URL: https://www.binance.com/en/my/wallet/exchange/buysell-history
 */

interface BinanceRow {
	'Date(UTC+1)': string | number;
	Method: string;
	'Spend Amount': string | number;
	'Receive Amount': string;
	Fee: string | number;
	Price: string | number;
	Status: string;
	'Transaction ID': string;
}

export class BinanceParser implements InvestmentParser {
	/**
	 * Binance buy history export contains transactions, not positions.
	 * Returns empty array - positions are calculated from aggregated transactions.
	 */
	parsePositions(_content: ArrayBuffer | string): ParsedPosition[] {
		// Binance buy history export only contains transactions, not positions
		// Positions need to be calculated from transaction history (see CalculateCryptoPositionsUseCase)
		return [];
	}

	/**
	 * Parse XLSX content and extract buy transactions
	 */
	parseTransactions(content: ArrayBuffer | string): ParsedInvestmentTransaction[] {
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
		const rows = utils.sheet_to_json<BinanceRow>(sheet, { defval: '' });

		const transactions: ParsedInvestmentTransaction[] = [];

		for (const row of rows) {
			const transaction = this.parseRow(row);
			if (transaction) {
				transactions.push(transaction);
			}
		}

		return transactions;
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
	private parseRow(row: BinanceRow): ParsedInvestmentTransaction | null {
		// Only process successful transactions
		const status = this.getString(row.Status).toLowerCase();
		if (status !== 'successful') {
			return null;
		}

		// Parse receive amount to extract symbol and quantity
		// Format: "0.00132001 BTC" → symbol='BTC', quantity=0.00132001
		const receiveAmount = this.getString(row['Receive Amount']);
		const parsed = this.parseAmountWithSymbol(receiveAmount);
		if (!parsed) {
			return null;
		}

		const { quantity, symbol } = parsed;

		// Skip rows with zero quantity
		if (quantity <= 0) {
			return null;
		}

		// Parse date
		const date = this.parseDate(row['Date(UTC+1)']);
		if (!date) {
			return null;
		}

		// Parse spend amount (total paid)
		const spendAmount = this.getString(row['Spend Amount']);
		const totalAmount = this.parseNumberFromAmount(spendAmount);

		// Parse price per unit
		const pricePerUnit = this.parseNumber(row.Price);

		// Parse fee
		const fee = this.parseNumber(row.Fee);

		// Payment method (card, bank transfer, etc.)
		const paymentMethod = this.getString(row.Method);

		// Transaction ID
		const transactionId = this.getString(row['Transaction ID']);

		// Extract currency from spend amount (e.g., "100.00 EUR" → "EUR")
		const currency = this.extractCurrencyFromAmount(spendAmount) || 'EUR';

		return {
			date,
			symbol: symbol.toUpperCase(),
			type: 'buy',
			quantity,
			pricePerUnit,
			totalAmount,
			fee,
			currency,
			status: 'successful',
			transactionId: transactionId || undefined,
			paymentMethod: paymentMethod || undefined
		};
	}

	/**
	 * Parse amount string with symbol (e.g., "0.00132001 BTC" → {quantity: 0.00132001, symbol: "BTC"})
	 */
	private parseAmountWithSymbol(value: string): { quantity: number; symbol: string } | null {
		if (!value) {
			return null;
		}

		const trimmed = value.trim();
		// Match pattern: number followed by space and symbol
		const match = trimmed.match(/^([\d,.]+)\s+([A-Za-z]+)$/);
		if (!match) {
			return null;
		}

		const quantity = this.parseNumberString(match[1]);
		const symbol = match[2];

		if (quantity <= 0 || !symbol) {
			return null;
		}

		return { quantity, symbol };
	}

	/**
	 * Parse number from amount string (e.g., "100.00 EUR" → 100.00)
	 */
	private parseNumberFromAmount(value: string): number {
		if (!value) {
			return 0;
		}

		const trimmed = value.trim();
		// Match the number part (before the currency symbol)
		const match = trimmed.match(/^([\d,.]+)/);
		if (!match) {
			return 0;
		}

		return this.parseNumberString(match[1]);
	}

	/**
	 * Extract currency from amount string (e.g., "100.00 EUR" → "EUR")
	 */
	private extractCurrencyFromAmount(value: string): string | null {
		if (!value) {
			return null;
		}

		const trimmed = value.trim();
		// Match the currency part (after the number)
		const match = trimmed.match(/[\d,.]+\s+([A-Za-z]+)$/);
		if (!match) {
			return null;
		}

		return match[1].toUpperCase();
	}

	/**
	 * Parse date from cell value
	 * Binance format: "2024-01-15 14:30:00" or similar
	 */
	private parseDate(value: string | number): Date | null {
		if (!value) {
			return null;
		}

		// Handle Excel serial date number
		if (typeof value === 'number') {
			// Excel serial date: days since 1900-01-01 (with leap year bug)
			const excelEpoch = new Date(1899, 11, 30);
			const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
			return isNaN(date.getTime()) ? null : date;
		}

		const trimmed = value.trim();
		if (!trimmed) {
			return null;
		}

		// Try ISO format (YYYY-MM-DD HH:MM:SS or YYYY-MM-DD)
		const date = new Date(trimmed);
		if (!isNaN(date.getTime())) {
			return date;
		}

		// Try DD/MM/YYYY format
		const ddmmMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
		if (ddmmMatch) {
			const [, day, month, year, hours, minutes, seconds] = ddmmMatch;
			return new Date(
				parseInt(year, 10),
				parseInt(month, 10) - 1,
				parseInt(day, 10),
				parseInt(hours || '0', 10),
				parseInt(minutes || '0', 10),
				parseInt(seconds || '0', 10)
			);
		}

		return null;
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
	 * Parse number from cell value
	 */
	private parseNumber(value: string | number | undefined | null): number {
		if (value === undefined || value === null) {
			return 0;
		}

		// If already a number, return it directly
		if (typeof value === 'number') {
			return isNaN(value) ? 0 : value;
		}

		return this.parseNumberString(value);
	}

	/**
	 * Parse number from string (handles various formats)
	 */
	private parseNumberString(value: string): number {
		const trimmed = value.trim();
		if (!trimmed) {
			return 0;
		}

		// Remove thousands separators (spaces or commas) and normalize decimal
		// Binance typically uses dot for decimals, but handle comma too
		let normalized = trimmed.replace(/\s/g, '');

		// If there's both comma and dot, comma is likely thousands separator
		if (normalized.includes(',') && normalized.includes('.')) {
			normalized = normalized.replace(/,/g, '');
		} else if (normalized.includes(',')) {
			// If only comma, it's the decimal separator
			normalized = normalized.replace(',', '.');
		}

		const parsed = parseFloat(normalized);
		return isNaN(parsed) ? 0 : parsed;
	}
}
