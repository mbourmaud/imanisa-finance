import type { CSVParser } from '@domain/import/CSVParser';
import type { ParsedTransaction } from '@domain/import/ParsedTransaction';

/**
 * CSV Parser for Caisse d'Épargne (Particulier) bank exports.
 *
 * Format: Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation
 * Encoding: UTF-8
 * Separator: semicolon (;)
 * Date format: DD/MM/YYYY
 * Amount format: French (comma as decimal separator, e.g., "1 234,56")
 *
 * This parser extracts the native CE categories (Categorie + Sous categorie) for future mapping.
 */
export class CaisseEpargneParser implements CSVParser {
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

		// CE Particulier format has 13 columns
		if (fields.length < 13) {
			return null;
		}

		const [
			dateComptaStr, // Date de comptabilisation
			libelleSimple, // Libelle simplifie
			libelleOperation, // Libelle operation
			reference, // Reference
			infosComplementaires, // Informations complementaires
			typeOperation, // Type operation
			categorie, // Categorie
			sousCategorie, // Sous categorie
			debitStr, // Debit
			creditStr, // Credit
			dateOperationStr, // Date operation
			dateValeurStr, // Date de valeur
			_pointage // Pointage operation (not used)
		] = fields;

		// Parse date - use Date operation as primary, fall back to Date de comptabilisation
		const date = this.parseDate(dateOperationStr) || this.parseDate(dateComptaStr);
		if (!date) {
			return null;
		}

		// Parse value date
		const valueDate = this.parseDate(dateValeurStr) || undefined;

		// Parse amount: merge debit (negative) and credit (positive)
		const debit = this.parseAmount(debitStr);
		const credit = this.parseAmount(creditStr);
		const amount = credit - debit;

		// Skip lines with no amount (both debit and credit are empty/zero)
		if (amount === 0 && !debitStr.trim() && !creditStr.trim()) {
			return null;
		}

		// Build description: prefer Libelle operation, fall back to Libelle simplifie
		const description = (libelleOperation.trim() || libelleSimple.trim()).replace(/\s+/g, ' ');

		// Build raw category from CE's native categorization (Categorie > Sous categorie)
		let rawCategory: string | undefined;
		if (categorie.trim()) {
			rawCategory = sousCategorie.trim()
				? `${categorie.trim()} > ${sousCategorie.trim()}`
				: categorie.trim();
		}

		return {
			date,
			amount,
			description,
			rawCategory,
			valueDate,
			reference: reference.trim() || undefined,
			additionalInfo: this.buildAdditionalInfo(infosComplementaires, typeOperation)
		};
	}

	/**
	 * Build additional info from Informations complementaires and Type operation
	 */
	private buildAdditionalInfo(infosComplementaires: string, typeOperation: string): string | undefined {
		const parts: string[] = [];
		if (typeOperation.trim()) {
			parts.push(`Type: ${typeOperation.trim()}`);
		}
		if (infosComplementaires.trim()) {
			parts.push(infosComplementaires.trim());
		}
		return parts.length > 0 ? parts.join(' | ') : undefined;
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
