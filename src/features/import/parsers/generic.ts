/**
 * Generic CSV Parser
 * Fallback parser that tries to intelligently parse any CSV
 */

import type { ParsedTransaction, ParseResult, Parser } from './types';
import { decodeCsvBuffer } from './decode-csv';

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string, delimiter: string = ','): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
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
 * Detect delimiter by counting occurrences in first line
 */
function detectDelimiter(line: string): string {
	const delimiters = [',', ';', '\t', '|'];
	let maxCount = 0;
	let detectedDelimiter = ',';

	for (const delimiter of delimiters) {
		const count = (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
		if (count > maxCount) {
			maxCount = count;
			detectedDelimiter = delimiter;
		}
	}

	return detectedDelimiter;
}

/**
 * Try to parse various date formats
 */
function parseDate(dateStr: string): Date | null {
	if (!dateStr) return null;

	// French format: DD/MM/YYYY
	let match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (match) {
		return new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10));
	}

	// ISO format: YYYY-MM-DD
	match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (match) {
		return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
	}

	// US format: MM/DD/YYYY
	match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (match) {
		const month = parseInt(match[1], 10);
		const day = parseInt(match[2], 10);
		// If month > 12, assume it's actually DD/MM/YYYY
		if (month <= 12) {
			return new Date(parseInt(match[3], 10), month - 1, day);
		}
	}

	// Try native parsing as fallback
	const parsed = new Date(dateStr);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Parse number handling various formats
 */
function parseNumber(numStr: string): number {
	if (!numStr) return 0;

	// Remove currency symbols and spaces
	let cleaned = numStr.replace(/[€$£¥\s]/g, '');

	// Detect format: if comma comes after dot, it's decimal
	const lastComma = cleaned.lastIndexOf(',');
	const lastDot = cleaned.lastIndexOf('.');

	if (lastComma > lastDot) {
		// French format: 1.234,56 or 1234,56
		cleaned = cleaned.replace(/\./g, '').replace(',', '.');
	} else if (lastDot > lastComma) {
		// US format: 1,234.56 or 1234.56
		cleaned = cleaned.replace(/,/g, '');
	}

	const num = parseFloat(cleaned);
	return Number.isNaN(num) ? 0 : num;
}

/**
 * Find column index by searching for keywords in header
 */
function findColumnIndex(header: string[], keywords: string[]): number {
	for (const keyword of keywords) {
		const index = header.findIndex((h) => h.toLowerCase().includes(keyword.toLowerCase()));
		if (index !== -1) return index;
	}
	return -1;
}

export const genericParser: Parser = {
	bankKey: 'other',
	name: 'Generic CSV',
	supportedMimeTypes: ['text/csv'],

	async parse(content: string | ArrayBuffer): Promise<ParseResult> {
		const _errors: string[] = [];
		const warnings: string[] = [];
		const transactions: ParsedTransaction[] = [];

		try {
			// Convert ArrayBuffer to string with auto-detected encoding
			const text = typeof content === 'string' ? content : decodeCsvBuffer(content);

			const lines = text.split(/\r?\n/).filter((line) => line.trim());

			if (lines.length < 2) {
				return {
					success: false,
					errors: ['File is empty or has no data rows'],
				};
			}

			// Detect delimiter
			const delimiter = detectDelimiter(lines[0]);

			// Parse header
			const header = parseCSVLine(lines[0], delimiter);

			// Find column indices
			const dateIndex = findColumnIndex(header, ['date', 'datum', 'fecha']);
			const descriptionIndex = findColumnIndex(header, [
				'description',
				'libellé',
				'libelle',
				'label',
				'memo',
				'narrative',
			]);
			const amountIndex = findColumnIndex(header, ['amount', 'montant', 'betrag', 'importe']);
			const debitIndex = findColumnIndex(header, ['debit', 'débit', 'withdrawal', 'sortie']);
			const creditIndex = findColumnIndex(header, ['credit', 'crédit', 'deposit', 'entrée']);
			const categoryIndex = findColumnIndex(header, ['category', 'catégorie', 'categorie', 'type']);

			if (dateIndex === -1) {
				return {
					success: false,
					errors: ['Could not find date column. Expected columns: date, datum, fecha'],
				};
			}

			if (descriptionIndex === -1) {
				return {
					success: false,
					errors: [
						'Could not find description column. Expected: description, libellé, label, memo',
					],
				};
			}

			if (amountIndex === -1 && debitIndex === -1 && creditIndex === -1) {
				return {
					success: false,
					errors: ['Could not find amount column(s). Expected: amount, montant, debit/credit'],
				};
			}

			// Process data rows
			for (let i = 1; i < lines.length; i++) {
				const line = lines[i].trim();
				if (!line) continue;

				const fields = parseCSVLine(line, delimiter);

				const dateStr = fields[dateIndex];
				const date = parseDate(dateStr);

				if (!date) {
					warnings.push(`Row ${i + 1}: Invalid date "${dateStr}"`);
					continue;
				}

				const description = fields[descriptionIndex] || '';

				let amount = 0;
				if (debitIndex !== -1 && creditIndex !== -1) {
					const debit = parseNumber(fields[debitIndex]);
					const credit = parseNumber(fields[creditIndex]);
					amount = credit > 0 ? credit : -debit;
				} else if (amountIndex !== -1) {
					amount = parseNumber(fields[amountIndex]);
				}

				if (amount === 0) {
					warnings.push(`Row ${i + 1}: Amount is zero, skipping`);
					continue;
				}

				const bankCategory = categoryIndex !== -1 ? fields[categoryIndex] : undefined;

				transactions.push({
					date,
					description,
					amount: Math.abs(amount),
					type: amount >= 0 ? 'INCOME' : 'EXPENSE',
					bankCategory,
					rawData: {
						originalLine: line,
						rowIndex: i + 1,
					},
				});
			}

			if (transactions.length === 0) {
				return {
					success: false,
					errors: ['No valid transactions found in file'],
				};
			}

			return {
				success: true,
				transactions,
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
