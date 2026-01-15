/**
 * Intermediate DTO for transactions parsed from CSV files.
 * Parser implementations return this format before domain transformation.
 */
export interface ParsedTransaction {
	/** Transaction date (operation date) */
	date: Date;
	/** Transaction amount (negative for debits, positive for credits) */
	amount: number;
	/** Transaction description/label */
	description: string;
	/** Optional category from the bank's CSV (e.g., Boursorama categories) */
	rawCategory?: string;
	/** Optional balance after transaction */
	balance?: number;
	/** Optional value date (date de valeur) */
	valueDate?: Date;
	/** Optional reference number */
	reference?: string;
	/** Optional additional information */
	additionalInfo?: string;
}
