import type { CsvParser, ParsedTransaction } from '../CsvParser';
import { parseCSV, parseAmount, parseDate } from '../CsvParser';
import { TransactionType } from '@domain/transaction/TransactionType';

export class CICParser implements CsvParser {
	parse(content: string): ParsedTransaction[] {
		const rows = parseCSV(content, ';');
		const transactions: ParsedTransaction[] = [];

		for (let i = 1; i < rows.length; i++) {
			const row = rows[i];
			if (row.length < 5) continue;

			const dateStr = row[0];
			const description = row[2] || '';
			const debit = row[3] ? parseAmount(row[3]) : 0;
			const credit = row[4] ? parseAmount(row[4]) : 0;

			if (!dateStr || (!debit && !credit)) continue;

			const amount = credit || -debit;
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
