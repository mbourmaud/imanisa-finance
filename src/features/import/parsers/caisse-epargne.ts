/**
 * Caisse d'Épargne CSV Parser
 * Handles CSV exports from Caisse d'Épargne bank
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
 * Returns date at noon UTC to avoid timezone issues
 */
function parseFrenchDate(dateStr: string): Date | null {
	const parts = dateStr.split('/');
	if (parts.length !== 3) return null;

	const day = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
	const year = parseInt(parts[2], 10);

	if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;

	// Use UTC to avoid timezone issues
	return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

/**
 * Parse Caisse d'Épargne number format
 * Handles: +100,00 / -12,95 / 100,00
 */
function parseCaisseEpargneNumber(numStr: string): number {
	if (!numStr || numStr.trim() === '') return 0;

	// Remove spaces and replace comma with dot
	let cleaned = numStr.trim().replace(/\s/g, '').replace(',', '.');

	// Handle explicit + sign (remove it, it's positive)
	if (cleaned.startsWith('+')) {
		cleaned = cleaned.substring(1);
	}

	const num = parseFloat(cleaned);
	return Number.isNaN(num) ? 0 : num;
}

export const caisseEpargneParser: Parser = {
	bankKey: 'caisse_epargne',
	name: "Caisse d'Épargne",
	supportedMimeTypes: ['text/csv', 'application/vnd.ms-excel'],

	async parse(content: string | ArrayBuffer, _mimeType: string): Promise<ParseResult> {
		const errors: string[] = [];
		const warnings: string[] = [];
		const transactions: ParsedTransaction[] = [];

		try {
			// Convert ArrayBuffer to string if needed
			// Caisse d'Épargne uses Windows-1252 encoding
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
			// Expected columns: Date de comptabilisation;Libelle simplifie;...;Categorie;...;Debit;Credit;...
			const header = parseCSVLine(lines[0]);

			// Find column indices
			// Support both "Date comptable" (CE Pro) and "Date de comptabilisation" (CE standard)
			const dateIndex = header.findIndex(
				(h) => h.toLowerCase() === 'date comptable' || h.toLowerCase() === 'date de comptabilisation'
			);
			const descriptionIndex = header.findIndex(
				(h) => h.toLowerCase() === 'libelle simplifie'
			);
			const categoryIndex = header.findIndex(
				(h) => h.toLowerCase() === 'categorie'
			);
			// Support both "Debit" and "Débit" (with accent)
			const debitIndex = header.findIndex(
				(h) => h.toLowerCase() === 'debit' || h.toLowerCase() === 'débit'
			);
			// Support both "Credit" and "Crédit" (with accent)
			const creditIndex = header.findIndex(
				(h) => h.toLowerCase() === 'credit' || h.toLowerCase() === 'crédit'
			);
			const referenceIndex = header.findIndex(
				(h) => h.toLowerCase() === 'reference' || h.toLowerCase() === 'référence'
			);

			// Validate required columns
			if (dateIndex === -1) {
				return {
					success: false,
					errors: ['Could not find "Date comptable" or "Date de comptabilisation" column in CSV'],
				};
			}

			if (descriptionIndex === -1) {
				return {
					success: false,
					errors: ['Could not find "Libelle simplifie" column in CSV'],
				};
			}

			if (debitIndex === -1 || creditIndex === -1) {
				return {
					success: false,
					errors: ['Could not find "Debit" and "Credit" columns in CSV'],
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

				// Parse debit and credit columns
				// Caisse d'Épargne format: Credit has +100,00, Debit has -12,95
				const debitStr = fields[debitIndex] || '';
				const creditStr = fields[creditIndex] || '';

				const debitAmount = parseCaisseEpargneNumber(debitStr);
				const creditAmount = parseCaisseEpargneNumber(creditStr);

				// Determine amount and type
				// Credit column: positive values = INCOME
				// Debit column: negative values (stored as positive in amount) = EXPENSE
				let amount: number;
				let type: 'INCOME' | 'EXPENSE';

				if (creditAmount > 0) {
					// Credit column has a positive value
					amount = creditAmount;
					type = 'INCOME';
				} else if (debitAmount !== 0) {
					// Debit column has a value (usually negative like -12,95)
					// Store as positive amount, mark as EXPENSE
					amount = Math.abs(debitAmount);
					type = 'EXPENSE';
				} else {
					// Both are zero or empty - skip this row
					warnings.push(`Row ${i + 1}: Amount is zero, skipping`);
					continue;
				}

				// Get optional fields
				const bankCategory = categoryIndex !== -1 ? fields[categoryIndex] : undefined;
				const reference = referenceIndex !== -1 ? fields[referenceIndex] : undefined;

				transactions.push({
					date,
					description,
					amount,
					type,
					bankCategory: bankCategory || undefined,
					reference: reference || undefined,
					rawData: {
						originalLine: line,
						rowIndex: i + 1,
						debitRaw: debitStr,
						creditRaw: creditStr,
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
