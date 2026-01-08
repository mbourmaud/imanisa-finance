import type { CsvParser, ParsedTransaction } from '../CsvParser';
import { parseCSV, parseAmount, parseDate } from '../CsvParser';
import { TransactionType } from '@domain/transaction/TransactionType';

export class BourseDirectParser implements CsvParser {
	parse(content: string): ParsedTransaction[] {
		const rows = parseCSV(content, ';');
		const transactions: ParsedTransaction[] = [];

		for (let i = 1; i < rows.length; i++) {
			const row = rows[i];
			if (row.length < 4) continue;

			const dateStr = row[0];
			const description = row[1] || '';
			const amountStr = row[3] || row[2] || '';

			if (!dateStr || !amountStr) continue;

			const amount = parseAmount(amountStr);
			const type = amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;

			transactions.push({
				date: parseDate(dateStr, 'DD/MM/YYYY'),
				description: description.trim(),
				amount: Math.abs(amount),
				type,
				category: null
			});
		}

		return transactions;
	}
}
