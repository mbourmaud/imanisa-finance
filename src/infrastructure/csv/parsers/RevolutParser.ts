import type { CsvParser, ParsedTransaction } from '../CsvParser';
import { parseCSV, parseAmount } from '../CsvParser';
import { TransactionType } from '@domain/transaction/TransactionType';

export class RevolutParser implements CsvParser {
	parse(content: string): ParsedTransaction[] {
		const rows = parseCSV(content, ',');
		const transactions: ParsedTransaction[] = [];

		const headerRow = rows[0];
		const typeIndex = headerRow.findIndex((h) => h.toLowerCase() === 'type');
		const startedDateIndex = headerRow.findIndex((h) => h.toLowerCase().includes('started'));
		const descriptionIndex = headerRow.findIndex((h) => h.toLowerCase() === 'description');
		const amountIndex = headerRow.findIndex((h) => h.toLowerCase() === 'amount');

		for (let i = 1; i < rows.length; i++) {
			const row = rows[i];
			if (row.length < 4) continue;

			const dateStr = row[startedDateIndex] || row[0];
			const description = row[descriptionIndex] || '';
			const amountStr = row[amountIndex] || '';

			if (!dateStr || !amountStr) continue;

			const amount = parseAmount(amountStr);
			const type = amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;

			transactions.push({
				date: new Date(dateStr),
				description: description.trim(),
				amount: Math.abs(amount),
				type,
				category: null
			});
		}

		return transactions;
	}
}
