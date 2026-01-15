import type { CSVParser } from '@domain/import/CSVParser';
import type { ParsedTransaction } from '@domain/import/ParsedTransaction';

/**
 * CSV Parser for Crédit Mutuel bank exports.
 *
 * Format: Date;Date de valeur;Débit;Crédit;Libellé;Solde
 * Encoding: Latin-1 (ISO-8859-1)
 * Separator: semicolon (;)
 * Date format: DD/MM/YYYY
 * Amount format: French (comma as decimal separator, e.g., "1 234,56")
 */
export class CreditMutuelParser implements CSVParser {
	parse(content: string): ParsedTransaction[] {
		const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

		if (lines.length < 2) {
			return [];
		}

		// Skip header line
		const dataLines = lines.slice(1);
		const transactions: ParsedTransaction[] = [];

		for (const line of dataLines) {
			const transaction = this.parseLine(line);
			if (transaction) {
				transactions.push(transaction);
			}
		}

		return transactions;
	}

	private parseLine(line: string): ParsedTransaction | null {
		// Parse CSV with semicolon separator, handling quoted fields
		const fields = this.parseCSVLine(line);

		if (fields.length < 6) {
			return null;
		}

		const [dateStr, valueDateStr, debitStr, creditStr, description, balanceStr] = fields;

		// Parse date (DD/MM/YYYY)
		const date = this.parseDate(dateStr);
		if (!date) {
			return null;
		}

		// Parse value date
		const valueDate = this.parseDate(valueDateStr);

		// Parse amount: merge debit (negative) and credit (positive)
		const debit = this.parseAmount(debitStr);
		const credit = this.parseAmount(creditStr);
		const amount = credit - debit;

		// Skip lines with no amount (both debit and credit are empty/zero)
		if (amount === 0 && !debitStr.trim() && !creditStr.trim()) {
			return null;
		}

		// Parse balance
		const balance = this.parseAmount(balanceStr);

		return {
			date,
			amount,
			description: description.trim(),
			balance: balanceStr.trim() ? balance : undefined,
			valueDate: valueDate || undefined
		};
	}

	/**
	 * Parse a CSV line with semicolon separator, handling quoted fields
	 */
	private parseCSVLine(line: string): string[] {
		const fields: string[] = [];
		let currentField = '';
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];

			if (char === '"') {
				if (inQuotes && line[i + 1] === '"') {
					// Escaped quote
					currentField += '"';
					i++;
				} else {
					// Toggle quote mode
					inQuotes = !inQuotes;
				}
			} else if (char === ';' && !inQuotes) {
				// Field separator
				fields.push(currentField);
				currentField = '';
			} else {
				currentField += char;
			}
		}

		// Don't forget the last field
		fields.push(currentField);

		return fields;
	}

	/**
	 * Parse French date format DD/MM/YYYY
	 */
	private parseDate(dateStr: string): Date | null {
		const trimmed = dateStr.trim();
		if (!trimmed) {
			return null;
		}

		const parts = trimmed.split('/');
		if (parts.length !== 3) {
			return null;
		}

		const day = parseInt(parts[0], 10);
		const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
		const year = parseInt(parts[2], 10);

		if (isNaN(day) || isNaN(month) || isNaN(year)) {
			return null;
		}

		return new Date(year, month, day);
	}

	/**
	 * Parse French number format (comma as decimal separator, space as thousands separator)
	 * Examples: "1 234,56" -> 1234.56, "1234,56" -> 1234.56, "-123,45" -> 123.45
	 */
	private parseAmount(amountStr: string): number {
		const trimmed = amountStr.trim();
		if (!trimmed) {
			return 0;
		}

		// Remove spaces (thousand separators) and replace comma with dot
		const normalized = trimmed
			.replace(/\s/g, '') // Remove all spaces
			.replace(',', '.'); // Replace comma with dot

		const value = parseFloat(normalized);
		return isNaN(value) ? 0 : Math.abs(value); // Return absolute value (sign is handled by debit/credit columns)
	}
}
