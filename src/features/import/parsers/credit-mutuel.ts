/**
 * Crédit Mutuel CSV Parser
 * Handles CSV exports from Crédit Mutuel bank
 */

import type { ParsedTransaction, ParseResult, Parser } from './types';

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string, delimiter: string = ';'): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				// Escaped quote
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === delimiter && !inQuotes) {
			result.push(current.trim());
			current = '';
		} else {
			current += char;
		}
	}

	result.push(current.trim());
	return result;
}

/**
 * Parse French date format (DD/MM/YYYY)
 */
function parseFrenchDate(dateStr: string): Date | null {
	const parts = dateStr.split('/');
	if (parts.length !== 3) return null;

	const day = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
	const year = parseInt(parts[2], 10);

	if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;

	return new Date(year, month, day);
}

/**
 * Parse French number format (1 234,56 -> 1234.56)
 */
function parseFrenchNumber(numStr: string): number {
	if (!numStr) return 0;

	// Remove spaces and replace comma with dot
	const cleaned = numStr.replace(/\s/g, '').replace(',', '.');
	const num = parseFloat(cleaned);

	return Number.isNaN(num) ? 0 : num;
}

export const creditMutuelParser: Parser = {
	bankKey: 'credit_mutuel',
	name: 'Crédit Mutuel',
	supportedMimeTypes: ['text/csv'],

	async parse(content: string | ArrayBuffer, _mimeType: string): Promise<ParseResult> {
		const errors: string[] = [];
		const warnings: string[] = [];
		const transactions: ParsedTransaction[] = [];

		try {
			// Convert ArrayBuffer to string if needed
			const text =
				typeof content === 'string' ? content : new TextDecoder('windows-1252').decode(content);

			const lines = text.split(/\r?\n/).filter((line) => line.trim());

			if (lines.length < 2) {
				return {
					success: false,
					errors: ['File is empty or has no data rows'],
				};
			}

			// Parse header to find column indices
			const header = parseCSVLine(lines[0]);
			const dateIndex = header.findIndex(
				(h) => h.toLowerCase().includes('date') && !h.toLowerCase().includes('valeur'),
			);
			const descriptionIndex = header.findIndex(
				(h) =>
					h.toLowerCase().includes('libellé') ||
					h.toLowerCase().includes('libelle') ||
					h.toLowerCase().includes('description'),
			);
			// Support both with and without accents: débit/debit, crédit/credit
			const debitIndex = header.findIndex(
				(h) => h.toLowerCase().includes('débit') || h.toLowerCase().includes('debit'),
			);
			const creditIndex = header.findIndex(
				(h) => h.toLowerCase().includes('crédit') || h.toLowerCase().includes('credit'),
			);
			const amountIndex = header.findIndex((h) => h.toLowerCase().includes('montant'));

			if (dateIndex === -1) {
				return {
					success: false,
					errors: ['Could not find date column in CSV'],
				};
			}

			if (descriptionIndex === -1) {
				return {
					success: false,
					errors: ['Could not find description/libellé column in CSV'],
				};
			}

			// Process data rows
			for (let i = 1; i < lines.length; i++) {
				const line = lines[i].trim();
				if (!line) continue;

				const fields = parseCSVLine(line);

				const dateStr = fields[dateIndex];
				const date = parseFrenchDate(dateStr);

				if (!date) {
					warnings.push(`Row ${i + 1}: Invalid date "${dateStr}"`);
					continue;
				}

				const description = fields[descriptionIndex] || '';

				let amount = 0;
				if (debitIndex !== -1 && creditIndex !== -1) {
					// Separate debit/credit columns
					// CM format: debit column has negative values (-100), credit has positive values (+100)
					const debit = parseFrenchNumber(fields[debitIndex]);
					const credit = parseFrenchNumber(fields[creditIndex]);
					// If credit > 0, use credit (income)
					// If debit is already negative (CM format), use it directly
					// If debit is positive (some other format), negate it
					if (credit > 0) {
						amount = credit;
					} else if (debit !== 0) {
						// CM stores debits as negative values, so use as-is
						amount = debit;
					}
				} else if (amountIndex !== -1) {
					// Single amount column
					amount = parseFrenchNumber(fields[amountIndex]);
				} else {
					warnings.push(`Row ${i + 1}: Could not determine amount`);
					continue;
				}

				if (amount === 0) {
					warnings.push(`Row ${i + 1}: Amount is zero, skipping`);
					continue;
				}

				transactions.push({
					date,
					description,
					amount: Math.abs(amount),
					type: amount >= 0 ? 'INCOME' : 'EXPENSE',
					rawData: {
						originalLine: line,
						rowIndex: i + 1,
					},
				});
			}

			return {
				success: true,
				transactions,
				errors: errors.length > 0 ? errors : undefined,
				warnings: warnings.length > 0 ? warnings : undefined,
			};
		} catch (error) {
			return {
				success: false,
				errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
			};
		}
	},
};
