import type { CSVParser } from '@domain/import/CSVParser';
import type { ParsedTransaction } from '@domain/import/ParsedTransaction';

/**
 * CSV Parser for Boursorama bank exports.
 *
 * Format: dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
 * Encoding: UTF-8 (with BOM)
 * Separator: semicolon (;)
 * Date format: YYYY-MM-DD (ISO)
 * Amount format: French (comma as decimal separator, e.g., "1234,56" or "-1234,56")
 */
export class BoursoramaParser implements CSVParser {
	parse(content: string): ParsedTransaction[] {
		// Remove UTF-8 BOM if present
		const cleanContent = content.replace(/^\uFEFF/, '');

		const lines = cleanContent.split(/\r?\n/).filter((line) => line.trim().length > 0);

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

		// Expected 11 columns:
		// dateOp;dateVal;label;category;categoryParent;supplierFound;amount;comment;accountNum;accountLabel;accountbalance
		if (fields.length < 11) {
			return null;
		}

		const [
			dateOpStr,
			dateValStr,
			label,
			category,
			categoryParent,
			_supplierFound,
			amountStr,
			comment,
			_accountNum,
			_accountLabel,
			accountBalanceStr
		] = fields;

		// Parse operation date (YYYY-MM-DD)
		const date = this.parseISODate(dateOpStr);
		if (!date) {
			return null;
		}

		// Parse value date
		const valueDate = this.parseISODate(dateValStr);

		// Parse amount (negative for debits, positive for credits)
		const amount = this.parseAmount(amountStr);

		// Skip lines with no amount
		if (amount === 0 && !amountStr.trim()) {
			return null;
		}

		// Extract short label from "Court | Long" format
		const description = this.extractShortLabel(label);

		// Build category string from category and categoryParent
		const rawCategory = this.buildCategory(category, categoryParent);

		// Parse account balance
		const balance = this.parseAmount(accountBalanceStr);

		return {
			date,
			amount,
			description: description.trim(),
			rawCategory: rawCategory || undefined,
			balance: accountBalanceStr.trim() ? balance : undefined,
			valueDate: valueDate || undefined,
			additionalInfo: comment.trim() || undefined
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
	 * Parse ISO date format YYYY-MM-DD
	 */
	private parseISODate(dateStr: string): Date | null {
		const trimmed = dateStr.trim();
		if (!trimmed) {
			return null;
		}

		const parts = trimmed.split('-');
		if (parts.length !== 3) {
			return null;
		}

		const year = parseInt(parts[0], 10);
		const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
		const day = parseInt(parts[2], 10);

		if (isNaN(day) || isNaN(month) || isNaN(year)) {
			return null;
		}

		return new Date(year, month, day);
	}

	/**
	 * Parse French number format (comma as decimal separator)
	 * Examples: "1234,56" -> 1234.56, "-1234,56" -> -1234.56
	 * Note: Unlike CM, Boursorama amounts are signed (negative for debits)
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
		return isNaN(value) ? 0 : value; // Keep the sign (negative for debits)
	}

	/**
	 * Extract short label from "Court | Long" format
	 * If no pipe separator, return the full label
	 */
	private extractShortLabel(label: string): string {
		const trimmed = label.trim();
		const pipeIndex = trimmed.indexOf(' | ');
		if (pipeIndex !== -1) {
			return trimmed.substring(0, pipeIndex);
		}
		return trimmed;
	}

	/**
	 * Build category string from category and categoryParent
	 * Returns "categoryParent > category" if both present
	 */
	private buildCategory(category: string, categoryParent: string): string | null {
		const cat = category.trim();
		const parent = categoryParent.trim();

		if (parent && cat) {
			return `${parent} > ${cat}`;
		} else if (cat) {
			return cat;
		} else if (parent) {
			return parent;
		}

		return null;
	}
}
